# Gym Management System Backend

A comprehensive FastAPI backend for managing gym operations including members, classes, trainers, equipment, and more.

## Features

- **Member Management**: CRUD operations for gym members
- **Class Management**: Schedule and manage fitness classes
- **Trainer Management**: Manage personal trainers and their schedules
- **Equipment Management**: Track gym equipment and maintenance
- **Payment Processing**: Handle membership payments and fees
- **Attendance Tracking**: Monitor member check-ins and check-outs
- **Workout Plans**: Create and manage personalized workout plans
- **Membership Management**: Handle different membership types and renewals
- **Feedback System**: Collect and manage member feedback
- **Health Metrics**: Track member health and fitness progress
- **Inventory Management**: Manage gym supplies and equipment
- **Branch Management**: Multi-location gym support
- **Staff Management**: Manage gym staff and roles

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Primary database (Neon)
- **AsyncPG**: Async PostgreSQL driver
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server

## Project Structure

```
gym_backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── db.py                # Database connection and session management
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas for request/response validation
│   ├── crud.py              # CRUD operations for all models
│   └── api/
│       ├── __init__.py
│       ├── api.py           # Main API router
│       └── endpoints/       # Individual endpoint modules
│           ├── members.py
│           ├── classes.py
│           ├── trainers.py
│           ├── enrollments.py
│           ├── equipment.py
│           ├── payments.py
│           ├── attendance.py
│           ├── workout_plans.py
│           ├── memberships.py
│           ├── feedback.py
│           ├── health_metrics.py
│           ├── inventory.py
│           ├── branches.py
│           ├── staff.py
│           └── rooms.py
├── requirements.txt          # Python dependencies
└── README.md               # This file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym_backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the `gym_backend` directory:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql+asyncpg://username:password@host:port/database
   
   # Example format for Neon:
   DATABASE_URL=postgresql+asyncpg://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database
   
   # API Configuration
   API_HOST=0.0.0.0
   API_PORT=8000
   DEBUG=true
   ```

5. **Set up the database**
   - Create a PostgreSQL database (or use Neon)
   - Run the `schema.sql` file from the project root to create tables
   - Update the `DATABASE_URL` in your `.env` file

## Running the Application

1. **Start the server**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Access the API**
   - API Base URL: `http://localhost:8000`
   - Interactive API Docs: `http://localhost:8000/docs`
   - ReDoc Documentation: `http://localhost:8000/redoc`
   - Health Check: `http://localhost:8000/health`
   - API Info: `http://localhost:8000/info`

## API Endpoints

### Core Endpoints
- `GET /api/v1/members` - List all members
- `POST /api/v1/members` - Create a new member
- `GET /api/v1/members/{id}` - Get member details
- `PUT /api/v1/members/{id}` - Update member
- `DELETE /api/v1/members/{id}` - Delete member

- `GET /api/v1/classes` - List all classes
- `POST /api/v1/classes` - Create a new class
- `GET /api/v1/classes/{id}` - Get class details
- `PUT /api/v1/classes/{id}` - Update class
- `DELETE /api/v1/classes/{id}` - Delete class

- `GET /api/v1/trainers` - List all trainers
- `POST /api/v1/trainers` - Create a new trainer
- `GET /api/v1/trainers/{id}` - Get trainer details
- `PUT /api/v1/trainers/{id}` - Update trainer
- `DELETE /api/v1/trainers/{id}` - Delete trainer

### Specialized Endpoints
- `POST /api/v1/attendance/check-in` - Check in a member
- `POST /api/v1/attendance/check-out` - Check out a member
- `GET /api/v1/classes/available/{member_id}` - Get available classes for a member
- `GET /api/v1/classes/schedule/{branch_id}` - Get branch schedule
- `GET /api/v1/payments/revenue/summary` - Get revenue summary
- `GET /api/v1/inventory/low-stock` - Get low stock items
- `GET /api/v1/equipment/maintenance/needed` - Get equipment needing maintenance

## Database Schema

The system includes the following main entities:
- **Members**: Gym members with personal information
- **Trainers**: Personal trainers and their specializations
- **Staff**: Gym staff with different roles
- **Branches**: Gym locations
- **Rooms**: Class rooms and facilities
- **Classes**: Fitness classes and schedules
- **Enrollments**: Member class enrollments
- **Equipment**: Gym equipment and maintenance status
- **Payments**: Financial transactions
- **Attendance**: Member check-ins and check-outs
- **WorkoutPlans**: Personalized workout plans
- **Memberships**: Membership types and durations
- **Feedback**: Member feedback and ratings
- **HealthMetrics**: Member health tracking
- **Inventory**: Gym supplies and stock

## Development

### Adding New Endpoints
1. Create a new file in `app/api/endpoints/`
2. Define your router and endpoints
3. Import and include the router in `app/api/api.py`
4. Add the endpoint to the main API router

### Database Migrations
- The current setup uses the `schema.sql` file for initial database setup
- For production, consider using Alembic for database migrations

### Testing
- Add tests in a `tests/` directory
- Use pytest for testing
- Consider adding integration tests for database operations

## Production Deployment

1. **Environment Variables**
   - Set `DEBUG=false`
   - Use strong `SECRET_KEY`
   - Configure proper `ALLOWED_ORIGINS`

2. **Database**
   - Use connection pooling
   - Set up proper database backups
   - Monitor database performance

3. **Security**
   - Enable HTTPS
   - Implement proper authentication and authorization
   - Rate limiting
   - Input validation

4. **Monitoring**
   - Logging
   - Health checks
   - Performance monitoring
   - Error tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
