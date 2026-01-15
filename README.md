# De-Clickbait: AI-Powered YouTube Title Sanitizer

**De-Clickbait** is a browser extension that uses Generative AI (GPT-4o) to replace sensationalist YouTube titles with factual, descriptive summaries in real-time.

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/backend-FastAPI-green)
![JavaScript](https://img.shields.io/badge/frontend-Chrome_Extension-yellow)

## 🚀 Key Features
- **Real-Time DOM Manipulation:** Automatically detects video titles and injects AI-generated summaries.
- **SPA (Single Page App) Support:** Uses `MutationObserver` to handle YouTube's dynamic navigation without page reloads.
- **Privacy-Focused Architecture:** Uses a local Python backend to bridge the browser and OpenAI, securing API keys and handling data processing off-client.
- **Fallback Handling:** Gracefully handles videos without transcripts or API errors by reverting to the original title.

## 🛠 Tech Stack
- **Frontend:** Chrome Extension (Manifest V3), Vanilla JavaScript, DOM API.
- **Backend:** Python, FastAPI, Uvicorn.
- **AI/ML:** OpenAI API (GPT-4o-mini), YouTube Transcript API.

## 🏗 Architecture
1. **Content Script** injects into `youtube.com`.
2. Script detects Video ID and sends it to **Localhost API**.
3. **FastAPI Backend** fetches the transcript using `youtube_transcript_api`.
4. **OpenAI** summarizes the transcript into a factual title.
5. Backend returns the new title; Content Script updates the **DOM**.

## 📦 Installation Guide

### Prerequisites
- Python 3.10+
- OpenAI API Key

### 1. Setup Backend
```bash
cd backend
pip install -r requirements.txt
export OPENAI_API_KEY='your-api-key-here'
uvicorn main:app --reload