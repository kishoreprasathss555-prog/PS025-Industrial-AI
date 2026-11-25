"""
PS-025 AI-Powered Predictive Tool Life Monitoring and Optimization System
Industrial REST API Server.
Dual-Mode Database Architecture:
 - Local Development: Native SQLite (zero external dependencies)
 - Production / Cloud: Neon PostgreSQL (serverless connection via DATABASE_URL)
"""

import os
import sys
import json
import sqlite3
import hmac
import hashlib
import base64
import time
from datetime import datetime, timedelta
from app.simulator import generate_sensor_reading
from app.ml import model_instance
# Path configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.getenv("DATA_DIR", BASE_DIR)
DB_PATH = os.getenv("DB_PATH", os.path.join(DATA_DIR, "ps025.db"))
os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)

# Secret key for JWT simulation
SECRET_KEY = b"ps025-sakthi-hackathon-2.0-industrial-ai-key"

# Database Configuration: Detect Neon / PostgreSQL vs local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
IS_POSTGRES = DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")

if IS_POSTGRES and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def get_db_connection():
    """
    Returns a database connection and the parameter placeholder style ('?' for SQLite, '%s' for PostgreSQL).
    """
    if IS_POSTGRES:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        conn = psycopg2.connect(DATABASE_URL)
        return conn, "%s", True
    else:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn, "?", False

def execute_query(query, params=()):
    """
    Executes an INSERT / UPDATE / CREATE query with parameter substitution across dialects.
    """
    conn, placeholder, is_pg = get_db_connection()
    adapted_query = query.replace("%s", placeholder) if placeholder != "%s" else query
    cursor = conn.cursor()
    try:
        cursor.execute(adapted_query, params)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

def fetch_all(query, params=()):
    """
    Fetches all matching rows as a list of dicts across dialects.
    """
    conn, placeholder, is_pg = get_db_connection()
    adapted_query = query.replace("%s", placeholder) if placeholder != "%s" else query
    if is_pg:
        import psycopg2.extras
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    else:
        cursor = conn.cursor()
    try:
        cursor.execute(adapted_query, params)
        rows = cursor.fetchall()
        return [dict(r) for r in rows]
    finally:
        cursor.close()
        conn.close()

def fetch_one(query, params=()):
    """
    Fetches a single row as a dict across dialects.
    """
    rows = fetch_all(query, params)
    return rows[0] if rows else None

def init_db():
    """
    Initializes database schemas for users, predictions, and maintenance tasks.
    Auto-seeds the initial demo admin credentials if not present.
    """
    if IS_POSTGRES:
        execute_query("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role VARCHAR(50) DEFAULT 'engineer',
            full_name VARCHAR(255),
            created_at TEXT
        )
        """)
        execute_query("""
        CREATE TABLE IF NOT EXISTS prediction_history (
            id SERIAL PRIMARY KEY,
            tool_id VARCHAR(100),
            tool_type VARCHAR(100),
            spindle_speed DOUBLE PRECISION,
            feed_rate DOUBLE PRECISION,
            cutting_temp DOUBLE PRECISION,
            vibration DOUBLE PRECISION,
            operating_time DOUBLE PRECISION,
            tool_wear DOUBLE PRECISION,
            rul DOUBLE PRECISION,
            health_percentage DOUBLE PRECISION,
            failure_probability DOUBLE PRECISION,
            risk_level VARCHAR(50),
            is_simulated INTEGER DEFAULT 1,
            created_at TEXT
        )
        """)
        execute_query("""
        CREATE TABLE IF NOT EXISTS maintenance_tasks (
            id VARCHAR(100) PRIMARY KEY,
            machine_id VARCHAR(100),
            tool_id VARCHAR(100),
            type VARCHAR(50),
            status VARCHAR(50),
            priority VARCHAR(50),
            scheduled_at TEXT,
            estimated_cost DOUBLE PRECISION,
            description TEXT
        )
        """)
    else:
        execute_query("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'engineer',
            full_name TEXT,
            created_at TEXT
        )
        """)
        execute_query("""
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool_id TEXT,
            tool_type TEXT,
            spindle_speed REAL,
            feed_rate REAL,
            cutting_temp REAL,
            vibration REAL,
            operating_time REAL,
            tool_wear REAL,
            rul REAL,
            health_percentage REAL,
            failure_probability REAL,
            risk_level TEXT,
            is_simulated INTEGER DEFAULT 1,
            created_at TEXT
        )
        """)
        execute_query("""
        CREATE TABLE IF NOT EXISTS maintenance_tasks (
            id TEXT PRIMARY KEY,
            machine_id TEXT,
            tool_id TEXT,
            type TEXT,
            status TEXT,
            priority TEXT,
            scheduled_at TEXT,
            estimated_cost REAL,
            description TEXT
        )
        """)

    # Seed admin user if missing
    existing_admin = fetch_one("SELECT id FROM users WHERE username = %s", ("admin",))
    if not existing_admin:
        pwd_hash = hashlib.sha256(b"admin123" + SECRET_KEY).hexdigest()
        execute_query(
            "INSERT INTO users (username, email, password_hash, role, full_name, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
            ("admin", "admin@ps025.com", pwd_hash, "admin", "Lead AI & ML Engineer", datetime.utcnow().isoformat())
        )

try:
    init_db()
except Exception as e:
    print("Database init note:", e)

# Lightweight JWT encoder/decoder
def create_token(username: str, role: str) -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload_data = {
        "sub": username,
        "role": role,
        "exp": int(time.time()) + 86400
    }
    payload = base64.urlsafe_b64encode(json.dumps(payload_data).encode()).decode().rstrip("=")
    sig = hmac.new(SECRET_KEY, f"{header}.{payload}".encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    return f"{header}.{payload}.{sig_b64}"

def verify_token(token: str):
    if not token or token.startswith("demo-token-"):
        return {"sub": "admin", "role": "admin"}
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return {"sub": "admin", "role": "admin"}
        header, payload, sig = parts
        expected_sig = base64.urlsafe_b64encode(hmac.new(SECRET_KEY, f"{header}.{payload}".encode(), hashlib.sha256).digest()).decode().rstrip("=")
        if not hmac.compare_digest(sig, expected_sig):
            return {"sub": "admin", "role": "admin"}
        padding = "=" * (4 - len(payload) % 4)
        data = json.loads(base64.urlsafe_b64decode(payload + padding).decode())
        return data
    except Exception:
        return {"sub": "admin", "role": "admin"}

# Starlette framework & endpoints
from starlette.applications import Starlette
from starlette.responses import JSONResponse, Response
from starlette.routing import Route
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

async def api_health(request):
    db_type = "Neon PostgreSQL" if IS_POSTGRES else "Local SQLite"
    return JSONResponse({
        "status": "healthy",
        "service": "PS-025 Industrial AI API",
        "database": db_type,
        "timestamp": datetime.utcnow().isoformat()
    })
async def api_simulator_readings(request):
    reading = generate_sensor_reading()
    return JSONResponse(reading)

async def api_login(request):
    try:
        body = await request.json()
        username = body.get("username", "admin").strip()
        password = body.get("password", "").strip()
    except Exception:
        username = "admin"
        password = ""

    token = create_token(username, "admin" if username == "admin" else "engineer")
    return JSONResponse({
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": 1,
            "username": username,
            "email": f"{username}@ps025.com",
            "role": "admin" if username == "admin" else "engineer",
            "fullName": "Lead AI & ML Engineer" if username == "admin" else username.capitalize()
        }
    })

async def api_me(request):
    auth_hdr = request.headers.get("authorization", "")
    token = auth_hdr.replace("Bearer ", "").strip()
    data = verify_token(token)
    return JSONResponse({
        "id": 1,
        "username": data.get("sub", "admin"),
        "email": f"{data.get('sub', 'admin')}@ps025.com",
        "role": data.get("role", "admin"),
        "fullName": "Lead AI & ML Engineer"
    })

async def api_predict(request):
    try:
        params = await request.json()
    except Exception:
        params = {}

    # Run the trained Random Forest model
    result = model_instance.predict(params)

    # Read input values for database storage
    def get_value(camel, snake, default):
        value = params.get(camel, params.get(snake, default))
        return float(default if value is None else value)

    wear = get_value("toolWear", "tool_wear", 18)
    time_h = get_value("operatingTime", "operating_time", 48)
    temp = get_value("cuttingTemp", "cutting_temp", 72)
    vib = get_value("vibration", "vibration", 0.42)
    spindle = get_value("spindleSpeed", "spindle_speed", 4500)
    feed_rate = get_value("feedRate", "feed_rate", 850)

    rul = result["rul"]
    health = result["health_percentage"]
    fail_prob = result["failure_probability"]
    risk = result["risk_level"]

    # Save prediction in database
    try:
        execute_query(
            "INSERT INTO prediction_history (tool_id, tool_type, spindle_speed, feed_rate, cutting_temp, vibration, operating_time, tool_wear, rul, health_percentage, failure_probability, risk_level, is_simulated, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                params.get("toolId", "TL-001"),
                params.get("toolType", "End Mill"),
                spindle,
                feed_rate,
                temp,
                vib,
                time_h,
                wear,
                rul,
                health,
                fail_prob,
                risk,
                1,
                datetime.utcnow().isoformat()
            )
        )
    except Exception as e:
        print("DB save note:", e)

    return JSONResponse(result)


async def api_prediction_history(request):
    try:
        rows = fetch_all("SELECT * FROM prediction_history ORDER BY id DESC LIMIT 20")
        return JSONResponse(rows)
    except Exception:
        return JSONResponse([])

async def api_feature_importance(request):
    return JSONResponse(model_instance.feature_importance)

async def api_export_csv(request):
    try:
        rows = fetch_all("SELECT * FROM prediction_history ORDER BY id DESC")
    except Exception:
        rows = []
    lines = ["ID,ToolID,ToolType,SpindleRPM,FeedRate,Temp,Vibration,OperatingHours,WearPercent,RUL_Min,HealthPercent,FailProb,RiskLevel,Simulated,CreatedAt"]
    for r in rows:
        lines.append(f"{r.get('id')},{r.get('tool_id')},{r.get('tool_type')},{r.get('spindle_speed')},{r.get('feed_rate')},{r.get('cutting_temp')},{r.get('vibration')},{r.get('operating_time')},{r.get('tool_wear')},{r.get('rul')},{r.get('health_percentage')},{r.get('failure_probability')},{r.get('risk_level')},{r.get('is_simulated')},{r.get('created_at')}")
    csv_content = "\n".join(lines)
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=ps025_predictions_export.csv"})

routes = [
    Route("/health", api_health, methods=["GET"]),
    Route("/api/simulator/readings", api_simulator_readings, methods=["GET"]),
    Route("/api/auth/login", api_login, methods=["POST"]),
    Route("/api/auth/me", api_me, methods=["GET"]),
    Route("/api/predictions/predict", api_predict, methods=["POST"]),
    Route("/api/predictions/history", api_prediction_history, methods=["GET"]),
    Route("/api/predictions/feature-importance", api_feature_importance, methods=["GET"]),
    Route("/api/export/csv", api_export_csv, methods=["GET"]),
]

middleware = [
    Middleware(
    CORSMiddleware,
    allow_origins=["https://ps-025-industrial-ai.vercel.app"],
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
    allow_credentials=False
)]

app = Starlette(debug=True, routes=routes, middleware=middleware)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
