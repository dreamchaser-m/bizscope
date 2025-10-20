from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from database import SessionLocal
from models import SavedKeyword
from data_fetcher import fetch_and_save_business_data

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def auto_update_task():
    """Scheduled task to update all keywords every 7 days"""
    logger.info("Starting scheduled auto-update task")
    db = SessionLocal()
    try:
        keywords = db.query(SavedKeyword).all()
        logger.info(f"Auto-updating {len(keywords)} keywords")
        
        for keyword_obj in keywords:
            try:
                logger.info(f"Auto-updating keyword: {keyword_obj.keyword}")
                await fetch_and_save_business_data(db, keyword_obj.keyword)
            except Exception as e:
                logger.error(f"Error auto-updating keyword {keyword_obj.keyword}: {str(e)}")
        
        logger.info("Scheduled auto-update task completed")
    except Exception as e:
        logger.error(f"Error in auto-update task: {str(e)}")
    finally:
        db.close()

def start_scheduler():
    """Start the scheduler with 7-day interval"""
    # Run every 7 days (604800 seconds)
    scheduler.add_job(
        auto_update_task,
        trigger=IntervalTrigger(days=7),
        id='auto_update_keywords',
        name='Auto-update keywords every 7 days',
        replace_existing=True
    )
    scheduler.start()
    logger.info("Scheduler started - will run auto-update every 7 days")

def stop_scheduler():
    """Stop the scheduler"""
    scheduler.shutdown()
    logger.info("Scheduler stopped")
