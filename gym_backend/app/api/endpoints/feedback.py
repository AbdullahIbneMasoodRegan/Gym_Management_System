from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import get_db
from app.crud import feedback
from app.schemas import Feedback, FeedbackCreate, FeedbackUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_feedback(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    member_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None),
    trainer_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all feedback with optional filtering and pagination"""
    try:
        if class_id:
            feedback_list = await feedback.get_by_class(db, class_id)
        elif trainer_id:
            feedback_list = await feedback.get_by_trainer(db, trainer_id)
        elif member_id:
            # This would need to be implemented in the CRUD layer
            feedback_list = []
        else:
            feedback_list = await feedback.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not any([member_id, class_id, trainer_id]):
            total_result = await db.execute("SELECT COUNT(*) FROM feedback")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(feedback_list)
            pages = 1
        
        return PaginatedResponse(
            items=[fb.__dict__ for fb in feedback_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving feedback: {str(e)}")

@router.get("/{feedback_id}", response_model=Feedback)
async def get_feedback_item(feedback_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific feedback by ID"""
    try:
        feedback_item = await feedback.get(db, feedback_id)
        if not feedback_item:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return feedback_item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving feedback: {str(e)}")

@router.post("/", response_model=Feedback)
async def create_feedback(feedback_data: FeedbackCreate, db: AsyncSession = Depends(get_db)):
    """Create a new feedback"""
    try:
        return await feedback.create(db, feedback_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating feedback: {str(e)}")

@router.put("/{feedback_id}", response_model=Feedback)
async def update_feedback(
    feedback_id: int, 
    feedback_update: FeedbackUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a feedback"""
    try:
        # Check if feedback exists
        existing_feedback = await feedback.get(db, feedback_id)
        if not existing_feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        
        return await feedback.update(db, feedback_id, feedback_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating feedback: {str(e)}")

@router.delete("/{feedback_id}", response_model=APIResponse)
async def delete_feedback(feedback_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a feedback"""
    try:
        # Check if feedback exists
        existing_feedback = await feedback.get(db, feedback_id)
        if not existing_feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        
        success = await feedback.delete(db, feedback_id)
        if success:
            return APIResponse(
                success=True,
                message="Feedback deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete feedback")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting feedback: {str(e)}")

@router.get("/class/{class_id}")
async def get_class_feedback(class_id: int, db: AsyncSession = Depends(get_db)):
    """Get all feedback for a specific class"""
    try:
        feedback_list = await feedback.get_by_class(db, class_id)
        average_rating = await feedback.get_average_rating(db, class_id=class_id)
        return {
            "class_id": class_id,
            "feedback": [fb.__dict__ for fb in feedback_list],
            "count": len(feedback_list),
            "average_rating": float(average_rating) if average_rating else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving class feedback: {str(e)}")

@router.get("/trainer/{trainer_id}")
async def get_trainer_feedback(trainer_id: int, db: AsyncSession = Depends(get_db)):
    """Get all feedback for a specific trainer"""
    try:
        feedback_list = await feedback.get_by_trainer(db, trainer_id)
        average_rating = await feedback.get_average_rating(db, trainer_id=trainer_id)
        return {
            "trainer_id": trainer_id,
            "feedback": [fb.__dict__ for fb in feedback_list],
            "count": len(feedback_list),
            "average_rating": float(average_rating) if average_rating else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trainer feedback: {str(e)}")

@router.get("/rating/average")
async def get_average_rating(
    class_id: Optional[int] = Query(None),
    trainer_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get average rating for a class or trainer"""
    try:
        if not class_id and not trainer_id:
            raise HTTPException(status_code=400, detail="Either class_id or trainer_id must be provided")
        
        average_rating = await feedback.get_average_rating(db, class_id, trainer_id)
        return {
            "class_id": class_id,
            "trainer_id": trainer_id,
            "average_rating": float(average_rating) if average_rating else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating average rating: {str(e)}")
