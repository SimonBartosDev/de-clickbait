# How to Run the Backend

## ✅ Correct Way (using uvicorn)

```bash
cd backend
uvicorn main:app --reload
```

The server will start at: **http://localhost:8000**

## ❌ Wrong Way

Don't run it directly with Python:
```bash
python main.py  # This won't work!
```

`main.py` is a FastAPI application, not a standalone script. It must be run through `uvicorn`.

## Optional: Add Your OpenAI API Key

Edit `backend/.env` and replace the placeholder:
```
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

## Testing

Once running, visit:
- Health check: http://localhost:8000
- API docs: http://localhost:8000/docs
