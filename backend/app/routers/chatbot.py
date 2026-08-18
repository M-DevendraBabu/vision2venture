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
    # Try NVIDIA first (primary)
    if settings.NVIDIA_API_KEY:
        try:
            from openai import OpenAI
            _chat_client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=settings.NVIDIA_API_KEY
            )
            _chat_provider = "nvidia"
            print("[Chatbot] OK - Using NVIDIA")
            return
        except Exception as e:
            print(f"[Chatbot] NVIDIA failed: {e}")
    # Groq fallback
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            _chat_client = Groq(api_key=settings.GROQ_API_KEY)
            _chat_provider = "groq"
            print("[Chatbot] OK - Using Groq")
            return
        except Exception as e:
            print(f"[Chatbot] Groq failed: {e}")
    print("[Chatbot] WARNING - No API key configured")

_init_chat()

@router.post("/message")
async def chat_message(payload: ChatMessage) -> Dict[str, str]:
    if not payload.message.strip():
        return {"reply": "Please type a message."}
    
    if _chat_client is None:
        return {"reply": "AI assistant is not configured. Please set NVIDIA_API_KEY or GROQ_API_KEY in the .env file."}
    
    try:
        if _chat_provider == "nvidia":
            completion = _chat_client.chat.completions.create(
                model="meta/llama-3.1-70b-instruct",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": payload.message}
                ],
                temperature=0.7,
                max_tokens=500,
            )
            return {"reply": completion.choices[0].message.content.strip()}
        elif _chat_provider == "groq":
            completion = _chat_client.chat.completions.create(
                model="qwen/qwen3.6-27b",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": payload.message}
                ],
                temperature=0.7,
                max_tokens=500,
            )
            reply = completion.choices[0].message.content.strip()
            # Remove thinking tags if present
            import re
            reply = re.sub(r'<think>.*?</think>', '', reply, flags=re.DOTALL).strip()
            return {"reply": reply}
    except Exception as e:
        print(f"[Chatbot] Error: {e}")
        return {"reply": "Sorry, I encountered an error. Please try again."}
