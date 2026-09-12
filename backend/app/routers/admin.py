import os
import json
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.user import User
from app.models.startup_idea import StartupIdea
from app.utils.security import get_current_user
from app.services.train_models import train_all_models

router = APIRouter(prefix="/admin", tags=["admin"])

def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires admin privileges"
        )
    return current_user

@router.get("/users")
def get_users(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    users = db.query(
        User.id,
        User.name,
        User.email,
        User.role,
        User.created_at,
        func.count(StartupIdea.id).label('idea_count')
    ).outerjoin(StartupIdea, User.id == StartupIdea.user_id).group_by(
        User.id, User.name, User.email, User.role, User.created_at
    ).all()
    
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at,
            "idea_count": u.idea_count
        } for u in users
    ]

@router.get("/users/{user_id}/history")
def get_user_history(user_id: str, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    ideas = db.query(StartupIdea).filter(StartupIdea.user_id == user_id).order_by(StartupIdea.created_at.desc()).all()
    return [{"id": i.id, "title": i.title, "description": i.description, "industry": i.industry, "sector": i.sector, "analysis_status": i.analysis_status, "created_at": i.created_at} for i in ideas]

@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    total_users = db.query(func.count(User.id)).scalar()
    total_ideas = db.query(func.count(StartupIdea.id)).scalar()
    total_completed = db.query(func.count(StartupIdea.id)).filter(StartupIdea.analysis_status == 'completed').scalar()
    
    # ML dataset status
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_dir = os.path.join(backend_dir, 'data')
    ml_models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_models')
    
    total_samples = 0
    dataset_files = []
    if os.path.exists(data_dir):
        for f in sorted(os.listdir(data_dir)):
            if f.endswith('.csv') or f.endswith('.xlsx'):
                dataset_files.append(f)
                try:
                    fpath = os.path.join(data_dir, f)
                    with open(fpath, 'r', encoding='utf-8', errors='ignore') as dfile:
                        line_count = sum(1 for _ in dfile) - 1
                        if line_count > 0:
                            total_samples += line_count
                except Exception:
                    pass

    # Read verified model metrics from saved metadata
    model_version = "v2.0-StackingEnsemble"
    model_accuracy = "Trained on verified datasets (Cross-Validated)"
    metadata_path = os.path.join(ml_models_dir, 'feature_metadata.json')
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, 'r', encoding='utf-8') as mf:
                meta = json.load(mf)
                metrics = meta.get("metrics")
                if metrics and "test_accuracy" in metrics:
                    acc = metrics['test_accuracy'] * 100
                    cv = metrics.get('cv_accuracy', 0) * 100
                    model_accuracy = f"{acc:.2f}% Test (CV: {cv:.2f}%)"
                    model_version = metrics.get("model_version", model_version)
                elif "feature_cols" in meta:
                    model_accuracy = f"Trained with {len(meta['feature_cols'])} verified features"
        except Exception:
            pass

    return {
        "total_users": total_users,
        "total_ideas": total_ideas,
        "total_completed": total_completed,
        "ml_model_version": model_version,
        "dataset_sample_count": total_samples,
        "dataset_files": dataset_files,
        "model_accuracy": model_accuracy
    }

@router.post("/retrain-models")
def retrain_models(background_tasks: BackgroundTasks, admin: User = Depends(get_admin_user)):
    """Triggers dataset re-training pipeline in the background."""
    background_tasks.add_task(train_all_models)
    return {
        "status": "success",
        "message": "Dataset model retraining pipeline launched successfully in background."
    }
