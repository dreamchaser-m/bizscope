import httpx
import logging
from sqlalchemy.orm import Session
from models import BusinessResult
from typing import Optional

logger = logging.getLogger(__name__)


def clean_keyword(keyword: str) -> str:
    """Clean keyword by removing spaces and special characters"""
    return keyword.lower().replace(' ', '').replace('&', '').replace(
        '-', '').replace('.', '').replace(',', '')


def build_address(street: Optional[str], city: Optional[str],
                  state: Optional[str], postal_code: Optional[str],
                  country: Optional[str]) -> Optional[str]:
    """Build address string from components"""
    parts = []
    if street:
        parts.append(street)
    if city:
        parts.append(city)
    if state:
        parts.append(state)
    if postal_code:
        parts.append(postal_code)
    if country:
        parts.append(country)

    return ", ".join(parts) if parts else None


async def fetch_and_save_business_data(db: Session, keyword: str):
    try:
        cleaned_keyword = clean_keyword(keyword)
        business_url = f"https://data.ct.gov/resource/n7gp-d28j.json?$where=(lower(replace(replace(replace(replace(replace(name, ' ', ''), '%26', ''), '-', ''), '.', ''), ',', '')) like '%25{cleaned_keyword}%25')&$order=name asc"

        async with httpx.AsyncClient(timeout=30.0) as client:
            logger.info(f"Fetching businesses for keyword: {keyword}")
            response = await client.get(business_url)
            response.raise_for_status()
            businesses = response.json()

            logger.info(
                f"Found {len(businesses)} businesses for keyword: {keyword}")

            for business in businesses:
                business_id = business.get('id')
                if not business_id:
                    continue

                existing = db.query(BusinessResult).filter(
                    BusinessResult.business_id == business_id).first()

                if existing:
                    if keyword not in existing.keyword.split(', '):
                        existing.keyword = existing.keyword + ', ' + keyword
                        db.commit()
                    continue

                business_alei = business.get('accountnumber')

                citizenship = business.get('citizenship', '')
                formation = business.get('formation_place', '')
                citizenship_formation = f"{citizenship}/{formation}" if citizenship or formation else None

                business_address = build_address(
                    business.get('billingstreet'), business.get('billingcity'),
                    business.get('billingstate'),
                    business.get('billingpostalcode'),
                    business.get('billingcountry'))

                date_registration = business.get('date_registration', '')
                date_formed_value = "None"
                if date_registration:
                    date_part = date_registration[:10] if len(
                        date_registration) >= 10 else date_registration
                    if date_part != "0001-01-01":
                        date_formed_value = date_part

                requires_annual = "Yes" if business.get(
                    'annual_report_due_date') else "No"
                annual_due = "None" if requires_annual == "No" else business.get(
                    'annual_report_due_date', '')[:10]

                business_result = BusinessResult(
                    keyword=keyword,
                    business_name=business.get('name'),
                    business_alei=business_alei,
                    business_id=business_id,
                    business_status=business.get('status'),
                    date_formed=date_formed_value,
                    business_email=business.get('business_email_address'),
                    citizenship_formation=citizenship_formation,
                    business_address=business_address,
                    mailing_address=business.get('mailing_address'),
                    requires_annual_filing=requires_annual,
                    annual_report_due=annual_due,
                    public_substatus=business.get('sub_status'),
                    naics_code=business.get('naics_code'),
                    naics_sub_code=business.get('naics_sub_code'),
                    last_report_filed=None)

                db.add(business_result)

            db.commit()
            logger.info(
                f"Successfully saved business data for keyword: {keyword}")

        # Fetch principals, agents, and filings
        businesses = db.query(BusinessResult).filter(
            BusinessResult.keyword.contains(keyword)).all()
        for business in businesses:
            business_id = business.business_id
            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    principal_url = f"https://data.ct.gov/resource/ka36-64k6.json?$where=(business_id='{business_id}')"
                    principal_response = await client.get(principal_url)
                    principal_response.raise_for_status()
                    principals = principal_response.json()

                    if principals:
                        principal = principals[0]
                        business.principal_name = principal.get('name__c')
                        business.principal_title = principal.get('designation')
                        business.principal_residence_address = principal.get(
                            'residence_address')
                        business.principal_business_address = build_address(
                            principal.get('business_street_address_1'),
                            principal.get('business_city'),
                            principal.get('business_state'),
                            principal.get('business_zip_code'),
                            principal.get('business_country'))
                except Exception as e:
                    logger.warning(
                        f"Error fetching principal for business {business_id}: {str(e)}"
                    )

                try:
                    agent_url = f"https://data.ct.gov/resource/qh2m-n44y.json?$where=(business_key='{business_id}')"
                    agent_response = await client.get(agent_url)
                    agent_response.raise_for_status()
                    agents = agent_response.json()

                    if agents:
                        agent = agents[0]
                        business.agent_name = agent.get('name__c')
                        business.agent_business_address = agent.get(
                            'business_address')
                        business.agent_mailing_address = agent.get(
                            'mailing_address')
                        business.agent_residence_address = build_address(
                            agent.get('residence_street_address_1'),
                            agent.get('residence_city'),
                            agent.get('residence_state'),
                            agent.get('residence_zip_code'),
                            agent.get('residence_country'))
                except Exception as e:
                    logger.warning(
                        f"Error fetching agent for business {business_id}: {str(e)}"
                    )

                try:
                    filing_url = f"https://data.ct.gov/resource/ah3s-bes7.json?$where=(account='{business_id}')&$order=filing_date desc&$limit=1"
                    filing_response = await client.get(filing_url)
                    filing_response.raise_for_status()
                    filings = filing_response.json()

                    if filings:
                        filing_date = filings[0].get('filing_date', '')
                        business.last_report_filed = filing_date[:
                                                                 10] if filing_date else None
                except Exception as e:
                    logger.warning(
                        f"Error fetching filing history for business {business_id}: {str(e)}"
                    )

            db.commit()
    except Exception as e:
        logger.error(
            f"Error fetching business data for keyword {keyword}: {str(e)}")
        db.rollback()
        raise
