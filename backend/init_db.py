import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db import engine, Base, SessionLocal
from app.models import User
from app.auth import get_password_hash

def init():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        print("Creating default demo admin user: admin / admin123")
        admin = User(
            username="admin",
            email="admin@ps025.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            full_name="Lead AI & ML Engineer"
        )
        db.add(admin)
        db.commit()
    else:
        print("Admin user already exists.")
    
    db.close()
    print("Database initialization complete.")

if __name__ == "__main__":
    init()
