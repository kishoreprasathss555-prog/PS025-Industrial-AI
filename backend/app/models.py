from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from .db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="engineer")
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PredictionRecord(Base):
    __tablename__ = "prediction_history"
    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(String)
    tool_type = Column(String)
    spindle_speed = Column(Float)
    feed_rate = Column(Float)
    cutting_temp = Column(Float)
    vibration = Column(Float)
    operating_time = Column(Float)
    tool_wear = Column(Float)
    rul = Column(Float)
    health_percentage = Column(Float)
    failure_probability = Column(Float)
    risk_level = Column(String)
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
