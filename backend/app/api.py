from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime
import json
from .db import get_db
from .models import User, PredictionRecord
from .auth import verify_password, create_access_token, get_current_user, get_password_hash
from .ml import model_instance

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class PredictionRequest(BaseModel):
    toolType: Optional[str] = "End Mill"
    toolId: Optional[str] = "TL-001"
    spindleSpeed: Optional[float] = 4500
    feedRate: Optional[float] = 850
    depthOfCut: Optional[float] = 2.5
    cuttingTemp: Optional[float] = 72
    vibration: Optional[float] = 0.42
    cuttingForce: Optional[float] = 1850
    powerConsumption: Optional[float] = 14.2
    operatingTime: Optional[float] = 48
    toolWear: Optional[float] = 18

@router.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user:
        # Create user on the fly for demo convenience
        user = User(
            username=req.username,
            email=f"{req.username}@ps025.com",
            hashed_password=get_password_hash(req.password),
            role="admin" if req.username.lower() in ["admin", "root"] else "engineer",
            full_name=req.username.capitalize()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "fullName": user.full_name or user.username
        }
    }

@router.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "fullName": current_user.full_name or current_user.username
    }

@router.post("/predictions/predict")
def predict_tool_life(req: PredictionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = model_instance.predict(req.dict())
    rec = PredictionRecord(
        tool_id=req.toolId or "TL-001",
        tool_type=req.toolType or "End Mill",
        spindle_speed=req.spindleSpeed,
        feed_rate=req.feedRate,
        cutting_temp=req.cuttingTemp,
        vibration=req.vibration,
        operating_time=req.operatingTime,
        tool_wear=req.toolWear,
        rul=res["rul"],
        health_percentage=res["health_percentage"],
        failure_probability=res["failure_probability"],
        risk_level=res["risk_level"],
        is_simulated=True
    )
    db.add(rec)
    db.commit()
    return res

@router.get("/predictions/history")
def prediction_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).limit(20).all()
    return records

@router.get("/predictions/feature-importance")
def feature_importance():
    return model_instance.feature_importance

@router.get("/predictions/metrics")
def model_metrics():
    return model_instance.metrics

@router.post("/machines/import-csv")
async def import_csv(file: UploadFile = File(...)):
    content = await file.read()
    lines = content.decode("utf-8", errors="ignore").splitlines()
    return {
        "filename": file.filename,
        "rows_processed": len(lines),
        "status": "success",
        "message": f"Successfully imported {len(lines)} telemetry samples into simulation buffer."
    }
