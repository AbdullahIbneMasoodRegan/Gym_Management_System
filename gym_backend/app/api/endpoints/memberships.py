from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import get_db
from app.crud import memberships
from app.schemas import Membership, MembershipCreate, MembershipUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_memberships(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    member_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all memberships with optional filtering and pagination"""
    try:
        if member_id:
            memberships_list = await memberships.get_by_member(db, member_id)
        else:
            memberships_list = await memberships.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not member_id:
            total_result = await db.execute("SELECT COUNT(*) FROM memberships")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(memberships_list)
            pages = 1
        
        return PaginatedResponse(
            items=[membership.__dict__ for membership in memberships_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving memberships: {str(e)}")

@router.get("/{membership_id}", response_model=Membership)
async def get_membership(membership_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific membership by ID"""
    try:
        membership = await memberships.get(db, membership_id)
        if not membership:
            raise HTTPException(status_code=404, detail="Membership not found")
        return membership
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving membership: {str(e)}")

@router.post("/", response_model=Membership)
async def create_membership(membership: MembershipCreate, db: AsyncSession = Depends(get_db)):
    """Create a new membership"""
    try:
        return await memberships.create(db, membership)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating membership: {str(e)}")

@router.put("/{membership_id}", response_model=Membership)
async def update_membership(
    membership_id: int, 
    membership_update: MembershipUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a membership"""
    try:
        # Check if membership exists
        existing_membership = await memberships.get(db, membership_id)
        if not existing_membership:
            raise HTTPException(status_code=404, detail="Membership not found")
        
        return await memberships.update(db, membership_id, membership_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating membership: {str(e)}")

@router.delete("/{membership_id}", response_model=APIResponse)
async def delete_membership(membership_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a membership"""
    try:
        # Check if membership exists
        existing_membership = await memberships.get(db, membership_id)
        if not existing_membership:
            raise HTTPException(status_code=404, detail="Membership not found")
        
        success = await memberships.delete(db, membership_id)
        if success:
            return APIResponse(
                success=True,
                message="Membership deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete membership")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting membership: {str(e)}")

@router.get("/member/{member_id}")
async def get_member_memberships(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get all memberships for a specific member"""
    try:
        memberships_list = await memberships.get_by_member(db, member_id)
        return {
            "member_id": member_id,
            "memberships": [membership.__dict__ for membership in memberships_list],
            "count": len(memberships_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving member memberships: {str(e)}")

@router.get("/member/{member_id}/active")
async def get_member_active_membership(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get active membership for a specific member"""
    try:
        active_membership = await memberships.get_active_membership(db, member_id)
        if active_membership:
            return {
                "member_id": member_id,
                "active_membership": active_membership.__dict__,
                "has_active_membership": True
            }
        else:
            return {
                "member_id": member_id,
                "active_membership": None,
                "has_active_membership": False
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving active membership: {str(e)}")

@router.get("/expiring")
async def get_expiring_memberships(
    days: int = Query(30, ge=1, le=365, description="Number of days to look ahead"),
    db: AsyncSession = Depends(get_db)
):
    """Get memberships that are expiring within the specified number of days"""
    try:
        expiring_memberships = await memberships.get_expiring_memberships(db, days)
        return {
            "days_ahead": days,
            "expiring_memberships": [membership.__dict__ for membership in expiring_memberships],
            "count": len(expiring_memberships)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving expiring memberships: {str(e)}")
