from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date

from app.db import get_db
from app.crud import members
from app.schemas import Member, MemberCreate, MemberUpdate, MemberWithDetails, SearchParams, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all members with pagination and optional search"""
    try:
        if search:
            members_list = await members.search_members(db, search, skip, limit)
            total = len(members_list)  # For search, we get all results
        else:
            members_list = await members.get_multi(db, skip, limit)
            # Get total count for pagination
            total_result = await db.execute("SELECT COUNT(*) FROM members")
            total = total_result.scalar()
        
        pages = (total + limit - 1) // limit
        
        return PaginatedResponse(
            items=[member.__dict__ for member in members_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving members: {str(e)}")

@router.get("/active", response_model=List[Member])
async def get_active_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get all active members (with valid memberships)"""
    try:
        return await members.get_active_members(db, skip, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving active members: {str(e)}")

@router.get("/{member_id}", response_model=MemberWithDetails)
async def get_member(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific member by ID with all related details"""
    try:
        member = await members.get_with_details(db, member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        return member
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving member: {str(e)}")

@router.post("/", response_model=Member)
async def create_member(member: MemberCreate, db: AsyncSession = Depends(get_db)):
    """Create a new member"""
    try:
        # Check if email already exists
        existing_member = await members.get_by_email(db, member.Email)
        if existing_member:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        return await members.create(db, member)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating member: {str(e)}")

@router.put("/{member_id}", response_model=Member)
async def update_member(
    member_id: int, 
    member_update: MemberUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a member"""
    try:
        # Check if member exists
        existing_member = await members.get(db, member_id)
        if not existing_member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # If email is being updated, check for duplicates
        if member_update.Email and member_update.Email != existing_member.Email:
            duplicate_member = await members.get_by_email(db, member_update.Email)
            if duplicate_member:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        return await members.update(db, member_id, member_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating member: {str(e)}")

@router.delete("/{member_id}", response_model=APIResponse)
async def delete_member(member_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a member"""
    try:
        # Check if member exists
        existing_member = await members.get(db, member_id)
        if not existing_member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        success = await members.delete(db, member_id)
        if success:
            return APIResponse(
                success=True,
                message="Member deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete member")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting member: {str(e)}")

@router.get("/{member_id}/enrollments")
async def get_member_enrollments(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get all enrollments for a specific member"""
    try:
        member = await members.get(db, member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Member enrollments endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving member enrollments: {str(e)}")

@router.get("/{member_id}/payments")
async def get_member_payments(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get all payments for a specific member"""
    try:
        member = await members.get(db, member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Member payments endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving member payments: {str(e)}")

@router.get("/{member_id}/health-metrics")
async def get_member_health_metrics(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get health metrics for a specific member"""
    try:
        member = await members.get(db, member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Member health metrics endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving member health metrics: {str(e)}")
