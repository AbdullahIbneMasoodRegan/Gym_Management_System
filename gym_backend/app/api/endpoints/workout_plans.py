from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import get_db
from app.crud import workout_plans
from app.schemas import WorkoutPlan, WorkoutPlanCreate, WorkoutPlanUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_workout_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    member_id: Optional[int] = Query(None),
    trainer_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all workout plans with optional filtering and pagination"""
    try:
        if member_id:
            workout_plans_list = await workout_plans.get_by_member(db, member_id)
        elif trainer_id:
            workout_plans_list = await workout_plans.get_by_trainer(db, trainer_id)
        else:
            workout_plans_list = await workout_plans.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not any([member_id, trainer_id]):
            total_result = await db.execute("SELECT COUNT(*) FROM workout_plans")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(workout_plans_list)
            pages = 1
        
        return PaginatedResponse(
            items=[plan.__dict__ for plan in workout_plans_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving workout plans: {str(e)}")

@router.get("/{plan_id}", response_model=WorkoutPlan)
async def get_workout_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific workout plan by ID"""
    try:
        workout_plan = await workout_plans.get(db, plan_id)
        if not workout_plan:
            raise HTTPException(status_code=404, detail="Workout plan not found")
        return workout_plan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving workout plan: {str(e)}")

@router.post("/", response_model=WorkoutPlan)
async def create_workout_plan(workout_plan: WorkoutPlanCreate, db: AsyncSession = Depends(get_db)):
    """Create a new workout plan"""
    try:
        return await workout_plans.create(db, workout_plan)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating workout plan: {str(e)}")

@router.put("/{plan_id}", response_model=WorkoutPlan)
async def update_workout_plan(
    plan_id: int, 
    workout_plan_update: WorkoutPlanUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a workout plan"""
    try:
        # Check if workout plan exists
        existing_plan = await workout_plans.get(db, plan_id)
        if not existing_plan:
            raise HTTPException(status_code=404, detail="Workout plan not found")
        
        return await workout_plans.update(db, plan_id, workout_plan_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating workout plan: {str(e)}")

@router.delete("/{plan_id}", response_model=APIResponse)
async def delete_workout_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a workout plan"""
    try:
        # Check if workout plan exists
        existing_plan = await workout_plans.get(db, plan_id)
        if not existing_plan:
            raise HTTPException(status_code=404, detail="Workout plan not found")
        
        success = await workout_plans.delete(db, plan_id)
        if success:
            return APIResponse(
                success=True,
                message="Workout plan deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete workout plan")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting workout plan: {str(e)}")

@router.get("/member/{member_id}")
async def get_member_workout_plans(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get all workout plans for a specific member"""
    try:
        workout_plans_list = await workout_plans.get_by_member(db, member_id)
        return {
            "member_id": member_id,
            "workout_plans": [plan.__dict__ for plan in workout_plans_list],
            "count": len(workout_plans_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving member workout plans: {str(e)}")

@router.get("/trainer/{trainer_id}")
async def get_trainer_workout_plans(trainer_id: int, db: AsyncSession = Depends(get_db)):
    """Get all workout plans for a specific trainer"""
    try:
        workout_plans_list = await workout_plans.get_by_trainer(db, trainer_id)
        return {
            "trainer_id": trainer_id,
            "workout_plans": [plan.__dict__ for plan in workout_plans_list],
            "count": len(workout_plans_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trainer workout plans: {str(e)}")

@router.get("/member/{member_id}/active")
async def get_member_active_workout_plans(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get active workout plans for a specific member"""
    try:
        active_plans = await workout_plans.get_active_plans(db, member_id)
        return {
            "member_id": member_id,
            "active_workout_plans": [plan.__dict__ for plan in active_plans],
            "count": len(active_plans)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving active workout plans: {str(e)}")
