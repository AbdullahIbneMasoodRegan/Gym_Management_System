# app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.db import get_db
from app.api.api import api_router
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import os

# Create FastAPI app
app = FastAPI(
    title="Gym Management System API",
    description="A comprehensive API for managing gym operations including members, classes, trainers, equipment, and more.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Gym Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    """Health check endpoint"""
    try:
        result = await db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
                "timestamp": "2024-01-01T00:00:00Z"
            }
        )

@app.get("/info")
async def info():
    """API information endpoint"""
    return {
        "name": "Gym Management System API",
        "version": "1.0.0",
        "description": "A comprehensive API for managing gym operations",
        "features": [
            "Member Management",
            "Class Management",
            "Trainer Management",
            "Equipment Management",
            "Payment Processing",
            "Attendance Tracking",
            "Workout Plans",
            "Membership Management",
            "Feedback System",
            "Health Metrics",
            "Inventory Management",
            "Branch Management",
            "Staff Management"
        ],
        "endpoints": {
            "members": "/api/v1/members",
            "classes": "/api/v1/classes",
            "trainers": "/api/v1/trainers",
            "equipment": "/api/v1/equipment",
            "payments": "/api/v1/payments",
            "attendance": "/api/v1/attendance",
            "workout-plans": "/api/v1/workout-plans",
            "memberships": "/api/v1/memberships",
            "feedback": "/api/v1/feedback",
            "health-metrics": "/api/v1/health-metrics",
            "inventory": "/api/v1/inventory",
            "branches": "/api/v1/branches",
            "staff": "/api/v1/staff",
            "rooms": "/api/v1/rooms"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
