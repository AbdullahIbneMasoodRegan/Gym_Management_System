from fastapi import APIRouter
from .endpoints import members, trainers, classes, enrollments, equipment, payments, attendance, workout_plans, memberships, feedback, health_metrics, inventory, branches, staff, rooms

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(members.router, prefix="/members", tags=["members"])
api_router.include_router(trainers.router, prefix="/trainers", tags=["trainers"])
api_router.include_router(classes.router, prefix="/classes", tags=["classes"])
api_router.include_router(enrollments.router, prefix="/enrollments", tags=["enrollments"])
api_router.include_router(equipment.router, prefix="/equipment", tags=["equipment"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(workout_plans.router, prefix="/workout-plans", tags=["workout-plans"])
api_router.include_router(memberships.router, prefix="/memberships", tags=["memberships"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(health_metrics.router, prefix="/health-metrics", tags=["health-metrics"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(branches.router, prefix="/branches", tags=["branches"])
api_router.include_router(staff.router, prefix="/staff", tags=["staff"])
api_router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
