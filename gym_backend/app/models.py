from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, DECIMAL, Text, ForeignKey, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Members(Base):
    __tablename__ = "members"
    
    MemberID = Column(Integer, primary_key=True, index=True)
    FirstName = Column(String(50), nullable=False)
    LastName = Column(String(50), nullable=False)
    Email = Column(String(100), unique=True, nullable=False, index=True)
    Phone = Column(String(15))
    JoinDate = Column(Date, nullable=False)
    DateOfBirth = Column(Date)
    Gender = Column(String(1), CheckConstraint("Gender IN ('M', 'F', 'O')"))
    Address = Column(Text)
    
    # Relationships
    enrollments = relationship("Enrollments", back_populates="member")
    payments = relationship("Payments", back_populates="member")
    attendance = relationship("Attendance", back_populates="member")
    workout_plans = relationship("WorkoutPlans", back_populates="member")
    memberships = relationship("Memberships", back_populates="member")
    feedback = relationship("Feedback", back_populates="member")
    health_metrics = relationship("HealthMetrics", back_populates="member")

class Trainers(Base):
    __tablename__ = "trainers"
    
    TrainerID = Column(Integer, primary_key=True, index=True)
    FirstName = Column(String(50), nullable=False)
    LastName = Column(String(50), nullable=False)
    Email = Column(String(100), unique=True, nullable=False, index=True)
    Phone = Column(String(15))
    HireDate = Column(Date, nullable=False)
    Specialization = Column(String(100))
    HourlyRate = Column(DECIMAL(10, 2), CheckConstraint("HourlyRate >= 0"))
    
    # Relationships
    classes = relationship("Classes", back_populates="trainer")
    workout_plans = relationship("WorkoutPlans", back_populates="trainer")
    feedback = relationship("Feedback", back_populates="trainer")

class Staff(Base):
    __tablename__ = "staff"
    
    StaffID = Column(Integer, primary_key=True, index=True)
    FirstName = Column(String(50), nullable=False)
    LastName = Column(String(50), nullable=False)
    Email = Column(String(100), unique=True, nullable=False, index=True)
    Phone = Column(String(15))
    HireDate = Column(Date, nullable=False)
    Role = Column(String(20), CheckConstraint("Role IN ('Manager', 'Receptionist', 'Maintenance')"), nullable=False)
    BranchID = Column(Integer, ForeignKey("branches.BranchID", ondelete="SET NULL"))
    
    # Relationships
    branch = relationship("Branches", back_populates="staff")
    maintenance_requests = relationship("MaintenanceRequests", back_populates="staff")

class Branches(Base):
    __tablename__ = "branches"
    
    BranchID = Column(Integer, primary_key=True, index=True)
    BranchName = Column(String(100), nullable=False)
    Address = Column(Text, nullable=False)
    Phone = Column(String(15))
    ManagerID = Column(Integer, ForeignKey("staff.StaffID", ondelete="SET NULL"))
    
    # Relationships
    staff = relationship("Staff", back_populates="branch")
    rooms = relationship("Rooms", back_populates="branch")
    classes = relationship("Classes", back_populates="branch")
    equipment = relationship("Equipment", back_populates="branch")
    attendance = relationship("Attendance", back_populates="branch")
    inventory = relationship("Inventory", back_populates="branch")

class Rooms(Base):
    __tablename__ = "rooms"
    
    RoomID = Column(Integer, primary_key=True, index=True)
    BranchID = Column(Integer, ForeignKey("branches.BranchID", ondelete="CASCADE"), nullable=False)
    RoomName = Column(String(50), nullable=False)
    Capacity = Column(Integer, CheckConstraint("Capacity > 0"))
    Description = Column(Text)
    
    # Relationships
    branch = relationship("Branches", back_populates="rooms")
    classes = relationship("Classes", back_populates="room")

class ClassCategories(Base):
    __tablename__ = "class_categories"
    
    CategoryID = Column(Integer, primary_key=True, index=True)
    CategoryName = Column(String(50), nullable=False)
    Description = Column(Text)
    
    # Relationships
    classes = relationship("Classes", back_populates="category")

class Classes(Base):
    __tablename__ = "classes"
    
    ClassID = Column(Integer, primary_key=True, index=True)
    ClassName = Column(String(100), nullable=False)
    TrainerID = Column(Integer, ForeignKey("trainers.TrainerID", ondelete="SET NULL"))
    BranchID = Column(Integer, ForeignKey("branches.BranchID", ondelete="CASCADE"), nullable=False)
    RoomID = Column(Integer, ForeignKey("rooms.RoomID", ondelete="SET NULL"))
    CategoryID = Column(Integer, ForeignKey("class_categories.CategoryID", ondelete="SET NULL"))
    Schedule = Column(DateTime, nullable=False)
    Capacity = Column(Integer, CheckConstraint("Capacity > 0"))
    Duration = Column(Integer, CheckConstraint("Duration > 0"))
    
    # Relationships
    trainer = relationship("Trainers", back_populates="classes")
    branch = relationship("Branches", back_populates="classes")
    room = relationship("Rooms", back_populates="classes")
    category = relationship("ClassCategories", back_populates="classes")
    enrollments = relationship("Enrollments", back_populates="class_")
    feedback = relationship("Feedback", back_populates="class_")

class Enrollments(Base):
    __tablename__ = "enrollments"
    
    EnrollmentID = Column(Integer, primary_key=True, index=True)
    MemberID = Column(Integer, ForeignKey("members.MemberID", ondelete="CASCADE"), nullable=False)
    ClassID = Column(Integer, ForeignKey("classes.ClassID", ondelete="CASCADE"), nullable=False)
    EnrollmentDate = Column(Date, nullable=False)
    
    # Relationships
    member = relationship("Members", back_populates="enrollments")
    class_ = relationship("Classes", back_populates="enrollments")

class Equipment(Base):
    __tablename__ = "equipment"
    
    EquipmentID = Column(Integer, primary_key=True, index=True)
    EquipmentName = Column(String(100), nullable=False)
    BranchID = Column(Integer, ForeignKey("branches.BranchID", ondelete="CASCADE"), nullable=False)
    PurchaseDate = Column(Date)
    MaintenanceDate = Column(Date)
    Status = Column(String(20), CheckConstraint("Status IN ('Operational', 'Under Maintenance', 'Out of Service')"), nullable=False)
    
    # Relationships
    branch = relationship("Branches", back_populates="equipment")
    maintenance_requests = relationship("MaintenanceRequests", back_populates="equipment")

class MaintenanceRequests(Base):
    __tablename__ = "maintenance_requests"
    
    RequestID = Column(Integer, primary_key=True, index=True)
    EquipmentID = Column(Integer, ForeignKey("equipment.EquipmentID", ondelete="CASCADE"), nullable=False)
    StaffID = Column(Integer, ForeignKey("staff.StaffID", ondelete="SET NULL"))
    RequestDate = Column(Date, nullable=False)
    Status = Column(String(20), CheckConstraint("Status IN ('Open', 'In Progress', 'Resolved')"), nullable=False)
    ResolutionDate = Column(Date)
    Notes = Column(Text)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="maintenance_requests")
    staff = relationship("Staff", back_populates="maintenance_requests")

class Payments(Base):
    __tablename__ = "payments"
    
    PaymentID = Column(Integer, primary_key=True, index=True)
    MemberID = Column(Integer, ForeignKey("members.MemberID", ondelete="CASCADE"), nullable=False)
    Amount = Column(DECIMAL(10, 2), CheckConstraint("Amount > 0"), nullable=False)
    PaymentDate = Column(Date, nullable=False)
    PaymentType = Column(String(20), CheckConstraint("PaymentType IN ('Cash', 'Card', 'Online')"), nullable=False)
    Description = Column(Text)
    
    # Relationships
    member = relationship("Members", back_populates="payments")

class Attendance(Base):
    __tablename__ = "attendance"
    
    AttendanceID = Column(Integer, primary_key=True, index=True)
    MemberID = Column(Integer, ForeignKey("members.MemberID", ondelete="CASCADE"), nullable=False)
    BranchID = Column(Integer, ForeignKey("branches.BranchID", ondelete="CASCADE"), nullable=False)
    CheckInTime = Column(DateTime, nullable=False)
    CheckOutTime = Column(DateTime)
    
    # Relationships
    member = relationship("Members", back_populates="attendance")
    branch = relationship("Branches", back_populates="attendance")

class WorkoutPlans(Base):
    __tablename__ = "workout_plans"
    
    PlanID = Column(Integer, primary_key=True, index=True)
    MemberID = Column(Integer, ForeignKey("members.MemberID", ondelete="CASCADE"), nullable=False)
    TrainerID = Column(Integer, ForeignKey("trainers.TrainerID", ondelete="SET NULL"))
    PlanName = Column(String(100), nullable=False)
    StartDate = Column(Date, nullable=False)
    EndDate = Column(Date)
    Description = Column(Text)
    
    # Relationships
    member = relationship("Members", back_populates="workout_plans")
    trainer = relationship("Trainers", back_populates="workout_plans")

class Memberships(Base):
    __tablename__ = "memberships"
    
    MembershipID = Column(Integer, primary_key=True, index=True)
    MemberID = Column(Integer, ForeignKey("members.MemberID", ondelete="CASCADE"), nullable=False)
    StartDate = Column(Date, nullable=False)
    EndDate = Column(Date)
    Type = Column(String(20), CheckConstraint("Type IN ('Basic', 'Premium', 'VIP')"), nullable=False)
    Cost = Column(DECIMAL(10, 2), CheckConstraint("Cost >= 0"), nullable=False)
    
    # Relationships
    member = relationship("Members", back_populates="memberships")
    membership_promotions = relationship("MembershipPromotions", back_populates="membership")

class Promotions(Base):
    __tablename__ = "promotions"
    
    PromotionID = Column(Integer, primary_key=True, index=True)
    PromotionName = Column(String(100), nullable=False)
    StartDate = Column(Date, nullable=False)
    EndDate = Column(Date)
    DiscountPercentage = Column(DECIMAL(5, 2), CheckConstraint("DiscountPercentage BETWEEN 0 AND 100"))
    Description = Column(Text)
    
    # Relationships
    membership_promotions = relationship("MembershipPromotions", back_populates="promotion")

class MembershipPromotions(Base):
    __tablename__ = "membership_promotions"
    
    MembershipPromotionID = Column(Integer, primary_key=True, index=True)
    MembershipID = Column(Integer, ForeignKey("memberships.MembershipID", ondelete="CASCADE"), nullable=False)
    PromotionID = Column(Integer, ForeignKey("promotions.PromotionID", ondelete="CASCADE"), nullable=False)
    AppliedDate = Column(Date, nullable=False)
    
    # Relationships
    membership = relationship("Memberships", back_populates="membership_promotions")
    promotion = relationship("Promotions", back_populates="membership_promotions")

class Feedback(Base):
    __tablename__ = "feedback"
    
    FeedbackID = Column(Integer, primary_key=True, index=True)
    MemberID = Column(Integer, ForeignKey("members.MemberID", ondelete="CASCADE"), nullable=False)
    ClassID = Column(Integer, ForeignKey("classes.ClassID", ondelete="SET NULL"))
    TrainerID = Column(Integer, ForeignKey("trainers.TrainerID", ondelete="SET NULL"))
    Rating = Column(Integer, CheckConstraint("Rating BETWEEN 1 AND 5"), nullable=False)
    Comment = Column(Text)
    FeedbackDate = Column(Date, nullable=False)
    
    # Relationships
    member = relationship("Members", back_populates="feedback")
    class_ = relationship("Classes", back_populates="feedback")
    trainer = relationship("Trainers", back_populates="feedback")

class HealthMetrics(Base):
    __tablename__ = "health_metrics"
    
    MetricID = Column(Integer, primary_key=True, index=True)
    MemberID = Column(Integer, ForeignKey("members.MemberID", ondelete="CASCADE"), nullable=False)
    RecordDate = Column(Date, nullable=False)
    Weight = Column(DECIMAL(5, 2), CheckConstraint("Weight > 0"))
    Height = Column(DECIMAL(5, 2), CheckConstraint("Height > 0"))
    Notes = Column(Text)
    
    # Relationships
    member = relationship("Members", back_populates="health_metrics")

class Inventory(Base):
    __tablename__ = "inventory"
    
    InventoryID = Column(Integer, primary_key=True, index=True)
    BranchID = Column(Integer, ForeignKey("branches.BranchID", ondelete="CASCADE"), nullable=False)
    ItemName = Column(String(100), nullable=False)
    Quantity = Column(Integer, CheckConstraint("Quantity >= 0"), nullable=False)
    LastRestocked = Column(Date)
    
    # Relationships
    branch = relationship("Branches", back_populates="inventory")
