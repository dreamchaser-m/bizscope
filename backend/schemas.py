from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class KeywordBase(BaseModel):
    keyword: str

class KeywordCreate(KeywordBase):
    pass

class KeywordUpdate(KeywordBase):
    pass

class Keyword(KeywordBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BusinessResultBase(BaseModel):
    business_id: Optional[str] = None
    keyword: str
    business_name: Optional[str] = None
    business_alei: Optional[str] = None
    business_status: Optional[str] = None
    date_formed: Optional[str] = None
    business_email: Optional[str] = None
    citizenship_formation: Optional[str] = None
    business_address: Optional[str] = None
    mailing_address: Optional[str] = None
    requires_annual_filing: Optional[str] = None
    annual_report_due: Optional[str] = None
    public_substatus: Optional[str] = None
    naics_code: Optional[str] = None
    naics_sub_code: Optional[str] = None
    last_report_filed: Optional[str] = None
    principal_name: Optional[str] = None
    principal_business_address: Optional[str] = None
    principal_title: Optional[str] = None
    principal_residence_address: Optional[str] = None
    agent_name: Optional[str] = None
    agent_business_address: Optional[str] = None
    agent_mailing_address: Optional[str] = None
    agent_residence_address: Optional[str] = None

class BusinessResult(BusinessResultBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StatusResponse(BaseModel):
    status: str
    last_update: Optional[str] = None
    progress: Optional[dict] = None
