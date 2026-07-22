from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.startup_idea import StartupIdea
from app.models.analysis import Report
from app.utils.security import get_current_user
from app.services.report_service import ReportService
from fastapi.responses import FileResponse
import os

router = APIRouter(prefix="/report", tags=["report"])

@router.post("/{idea_id}/generate")
def generate_report(idea_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    idea = db.query(StartupIdea).filter(StartupIdea.id == idea_id, StartupIdea.user_id == current_user.id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    
    pdf_path = ReportService.generate_pdf(idea_id, db)
    if not pdf_path:
        raise HTTPException(status_code=500, detail="Failed to generate report")
    
    return {"status": "success", "message": "Report generated successfully", "data": {"pdf_location": pdf_path}}

@router.get("/{idea_id}/download")
def download_report(idea_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    idea = db.query(StartupIdea).filter(StartupIdea.id == idea_id, StartupIdea.user_id == current_user.id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    
    report = db.query(Report).filter(Report.idea_id == idea_id).first()
    if not report or not os.path.exists(report.pdf_location):
        # Auto-generate PDF report on the fly if not generated yet
        pdf_path = ReportService.generate_pdf(idea_id, db)
        if not pdf_path:
            raise HTTPException(status_code=500, detail="Failed to generate PDF report")
        report = db.query(Report).filter(Report.idea_id == idea_id).first()
    
    if not report or not os.path.exists(report.pdf_location):
        raise HTTPException(status_code=404, detail="Report file not found")

    report.download_count += 1
    db.commit()
    
    filename = f"Vision2Venture_Report_{idea.title.replace(' ', '_')}.pdf"
    return FileResponse(path=report.pdf_location, filename=filename, media_type='application/pdf')
