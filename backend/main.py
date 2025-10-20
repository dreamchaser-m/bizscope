from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
import logging
from datetime import datetime
import asyncio

from database import get_db, init_db
from models import SavedKeyword, BusinessResult
from schemas import Keyword, KeywordCreate, KeywordUpdate, BusinessResult as BusinessResultSchema, StatusResponse
from data_fetcher import fetch_and_save_business_data
from scheduler import start_scheduler, stop_scheduler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="BizScope API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global status management
app_status = {
    "status": "idle",
    "last_update": None,
    "progress": {"keywords_done": 0, "total_keywords": 0}
}

@app.on_event("startup")
async def startup_event():
    init_db()
    start_scheduler()
    logger.info("Database initialized and scheduler started")

@app.on_event("shutdown")
async def shutdown_event():
    stop_scheduler()
    logger.info("Scheduler stopped")

# Status endpoint
@app.get("/api/status", response_model=StatusResponse)
async def get_status():
    return app_status

# Keyword endpoints
@app.get("/api/keywords", response_model=List[Keyword])
async def get_keywords(db: Session = Depends(get_db)):
    return db.query(SavedKeyword).all()

@app.post("/api/keywords", response_model=Keyword)
async def create_keyword(keyword: KeywordCreate, db: Session = Depends(get_db)):
    # Check if keyword already exists
    existing = db.query(SavedKeyword).filter(SavedKeyword.keyword == keyword.keyword).first()
    if existing:
        raise HTTPException(status_code=400, detail="Keyword already exists")
    
    db_keyword = SavedKeyword(keyword=keyword.keyword)
    db.add(db_keyword)
    db.commit()
    db.refresh(db_keyword)
    return db_keyword

@app.put("/api/keywords/{keyword_id}", response_model=Keyword)
async def update_keyword(keyword_id: int, keyword: KeywordUpdate, db: Session = Depends(get_db)):
    db_keyword = db.query(SavedKeyword).filter(SavedKeyword.id == keyword_id).first()
    if not db_keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    
    # Check if new keyword already exists (excluding current)
    existing = db.query(SavedKeyword).filter(
        SavedKeyword.keyword == keyword.keyword,
        SavedKeyword.id != keyword_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Keyword already exists")
    
    db_keyword.keyword = keyword.keyword
    db_keyword.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_keyword)
    return db_keyword

@app.delete("/api/keywords/{keyword_id}")
async def delete_keyword(keyword_id: int, db: Session = Depends(get_db)):
    db_keyword = db.query(SavedKeyword).filter(SavedKeyword.id == keyword_id).first()
    if not db_keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    
    db.delete(db_keyword)
    db.commit()
    return {"message": "Keyword deleted successfully"}

# Results endpoints
@app.get("/api/results", response_model=dict)
async def get_results(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    business_name: Optional[str] = None,
    business_status: Optional[str] = None,
    keyword: Optional[str] = None,
    naics_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(BusinessResult)
        
        # Apply unified search
        if search:
            search_filter = or_(
                BusinessResult.business_name.ilike(f"%{search}%"),
                BusinessResult.business_id.ilike(f"%{search}%"),
                BusinessResult.business_alei.ilike(f"%{search}%"),
                BusinessResult.keyword.ilike(f"%{search}%"),
                BusinessResult.business_email.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Apply column filters
        if business_name:
            query = query.filter(BusinessResult.business_name.ilike(f"%{business_name}%"))
        if business_status:
            query = query.filter(BusinessResult.business_status.ilike(f"%{business_status}%"))
        if keyword:
            query = query.filter(BusinessResult.keyword.ilike(f"%{keyword}%"))
        if naics_code:
            query = query.filter(BusinessResult.naics_code.ilike(f"%{naics_code}%"))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        results = query.offset(offset).limit(limit).all()
        
        # Convert ORM objects to dictionaries to avoid serialization issues
        results_data = [
            {
                "id": r.id,
                "business_id": r.business_id,
                "keyword": r.keyword,
                "business_name": r.business_name,
                "business_alei": r.business_alei,
                "business_status": r.business_status,
                "date_formed": r.date_formed,
                "business_email": r.business_email,
                "citizenship_formation": r.citizenship_formation,
                "business_address": r.business_address,
                "mailing_address": r.mailing_address,
                "requires_annual_filing": r.requires_annual_filing,
                "annual_report_due": r.annual_report_due,
                "public_substatus": r.public_substatus,
                "naics_code": r.naics_code,
                "naics_sub_code": r.naics_sub_code,
                "last_report_filed": r.last_report_filed,
                "principal_name": r.principal_name,
                "principal_business_address": r.principal_business_address,
                "principal_title": r.principal_title,
                "principal_residence_address": r.principal_residence_address,
                "agent_name": r.agent_name,
                "agent_business_address": r.agent_business_address,
                "agent_mailing_address": r.agent_mailing_address,
                "agent_residence_address": r.agent_residence_address,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            }
            for r in results
        ]
        
        return {
            "results": results_data,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Error fetching results: {str(e)}")
        # Return empty results instead of failing
        return {
            "results": [],
            "total": 0,
            "page": page,
            "limit": limit,
            "total_pages": 0
        }

@app.get("/api/results/{result_id}", response_model=BusinessResultSchema)
async def get_result(result_id: int, db: Session = Depends(get_db)):
    result = db.query(BusinessResult).filter(BusinessResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result

async def update_all_keywords_background(db: Session):
    """Background task to update all keywords"""
    try:
        app_status["status"] = "busy"
        keywords = db.query(SavedKeyword).all()
        app_status["progress"]["total_keywords"] = len(keywords)
        app_status["progress"]["keywords_done"] = 0
        
        for idx, keyword_obj in enumerate(keywords):
            logger.info(f"Updating keyword {idx + 1}/{len(keywords)}: {keyword_obj.keyword}")
            await fetch_and_save_business_data(db, keyword_obj.keyword)
            app_status["progress"]["keywords_done"] = idx + 1
        
        app_status["status"] = "idle"
        app_status["last_update"] = datetime.utcnow().isoformat()
        logger.info("All keywords updated successfully")
    except Exception as e:
        logger.error(f"Error updating keywords: {str(e)}")
        app_status["status"] = "idle"
        raise

async def update_single_keyword_background(db: Session, keyword: str):
    """Background task to update a single keyword"""
    try:
        app_status["status"] = "busy"
        app_status["progress"]["total_keywords"] = 1
        app_status["progress"]["keywords_done"] = 0
        
        logger.info(f"Updating keyword: {keyword}")
        await fetch_and_save_business_data(db, keyword)
        app_status["progress"]["keywords_done"] = 1
        
        app_status["status"] = "idle"
        app_status["last_update"] = datetime.utcnow().isoformat()
        logger.info(f"Keyword '{keyword}' updated successfully")
    except Exception as e:
        logger.error(f"Error updating keyword '{keyword}': {str(e)}")
        app_status["status"] = "idle"
        raise

@app.post("/api/results/update")
async def update_results(
    background_tasks: BackgroundTasks,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if app_status["status"] == "busy":
        raise HTTPException(status_code=409, detail="Update already in progress")
    
    if keyword:
        # Update single keyword
        keyword_obj = db.query(SavedKeyword).filter(SavedKeyword.keyword == keyword).first()
        if not keyword_obj:
            raise HTTPException(status_code=404, detail="Keyword not found")
        
        # Start background task
        asyncio.create_task(update_single_keyword_background(db, keyword))
        return {"message": f"Update started for keyword: {keyword}"}
    else:
        # Update all keywords
        # Start background task
        asyncio.create_task(update_all_keywords_background(db))
        return {"message": "Update started for all keywords"}

@app.get("/api/results/status")
async def get_results_status():
    return app_status

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
