# Vision2Venture 🚀

> AI-Powered Startup Analysis Platform — Transform your startup ideas into detailed business intelligence reports.

## Features

- **AI Analysis Engine** — Groq / NVIDIA LLMs (Qwen) interpret **real-world market signals** (not invented data) to produce market research, competitor analysis, SWOT, and financial projections, with a labelled template fallback when the LLM is unavailable
- **Real-Data Grounding** — Free, no-key public sources: Google Trends (search demand), World Bank (macro indicators), Google News (headlines), Wikipedia (company profiles), OpenStreetMap/Overpass (physical competitors), and a Y Combinator dataset + web search (online competitors)
- **NLP Processing** — Keyword extraction, domain classification, and problem/solution parsing
- **ML Scoring** — Startup success prediction, risk, feasibility, and investor-readiness models trained on real datasets (Crunchbase, unicorns, Indian funding)
- **Transparent Provenance** — Every output carries a `data_source` label rendered as a colour-coded badge (Real / AI-grounded / Benchmark / Fallback)
- **9-Tab Dashboard** — Overview, Market, Competitors, Technology, Business Model, Financial, Risk, Roadmap, Report
- **PDF Reports** — Professional multi-page downloadable business reports
- **JWT Authentication** — Secure user registration and login
- **Premium UI** — Dark theme, glassmorphism, smooth animations, Chart.js visualizations

> **Note on accuracy:** For a *new* idea, market size, growth, and financial figures are **AI/benchmark estimates**, not measured company data — an idea-stage startup has no real financials or market share. Competitor identities, macro indicators, and news are real; the interpretive figures are estimates, and the UI is transparent about which is which. See `docs/LIMITATIONS_AND_FUTURE_WORK.md`.
>
> Nothing unverified is presented as verified. Competitor ratings and review counts are reported as unavailable rather than estimated, AI-suggested businesses are labelled "Unverified", carry no coordinates and are never plotted on the map, and an unreachable data provider is reported as unknown rather than as a finding of zero competition. `backend/test_analysis_accuracy.py` (57 checks) guards these properties.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, React Router, Axios, Chart.js, React Icons |
| **Backend** | FastAPI (Python), SQLAlchemy ORM, Pydantic v2 |
| **Database** | MySQL 8.0 |
| **AI/ML** | Groq & NVIDIA LLMs (Qwen), NLP, Scikit-learn ensemble models (7 trained models) |
| **Real-Data APIs** | Google Trends, World Bank, Google News RSS, Wikipedia, OpenStreetMap/Overpass, DuckDuckGo/Tavily/Brave |
| **PDF** | ReportLab |

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MySQL 8.0+** (MySQL Workbench)
- **A Groq API key** (free at [console.groq.com](https://console.groq.com)) and/or an **NVIDIA API key** for the LLM analysis engine. All real-data sources (Google Trends, World Bank, Google News, Wikipedia, OpenStreetMap) are free and need **no key**.

## Quick Start

### 1. Database Setup

For a fresh install, open MySQL Workbench and run:
```sql
source database/schema.sql;
```

#### Database Migrations
For existing databases upgrading to the real-data and nullable-scores release, execute the migration script:
```sql
source database/migrations/002_allow_null_scores_and_add_data_source.sql;
```
This migration:
- Allows `NULL` for `overall_score` in `startup_analysis`, preventing hardcoded baseline defaults.
- Allows `NULL` for `growth_rate` and `opportunity_score` in `market_analysis` when AI or model telemetry is unavailable.
- Adds `data_source VARCHAR(100)` to `market_analysis`, `business_models`, `swot_analysis`, and `financial_analysis` to surface source provenance (Real Data / AI / Benchmark / Fallback) across the UI.


### 2. Configure Environment

Edit the `.env` file in the project root:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vision2venture
SECRET_KEY=your-secret-key
# LLM engine (set at least one). Real-data sources need no key.
GROQ_API_KEY=your-groq-api-key
NVIDIA_API_KEY=your-nvidia-api-key
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
