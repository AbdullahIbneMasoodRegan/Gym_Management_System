from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import get_db
from app.crud import rooms
from app.schemas import Room, RoomCreate, RoomUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    branch_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all rooms with optional filtering and pagination"""
    try:
        if branch_id:
            rooms_list = await rooms.get_by_branch(db, branch_id)
        else:
            rooms_list = await rooms.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not branch_id:
            total_result = await db.execute("SELECT COUNT(*) FROM rooms")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(rooms_list)
            pages = 1
        
        return PaginatedResponse(
            items=[room.__dict__ for room in rooms_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving rooms: {str(e)}")

@router.get("/{room_id}", response_model=Room)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific room by ID"""
    try:
        room = await rooms.get(db, room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        return room
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving room: {str(e)}")

@router.post("/", response_model=Room)
async def create_room(room: RoomCreate, db: AsyncSession = Depends(get_db)):
    """Create a new room"""
    try:
        return await rooms.create(db, room)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating room: {str(e)}")

@router.put("/{room_id}", response_model=Room)
async def update_room(
    room_id: int, 
    room_update: RoomUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a room"""
    try:
        # Check if room exists
        existing_room = await rooms.get(db, room_id)
        if not existing_room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        return await rooms.update(db, room_id, room_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating room: {str(e)}")

@router.delete("/{room_id}", response_model=APIResponse)
async def delete_room(room_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a room"""
    try:
        # Check if room exists
        existing_room = await rooms.get(db, room_id)
        if not existing_room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        success = await rooms.delete(db, room_id)
        if success:
            return APIResponse(
                success=True,
                message="Room deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete room")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting room: {str(e)}")

@router.get("/branch/{branch_id}")
async def get_rooms_by_branch(branch_id: int, db: AsyncSession = Depends(get_db)):
    """Get all rooms for a specific branch"""
    try:
        rooms_list = await rooms.get_by_branch(db, branch_id)
        return {
            "branch_id": branch_id,
            "rooms": [room.__dict__ for room in rooms_list],
            "count": len(rooms_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving rooms by branch: {str(e)}")
