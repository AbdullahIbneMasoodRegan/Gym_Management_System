from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

# Base schemas
class MemberBase(BaseModel):
    FirstName: str = Field(..., min_length=1, max_length=50)
    LastName: str = Field(..., min_length=1, max_length=50)
    Email: EmailStr
    Phone: Optional[str] = Field(None, max_length=15)
    DateOfBirth: Optional[date] = None
    Gender: Optional[str] = Field(None, regex='^[MFO]$')
    Address: Optional[str] = None

class MemberCreate(MemberBase):
    JoinDate: date = Field(default_factory=date.today)

class MemberUpdate(BaseModel):
    FirstName: Optional[str] = Field(None, min_length=1, max_length=50)
    LastName: Optional[str] = Field(None, min_length=1, max_length=50)
    Email: Optional[EmailStr] = None
    Phone: Optional[str] = Field(None, max_length=15)
    DateOfBirth: Optional[date] = None
    Gender: Optional[str] = Field(None, regex='^[MFO]$')
    Address: Optional[str] = None

class Member(MemberBase):
    MemberID: int
    JoinDate: date
    
    class Config:
        from_attributes = True

# Trainer schemas
class TrainerBase(BaseModel):
    FirstName: str = Field(..., min_length=1, max_length=50)
    LastName: str = Field(..., min_length=1, max_length=50)
    Email: EmailStr
    Phone: Optional[str] = Field(None, max_length=15)
    Specialization: Optional[str] = Field(None, max_length=100)
    HourlyRate: Optional[Decimal] = Field(None, ge=0)

class TrainerCreate(TrainerBase):
    HireDate: date = Field(default_factory=date.today)

class TrainerUpdate(BaseModel):
    FirstName: Optional[str] = Field(None, min_length=1, max_length=50)
    LastName: Optional[str] = Field(None, min_length=1, max_length=50)
    Email: Optional[EmailStr] = None
    Phone: Optional[str] = Field(None, max_length=15)
    Specialization: Optional[str] = Field(None, max_length=100)
    HourlyRate: Optional[Decimal] = Field(None, ge=0)

class Trainer(TrainerBase):
    TrainerID: int
    HireDate: date
    
    class Config:
        from_attributes = True

# Staff schemas
class StaffBase(BaseModel):
    FirstName: str = Field(..., min_length=1, max_length=50)
    LastName: str = Field(..., min_length=1, max_length=50)
    Email: EmailStr
    Phone: Optional[str] = Field(None, max_length=15)
    Role: str = Field(..., regex='^(Manager|Receptionist|Maintenance)$')
    BranchID: Optional[int] = None

class StaffCreate(StaffBase):
    HireDate: date = Field(default_factory=date.today)

class StaffUpdate(BaseModel):
    FirstName: Optional[str] = Field(None, min_length=1, max_length=50)
    LastName: Optional[str] = Field(None, min_length=1, max_length=50)
    Email: Optional[EmailStr] = None
    Phone: Optional[str] = Field(None, max_length=15)
    Role: Optional[str] = Field(None, regex='^(Manager|Receptionist|Maintenance)$')
    BranchID: Optional[int] = None

class Staff(StaffBase):
    StaffID: int
    HireDate: date
    
    class Config:
        from_attributes = True

# Branch schemas
class BranchBase(BaseModel):
    BranchName: str = Field(..., min_length=1, max_length=100)
    Address: str
    Phone: Optional[str] = Field(None, max_length=15)
    ManagerID: Optional[int] = None

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    BranchName: Optional[str] = Field(None, min_length=1, max_length=100)
    Address: Optional[str] = None
    Phone: Optional[str] = Field(None, max_length=15)
    ManagerID: Optional[int] = None

class Branch(BranchBase):
    BranchID: int
    
    class Config:
        from_attributes = True

# Room schemas
class RoomBase(BaseModel):
    BranchID: int
    RoomName: str = Field(..., min_length=1, max_length=50)
    Capacity: Optional[int] = Field(None, gt=0)
    Description: Optional[str] = None

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    RoomName: Optional[str] = Field(None, min_length=1, max_length=50)
    Capacity: Optional[int] = Field(None, gt=0)
    Description: Optional[str] = None

class Room(RoomBase):
    RoomID: int
    
    class Config:
        from_attributes = True

# Class schemas
class ClassBase(BaseModel):
    ClassName: str = Field(..., min_length=1, max_length=100)
    TrainerID: Optional[int] = None
    BranchID: int
    RoomID: Optional[int] = None
    CategoryID: Optional[int] = None
    Schedule: datetime
    Capacity: int = Field(..., gt=0)
    Duration: int = Field(..., gt=0)

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    ClassName: Optional[str] = Field(None, min_length=1, max_length=100)
    TrainerID: Optional[int] = None
    RoomID: Optional[int] = None
    CategoryID: Optional[int] = None
    Schedule: Optional[datetime] = None
    Capacity: Optional[int] = Field(None, gt=0)
    Duration: Optional[int] = Field(None, gt=0)

class Class(ClassBase):
    ClassID: int
    
    class Config:
        from_attributes = True

# Enrollment schemas
class EnrollmentBase(BaseModel):
    MemberID: int
    ClassID: int
    EnrollmentDate: date = Field(default_factory=date.today)

class EnrollmentCreate(EnrollmentBase):
    pass

class Enrollment(EnrollmentBase):
    EnrollmentID: int
    
    class Config:
        from_attributes = True

# Equipment schemas
class EquipmentBase(BaseModel):
    EquipmentName: str = Field(..., min_length=1, max_length=100)
    BranchID: int
    PurchaseDate: Optional[date] = None
    MaintenanceDate: Optional[date] = None
    Status: str = Field(..., regex='^(Operational|Under Maintenance|Out of Service)$')

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentUpdate(BaseModel):
    EquipmentName: Optional[str] = Field(None, min_length=1, max_length=100)
    PurchaseDate: Optional[date] = None
    MaintenanceDate: Optional[date] = None
    Status: Optional[str] = Field(None, regex='^(Operational|Under Maintenance|Out of Service)$')

class Equipment(EquipmentBase):
    EquipmentID: int
    
    class Config:
        from_attributes = True

# Payment schemas
class PaymentBase(BaseModel):
    MemberID: int
    Amount: Decimal = Field(..., gt=0)
    PaymentType: str = Field(..., regex='^(Cash|Card|Online)$')
    Description: Optional[str] = None

class PaymentCreate(PaymentBase):
    PaymentDate: date = Field(default_factory=date.today)

class PaymentUpdate(BaseModel):
    Amount: Optional[Decimal] = Field(None, gt=0)
    PaymentType: Optional[str] = Field(None, regex='^(Cash|Card|Online)$')
    Description: Optional[str] = None

class Payment(PaymentBase):
    PaymentID: int
    PaymentDate: date
    
    class Config:
        from_attributes = True

# Attendance schemas
class AttendanceBase(BaseModel):
    MemberID: int
    BranchID: int
    CheckInTime: datetime
    CheckOutTime: Optional[datetime] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    CheckOutTime: Optional[datetime] = None

class Attendance(AttendanceBase):
    AttendanceID: int
    
    class Config:
        from_attributes = True

# Workout Plan schemas
class WorkoutPlanBase(BaseModel):
    MemberID: int
    TrainerID: Optional[int] = None
    PlanName: str = Field(..., min_length=1, max_length=100)
    StartDate: date
    EndDate: Optional[date] = None
    Description: Optional[str] = None

class WorkoutPlanCreate(WorkoutPlanBase):
    pass

class WorkoutPlanUpdate(BaseModel):
    PlanName: Optional[str] = Field(None, min_length=1, max_length=100)
    EndDate: Optional[date] = None
    Description: Optional[str] = None

class WorkoutPlan(WorkoutPlanBase):
    PlanID: int
    
    class Config:
        from_attributes = True

# Membership schemas
class MembershipBase(BaseModel):
    MemberID: int
    StartDate: date
    EndDate: Optional[date] = None
    Type: str = Field(..., regex='^(Basic|Premium|VIP)$')
    Cost: Decimal = Field(..., ge=0)

class MembershipCreate(MembershipBase):
    pass

class MembershipUpdate(BaseModel):
    EndDate: Optional[date] = None
    Type: Optional[str] = Field(None, regex='^(Basic|Premium|VIP)$')
    Cost: Optional[Decimal] = Field(None, ge=0)

class Membership(MembershipBase):
    MembershipID: int
    
    class Config:
        from_attributes = True

# Feedback schemas
class FeedbackBase(BaseModel):
    MemberID: int
    ClassID: Optional[int] = None
    TrainerID: Optional[int] = None
    Rating: int = Field(..., ge=1, le=5)
    Comment: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    FeedbackDate: date = Field(default_factory=date.today)

class FeedbackUpdate(BaseModel):
    Rating: Optional[int] = Field(None, ge=1, le=5)
    Comment: Optional[str] = None

class Feedback(FeedbackBase):
    FeedbackID: int
    FeedbackDate: date
    
    class Config:
        from_attributes = True

# Health Metrics schemas
class HealthMetricsBase(BaseModel):
    MemberID: int
    RecordDate: date
    Weight: Optional[Decimal] = Field(None, gt=0)
    Height: Optional[Decimal] = Field(None, gt=0)
    Notes: Optional[str] = None

class HealthMetricsCreate(HealthMetricsBase):
    pass

class HealthMetricsUpdate(BaseModel):
    Weight: Optional[Decimal] = Field(None, gt=0)
    Height: Optional[Decimal] = Field(None, gt=0)
    Notes: Optional[str] = None

class HealthMetrics(HealthMetricsBase):
    MetricID: int
    
    class Config:
        from_attributes = True

# Inventory schemas
class InventoryBase(BaseModel):
    BranchID: int
    ItemName: str = Field(..., min_length=1, max_length=100)
    Quantity: int = Field(..., ge=0)
    LastRestocked: Optional[date] = None

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    ItemName: Optional[str] = Field(None, min_length=1, max_length=100)
    Quantity: Optional[int] = Field(None, ge=0)
    LastRestocked: Optional[date] = None

class Inventory(InventoryBase):
    InventoryID: int
    
    class Config:
        from_attributes = True

# Response schemas with relationships
class MemberWithDetails(Member):
    enrollments: List[Enrollment] = []
    payments: List[Payment] = []
    workout_plans: List[WorkoutPlan] = []
    memberships: List[Membership] = []
    health_metrics: List[HealthMetrics] = []

class ClassWithDetails(Class):
    enrollments: List[Enrollment] = []
    feedback: List[Feedback] = []

class BranchWithDetails(Branch):
    staff: List[Staff] = []
    rooms: List[Room] = []
    classes: List[Class] = []
    equipment: List[Equipment] = []
    inventory: List[Inventory] = []

# Pagination schemas
class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int

# Search schemas
class SearchParams(BaseModel):
    query: Optional[str] = None
    page: int = Field(default=1, ge=1)
    size: int = Field(default=10, ge=1, le=100)
    sort_by: Optional[str] = None
    sort_order: str = Field(default="asc", regex="^(asc|desc)$")

# API Response schemas
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    error: Optional[str] = None
