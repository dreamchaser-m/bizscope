# BizScope

**Discover, Track, and Analyze Connecticut Businesses**

BizScope is a modern, full-stack web platform that lets users discover, track, and analyze Connecticut businesses through the Connecticut Open Data APIs. The platform allows users to manage saved keywords, fetch business data based on those keywords, and view searchable, filterable results in an interactive table.

## Features

- **Keyword Management**: Add, edit, and delete saved keywords for tracking businesses
- **Automated Data Fetching**: Fetch business data from Connecticut Open Data APIs
- **Advanced Search & Filtering**: Unified search with per-column filters and pagination
- **Detailed Business View**: Click any business to view comprehensive information including:
  - General business information
  - Principal details
  - Agent details
- **Auto-Update Scheduler**: Automatically refresh data every 7 days
- **Dark/Light Theme**: Toggle between themes with localStorage persistence
- **Real-time Status**: Monitor data update progress with status indicators

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (React 18)
- **UI Components**: shadcn/ui
- **Styling**: TailwindCSS v4
- **State Management**: Zustand
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite with SQLAlchemy ORM
- **HTTP Client**: httpx (async)
- **Scheduler**: APScheduler (7-day auto-refresh)
- **Validation**: Pydantic

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- npm

### Installation

The project is configured to run on Replit. Simply click the "Run" button to start both the backend and frontend servers.

For local development:

1. **Install Dependencies**

Backend:
```bash
cd backend
pip install -r requirements.txt
```

Frontend:
```bash
cd frontend
npm install
```

2. **Run the Application**

Backend (starts on port 8000):
```bash
cd backend
python main.py
```

Frontend (starts on port 5000):
```bash
cd frontend
npm run dev
```

Or use the combined startup script:
```bash
bash start.sh
```

## API Endpoints

### Keywords
- `GET /api/keywords` - Get all saved keywords
- `POST /api/keywords` - Create a new keyword
- `PUT /api/keywords/{id}` - Update a keyword
- `DELETE /api/keywords/{id}` - Delete a keyword

### Business Results
- `GET /api/results` - Get business results with filters and pagination
  - Query params: `page`, `limit`, `search`, `business_name`, `business_status`, `keyword`, `naics_code`
- `GET /api/results/{id}` - Get a single business result
- `POST /api/results/update` - Trigger data update (all keywords or single keyword)
  - Optional query param: `keyword` (to update specific keyword)

### Status
- `GET /api/status` - Get current backend status (idle/busy) and progress

## Usage

1. **Add Keywords**: In the left panel, enter keywords for businesses you want to track (e.g., "restaurant", "tech", "consulting")

2. **Save Changes**: Click the "Save Changes" button to persist your keywords

3. **Update Data**: Click the "Update Data" button to fetch business information for your saved keywords

4. **Search & Filter**: Use the unified search bar or per-column filters to find specific businesses

5. **View Details**: Hover over any row to see the blur effect, then click to view full business details in a modal

6. **Auto-Update**: The system automatically refreshes all data every 7 days

## Data Sources

BizScope fetches data from the following Connecticut Open Data APIs:
- **Business Registry**: https://data.ct.gov/resource/n7gp-d28j.json
- **Principals**: https://data.ct.gov/resource/ka36-64k6.json
- **Agents**: https://data.ct.gov/resource/qh2m-n44y.json
- **Filing History**: https://data.ct.gov/resource/ah3s-bes7.json

## Database Schema

### saved_keywords
- `id`: Primary key
- `keyword`: Unique keyword string
- `created_at`: Timestamp
- `updated_at`: Timestamp

### business_results
- `id`: Primary key
- `business_id`: Connecticut business ID
- `keyword`: Associated keywords
- `business_name`, `business_alei`, `business_status`, etc.
- `principal_*`: Principal information fields
- `agent_*`: Agent information fields
- `created_at`, `updated_at`: Timestamps

## Project Structure

```
.
├── backend/
│   ├── main.py           # FastAPI application
│   ├── models.py         # SQLAlchemy models
│   ├── database.py       # Database configuration
│   ├── schemas.py        # Pydantic schemas
│   ├── data_fetcher.py   # Data fetching logic
│   └── scheduler.py      # APScheduler configuration
├── frontend/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   │   ├── KeywordPanel.tsx
│   │   ├── ResultsTable.tsx
│   │   ├── BusinessModal.tsx
│   │   └── ThemeToggle.tsx
│   └── lib/              # Utilities
│       ├── store.ts      # Zustand store
│       └── api.ts        # API client
├── start.sh              # Combined startup script
└── README.md

```

## Features in Detail

### Backend Status System
- **idle**: Backend is ready for operations
- **busy**: Backend is currently fetching/updating data
- UI buttons are automatically disabled during busy state

### Keyword Management
- Add new keywords to track
- Edit existing keywords
- Delete keywords you no longer need
- Changes are only saved when you click "Save Changes"
- All operations are disabled during data updates

### Results Table
- Pagination with configurable page size
- Unified search across multiple fields
- Per-column filtering
- Hover effect with click-to-view tooltip
- Column resizing support
- Long text truncation with full text on hover

### Business Modal
Three sections of information:
1. **General Information**: Basic business details, formation date, status, addresses
2. **Principal Details**: Information about business principals
3. **Agent Details**: Registered agent information

## Development Notes

- The frontend proxies API requests to the backend
- CORS is configured to allow all origins in development
- SQLite database is created automatically on first run
- APScheduler runs in the background for auto-updates
- Theme preference is stored in localStorage

## Troubleshooting

**Backend not starting?**
- Ensure all Python dependencies are installed
- Check that port 8000 is available

**Frontend not loading?**
- Ensure all npm dependencies are installed
- Check that port 5000 is available
- Verify the backend is running

**Data not updating?**
- Check the status indicator for busy/idle state
- Look for error messages in the browser console
- Verify internet connectivity to Connecticut Open Data APIs

## License

This project is built for educational purposes.

## Support

For issues or questions, please refer to the project repository or contact the development team.
