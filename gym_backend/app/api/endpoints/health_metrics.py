from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db import get_db
from app.crud import health_metrics
from app.schemas import HealthMetrics, HealthMetricsCreate, HealthMetricsUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_health_metrics(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    member_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all health metrics with optional filtering and pagination"""
    try:
        if member_id:
            health_metrics_list = await health_metrics.get_by_member(db, member_id)
        else:
            health_metrics_list = await health_metrics.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not member_id:
            total_result = await db.execute("SELECT COUNT(*) FROM health_metrics")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(health_metrics_list)
            pages = 1
        
        return PaginatedResponse(
            items=[metric.__dict__ for metric in health_metrics_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving health metrics: {str(e)}")

@router.get("/{metric_id}", response_model=HealthMetrics)
async def get_health_metric(metric_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific health metric by ID"""
    try:
        health_metric = await health_metrics.get(db, metric_id)
        if not health_metric:
            raise HTTPException(status_code=404, detail="Health metric not found")
        return health_metric
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving health metric: {str(e)}")

@router.post("/", response_model=HealthMetrics)
async def create_health_metric(health_metric: HealthMetricsCreate, db: AsyncSession = Depends(get_db)):
    """Create a new health metric"""
    try:
        return await health_metrics.create(db, health_metric)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating health metric: {str(e)}")

@router.put("/{metric_id}", response_model=HealthMetrics)
async def update_health_metric(
    metric_id: int, 
    health_metric_update: HealthMetricsUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a health metric"""
    try:
        # Check if health metric exists
        existing_metric = await health_metrics.get(db, metric_id)
        if not existing_metric:
            raise HTTPException(status_code=404, detail="Health metric not found")
        
        return await health_metrics.update(db, metric_id, health_metric_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating health metric: {str(e)}")

@router.delete("/{metric_id}", response_model=APIResponse)
async def delete_health_metric(metric_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a health metric"""
    try:
        # Check if health metric exists
        existing_metric = await health_metrics.get(db, metric_id)
        if not existing_metric:
            raise HTTPException(status_code=404, detail="Health metric not found")
        
        success = await health_metrics.delete(db, metric_id)
        if success:
            return APIResponse(
                success=True,
                message="Health metric deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete health metric")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting health metric: {str(e)}")

@router.get("/member/{member_id}")
async def get_member_health_metrics(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get all health metrics for a specific member"""
    try:
        health_metrics_list = await health_metrics.get_by_member(db, member_id)
        return {
            "member_id": member_id,
            "health_metrics": [metric.__dict__ for metric in health_metrics_list],
            "count": len(health_metrics_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving member health metrics: {str(e)}")

@router.get("/member/{member_id}/latest")
async def get_member_latest_health_metrics(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get the latest health metrics for a specific member"""
    try:
        latest_metric = await health_metrics.get_latest_metrics(db, member_id)
        if latest_metric:
            return {
                "member_id": member_id,
                "latest_health_metrics": latest_metric.__dict__,
                "has_metrics": True
            }
        else:
            return {
                "member_id": member_id,
                "latest_health_metrics": None,
                "has_metrics": False
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving latest health metrics: {str(e)}")
