from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import get_db
from app.crud import equipment
from app.schemas import Equipment, EquipmentCreate, EquipmentUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_equipment(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    branch_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all equipment with optional filtering and pagination"""
    try:
        if branch_id:
            equipment_list = await equipment.get_by_branch(db, branch_id)
        elif status:
            equipment_list = await equipment.get_by_status(db, status)
        else:
            equipment_list = await equipment.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not any([branch_id, status]):
            total_result = await db.execute("SELECT COUNT(*) FROM equipment")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(equipment_list)
            pages = 1
        
        return PaginatedResponse(
            items=[eq.__dict__ for eq in equipment_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving equipment: {str(e)}")

@router.get("/{equipment_id}", response_model=Equipment)
async def get_equipment_item(equipment_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific equipment item by ID"""
    try:
        equipment_item = await equipment.get(db, equipment_id)
        if not equipment_item:
            raise HTTPException(status_code=404, detail="Equipment not found")
        return equipment_item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving equipment: {str(e)}")

@router.post("/", response_model=Equipment)
async def create_equipment(equipment_data: EquipmentCreate, db: AsyncSession = Depends(get_db)):
    """Create a new equipment item"""
    try:
        return await equipment.create(db, equipment_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating equipment: {str(e)}")

@router.put("/{equipment_id}", response_model=Equipment)
async def update_equipment(
    equipment_id: int, 
    equipment_update: EquipmentUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update an equipment item"""
    try:
        # Check if equipment exists
        existing_equipment = await equipment.get(db, equipment_id)
        if not existing_equipment:
            raise HTTPException(status_code=404, detail="Equipment not found")
        
        return await equipment.update(db, equipment_id, equipment_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating equipment: {str(e)}")

@router.delete("/{equipment_id}", response_model=APIResponse)
async def delete_equipment(equipment_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an equipment item"""
    try:
        # Check if equipment exists
        existing_equipment = await equipment.get(db, equipment_id)
        if not existing_equipment:
            raise HTTPException(status_code=404, detail="Equipment not found")
        
        success = await equipment.delete(db, equipment_id)
        if success:
            return APIResponse(
                success=True,
                message="Equipment deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete equipment")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting equipment: {str(e)}")

@router.get("/branch/{branch_id}")
async def get_equipment_by_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get all equipment for a specific branch"""
    try:
        equipment_list = await equipment.get_by_branch(db, branch_id)
        return {
            "branch_id": branch_id,
            "equipment": [eq.__dict__ for eq in equipment_list],
            "count": len(equipment_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving equipment by branch: {str(e)}")

@router.get("/status/{status}")
async def get_equipment_by_status(status: str, db: AsyncSession = Depends(get_db)):
    """Get all equipment by status"""
    try:
        # Validate status
        valid_statuses = ['Operational', 'Under Maintenance', 'Out of Service']
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        equipment_list = await equipment.get_by_status(db, status)
        return {
            "status": status,
            "equipment": [eq.__dict__ for eq in equipment_list],
            "count": len(equipment_list)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving equipment by status: {str(e)}")

@router.get("/maintenance/needed")
async def get_equipment_needing_maintenance(db: AsyncSession = Depends(get_db)):
    """Get all equipment that needs maintenance"""
    try:
        equipment_list = await equipment.get_equipment_needing_maintenance(db)
        return {
            "equipment_needing_maintenance": [eq.__dict__ for eq in equipment_list],
            "count": len(equipment_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving equipment needing maintenance: {str(e)}")
