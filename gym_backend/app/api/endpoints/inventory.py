from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import get_db
from app.crud import inventory
from app.schemas import Inventory, InventoryCreate, InventoryUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_inventory(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    branch_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all inventory items with optional filtering and pagination"""
    try:
        if branch_id:
            inventory_list = await inventory.get_by_branch(db, branch_id)
        else:
            inventory_list = await inventory.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not branch_id:
            total_result = await db.execute("SELECT COUNT(*) FROM inventory")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(inventory_list)
            pages = 1
        
        return PaginatedResponse(
            items=[item.__dict__ for item in inventory_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving inventory: {str(e)}")

@router.get("/{inventory_id}", response_model=Inventory)
async def get_inventory_item(inventory_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific inventory item by ID"""
    try:
        inventory_item = await inventory.get(db, inventory_id)
        if not inventory_item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        return inventory_item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving inventory item: {str(e)}")

@router.post("/", response_model=Inventory)
async def create_inventory_item(inventory_data: InventoryCreate, db: AsyncSession = Depends(get_db)):
    """Create a new inventory item"""
    try:
        return await inventory.create(db, inventory_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating inventory item: {str(e)}")

@router.put("/{inventory_id}", response_model=Inventory)
async def update_inventory_item(
    inventory_id: int, 
    inventory_update: InventoryUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update an inventory item"""
    try:
        # Check if inventory item exists
        existing_item = await inventory.get(db, inventory_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        return await inventory.update(db, inventory_id, inventory_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating inventory item: {str(e)}")

@router.delete("/{inventory_id}", response_model=APIResponse)
async def delete_inventory_item(inventory_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an inventory item"""
    try:
        # Check if inventory item exists
        existing_item = await inventory.get(db, inventory_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        success = await inventory.delete(db, inventory_id)
        if success:
            return APIResponse(
                success=True,
                message="Inventory item deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete inventory item")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting inventory item: {str(e)}")

@router.get("/branch/{branch_id}")
async def get_branch_inventory(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get all inventory items for a specific branch"""
    try:
        inventory_list = await inventory.get_by_branch(db, branch_id)
        return {
            "branch_id": branch_id,
            "inventory": [item.__dict__ for item in inventory_list],
            "count": len(inventory_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving branch inventory: {str(e)}")

@router.get("/low-stock")
async def get_low_stock_items(
    threshold: int = Query(10, ge=0, description="Quantity threshold for low stock"),
    db: AsyncSession = Depends(get_db)
):
    """Get all inventory items that are low in stock"""
    try:
        low_stock_items = await inventory.get_low_stock_items(db, threshold)
        return {
            "threshold": threshold,
            "low_stock_items": [item.__dict__ for item in low_stock_items],
            "count": len(low_stock_items)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving low stock items: {str(e)}")

@router.put("/{inventory_id}/quantity")
async def update_inventory_quantity(
    inventory_id: int,
    quantity: int = Query(..., ge=0, description="New quantity for the inventory item"),
    db: AsyncSession = Depends(get_db)
):
    """Update the quantity of an inventory item and mark as restocked"""
    try:
        # Check if inventory item exists
        existing_item = await inventory.get(db, inventory_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        
        updated_item = await inventory.update_quantity(db, inventory_id, quantity)
        return {
            "success": True,
            "message": "Inventory quantity updated successfully",
            "inventory_item": updated_item.__dict__
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating inventory quantity: {str(e)}")
