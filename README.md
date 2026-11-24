# PS-025: AI‑Powered Predictive Tool‑Life Monitoring and Optimization System

## Overview
A professional‑grade industrial web application that provides real‑time machine monitoring, AI‑driven tool‑life prediction, predictive maintenance, and optimization. The stack is:

- **Frontend** – React + TypeScript, Vite, Tailwind CSS, Recharts, Lucide‑React icons
- **Backend** – FastAPI (Python), PostgreSQL (SQLite fallback for local dev)
- **Machine Learning** – Scikit‑learn, XGBoost (demo model, labelled as *SIMULATED*)
- **Auth** – Role‑based JWT authentication (admin, engineer, viewer)
- **API** – RESTful endpoints for machines, tools, predictions, maintenance, alerts

The project is structured as a monorepo with separate `frontend/` and `backend/` directories.

---

## Quick Start (Windows)
```powershell
# 1. Clone / copy this folder
cd %USERPROFILE%\\.gemini\antigravity\scratch
# Already present as PS025-Industrial-AI

# 2. Install backend dependencies (uses the bundled Python interpreter)
"C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m pip install -r backend/requirements.txt

# 3. Initialise the PostgreSQL database (or use SQLite fallback)
#    Edit `backend/.env` if you want to point to a real PostgreSQL instance.
"C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" backend/app/init_db.py

# 4. Run the backend server
"C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" -m uvicorn backend/app/main:app --reload --port 8000

# 5. Open a new terminal for the frontend
cd frontend
npm install   # installs Vite, React, Tailwind, etc.
npm run dev   # starts Vite dev server on http://localhost:5173
```

The frontend will automatically talk to the backend at `http://localhost:8000`.

---

## Project Structure
```
PS025-Industrial-AI/
│   README.md
│   .gitignore
│
├─frontend/                # React + Vite app
│   │   index.html
│   │   vite.config.ts
│   │   tsconfig.json
│   │   postcss.config.cjs
│   │   tailwind.config.cjs
│   │   package.json
│   │   tsconfig.node.json
│   │
│   └─src/
│       │   main.tsx
│       │   App.tsx
│       │   routes.tsx          # react‑router routes
│       │
│       ├─components/          # reusable UI pieces (cards, charts, tables)
│       │   Header.tsx
│       │   Sidebar.tsx
│       │   StatusBadge.tsx
│       │   ...
│       └─pages/               # page‑level components
│           │   Dashboard.tsx
│           │   Machines.tsx
│           │   Tools.tsx
│           │   Maintenance.tsx
│           │   Optimization.tsx
│           │   Alerts.tsx
│           │   Auth.tsx
│           │   ...
│
└─backend/                 # FastAPI app
    │   requirements.txt
    │   .env               # DB connection string, JWT secret, etc.
    │   init_db.py         # simple script to create tables & demo data
    │   main.py            # FastAPI entry point
    │
    └─app/
        │   __init__.py
        │   db.py           # SQLAlchemy session & engine
        │   models.py       # SQLAlchemy ORM models (User, Machine, Tool, ...)
        │   schemas.py      # Pydantic models for request/response
        │   crud.py         # DB helper functions
        │   auth.py         # JWT utilities, role‑based deps
        │   ml.py           # placeholder model load / demo prediction
        │   api.py          # router with all endpoints
        │
        └─router/          # optional sub‑routers per module
            │   machines.py
            │   tools.py
            │   predictions.py
            │   maintenance.py
            │   optimization.py
            │   alerts.py
``` 

---

## Development Notes
- The UI follows a **dark navy** theme with cyan/electric‑blue accents (see `tailwind.config.cjs`).
- All charts use **Recharts** (line, area, bar, gauge‑style). 
- Icons are from **lucide‑react**.
- The ML model (`backend/app/ml.py`) loads a pre‑trained XGBoost model if present; otherwise it returns deterministic demo values and clearly marks them as *SIMULATED*.
- Authentication uses **OAuth2PasswordBearer** with JWT; role checks are done via FastAPI dependencies.
- Database migrations are kept simple – use `alembic` if you need full migrations later.

---

## License
MIT – feel free to adapt for your hackathon project.
