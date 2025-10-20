from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class SavedKeyword(Base):
    __tablename__ = "saved_keywords"
    
    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BusinessResult(Base):
    __tablename__ = "business_results"
    
    id = Column(Integer, primary_key=True, index=True)
    business_id = Column(String, index=True)
    keyword = Column(String, nullable=False, index=True)
    business_name = Column(String)
    business_alei = Column(String)
    business_status = Column(String)
    date_formed = Column(String)
    business_email = Column(String)
    citizenship_formation = Column(String)
    business_address = Column(Text)
    mailing_address = Column(Text)
    requires_annual_filing = Column(String)
    annual_report_due = Column(String)
    public_substatus = Column(String)
    naics_code = Column(String)
    naics_sub_code = Column(String)
    last_report_filed = Column(String)
    principal_name = Column(String)
    principal_business_address = Column(Text)
    principal_title = Column(String)
    principal_residence_address = Column(Text)
    agent_name = Column(String)
    agent_business_address = Column(Text)
    agent_mailing_address = Column(Text)
    agent_residence_address = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
