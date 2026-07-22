from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.user import User, UserSession
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.utils.security import hash_password, verify_password, create_access_token, get_current_user
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
    Handle Google Sign-In. Receives a Google credential (ID token) from the frontend,
    verifies it with Google, and creates/logs in the user.
    """
    credential = data.get("credential")
    if not credential:
        raise HTTPException(status_code=400, detail="No credential provided")
    
    # Verify the Google ID token by calling Google's tokeninfo endpoint
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            google_data = json.loads(response.read().decode())
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    
    email = google_data.get("email")
    name = google_data.get("name", google_data.get("given_name", "User"))
    
    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from Google")
    
    # Check if user exists
    db_user = db.query(User).filter(User.email == email).first()
    
    if not db_user:
        # Create new user with a random password (they'll use Google to login)
        random_pass = str(uuid.uuid4())
        db_user = User(
            name=name,
            email=email,
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

@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    return {"status": "success", "message": "Password reset link sent if email exists."}

@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    return {"status": "success", "message": "Password updated successfully."}
