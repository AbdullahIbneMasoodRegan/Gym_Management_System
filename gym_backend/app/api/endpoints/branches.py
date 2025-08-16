from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import get_db
from app.crud import branches
from app.schemas import Branch, BranchCreate, BranchUpdate, BranchWithDetails, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_branches(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get all branches with pagination"""
    try:
        branches_list = await branches.get_multi(db, skip, limit)
        total_result = await db.execute("SELECT COUNT(*) FROM branches")
        total = total_result.scalar()
        pages = (total + limit - 1) // limit
        
        return PaginatedResponse(
            items=[branch.__dict__ for branch in branches_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving branches: {str(e)}")

@router.get("/{branch_id}", response_model=BranchWithDetails)
async def get_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific branch by ID with all related details"""
    try:
        branch = await branches.get_with_details(db, branch_id)
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")
        return branch
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving branch: {str(e)}")

@router.post("/", response_model=Branch)
async def create_branch(branch: BranchCreate, db: AsyncSession = Depends(get_db)):
    """Create a new branch"""
    try:
        return await branches.create(db, branch)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating branch: {str(e)}")

@router.put("/{branch_id}", response_model=Branch)
async def update_branch(
    branch_id: int, 
    branch_update: BranchUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a branch"""
    try:
        # Check if branch exists
        existing_branch = await branches.get(db, branch_id)
        if not existing_branch:
            raise HTTPException(status_code=404, detail="Branch not found")
        
        return await branches.update(db, branch_id, branch_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating branch: {str(e)}")

@router.delete("/{branch_id}", response_model=APIResponse)
async def delete_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a branch"""
    try:
        # Check if branch exists
        existing_branch = await branches.get(db, branch_id)
        if not existing_branch:
            raise HTTPException(status_code=404, detail="Branch not found")
        
        success = await branches.delete(db, branch_id)
        if success:
            return APIResponse(
                success=True,
                message="Branch deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete branch")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting branch: {str(e)}")

@router.get("/{branch_id}/staff")
async def get_branch_staff(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get all staff for a specific branch"""
    try:
        branch = await branches.get(db, branch_id)
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Branch staff endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving branch staff: {str(e)}")

@router.get("/{branch_id}/classes")
async def get_branch_classes(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get all classes for a specific branch"""
    try:
        branch = await branches.get(db, branch_id)
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Branch classes endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving branch classes: {str(e)}")

@router.get("/{branch_id}/equipment")
async def get_branch_equipment(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get all equipment for a specific branch"""
    try:
        branch = await branches.get(db, branch_id)
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Branch equipment endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving branch equipment: {str(e)}")

@router.get("/{branch_id}/inventory")
async def get_branch_inventory(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get all inventory for a specific branch"""
    try:
        branch = await branches.get(db, branch_id)
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")
        
        # This would need to be implemented in the CRUD layer
        # For now, return a placeholder
        return {"message": "Branch inventory endpoint - to be implemented"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving branch inventory: {str(e)}")
