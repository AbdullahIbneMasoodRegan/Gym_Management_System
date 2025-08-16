from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date, datetime

from app.db import get_db
from app.crud import classes
from app.schemas import Class, ClassCreate, ClassUpdate, ClassWithDetails, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_classes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    branch_id: Optional[int] = Query(None),
    trainer_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all classes with optional filtering and pagination"""
    try:
        if branch_id:
            classes_list = await classes.get_by_branch(db, branch_id)
        elif trainer_id:
            classes_list = await classes.get_by_trainer(db, trainer_id)
        elif date_from and date_to:
            classes_list = await classes.get_by_date_range(db, date_from, date_to)
        else:
            classes_list = await classes.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not any([branch_id, trainer_id, date_from, date_to]):
            total_result = await db.execute("SELECT COUNT(*) FROM classes")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(classes_list)
            pages = 1
        
        return PaginatedResponse(
            items=[cls.__dict__ for cls in classes_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving classes: {str(e)}")

@router.get("/{class_id}", response_model=ClassWithDetails)
async def get_class(class_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific class by ID with enrollment and feedback details"""
    try:
        class_obj = await classes.get_with_details(db, class_id)
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")
        return class_obj
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving class: {str(e)}")

@router.post("/", response_model=Class)
async def create_class(class_data: ClassCreate, db: AsyncSession = Depends(get_db)):
    """Create a new class"""
    try:
        # Validate that the schedule is in the future
        if class_data.Schedule <= datetime.now():
            raise HTTPException(status_code=400, detail="Class schedule must be in the future")
        
        # Validate capacity and duration
        if class_data.Capacity <= 0:
            raise HTTPException(status_code=400, detail="Class capacity must be greater than 0")
        
        if class_data.Duration <= 0:
            raise HTTPException(status_code=400, detail="Class duration must be greater than 0")
        
        return await classes.create(db, class_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating class: {str(e)}")

@router.put("/{class_id}", response_model=Class)
async def update_class(
    class_id: int, 
    class_update: ClassUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a class"""
    try:
        # Check if class exists
        existing_class = await classes.get(db, class_id)
        if not existing_class:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Validate schedule if being updated
        if class_update.Schedule and class_update.Schedule <= datetime.now():
            raise HTTPException(status_code=400, detail="Class schedule must be in the future")
        
        # Validate capacity if being updated
        if class_update.Capacity is not None and class_update.Capacity <= 0:
            raise HTTPException(status_code=400, detail="Class capacity must be greater than 0")
        
        # Validate duration if being updated
        if class_update.Duration is not None and class_update.Duration <= 0:
            raise HTTPException(status_code=400, detail="Class duration must be greater than 0")
        
        return await classes.update(db, class_id, class_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating class: {str(e)}")

@router.delete("/{class_id}", response_model=APIResponse)
async def delete_class(class_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a class"""
    try:
        # Check if class exists
        existing_class = await classes.get(db, class_id)
        if not existing_class:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Check if class has enrollments
        # This would need to be implemented in the CRUD layer
        # For now, we'll allow deletion
        
        success = await classes.delete(db, class_id)
        if success:
            return APIResponse(
                success=True,
                message="Class deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete class")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting class: {str(e)}")

@router.get("/{class_id}/enrollments")
async def get_class_enrollments(class_id: int, db: AsyncSession = Depends(get_db)):
    """Get all enrollments for a specific class"""
    try:
        class_obj = await classes.get(db, class_id)
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Class enrollments endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving class enrollments: {str(e)}")

@router.get("/{class_id}/feedback")
async def get_class_feedback(class_id: int, db: AsyncSession = Depends(get_db)):
    """Get all feedback for a specific class"""
    try:
        class_obj = await classes.get(db, class_id)
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Class feedback endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving class feedback: {str(e)}")

@router.get("/available/{member_id}")
async def get_available_classes(
    member_id: int, 
    class_date: date = Query(..., description="Date to check for available classes"),
    db: AsyncSession = Depends(get_db)
):
    """Get available classes for a specific member on a specific date"""
    try:
        available_classes = await classes.get_available_classes(db, member_id, class_date)
        return {
            "member_id": member_id,
            "date": class_date,
            "available_classes": [cls.__dict__ for cls in available_classes]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving available classes: {str(e)}")

@router.get("/schedule/{branch_id}")
async def get_branch_schedule(
    branch_id: int,
    date_from: date = Query(..., description="Start date for schedule"),
    date_to: date = Query(..., description="End date for schedule"),
    db: AsyncSession = Depends(get_db)
):
    """Get class schedule for a specific branch within a date range"""
    try:
        if date_from > date_to:
            raise HTTPException(status_code=400, detail="Start date must be before end date")
        
        classes_list = await classes.get_by_date_range(db, date_from, date_to)
        branch_classes = [cls for cls in classes_list if cls.BranchID == branch_id]
        
        return {
            "branch_id": branch_id,
            "date_from": date_from,
            "date_to": date_to,
            "classes": [cls.__dict__ for cls in branch_classes]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving branch schedule: {str(e)}")
