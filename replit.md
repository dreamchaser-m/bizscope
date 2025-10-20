# BizScope Project

## Overview
BizScope is a full-stack business intelligence platform for discovering, tracking, and analyzing Connecticut businesses through Open Data APIs. Built with FastAPI (backend) and Next.js (frontend).

## Recent Changes
- **2025-10-20**: Initial project setup completed
  - FastAPI backend with SQLite database
  - Next.js frontend with shadcn/ui components
  - APScheduler for 7-day auto-refresh
  - Complete CRUD for keywords
  - Business data fetching from Connecticut Open Data APIs
  - Dark/light theme toggle
  - Advanced search and filtering

## Project Architecture

### Backend (`/backend`)
- **main.py**: FastAPI application with all API endpoints
- **models.py**: SQLAlchemy ORM models (SavedKeyword, BusinessResult)
- **database.py**: Database configuration and session management
- **schemas.py**: Pydantic models for request/response validation
- **data_fetcher.py**: Async data fetching logic for Connecticut APIs
- **scheduler.py**: APScheduler configuration for 7-day auto-updates

### Frontend (`/frontend`)
- **app/page.tsx**: Main application page with two-panel layout
- **components/KeywordPanel.tsx**: Keyword management interface
- **components/ResultsTable.tsx**: Business results table with filtering
- **components/BusinessModal.tsx**: Detailed business information modal
- **components/ThemeToggle.tsx**: Light/dark theme switcher
- **lib/store.ts**: Zustand state management
- **lib/api.ts**: Axios API client

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, httpx, APScheduler
- **Frontend**: Next.js 14+, React 18, shadcn/ui, TailwindCSS v4, Zustand
- **Languages**: Python 3.11, TypeScript

## Key Features
1. Keyword Management (Add/Edit/Delete)
2. Automated Data Fetching from CT Open Data APIs
3. Advanced Search & Filtering
4. Paginated Results Table
5. Detailed Business Modals
6. Auto-Update Every 7 Days
7. Dark/Light Theme Toggle
8. Real-time Status Monitoring

## Data Sources
- Business Registry: https://data.ct.gov/resource/n7gp-d28j.json
- Principals: https://data.ct.gov/resource/ka36-64k6.json
- Agents: https://data.ct.gov/resource/qh2m-n44y.json
- Filing History: https://data.ct.gov/resource/ah3s-bes7.json

## Running the Application
The application runs via the "BizScope App" workflow which starts both:
- Backend on port 8000 (FastAPI)
- Frontend on port 5000 (Next.js)

Click the "Run" button or execute: `bash start.sh`

## User Preferences
- None specified yet

## Database Schema
- **saved_keywords**: Stores user's saved search keywords
- **business_results**: Stores fetched business data with all details (business info, principals, agents, filing history)

## Next Steps
- Consider adding CSV export functionality
- Add email notifications for data updates
- Implement business comparison features
- Add analytics dashboard with charts
