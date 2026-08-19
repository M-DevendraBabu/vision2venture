from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from app.config import settings

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatMessage(BaseModel):
    message: str

SYSTEM_PROMPT = """You are V2V Assistant, the AI startup mentor and business co-pilot for Vision2Venture.
Help users with: startup validation, business planning, market opportunities, financial projections, risk evaluation, and platform navigation.
Keep responses concise (2-4 clear sentences or short bullet points, under 120 words). Be insightful, professional, and directly actionable."""

# Initialize client once
_chat_client = None
_chat_provider = None

def _init_chat():
    global _chat_client, _chat_provider
    # Try NVIDIA first (fast 8b model)
    if settings.NVIDIA_API_KEY:
        try:
            from openai import OpenAI
            _chat_client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=settings.NVIDIA_API_KEY,
                timeout=10.0
            )
            _chat_provider = "nvidia"
            print("[Chatbot] OK - Using NVIDIA (meta/llama-3.1-8b-instruct)")
            return
        except Exception as e:
            print(f"[Chatbot] NVIDIA init failed: {e}")
            
    # Groq fallback
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            _chat_client = Groq(api_key=settings.GROQ_API_KEY, timeout=10.0)
            _chat_provider = "groq"
            print("[Chatbot] OK - Using Groq (groq/compound-mini)")
            return
        except Exception as e:
            print(f"[Chatbot] Groq init failed: {e}")
            
    print("[Chatbot] WARNING - No active API key configured")

_init_chat()

@router.post("/message")
async def chat_message(payload: ChatMessage) -> Dict[str, str]:
    if not payload.message.strip():
        return {"reply": "Please type a startup question."}
    
    # Re-init if client is missing
    global _chat_client, _chat_provider
    if _chat_client is None:
        _init_chat()

    user_msg = payload.message.strip()

    # 1. Try NVIDIA
    if _chat_provider == "nvidia" and _chat_client is not None:
        try:
            completion = _chat_client.chat.completions.create(
                model="meta/llama-3.1-8b-instruct",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_msg}
                ],
                temperature=0.7,
                max_tokens=400,
            )
            reply = completion.choices[0].message.content.strip()
            if reply:
                return {"reply": reply}
        except Exception as e:
            print(f"[Chatbot] NVIDIA call error: {e}. Trying fallback...")

    # 2. Try Groq Fallback
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            groq_c = Groq(api_key=settings.GROQ_API_KEY, timeout=10.0)
            completion = groq_c.chat.completions.create(
                model="groq/compound-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_msg}
                ],
                temperature=0.7,
                max_tokens=400,
            )
            reply = completion.choices[0].message.content.strip()
            if reply:
                return {"reply": reply}
        except Exception as e:
            print(f"[Chatbot] Groq fallback error: {e}")

    # 3. Dynamic Startup Co-Pilot Fallback Response
    return {
        "reply": f"To validate your idea '{user_msg[:60]}', focus on three core pillars: 1) Talk to at least 20 target customers to confirm the pain point, 2) Build a lightweight MVP to test willingness to pay, and 3) Leverage Vision2Venture's Analysis dashboard to review market size and unit economics."
    }
