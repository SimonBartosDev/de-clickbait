import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from openai import OpenAI

app = FastAPI(title="De-Clickbait API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class VideoRequest(BaseModel):
    video_id: str

@app.get("/")
def read_root():
    return {"status": "running", "message": "De-Clickbait Server is Active"}

@app.post("/fix_title")
def fix_title(request: VideoRequest):
    print(f"📥 Received request for Video ID: {request.video_id}")
    
    try:
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(request.video_id)
        except (TranscriptsDisabled, NoTranscriptFound):
            print("❌ No transcript available for this video.")
            return {"error": "No transcript available", "new_title": None}

        full_text = " ".join([entry['text'] for entry in transcript_list])
        truncated_text = full_text[:2500]

        print("✅ Transcript fetched. Sending to AI...")

        prompt = f"""
        You are a helpful assistant that fixes clickbait YouTube titles.
        Read the following video transcript intro and generate a **boring, factual, and descriptive title**.
        
        Rules:
        1. Max 10-12 words.
        2. No emojis.
        3. No exclamation marks.
        4. Describe exactly what happens or what is discussed.
        
        TRANSCRIPT INTRO:
        "{truncated_text}"
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=50,
            temperature=0.3
        )

        new_title = response.choices[0].message.content.strip().replace('"', '')
        print(f"✨ Generated Title: {new_title}")

        return {
            "original_id": request.video_id, 
            "new_title": new_title
        }

    except Exception as e:
        print(f"🔥 Error: {str(e)}")
        return {"error": str(e), "new_title": None}