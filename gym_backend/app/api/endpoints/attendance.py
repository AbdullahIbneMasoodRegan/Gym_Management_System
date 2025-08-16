from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date

from app.db import get_db
from app.crud import attendance
from app.schemas import Attendance, AttendanceCreate, AttendanceUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_attendance(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    member_id: Optional[int] = Query(None),
    branch_id: Optional[int] = Query(None),
    date: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all attendance records with optional filtering and pagination"""
    try:
        if member_id:
            attendance_list = await attendance.get_by_member(db, member_id)
        elif branch_id:
            attendance_list = await attendance.get_by_branch(db, branch_id)
        elif date:
            attendance_list = await attendance.get_by_date(db, date)
        else:
            attendance_list = await attendance.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not any([member_id, branch_id, date]):
            total_result = await db.execute("SELECT COUNT(*) FROM attendance")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(attendance_list)
            pages = 1
        
        return PaginatedResponse(
            items=[att.__dict__ for att in attendance_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving attendance: {str(e)}")

@router.get("/{attendance_id}", response_model=Attendance)
async def get_attendance_record(attendance_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific attendance record by ID"""
    try:
        attendance_record = await attendance.get(db, attendance_id)
        if not attendance_record:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        return attendance_record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving attendance: {str(e)}")

@router.post("/", response_model=Attendance)
async def create_attendance(attendance_data: AttendanceCreate, db: AsyncSession = Depends(get_db)):
    """Create a new attendance record"""
    try:
        return await attendance.create(db, attendance_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating attendance: {str(e)}")

@router.put("/{attendance_id}", response_model=Attendance)
async def update_attendance(
    attendance_id: int, 
    attendance_update: AttendanceUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update an attendance record"""
    try:
        # Check if attendance exists
        existing_attendance = await attendance.get(db, attendance_id)
        if not existing_attendance:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        
        return await attendance.update(db, attendance_id, attendance_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating attendance: {str(e)}")

@router.delete("/{attendance_id}", response_model=APIResponse)
async def delete_attendance(attendance_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an attendance record"""
    try:
        # Check if attendance exists
        existing_attendance = await attendance.get(db, attendance_id)
        if not existing_attendance:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        
        success = await attendance.delete(db, attendance_id)
        if success:
            return APIResponse(
                success=True,
                message="Attendance record deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete attendance record")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting attendance: {str(e)}")

@router.post("/check-in")
async def check_in_member(
    member_id: int,
    branch_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Check in a member at a specific branch"""
    try:
        attendance_record = await attendance.check_in_member(db, member_id, branch_id)
        if attendance_record:
            return {
                "success": True,
                "message": "Member checked in successfully",
                "attendance": attendance_record.__dict__
            }
        else:
            return {
                "success": False,
                "message": "Member is already checked in"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking in member: {str(e)}")

@router.post("/check-out")
async def check_out_member(
    member_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Check out a member"""
    try:
        attendance_record = await attendance.check_out_member(db, member_id)
        if attendance_record:
            return {
                "success": True,
                "message": "Member checked out successfully",
                "attendance": attendance_record.__dict__
            }
        else:
            return {
                "success": False,
                "message": "Member is not currently checked in"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking out member: {str(e)}")

@router.get("/member/{member_id}")
async def get_member_attendance(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get all attendance records for a specific member"""
    try:
        attendance_list = await attendance.get_by_member(db, member_id)
        return {
            "member_id": member_id,
            "attendance": [att.__dict__ for att in attendance_list],
            "total_visits": len(attendance_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving member attendance: {str(e)}")

@router.get("/branch/{branch_id}")
async def get_branch_attendance(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get all attendance records for a specific branch"""
    try:
        attendance_list = await attendance.get_by_branch(db, branch_id)
        return {
            "branch_id": branch_id,
            "attendance": [att.__dict__ for att in attendance_list],
            "total_visits": len(attendance_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving branch attendance: {str(e)}")

@router.get("/date/{date}")
async def get_attendance_by_date(attendance_date: date, db: AsyncSession = Depends(get_db)):
    """Get all attendance records for a specific date"""
    try:
        attendance_list = await attendance.get_by_date(db, attendance_date)
        return {
            "date": attendance_date,
            "attendance": [att.__dict__ for att in attendance_list],
            "total_visits": len(attendance_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving attendance by date: {str(e)}")
