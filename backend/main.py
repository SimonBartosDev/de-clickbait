import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from openai import OpenAI

# 1. Initialize the App
app = FastAPI(title="De-Clickbait API")

# 2. CORS Configuration (Crucial for Chrome Extensions)
# This allows your extension (running on youtube.com) to talk to localhost.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to your Extension ID
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Initialize OpenAI Client
# OPTION A: Set your API key directly here (Easier for today)
# client = OpenAI(api_key="sk-proj-...") 

# OPTION B: Best Practice (Read from Environment Variable)
# Make sure to run `export OPENAI_API_KEY='sk-...'` in your terminal first
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 4. Data Model
class VideoRequest(BaseModel):
    video_id: str

# 5. Health Check Endpoint
@app.get("/")
def read_root():
    return {"status": "running", "message": "De-Clickbait Server is Active"}

# 6. The Main Logic Endpoint
@app.post("/fix_title")
def fix_title(request: VideoRequest):
    print(f"📥 Received request for Video ID: {request.video_id}")
    
    try:
        # Step A: Fetch Transcript
        # We try to get the English transcript first.
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(request.video_id)
        except (TranscriptsDisabled, NoTranscriptFound):
            # Fallback: If no subtitles exist, we can't summarize.
            print("❌ No transcript available for this video.")
            return {"error": "No transcript available", "new_title": None}

        # Step B: Pre-process Text
        # We combine the dictionary list into a single string.
        # We only take the first 2,500 characters. Usually, the "clickbait reveal" 
        # or the main topic is explained in the first few minutes.
        # Sending the whole hour-long text is expensive and unnecessary.
        full_text = " ".join([entry['text'] for entry in transcript_list])
        truncated_text = full_text[:2500] 

        print("✅ Transcript fetched. Sending to AI...")

        # Step C: Ask OpenAI
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
            model="gpt-4o-mini", # Using 'mini' because it's fast and cheap
            messages=[{"role": "user", "content": prompt}],
            max_tokens=50, # Keep it short
            temperature=0.3 # Keep it factual (lower is less creative)
        )

        # Step D: Extract Result
        new_title = response.choices[0].message.content.strip().replace('"', '')
        print(f"✨ Generated Title: {new_title}")

        return {
            "original_id": request.video_id, 
            "new_title": new_title
        }

    except Exception as e:
        print(f"🔥 Error: {str(e)}")
        # We return a 200 OK with error details so the frontend doesn't crash
        return {"error": str(e), "new_title": None}

# To run this server:
# 1. Open terminal in 'backend/' folder
# 2. Run: uvicorn main:app --reload