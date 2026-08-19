from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.user import User, UserSession
import random
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse, ForgotPasswordRequest, VerifyResetOTPRequest
from app.utils.security import hash_password, verify_password, create_access_token, get_current_user
from app.services.email_service import send_reset_otp_email
from app.config import settings
import uuid
import json
import urllib.request

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    password = user.password
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    if not any(c.isupper() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not any(c.islower() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one digit")
    if not any(c in "!@#$%^&*" for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character (!@#$%^&*)")
        
    hashed_password = hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.id}, expires_delta=access_token_expires
    )
    
    session_record = UserSession(
        user_id=db_user.id,
        token=access_token,
        expires_at=datetime.utcnow() + access_token_expires
    )
    db.add(session_record)
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer", "user": db_user}

@router.post("/google")
def google_auth(data: dict, db: Session = Depends(get_db)):
    """
    Handle Google Sign-In. Receives an access_token + user info from the frontend,
    verifies it with Google, and creates/logs in the user.
    """
    access_token = data.get("access_token")
    email = data.get("email")
    name = data.get("name", "User")
    
    if not access_token or not email:
        raise HTTPException(status_code=400, detail="Missing access_token or email")
    
    # Verify the access token by calling Google's userinfo endpoint
    try:
        url = "https://www.googleapis.com/oauth2/v3/userinfo"
        req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
        with urllib.request.urlopen(req, timeout=10) as response:
            google_data = json.loads(response.read().decode())
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    
    # Use verified email from Google response
    verified_email = google_data.get("email", email)
    verified_name = google_data.get("name", name)
    
    if not verified_email:
        raise HTTPException(status_code=400, detail="Could not get email from Google")
    
    # Check if user exists
    db_user = db.query(User).filter(User.email == verified_email).first()
    
    if not db_user:
        # Create new user with a random password (they'll use Google to login)
        random_pass = str(uuid.uuid4())
        db_user = User(
            name=verified_name,
            email=verified_email,
            password_hash=hash_password(random_pass)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    
    # Create session token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.id}, expires_delta=access_token_expires
    )
    
    session_record = UserSession(
        user_id=db_user.id,
        token=access_token,
        expires_at=datetime.utcnow() + access_token_expires
    )
    db.add(session_record)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
            "created_at": str(db_user.created_at),
            "updated_at": str(db_user.updated_at)
        }
    }

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks

@router.post("/forgot-password")
def request_password_reset_otp(req: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found with this email address")
    
    # Generate 6-digit OTP code
    otp_code = f"{random.randint(100000, 999999)}"
    user.reset_token = otp_code
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    # Dispatch email send to background task (non-blocking for high multi-user traffic)
    background_tasks.add_task(send_reset_otp_email, to_email=user.email, otp_code=otp_code, user_name=user.name)

    return {
        "status": "success",
        "message": f"A 6-digit verification code has been sent to {user.email}. Please check your inbox."
    }

@router.post("/reset-password")
def verify_otp_and_reset_password(req: VerifyResetOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email address")
    
    if not user.reset_token or user.reset_token != req.otp_code.strip():
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check the OTP and try again.")
    
    if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new OTP.")

    password = req.new_password
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    if not any(c.isupper() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not any(c.islower() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one digit")
    if not any(c in "!@#$%^&*" for c in password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character (!@#$%^&*)")

    user.password_hash = hash_password(password)
    user.reset_token = None
    user.reset_token_expires = None
    
    # Revoke existing sessions
    db.query(UserSession).filter(UserSession.user_id == user.id).delete()
    db.commit()

    return {"message": "Verification successful! Your password has been updated. Please log in with your new password."}
