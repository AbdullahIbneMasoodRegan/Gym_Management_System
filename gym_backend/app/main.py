# app/main.py
from fastapi import FastAPI, Depends
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


app = FastAPI()

@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT 1"))
    return {"status": "ok", "db": result.scalar()}
