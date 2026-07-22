from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from app.config import settings

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatMessage(BaseModel):
    message: str

SYSTEM_PROMPT = """You are V2V Assistant, the AI chatbot for Vision2Venture - a startup analysis platform.
Help users with: startup validation, business planning, understanding analysis results, and platform navigation.
Keep responses concise (under 120 words). Be professional and helpful. Do not use emoji."""

# Initialize client once
_chat_client = None
_chat_provider = None

def _init_chat():
    global _chat_client, _chat_provider
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            _chat_client = Groq(api_key=settings.GROQ_API_KEY)
            _chat_provider = "groq"
            print("[Chatbot] OK - Using Groq")
            return
        except Exception as e:
            print(f"[Chatbot] Groq failed: {e}")
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _chat_client = genai.GenerativeModel('gemini-2.0-flash', system_instruction=SYSTEM_PROMPT)
            _chat_provider = "gemini"
            print("[Chatbot] OK - Using Gemini")
            return
        except Exception as e:
            print(f"[Chatbot] Gemini failed: {e}")
    print("[Chatbot] WARNING - No API key configured")

_init_chat()

@router.post("/message")
async def chat_message(payload: ChatMessage) -> Dict[str, str]:
    if not payload.message.strip():
        return {"reply": "Please type a message."}
    
    if _chat_client is None:
        return {"reply": "AI assistant is not configured. Please set GROQ_API_KEY in the .env file."}
    
    try:
        if _chat_provider == "groq":
            completion = _chat_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": payload.message}
                ],
                temperature=0.7,
                max_tokens=500,
            )
            return {"reply": completion.choices[0].message.content.strip()}
        elif _chat_provider == "gemini":
            response = _chat_client.generate_content(payload.message)
            return {"reply": response.text.strip()}
    except Exception as e:
        print(f"[Chatbot] Error: {e}")
        return {"reply": "Sorry, I encountered an error. Please try again."}
