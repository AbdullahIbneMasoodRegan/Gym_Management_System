from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import get_db
from app.crud import staff
from app.schemas import Staff, StaffCreate, StaffUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_staff(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[str] = Query(None),
    branch_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all staff with optional filtering and pagination"""
    try:
        # For now, get all staff and filter in Python
        # This could be optimized with database queries
        staff_list = await staff.get_multi(db, skip, limit)
        
        # Apply filters
        if role:
            staff_list = [s for s in staff_list if s.Role == role]
        if branch_id:
            staff_list = [s for s in staff_list if s.BranchID == branch_id]
        
        total_result = await db.execute("SELECT COUNT(*) FROM staff")
        total = total_result.scalar()
        pages = (total + limit - 1) // limit
        
        return PaginatedResponse(
            items=[s.__dict__ for s in staff_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving staff: {str(e)}")

@router.get("/{staff_id}", response_model=Staff)
async def get_staff_member(staff_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific staff member by ID"""
    try:
        staff_member = await staff.get(db, staff_id)
        if not staff_member:
            raise HTTPException(status_code=404, detail="Staff member not found")
        return staff_member
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving staff member: {str(e)}")

@router.post("/", response_model=Staff)
async def create_staff(staff_data: StaffCreate, db: AsyncSession = Depends(get_db)):
    """Create a new staff member"""
    try:
        # Check if email already exists
        existing_staff = await staff.get_by_email(db, staff_data.Email)
        if existing_staff:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        return await staff.create(db, staff_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating staff member: {str(e)}")

@router.put("/{staff_id}", response_model=Staff)
async def update_staff(
    staff_id: int, 
    staff_update: StaffUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a staff member"""
    try:
        # Check if staff exists
        existing_staff = await staff.get(db, staff_id)
        if not existing_staff:
            raise HTTPException(status_code=404, detail="Staff member not found")
        
        # If email is being updated, check for duplicates
        if staff_update.Email and staff_update.Email != existing_staff.Email:
            duplicate_staff = await staff.get_by_email(db, staff_update.Email)
            if duplicate_staff:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        return await staff.update(db, staff_id, staff_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating staff member: {str(e)}")

@router.delete("/{staff_id}", response_model=APIResponse)
async def delete_staff(staff_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a staff member"""
    try:
        # Check if staff exists
        existing_staff = await staff.get(db, staff_id)
        if not existing_staff:
            raise HTTPException(status_code=404, detail="Staff member not found")
        
        success = await staff.delete(db, staff_id)
        if success:
            return APIResponse(
                success=True,
                message="Staff member deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete staff member")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting staff member: {str(e)}")

@router.get("/role/{role}")
async def get_staff_by_role(role: str, db: AsyncSession = Depends(get_db)):
    """Get all staff by role"""
    try:
        # Validate role
        valid_roles = ['Manager', 'Receptionist', 'Maintenance']
        if role not in valid_roles:
            raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")
        
        # For now, get all staff and filter by role
        # This could be optimized with database queries
        all_staff = await staff.get_multi(db, 0, 1000)
        role_staff = [s for s in all_staff if s.Role == role]
        
        return {
            "role": role,
            "staff": [s.__dict__ for s in role_staff],
            "count": len(role_staff)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving staff by role: {str(e)}")

@router.get("/branch/{branch_id}")
async def get_staff_by_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get all staff for a specific branch"""
    try:
        # For now, get all staff and filter by branch
        # This could be optimized with database queries
        all_staff = await staff.get_multi(db, 0, 1000)
        branch_staff = [s for s in all_staff if s.BranchID == branch_id]
        
        return {
            "branch_id": branch_id,
            "staff": [s.__dict__ for s in branch_staff],
            "count": len(branch_staff)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving staff by branch: {str(e)}")
