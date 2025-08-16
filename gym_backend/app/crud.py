from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from decimal import Decimal

from .models import *
from .schemas import *

# Generic CRUD operations
class CRUDBase:
    def __init__(self, model):
        self.model = model

    async def get(self, db: AsyncSession, id: int):
        result = await db.execute(select(self.model).where(self.model.__table__.columns[f"{self.model.__name__}ID"] == id))
        return result.scalar_one_or_none()

    async def get_multi(self, db: AsyncSession, skip: int = 0, limit: int = 100):
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()

    async def create(self, db: AsyncSession, obj_in):
        db_obj = self.model(**obj_in.dict())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, id: int, obj_in):
        id_column = f"{self.model.__name__}ID"
        result = await db.execute(
            update(self.model)
            .where(getattr(self.model, id_column) == id)
            .values(**obj_in.dict(exclude_unset=True))
        )
        await db.commit()
        return await self.get(db, id)

    async def delete(self, db: AsyncSession, id: int):
        id_column = f"{self.model.__name__}ID"
        result = await db.execute(
            delete(self.model).where(getattr(self.model, id_column) == id)
        )
        await db.commit()
        return result.rowcount > 0

# Members CRUD
class CRUDMembers(CRUDBase):
    def __init__(self):
        super().__init__(Members)

    async def get_by_email(self, db: AsyncSession, email: str):
        result = await db.execute(select(Members).where(Members.Email == email))
        return result.scalar_one_or_none()

    async def search_members(self, db: AsyncSession, query: str, skip: int = 0, limit: int = 100):
        search_filter = or_(
            Members.FirstName.ilike(f"%{query}%"),
            Members.LastName.ilike(f"%{query}%"),
            Members.Email.ilike(f"%{query}%")
        )
        result = await db.execute(
            select(Members)
            .where(search_filter)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_with_details(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(Members)
            .options(
                selectinload(Members.enrollments),
                selectinload(Members.payments),
                selectinload(Members.workout_plans),
                selectinload(Members.memberships),
                selectinload(Members.health_metrics)
            )
            .where(Members.MemberID == member_id)
        )
        return result.scalar_one_or_none()

    async def get_active_members(self, db: AsyncSession, skip: int = 0, limit: int = 100):
        # Get members with active memberships
        result = await db.execute(
            select(Members)
            .join(Memberships)
            .where(Memberships.EndDate.is_(None) | (Memberships.EndDate >= date.today()))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

# Trainers CRUD
class CRUDTrainers(CRUDBase):
    def __init__(self):
        super().__init__(Trainers)

    async def get_by_specialization(self, db: AsyncSession, specialization: str):
        result = await db.execute(
            select(Trainers).where(Trainers.Specialization.ilike(f"%{specialization}%"))
        )
        return result.scalars().all()

    async def get_available_trainers(self, db: AsyncSession, date: date, time: str):
        # Get trainers not assigned to classes at specific time
        result = await db.execute(
            select(Trainers)
            .outerjoin(Classes, and_(
                Classes.TrainerID == Trainers.TrainerID,
                func.date(Classes.Schedule) == date,
                func.extract('hour', Classes.Schedule) == int(time.split(':')[0])
            ))
            .where(Classes.ClassID.is_(None))
        )
        return result.scalars().all()

# Classes CRUD
class CRUDClasses(CRUDBase):
    def __init__(self):
        super().__init__(Classes)

    async def get_by_branch(self, db: AsyncSession, branch_id: int):
        result = await db.execute(
            select(Classes).where(Classes.BranchID == branch_id)
        )
        return result.scalars().all()

    async def get_by_trainer(self, db: AsyncSession, trainer_id: int):
        result = await db.execute(
            select(Classes).where(Classes.TrainerID == trainer_id)
        )
        return result.scalars().all()

    async def get_by_date_range(self, db: AsyncSession, start_date: date, end_date: date):
        result = await db.execute(
            select(Classes)
            .where(
                and_(
                    func.date(Classes.Schedule) >= start_date,
                    func.date(Classes.Schedule) <= end_date
                )
            )
        )
        return result.scalars().all()

    async def get_with_details(self, db: AsyncSession, class_id: int):
        result = await db.execute(
            select(Classes)
            .options(
                selectinload(Classes.enrollments),
                selectinload(Classes.feedback)
            )
            .where(Classes.ClassID == class_id)
        )
        return result.scalar_one_or_none()

    async def get_available_classes(self, db: AsyncSession, member_id: int, date: date):
        # Get classes that member can enroll in (not already enrolled, has capacity)
        result = await db.execute(
            select(Classes)
            .outerjoin(Enrollments, and_(
                Enrollments.ClassID == Classes.ClassID,
                Enrollments.MemberID == member_id
            ))
            .where(
                and_(
                    func.date(Classes.Schedule) == date,
                    Enrollments.EnrollmentID.is_(None),
                    Classes.Capacity > func.coalesce(
                        select(func.count(Enrollments.EnrollmentID))
                        .where(Enrollments.ClassID == Classes.ClassID)
                        .scalar_subquery(), 0
                    )
                )
            )
        )
        return result.scalars().all()

# Enrollments CRUD
class CRUDEnrollments(CRUDBase):
    def __init__(self):
        super().__init__(Enrollments)

    async def get_by_member(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(Enrollments).where(Enrollments.MemberID == member_id)
        )
        return result.scalars().all()

    async def get_by_class(self, db: AsyncSession, class_id: int):
        result = await db.execute(
            select(Enrollments).where(Enrollments.ClassID == class_id)
        )
        return result.scalars().all()

    async def check_enrollment(self, db: AsyncSession, member_id: int, class_id: int):
        result = await db.execute(
            select(Enrollments).where(
                and_(
                    Enrollments.MemberID == member_id,
                    Enrollments.ClassID == class_id
                )
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_class_enrollment_count(self, db: AsyncSession, class_id: int):
        result = await db.execute(
            select(func.count(Enrollments.EnrollmentID))
            .where(Enrollments.ClassID == class_id)
        )
        return result.scalar()

# Equipment CRUD
class CRUDEquipment(CRUDBase):
    def __init__(self):
        super().__init__(Equipment)

    async def get_by_branch(self, db: AsyncSession, branch_id: int):
        result = await db.execute(
            select(Equipment).where(Equipment.BranchID == branch_id)
        )
        return result.scalars().all()

    async def get_by_status(self, db: AsyncSession, status: str):
        result = await db.execute(
            select(Equipment).where(Equipment.Status == status)
        )
        return result.scalars().all()

    async def get_equipment_needing_maintenance(self, db: AsyncSession):
        result = await db.execute(
            select(Equipment).where(
                or_(
                    Equipment.Status == 'Under Maintenance',
                    Equipment.Status == 'Out of Service'
                )
            )
        )
        return result.scalars().all()

# Payments CRUD
class CRUDPayments(CRUDBase):
    def __init__(self):
        super().__init__(Payments)

    async def get_by_member(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(Payments).where(Payments.MemberID == member_id)
        )
        return result.scalars().all()

    async def get_by_date_range(self, db: AsyncSession, start_date: date, end_date: date):
        result = await db.execute(
            select(Payments).where(
                and_(
                    Payments.PaymentDate >= start_date,
                    Payments.PaymentDate <= end_date
                )
            )
        )
        return result.scalars().all()

    async def get_total_revenue(self, db: AsyncSession, start_date: date, end_date: date):
        result = await db.execute(
            select(func.sum(Payments.Amount))
            .where(
                and_(
                    Payments.PaymentDate >= start_date,
                    Payments.PaymentDate <= end_date
                )
            )
        )
        return result.scalar() or Decimal('0')

# Attendance CRUD
class CRUDAttendance(CRUDBase):
    def __init__(self):
        super().__init__(Attendance)

    async def get_by_member(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(Attendance).where(Attendance.MemberID == member_id)
        )
        return result.scalars().all()

    async def get_by_branch(self, db: AsyncSession, branch_id: int):
        result = await db.execute(
            select(Attendance).where(Attendance.BranchID == branch_id)
        )
        return result.scalars().all()

    async def get_by_date(self, db: AsyncSession, date: date):
        result = await db.execute(
            select(Attendance).where(func.date(Attendance.CheckInTime) == date)
        )
        return result.scalars().all()

    async def check_in_member(self, db: AsyncSession, member_id: int, branch_id: int):
        # Check if member is already checked in
        existing = await db.execute(
            select(Attendance).where(
                and_(
                    Attendance.MemberID == member_id,
                    Attendance.CheckOutTime.is_(None)
                )
            )
        )
        if existing.scalar_one_or_none():
            return None  # Already checked in
        
        # Create new check-in
        attendance = Attendance(
            MemberID=member_id,
            BranchID=branch_id,
            CheckInTime=datetime.now()
        )
        db.add(attendance)
        await db.commit()
        await db.refresh(attendance)
        return attendance

    async def check_out_member(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(Attendance).where(
                and_(
                    Attendance.MemberID == member_id,
                    Attendance.CheckOutTime.is_(None)
                )
            )
        )
        attendance = result.scalar_one_or_none()
        if attendance:
            attendance.CheckOutTime = datetime.now()
            await db.commit()
            await db.refresh(attendance)
        return attendance

# Workout Plans CRUD
class CRUDWorkoutPlans(CRUDBase):
    def __init__(self):
        super().__init__(WorkoutPlans)

    async def get_by_member(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(WorkoutPlans).where(WorkoutPlans.MemberID == member_id)
        )
        return result.scalars().all()

    async def get_by_trainer(self, db: AsyncSession, trainer_id: int):
        result = await db.execute(
            select(WorkoutPlans).where(WorkoutPlans.TrainerID == trainer_id)
        )
        return result.scalars().all()

    async def get_active_plans(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(WorkoutPlans).where(
                and_(
                    WorkoutPlans.MemberID == member_id,
                    or_(
                        WorkoutPlans.EndDate.is_(None),
                        WorkoutPlans.EndDate >= date.today()
                    )
                )
            )
        )
        return result.scalars().all()

# Memberships CRUD
class CRUDMemberships(CRUDBase):
    def __init__(self):
        super().__init__(Memberships)

    async def get_by_member(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(Memberships).where(Memberships.MemberID == member_id)
        )
        return result.scalars().all()

    async def get_active_membership(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(Memberships).where(
                and_(
                    Memberships.MemberID == member_id,
                    or_(
                        Memberships.EndDate.is_(None),
                        Memberships.EndDate >= date.today()
                    )
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_expiring_memberships(self, db: AsyncSession, days: int = 30):
        result = await db.execute(
            select(Memberships).where(
                and_(
                    Memberships.EndDate.is_not(None),
                    Memberships.EndDate <= date.today() + timedelta(days=days)
                )
            )
        )
        return result.scalars().all()

# Feedback CRUD
class CRUDFeedback(CRUDBase):
    def __init__(self):
        super().__init__(Feedback)

    async def get_by_class(self, db: AsyncSession, class_id: int):
        result = await db.execute(
            select(Feedback).where(Feedback.ClassID == class_id)
        )
        return result.scalars().all()

    async def get_by_trainer(self, db: AsyncSession, trainer_id: int):
        result = await db.execute(
            select(Feedback).where(Feedback.TrainerID == trainer_id)
        )
        return result.scalars().all()

    async def get_average_rating(self, db: AsyncSession, class_id: int = None, trainer_id: int = None):
        query = select(func.avg(Feedback.Rating))
        if class_id:
            query = query.where(Feedback.ClassID == class_id)
        if trainer_id:
            query = query.where(Feedback.TrainerID == trainer_id)
        
        result = await db.execute(query)
        return result.scalar()

# Health Metrics CRUD
class CRUDHealthMetrics(CRUDBase):
    def __init__(self):
        super().__init__(HealthMetrics)

    async def get_by_member(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(HealthMetrics)
            .where(HealthMetrics.MemberID == member_id)
            .order_by(HealthMetrics.RecordDate.desc())
        )
        return result.scalars().all()

    async def get_latest_metrics(self, db: AsyncSession, member_id: int):
        result = await db.execute(
            select(HealthMetrics)
            .where(HealthMetrics.MemberID == member_id)
            .order_by(HealthMetrics.RecordDate.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

# Inventory CRUD
class CRUDInventory(CRUDBase):
    def __init__(self):
        super().__init__(Inventory)

    async def get_by_branch(self, db: AsyncSession, branch_id: int):
        result = await db.execute(
            select(Inventory).where(Inventory.BranchID == branch_id)
        )
        return result.scalars().all()

    async def get_low_stock_items(self, db: AsyncSession, threshold: int = 10):
        result = await db.execute(
            select(Inventory).where(Inventory.Quantity <= threshold)
        )
        return result.scalars().all()

    async def update_quantity(self, db: AsyncSession, inventory_id: int, quantity: int):
        result = await db.execute(
            update(Inventory)
            .where(Inventory.InventoryID == inventory_id)
            .values(Quantity=quantity, LastRestocked=date.today())
        )
        await db.commit()
        return await self.get(db, inventory_id)

# Initialize CRUD instances
members = CRUDMembers()
trainers = CRUDTrainers()
classes = CRUDClasses()
enrollments = CRUDEnrollments()
equipment = CRUDEquipment()
payments = CRUDPayments()
attendance = CRUDAttendance()
workout_plans = CRUDWorkoutPlans()
memberships = CRUDMemberships()
feedback = CRUDFeedback()
health_metrics = CRUDHealthMetrics()
inventory = CRUDInventory()
