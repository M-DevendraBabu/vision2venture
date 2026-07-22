from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.startup_idea import StartupIdea
from app.models.user import User
from app.schemas.startup import StartupIdeaCreate, StartupIdeaResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/startup", tags=["startup"])

@router.post("/create", response_model=StartupIdeaResponse)
def create_startup_idea(idea: StartupIdeaCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_idea = StartupIdea(
        user_id=current_user.id,
        title=idea.title,
        description=idea.description,
        industry=idea.industry,
        country=idea.country,
        business_type=idea.business_type,
        target_customers=idea.target_customers,
        budget=idea.budget,
        team_skills=idea.team_skills,
        sector=idea.sector,
        pricing_model=idea.pricing_model,
        team_size=idea.team_size,
        business_stage=idea.business_stage,
        revenue_goal=idea.revenue_goal,
        funding_required=idea.funding_required,
        analysis_status='pending'
    )
    db.add(new_idea)
    db.commit()
    db.refresh(new_idea)
    return new_idea

@router.get("/list", response_model=List[StartupIdeaResponse])
def list_startup_ideas(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ideas = db.query(StartupIdea).filter(StartupIdea.user_id == current_user.id).all()
    return ideas

@router.get("/{id}", response_model=StartupIdeaResponse)
def get_startup_idea(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    idea = db.query(StartupIdea).filter(StartupIdea.id == id, StartupIdea.user_id == current_user.id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    return idea

@router.delete("/{id}")
def delete_startup_idea(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    idea = db.query(StartupIdea).filter(StartupIdea.id == id, StartupIdea.user_id == current_user.id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    db.delete(idea)
    db.commit()
    return {"status": "success", "message": "Startup idea deleted successfully."}
