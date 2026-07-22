# Vision2Venture 🚀

> AI-Powered Startup Analysis Platform — Transform your startup ideas into detailed business intelligence reports.

## Features

- **AI Analysis Engine** — Powered by Google Gemini for market research, competitor analysis, SWOT, financial projections, and more
- **NLP Processing** — spaCy-powered keyword extraction, domain classification, and problem/solution parsing
- **ML Scoring** — Risk assessment, feasibility analysis, and investor readiness scoring
- **9-Tab Dashboard** — Overview, Market, Competitors, Technology, Business Model, Financial, Risk, Roadmap, Report
- **PDF Reports** — Professional multi-page downloadable business reports
- **JWT Authentication** — Secure user registration and login
- **Premium UI** — Dark theme, glassmorphism, smooth animations, Chart.js visualizations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, React Router, Axios, Chart.js, React Icons |
| **Backend** | FastAPI (Python), SQLAlchemy ORM, Pydantic v2 |
| **Database** | MySQL 8.0 |
| **AI/ML** | Google Gemini API, spaCy NLP, Scikit-learn heuristics |
| **PDF** | ReportLab |

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MySQL 8.0+** (MySQL Workbench)
- **Google Gemini API Key** (free at [aistudio.google.com](https://aistudio.google.com/apikey))

## Quick Start

### 1. Database Setup

Open MySQL Workbench and run:
```sql
source database/schema.sql;
```

### 2. Configure Environment

Edit the `.env` file in the project root:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vision2venture
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Open the App

Navigate to **http://localhost:5173** in your browser.

## Project Structure

```
vision2venture/
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment settings
│   │   ├── main.py                # FastAPI entry point
│   │   ├── database/              # SQLAlchemy connection
│   │   ├── models/                # ORM models (15 tables)
│   │   ├── schemas/               # Pydantic schemas
│   │   ├── routers/               # API routes
│   │   ├── services/              # Business logic
│   │   │   ├── nlp_service.py     # spaCy NLP
│   │   │   ├── ai_service.py      # Gemini AI
│   │   │   ├── ml_service.py      # ML scoring
│   │   │   ├── analysis_service.py # Orchestrator
│   │   │   └── report_service.py  # PDF generation
│   │   ├── middleware/            # CORS, rate limiting
│   │   └── utils/                 # JWT, password hashing
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/                 # 8 pages
│       ├── components/            # UI components + 9 analysis tabs
│       ├── context/               # Auth context
│       ├── services/              # API client
│       └── styles/                # CSS design system
├── database/
│   └── schema.sql                 # MySQL DDL
└── .env                           # Environment variables
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| POST | `/api/startup/create` | Create startup idea |
| GET | `/api/startup/list` | List user's ideas |
| POST | `/api/analysis/{id}/run` | Run AI analysis |
| GET | `/api/analysis/{id}/status` | Check status |
| GET | `/api/analysis/{id}/overview` | Get overview |
| GET | `/api/analysis/{id}/market` | Get market data |
| GET | `/api/analysis/{id}/competitors` | Get competitors |
| GET | `/api/analysis/{id}/technology` | Get tech stack |
| GET | `/api/analysis/{id}/business` | Get business model + SWOT |
| GET | `/api/analysis/{id}/financial` | Get financials |
| GET | `/api/analysis/{id}/risk` | Get risk + feasibility |
| GET | `/api/analysis/{id}/roadmap` | Get roadmap |
| POST | `/api/report/{id}/generate` | Generate PDF |
| GET | `/api/report/{id}/download` | Download PDF |

## License

MIT License — Built with ❤️ by Vision2Venture
