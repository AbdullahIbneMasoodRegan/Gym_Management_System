from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import get_db
from app.crud import trainers
from app.schemas import Trainer, TrainerCreate, TrainerUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_trainers(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    specialization: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all trainers with optional filtering and pagination"""
    try:
        if specialization:
            trainers_list = await trainers.get_by_specialization(db, specialization)
        else:
            trainers_list = await trainers.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not specialization:
            total_result = await db.execute("SELECT COUNT(*) FROM trainers")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(trainers_list)
            pages = 1
        
        return PaginatedResponse(
            items=[trainer.__dict__ for trainer in trainers_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trainers: {str(e)}")

@router.get("/{trainer_id}", response_model=Trainer)
async def get_trainer(trainer_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific trainer by ID"""
    try:
        trainer = await trainers.get(db, trainer_id)
        if not trainer:
            raise HTTPException(status_code=404, detail="Trainer not found")
        return trainer
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trainer: {str(e)}")

@router.post("/", response_model=Trainer)
async def create_trainer(trainer: TrainerCreate, db: AsyncSession = Depends(get_db)):
    """Create a new trainer"""
    try:
        # Check if email already exists
        existing_trainer = await trainers.get_by_email(db, trainer.Email)
        if existing_trainer:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        return await trainers.create(db, trainer)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating trainer: {str(e)}")

@router.put("/{trainer_id}", response_model=Trainer)
async def update_trainer(
    trainer_id: int, 
    trainer_update: TrainerUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a trainer"""
    try:
        # Check if trainer exists
        existing_trainer = await trainers.get(db, trainer_id)
        if not existing_trainer:
            raise HTTPException(status_code=404, detail="Trainer not found")
        
        # If email is being updated, check for duplicates
        if trainer_update.Email and trainer_update.Email != existing_trainer.Email:
            duplicate_trainer = await trainers.get_by_email(db, trainer_update.Email)
            if duplicate_trainer:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        return await trainers.update(db, trainer_id, trainer_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating trainer: {str(e)}")

@router.delete("/{trainer_id}", response_model=APIResponse)
async def delete_trainer(trainer_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a trainer"""
    try:
        # Check if trainer exists
        existing_trainer = await trainers.get(db, trainer_id)
        if not existing_trainer:
            raise HTTPException(status_code=404, detail="Trainer not found")
        
        success = await trainers.delete(db, trainer_id)
        if success:
            return APIResponse(
                success=True,
                message="Trainer deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete trainer")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting trainer: {str(e)}")

@router.get("/specialization/{specialization}")
async def get_trainers_by_specialization(specialization: str, db: AsyncSession = Depends(get_db)):
    """Get all trainers by specialization"""
    try:
        trainers_list = await trainers.get_by_specialization(db, specialization)
        return {
            "specialization": specialization,
            "trainers": [trainer.__dict__ for trainer in trainers_list],
            "count": len(trainers_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trainers by specialization: {str(e)}")

@router.get("/{trainer_id}/classes")
async def get_trainer_classes(trainer_id: int, db: AsyncSession = Depends(get_db)):
    """Get all classes for a specific trainer"""
    try:
        trainer = await trainers.get(db, trainer_id)
        if not trainer:
            raise HTTPException(status_code=404, detail="Trainer not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Trainer classes endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trainer classes: {str(e)}")

@router.get("/{trainer_id}/workout-plans")
async def get_trainer_workout_plans(trainer_id: int, db: AsyncSession = Depends(get_db)):
    """Get all workout plans for a specific trainer"""
    try:
        trainer = await trainers.get(db, trainer_id)
        if not trainer:
            raise HTTPException(status_code=404, detail="Trainer not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Trainer workout plans endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trainer workout plans: {str(e)}")
