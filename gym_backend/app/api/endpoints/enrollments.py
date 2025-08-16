from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date

from app.db import get_db
from app.crud import enrollments, members, classes
from app.schemas import Enrollment, EnrollmentCreate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_enrollments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    member_id: Optional[int] = Query(None),
    class_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all enrollments with optional filtering and pagination"""
    try:
        if member_id:
            enrollments_list = await enrollments.get_by_member(db, member_id)
        elif class_id:
            enrollments_list = await enrollments.get_by_class(db, class_id)
        else:
            enrollments_list = await enrollments.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not any([member_id, class_id]):
            total_result = await db.execute("SELECT COUNT(*) FROM enrollments")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(enrollments_list)
            pages = 1
        
        return PaginatedResponse(
            items=[enrollment.__dict__ for enrollment in enrollments_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving enrollments: {str(e)}")

@router.get("/{enrollment_id}", response_model=Enrollment)
async def get_enrollment(enrollment_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific enrollment by ID"""
    try:
        enrollment = await enrollments.get(db, enrollment_id)
        if not enrollment:
            raise HTTPException(status_code=404, detail="Enrollment not found")
        return enrollment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving enrollment: {str(e)}")

@router.post("/", response_model=Enrollment)
async def create_enrollment(enrollment_data: EnrollmentCreate, db: AsyncSession = Depends(get_db)):
    """Create a new enrollment"""
    try:
        # Check if member exists
        member = await members.get(db, enrollment_data.MemberID)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # Check if class exists
        class_obj = await classes.get(db, enrollment_data.ClassID)
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Check if member is already enrolled
        existing_enrollment = await enrollments.check_enrollment(
            db, enrollment_data.MemberID, enrollment_data.ClassID
        )
        if existing_enrollment:
            raise HTTPException(status_code=400, detail="Member is already enrolled in this class")
        
        # Check if class has capacity
        current_enrollments = await enrollments.get_class_enrollment_count(db, enrollment_data.ClassID)
        if current_enrollments >= class_obj.Capacity:
            raise HTTPException(status_code=400, detail="Class is at full capacity")
        
        return await enrollments.create(db, enrollment_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating enrollment: {str(e)}")

@router.delete("/{enrollment_id}", response_model=APIResponse)
async def delete_enrollment(enrollment_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an enrollment"""
    try:
        # Check if enrollment exists
        existing_enrollment = await enrollments.get(db, enrollment_id)
        if not existing_enrollment:
            raise HTTPException(status_code=404, detail="Enrollment not found")
        
        success = await enrollments.delete(db, enrollment_id)
        if success:
            return APIResponse(
                success=True,
                message="Enrollment deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete enrollment")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting enrollment: {str(e)}")

@router.get("/member/{member_id}")
async def get_member_enrollments(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get all enrollments for a specific member"""
    try:
        # Check if member exists
        member = await members.get(db, member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        enrollments_list = await enrollments.get_by_member(db, member_id)
        return {
            "member_id": member_id,
            "enrollments": [enrollment.__dict__ for enrollment in enrollments_list]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving member enrollments: {str(e)}")

@router.get("/class/{class_id}")
async def get_class_enrollments(class_id: int, db: AsyncSession = Depends(get_db)):
    """Get all enrollments for a specific class"""
    try:
        # Check if class exists
        class_obj = await classes.get(db, class_id)
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")
        
        enrollments_list = await enrollments.get_by_class(db, class_id)
        return {
            "class_id": class_id,
            "enrollments": [enrollment.__dict__ for enrollment in enrollments_list],
            "total_enrolled": len(enrollments_list),
            "capacity": class_obj.Capacity,
            "available_spots": class_obj.Capacity - len(enrollments_list)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving class enrollments: {str(e)}")

@router.post("/bulk")
async def create_bulk_enrollments(
    enrollments_data: List[EnrollmentCreate], 
    db: AsyncSession = Depends(get_db)
):
    """Create multiple enrollments at once"""
    try:
        created_enrollments = []
        errors = []
        
        for enrollment_data in enrollments_data:
            try:
                # Check if member exists
                member = await members.get(db, enrollment_data.MemberID)
                if not member:
                    errors.append(f"Member {enrollment_data.MemberID} not found")
                    continue
                
                # Check if class exists
                class_obj = await classes.get(db, enrollment_data.ClassID)
                if not class_obj:
                    errors.append(f"Class {enrollment_data.ClassID} not found")
                    continue
                
                # Check if already enrolled
                existing_enrollment = await enrollments.check_enrollment(
                    db, enrollment_data.MemberID, enrollment_data.ClassID
                )
                if existing_enrollment:
                    errors.append(f"Member {enrollment_data.MemberID} already enrolled in class {enrollment_data.ClassID}")
                    continue
                
                # Check capacity
                current_enrollments = await enrollments.get_class_enrollment_count(db, enrollment_data.ClassID)
                if current_enrollments >= class_obj.Capacity:
                    errors.append(f"Class {enrollment_data.ClassID} is at full capacity")
                    continue
                
                enrollment = await enrollments.create(db, enrollment_data)
                created_enrollments.append(enrollment)
                
            except Exception as e:
                errors.append(f"Error creating enrollment for member {enrollment_data.MemberID}: {str(e)}")
        
        return {
            "success": len(errors) == 0,
            "created_enrollments": len(created_enrollments),
            "total_requested": len(enrollments_data),
            "errors": errors,
            "enrollments": [enrollment.__dict__ for enrollment in created_enrollments]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating bulk enrollments: {str(e)}")
