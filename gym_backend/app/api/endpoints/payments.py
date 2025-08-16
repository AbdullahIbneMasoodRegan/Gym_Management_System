from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date

from app.db import get_db
from app.crud import payments
from app.schemas import Payment, PaymentCreate, PaymentUpdate, PaginatedResponse, APIResponse

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    member_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get all payments with optional filtering and pagination"""
    try:
        if member_id:
            payments_list = await payments.get_by_member(db, member_id)
        elif date_from and date_to:
            payments_list = await payments.get_by_date_range(db, date_from, date_to)
        else:
            payments_list = await payments.get_multi(db, skip, limit)
        
        # Apply pagination if no specific filters
        if not any([member_id, date_from, date_to]):
            total_result = await db.execute("SELECT COUNT(*) FROM payments")
            total = total_result.scalar()
            pages = (total + limit - 1) // limit
        else:
            total = len(payments_list)
            pages = 1
        
        return PaginatedResponse(
            items=[payment.__dict__ for payment in payments_list],
            total=total,
            page=skip // limit + 1,
            size=limit,
            pages=pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving payments: {str(e)}")

@router.get("/{payment_id}", response_model=Payment)
async def get_payment(payment_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific payment by ID"""
    try:
        payment = await payments.get(db, payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving payment: {str(e)}")

@router.post("/", response_model=Payment)
async def create_payment(payment: PaymentCreate, db: AsyncSession = Depends(get_db)):
    """Create a new payment"""
    try:
        return await payments.create(db, payment)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")

@router.put("/{payment_id}", response_model=Payment)
async def update_payment(
    payment_id: int, 
    payment_update: PaymentUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a payment"""
    try:
        # Check if payment exists
        existing_payment = await payments.get(db, payment_id)
        if not existing_payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        return await payments.update(db, payment_id, payment_update)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating payment: {str(e)}")

@router.delete("/{payment_id}", response_model=APIResponse)
async def delete_payment(payment_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a payment"""
    try:
        # Check if payment exists
        existing_payment = await payments.get(db, payment_id)
        if not existing_payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        success = await payments.delete(db, payment_id)
        if success:
            return APIResponse(
                success=True,
                message="Payment deleted successfully"
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to delete payment")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting payment: {str(e)}")

@router.get("/member/{member_id}")
async def get_member_payments(member_id: int, db: AsyncSession = Depends(get_db)):
    """Get all payments for a specific member"""
    try:
        payments_list = await payments.get_by_member(db, member_id)
        return {
            "member_id": member_id,
            "payments": [payment.__dict__ for payment in payments_list],
            "total_amount": sum(payment.Amount for payment in payments_list)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving member payments: {str(e)}")

@router.get("/revenue/summary")
async def get_revenue_summary(
    date_from: date = Query(..., description="Start date for revenue calculation"),
    date_to: date = Query(..., description="End date for revenue calculation"),
    db: AsyncSession = Depends(get_db)
):
    """Get revenue summary for a date range"""
    try:
        if date_from > date_to:
            raise HTTPException(status_code=400, detail="Start date must be before end date")
        
        total_revenue = await payments.get_total_revenue(db, date_from, date_to)
        return {
            "date_from": date_from,
            "date_to": date_to,
            "total_revenue": float(total_revenue)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating revenue: {str(e)}")
