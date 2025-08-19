
--p Hhu6sDvqk4mVepQE
-- Creating Members table
-- Creating Members table
CREATE TABLE Members (
    MemberID SERIAL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15),
    JoinDate DATE NOT NULL,
    DateOfBirth DATE,
    Gender CHAR(1) CHECK (Gender IN ('M', 'F', 'O')),
    Address TEXT
);

-- Creating Trainers table
CREATE TABLE Trainers (
    TrainerID SERIAL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15),
    HireDate DATE NOT NULL,
    Specialization VARCHAR(100),
    HourlyRate DECIMAL(10,2) CHECK (HourlyRate >= 0)
);

-- Creating Staff table
CREATE TABLE Staff (
    StaffID SERIAL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15),
    HireDate DATE NOT NULL,
    Role VARCHAR(20) CHECK (Role IN ('Manager', 'Receptionist', 'Maintenance')) NOT NULL,
    BranchID INT
);

-- Creating Branches table
CREATE TABLE Branches (
    BranchID SERIAL PRIMARY KEY,
    BranchName VARCHAR(100) NOT NULL,
    Address TEXT NOT NULL,
    Phone VARCHAR(15),
    ManagerID INT REFERENCES Staff(StaffID) ON DELETE SET NULL
);

-- Update Staff table to add foreign key to Branches
ALTER TABLE Staff ADD CONSTRAINT fk_staff_branch FOREIGN KEY (BranchID) REFERENCES Branches(BranchID) ON DELETE SET NULL;

-- Creating Rooms table
CREATE TABLE Rooms (
    RoomID SERIAL PRIMARY KEY,
    BranchID INT REFERENCES Branches(BranchID) ON DELETE CASCADE,
    RoomName VARCHAR(50) NOT NULL,
    Capacity INT CHECK (Capacity > 0),
    Description TEXT
);

-- Creating ClassCategories table
CREATE TABLE ClassCategories (
    CategoryID SERIAL PRIMARY KEY,
    CategoryName VARCHAR(50) NOT NULL,
    Description TEXT
);

-- Creating Classes table
CREATE TABLE Classes (
    ClassID SERIAL PRIMARY KEY,
    ClassName VARCHAR(100) NOT NULL,
    TrainerID INT REFERENCES Trainers(TrainerID) ON DELETE SET NULL,
    BranchID INT REFERENCES Branches(BranchID) ON DELETE CASCADE,
    RoomID INT REFERENCES Rooms(RoomID) ON DELETE SET NULL,
    CategoryID INT REFERENCES ClassCategories(CategoryID) ON DELETE SET NULL,
    Schedule TIMESTAMP NOT NULL,
    Capacity INT CHECK (Capacity > 0),
    Duration INT CHECK (Duration > 0)
);

-- Creating Enrollments table
CREATE TABLE Enrollments (
    EnrollmentID SERIAL PRIMARY KEY,
    MemberID INT REFERENCES Members(MemberID) ON DELETE CASCADE,
    ClassID INT REFERENCES Classes(ClassID) ON DELETE CASCADE,
    EnrollmentDate DATE NOT NULL
);

-- Creating Equipment table
CREATE TABLE Equipment (
    EquipmentID SERIAL PRIMARY KEY,
    EquipmentName VARCHAR(100) NOT NULL,
    BranchID INT REFERENCES Branches(BranchID) ON DELETE CASCADE,
    PurchaseDate DATE,
    MaintenanceDate DATE,
    Status VARCHAR(20) CHECK (Status IN ('Operational', 'Under Maintenance', 'Out of Service')) NOT NULL
);

-- Creating MaintenanceRequests table
CREATE TABLE MaintenanceRequests (
    RequestID SERIAL PRIMARY KEY,
    EquipmentID INT REFERENCES Equipment(EquipmentID) ON DELETE CASCADE,
    StaffID INT REFERENCES Staff(StaffID) ON DELETE SET NULL,
    RequestDate DATE NOT NULL,
    Status VARCHAR(20) CHECK (Status IN ('Open', 'In Progress', 'Resolved')) NOT NULL,
    ResolutionDate DATE,
    Notes TEXT
);

-- Creating Payments table
CREATE TABLE Payments (
    PaymentID SERIAL PRIMARY KEY,
    MemberID INT REFERENCES Members(MemberID) ON DELETE CASCADE,
    Amount DECIMAL(10,2) CHECK (Amount > 0) NOT NULL,
    PaymentDate DATE NOT NULL,
    PaymentType VARCHAR(20) CHECK (PaymentType IN ('Cash', 'Card', 'Online')) NOT NULL,
    Description TEXT
);

-- Creating Attendance table
CREATE TABLE Attendance (
    AttendanceID SERIAL PRIMARY KEY,
    MemberID INT REFERENCES Members(MemberID) ON DELETE CASCADE,
    BranchID INT REFERENCES Branches(BranchID) ON DELETE CASCADE,
    CheckInTime TIMESTAMP NOT NULL,
    CheckOutTime TIMESTAMP
);

-- Creating WorkoutPlan table
CREATE TABLE WorkoutPlans (
    PlanID SERIAL PRIMARY KEY,
    MemberID INT REFERENCES Members(MemberID) ON DELETE CASCADE,
    TrainerID INT REFERENCES Trainers(TrainerID) ON DELETE SET NULL,
    PlanName VARCHAR(100) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE,
    Description TEXT
);

-- Creating Memberships table
CREATE TABLE Memberships (
    MembershipID SERIAL PRIMARY KEY,
    MemberID INT REFERENCES Members(MemberID) ON DELETE CASCADE,
    StartDate DATE NOT NULL,
    EndDate DATE,
    Type VARCHAR(20) CHECK (Type IN ('Basic', 'Premium', 'VIP')) NOT NULL,
    Cost DECIMAL(10,2) CHECK (Cost >= 0) NOT NULL
);

-- Creating Promotions table
CREATE TABLE Promotions (
    PromotionID SERIAL PRIMARY KEY,
    PromotionName VARCHAR(100) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE,
    DiscountPercentage DECIMAL(5,2) CHECK (DiscountPercentage BETWEEN 0 AND 100),
    Description TEXT
);

-- Creating MembershipPromotions table
CREATE TABLE MembershipPromotions (
    MembershipPromotionID SERIAL PRIMARY KEY,
    MembershipID INT REFERENCES Memberships(MembershipID) ON DELETE CASCADE,
    PromotionID INT REFERENCES Promotions(PromotionID) ON DELETE CASCADE,
    AppliedDate DATE NOT NULL
);

-- Creating Feedback table
CREATE TABLE Feedback (
    FeedbackID SERIAL PRIMARY KEY,
    MemberID INT REFERENCES Members(MemberID) ON DELETE CASCADE,
    ClassID INT REFERENCES Classes(ClassID) ON DELETE SET NULL,
    TrainerID INT REFERENCES Trainers(TrainerID) ON DELETE SET NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5) NOT NULL,
    Comment TEXT,
    FeedbackDate DATE NOT NULL
);

-- Creating HealthMetrics table
CREATE TABLE HealthMetrics (
    MetricID SERIAL PRIMARY KEY,
    MemberID INT REFERENCES Members(MemberID) ON DELETE CASCADE,
    RecordDate DATE NOT NULL,
    Weight DECIMAL(5,2) CHECK (Weight > 0),
    Height DECIMAL(5,2) CHECK (Height > 0),
    Notes TEXT
);

-- Creating Inventory table
CREATE TABLE Inventory (
    InventoryID SERIAL PRIMARY KEY,
    BranchID INT REFERENCES Branches(BranchID) ON DELETE CASCADE,
    ItemName VARCHAR(100) NOT NULL,
    Quantity INT CHECK (Quantity >= 0) NOT NULL,
    LastRestocked DATE
);


-- Branches
INSERT INTO Branches (BranchName, Address, Phone, ManagerID)
VALUES 
('Central Gym', '123 Main St', '01234567890', NULL),
('Northside Gym', '456 North Ave', '01234567891', NULL),
('South Gym', '789 South Blvd', '01234567892', NULL),
('East Gym', '321 East Rd', '01234567893', NULL),
('West Gym', '654 West St', '01234567894', NULL);

-- Staff
INSERT INTO Staff (FirstName, LastName, Email, Phone, HireDate, Role, BranchID)
VALUES
('Alice', 'Smith', 'alice.smith@gym.com', '01711111111', '2023-01-01', 'Manager', 1),
('Bob', 'Johnson', 'bob.johnson@gym.com', '01722222222', '2023-02-01', 'Receptionist', 1),
('Carol', 'Lee', 'carol.lee@gym.com', '01733333333', '2023-03-01', 'Maintenance', 2),
('David', 'Kim', 'david.kim@gym.com', '01744444444', '2023-01-15', 'Manager', 2),
('Eve', 'Martinez', 'eve.martinez@gym.com', '01755555555', '2023-04-01', 'Receptionist', 3),
('Frank', 'Wright', 'frank.wright@gym.com', '01766666666', '2023-05-01', 'Maintenance', 3);

-- Update Branches to assign ManagerID
UPDATE Branches SET ManagerID = 1 WHERE BranchID = 1;
UPDATE Branches SET ManagerID = 4 WHERE BranchID = 2;

-- Trainers
INSERT INTO Trainers (FirstName, LastName, Email, Phone, HireDate, Specialization, HourlyRate)
VALUES
('Grace', 'Chen', 'grace.chen@gym.com', '01777777777', '2023-06-01', 'Yoga', 50.00),
('Hank', 'Patel', 'hank.patel@gym.com', '01788888888', '2023-06-15', 'Weightlifting', 60.00),
('Ivy', 'Khan', 'ivy.khan@gym.com', '01799999999', '2023-07-01', 'Cardio', 55.00);

-- Members
INSERT INTO Members (FirstName, LastName, Email, Phone, JoinDate, MembershipStatus, DateOfBirth, Gender, Address)
VALUES
('John', 'Doe', 'john.doe@example.com', '01811111111', '2024-01-01', TRUE, '1990-01-01', 'M', 'House 1, Road 1'),
('Jane', 'Doe', 'jane.doe@example.com', '01822222222', '2024-01-02', TRUE, '1992-02-02', 'F', 'House 2, Road 2'),
('Sam', 'Green', 'sam.green@example.com', '01833333333', '2024-01-03', FALSE, '1995-03-03', 'M', 'House 3, Road 3'),
('Sara', 'Blue', 'sara.blue@example.com', '01844444444', '2024-01-04', TRUE, '1994-04-04', 'F', 'House 4, Road 4'),
('Tom', 'Brown', 'tom.brown@example.com', '01855555555', '2024-01-05', TRUE, '1996-05-05', 'M', 'House 5, Road 5'),
('Nina', 'Red', 'nina.red@example.com', '01866666666', '2024-01-06', FALSE, '1993-06-06', 'F', 'House 6, Road 6');

-- Class Categories
INSERT INTO ClassCategories (CategoryName, Description)
VALUES
('Strength', 'Weight training and body building'),
('Cardio', 'Heart-rate based fitness classes');

-- Rooms
INSERT INTO Rooms (BranchID, RoomName, Capacity, Description)
VALUES
(1, 'Room A', 20, 'Spacious room for yoga'),
(2, 'Room B', 15, 'Medium room for cardio'),
(1, 'Room C', 25, 'Large multipurpose room');

-- Classes
INSERT INTO Classes (ClassName, TrainerID, BranchID, RoomID, CategoryID, Schedule, Capacity, Duration)
VALUES
('Morning Yoga', 1, 1, 1, 2, '2025-07-15 08:00:00', 20, 60),
('Evening Cardio', 3, 2, 2, 2, '2025-07-15 18:00:00', 15, 45),
('Strength Circuit', 2, 1, 3, 1, '2025-07-16 10:00:00', 25, 50);

-- Enrollments
INSERT INTO Enrollments (MemberID, ClassID, EnrollmentDate)
VALUES
(1, 1, '2025-07-10'),
(2, 1, '2025-07-10'),
(3, 2, '2025-07-11'),
(4, 3, '2025-07-12'),
(5, 3, '2025-07-12');

-- Equipment
INSERT INTO Equipment (EquipmentName, BranchID, PurchaseDate, MaintenanceDate, Status)
VALUES
('Treadmill', 1, '2023-01-01', '2024-01-01', 'Operational'),
('Bench Press', 1, '2022-06-01', '2024-06-01', 'Under Maintenance'),
('Elliptical', 2, '2023-03-01', '2024-03-01', 'Operational'),
('Squat Rack', 3, '2022-08-01', '2024-02-01', 'Out of Service');

-- Maintenance Requests
INSERT INTO MaintenanceRequests (EquipmentID, StaffID, RequestDate, Status, ResolutionDate, Notes)
VALUES
(2, 3, '2025-07-10', 'In Progress', NULL, 'Needs bolt replacement'),
(4, 6, '2025-07-12', 'Open', NULL, 'Welded joint cracked');

-- Payments
INSERT INTO Payments (MemberID, Amount, PaymentDate, PaymentType, Description)
VALUES
(1, 1000.00, '2025-07-01', 'Online', 'Monthly payment'),
(2, 1500.00, '2025-07-01', 'Card', 'Premium upgrade'),
(3, 500.00, '2025-07-01', 'Cash', 'Basic plan'),
(4, 2000.00, '2025-07-01', 'Card', 'VIP plan'),
(5, 1000.00, '2025-07-01', 'Online', 'Monthly fee');

-- Attendance
INSERT INTO Attendance (MemberID, BranchID, CheckInTime, CheckOutTime)
VALUES
(1, 1, '2025-07-13 08:00:00', '2025-07-13 09:00:00'),
(2, 1, '2025-07-13 08:05:00', '2025-07-13 09:00:00'),
(3, 2, '2025-07-13 10:00:00', '2025-07-13 11:00:00'),
(4, 1, '2025-07-13 11:00:00', '2025-07-13 12:00:00'),
(5, 1, '2025-07-13 13:00:00', '2025-07-13 14:00:00');

-- Workout Plans
INSERT INTO WorkoutPlans (MemberID, TrainerID, PlanName, StartDate, EndDate, Description)
VALUES
(1, 1, 'Weight Loss Plan', '2025-07-01', '2025-09-30', 'Focus on fat burn'),
(2, 2, 'Strength Gain', '2025-07-01', '2025-08-31', 'Increase muscle mass'),
(3, 3, 'Cardio Boost', '2025-07-01', '2025-07-31', 'Improve stamina');

-- Memberships
INSERT INTO Memberships (MemberID, StartDate, EndDate, Type, Cost)
VALUES
(1, '2025-07-01', '2025-07-31', 'Basic', 1000.00),
(2, '2025-07-01', '2025-07-31', 'Premium', 1500.00),
(3, '2025-07-01', '2025-07-31', 'Basic', 500.00),
(4, '2025-07-01', '2025-07-31', 'VIP', 2000.00),
(5, '2025-07-01', '2025-07-31', 'Basic', 1000.00);

-- Promotions
INSERT INTO Promotions (PromotionName, StartDate, EndDate, DiscountPercentage, Description)
VALUES
('Summer Special', '2025-07-01', '2025-07-31', 20.00, '20% off on all memberships'),
('New Year Offer', '2025-01-01', '2025-01-31', 30.00, '30% off for new members');

-- MembershipPromotions
INSERT INTO MembershipPromotions (MembershipID, PromotionID, AppliedDate)
VALUES
(1, 1, '2025-07-01'),
(2, 1, '2025-07-01');

-- Feedback
INSERT INTO Feedback (MemberID, ClassID, TrainerID, Rating, Comment, FeedbackDate)
VALUES
(1, 1, 1, 5, 'Great session!', '2025-07-13'),
(2, 1, 1, 4, 'Very relaxing', '2025-07-13'),
(3, 2, 3, 3, 'Good but intense', '2025-07-13');

-- Health Metrics
INSERT INTO HealthMetrics (MemberID, RecordDate, Weight, Height, BMI, Notes)
VALUES
(1, '2025-07-01', 70.00, 170.00, 24.22, 'Normal'),
(2, '2025-07-01', 65.00, 165.00, 23.88, 'Good'),
(3, '2025-07-01', 85.00, 180.00, 26.23, 'Overweight'),
(4, '2025-07-01', 55.00, 160.00, 21.48, 'Healthy');

-- Inventory
INSERT INTO Inventory (BranchID, ItemName, Quantity, LastRestocked)
VALUES
(1, 'Protein Bars', 100, '2025-07-01'),
(1, 'Towels', 50, '2025-07-01'),
(2, 'Water Bottles', 200, '2025-07-01');



ALTER TABLE Members DROP COLUMN MembershipStatus;
ALTER TABLE HealthMetrics DROP COLUMN BMI;



-- Insert into Branches (must be first due to foreign key dependencies)
INSERT INTO Branches (BranchName, Address, Phone) VALUES
('Downtown Fitness', '123 Main St, Cityville', '555-0101'),
('Suburban Gym', '456 Oak Ave, Suburbia', '555-0102');

-- Insert into Staff (after Branches due to BranchID foreign key)
INSERT INTO Staff (FirstName, LastName, Email, Phone, HireDate, Role, BranchID) VALUES
('John', 'Smith', 'john.smith@gym.com', '555-1001', '2023-01-15', 'Manager', 1),
('Jane', 'Doe', 'jane.doe@gym.com', '555-1002', '2023-02-01', 'Receptionist', 1),
('Mike', 'Johnson', 'mike.johnson@gym.com', '555-1003', '2023-03-01', 'Maintenance', 2);

-- Update Branches with ManagerID
UPDATE Branches SET ManagerID = 1 WHERE BranchID = 1;
UPDATE Branches SET ManagerID = 3 WHERE BranchID = 2;

-- Insert into Members
INSERT INTO Members (FirstName, LastName, Email, Phone, JoinDate, DateOfBirth, Gender, Address) VALUES
('Alice', 'Brown', 'alice.brown@email.com', '555-2001', '2024-01-10', '1990-05-15', 'F', '789 Pine St'),
('Bob', 'Wilson', 'bob.wilson@email.com', '555-2002', '2024-02-15', '1985-08-22', 'M', '321 Elm St'),
('Carol', 'Davis', 'carol.davis@email.com', '555-2003', '2024-03-20', '1995-11-30', 'O', '654 Maple Ave');

-- Insert into Trainers
INSERT INTO Trainers (FirstName, LastName, Email, Phone, HireDate, Specialization, HourlyRate) VALUES
('Tom', 'Clark', 'tom.clark@gym.com', '555-3001', '2023-06-01', 'Strength Training', 50.00),
('Lisa', 'Taylor', 'lisa.taylor@gym.com', '555-3002', '2023-07-15', 'Yoga', 45.00);

-- Insert into Rooms
INSERT INTO Rooms (BranchID, RoomName, Capacity, Description) VALUES
(1, 'Studio A', 20, 'Main group exercise room'),
(1, 'Weight Room', 15, 'Free weights and machines'),
(2, 'Yoga Studio', 25, 'Dedicated yoga space');

-- Insert into ClassCategories
INSERT INTO ClassCategories (CategoryName, Description) VALUES
('Cardio', 'High-intensity cardiovascular workouts'),
('Strength', 'Weight training and resistance exercises'),
('Yoga', 'Flexibility and mindfulness classes');

-- Insert into Classes
INSERT INTO Classes (ClassName, TrainerID, BranchID, RoomID, CategoryID, Schedule, Capacity, Duration) VALUES
('Morning Cardio Blast', 1, 1, 1, 1, '2025-07-20 08:00:00', 15, 60),
('Power Lifting', 1, 1, 2, 2, '2025-07-20 10:00:00', 10, 90),
('Evening Yoga Flow', 2, 2, 3, 3, '2025-07-20 18:00:00', 20, 75);

-- Insert into Enrollments
INSERT INTO Enrollments (MemberID, ClassID, EnrollmentDate) VALUES
(1, 1, '2025-07-15'),
(2, 1, '2025-07-15'),
(3, 3, '2025-07-16');


BEGIN;
-- Clear dependent tables
TRUNCATE TABLE MaintenanceRequests, Equipment RESTART IDENTITY CASCADE;

-- Insert into Equipment
INSERT INTO Equipment (EquipmentName, BranchID, PurchaseDate, MaintenanceDate, Status) VALUES
('Treadmill', 1, '2023-05-01', '2025-06-01', 'Operational'),
('Squat Rack', 1, '2023-06-15', '2025-06-15', 'Operational'),
('Yoga Mats', 2, '2023-07-01', '2025-07-01', 'Operational');

-- Insert into MaintenanceRequests
INSERT INTO MaintenanceRequests (EquipmentID, StaffID, RequestDate, Status, Notes) VALUES
(1, 3, '2025-07-10', 'Open', 'Treadmill belt slipping'),
(2, 3, '2025-07-12', 'In Progress', 'Squat rack safety bar issue');

-- Insert into Payments
INSERT INTO Payments (MemberID, Amount, PaymentDate, PaymentType, Description) VALUES
(1, 99.99, '2025-07-01', 'Card', 'Monthly membership fee'),
(2, 149.99, '2025-07-01', 'Online', 'Premium membership fee'),
(3, 50.00, '2025-07-05', 'Cash', 'Personal training session');

-- Insert into Attendance (corrected BranchID)
INSERT INTO Attendance (MemberID, BranchID, CheckInTime, CheckOutTime) VALUES
(1, 1, '2025-07-16 07:30:00', '2025-07-16 09:00:00'),
(2, 1, '2025-07-16 09:00:00', '2025-07-16 10:30:00'),
(3, 2, '2025-07-16 17:00:00', NULL);

-- Insert into WorkoutPlans
INSERT INTO WorkoutPlans (MemberID, TrainerID, PlanName, StartDate, EndDate, Description) VALUES
(1, 1, 'Strength Program', '2025-07-01', '2025-09-30', 'Strength training plan'),
(2, 1, 'Cardio Focus', '2025-07-01', '2025-07-31', 'Cardio improvement plan');

-- Insert into Memberships
INSERT INTO Memberships (MemberID, StartDate, EndDate, Type, Cost) VALUES
(1, '2025-07-01', '2026-07-01', 'Basic', 99.99),
(2, '2025-07-01', '2026-07-01', 'Premium', 149.99),
(3, '2025-07-01', '2026-07-01', 'VIP', 199.99);

-- Insert into Promotions
INSERT INTO Promotions (PromotionName, StartDate, EndDate, DiscountPercentage, Description) VALUES
('Summer Special', '2025-07-01', '2025-08-31', 20.00, '20% off new memberships'),
('Refer a Friend', '2025-07-01', '2025-12-31', 15.00, 'Discount for referrals');

-- Insert into MembershipPromotions
INSERT INTO MembershipPromotions (MembershipID, PromotionID, AppliedDate) VALUES
(1, 1, '2025-07-01'),
(2, 2, '2025-07-01');

-- Insert into Feedback
INSERT INTO Feedback (MemberID, ClassID, TrainerID, Rating, Comment, FeedbackDate) VALUES
(1, 1, 1, 5, 'Great class, very energetic!', '2025-07-16'),
(3, 3, 2, 4, 'Relaxing yoga session', '2025-07-16');

-- Insert into HealthMetrics 
INSERT INTO HealthMetrics (MemberID, RecordDate, Weight, Height, Notes) VALUES
(1, '2025-07-01', 65.50, 165.00, 'Initial assessment'),
(2, '2025-07-01', 80.00, 175.00, 'Baseline measurement');

-- Insert into Inventory
INSERT INTO Inventory (BranchID, ItemName, Quantity, LastRestocked) VALUES
(1, 'Towels', 100, '2025-07-10'),
(2, 'Cleaning Supplies', 50, '2025-07-12');

COMMIT;