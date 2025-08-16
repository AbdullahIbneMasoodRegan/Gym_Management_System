#!/usr/bin/env python3
"""
Database initialization script for the Gym Management System
This script helps set up the database and verify the connection
"""

import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy import text
from app.db import engine
from app.models import Base

# Load environment variables
load_dotenv()

async def init_database():
    """Initialize the database and create tables"""
    try:
        print("Connecting to database...")
        
        # Test connection
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✅ Connected to PostgreSQL: {version}")
            
            # Check if tables exist
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            existing_tables = [row[0] for row in result.fetchall()]
            
            if existing_tables:
                print(f"📋 Existing tables: {', '.join(existing_tables)}")
            else:
                print("📋 No existing tables found")
                print("💡 Run the schema.sql file from the project root to create tables")
        
        print("\n✅ Database connection successful!")
        print("\nNext steps:")
        print("1. Run the schema.sql file from the project root to create tables")
        print("2. Start the backend with: python start.py")
        print("3. Access the API at: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check your .env file and DATABASE_URL")
        print("2. Ensure your database is running")
        print("3. Verify your connection credentials")
        print(f"\nError details: {e}")

async def check_tables():
    """Check which tables exist in the database"""
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("""
                SELECT 
                    table_name,
                    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
                FROM information_schema.tables t
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            
            tables = result.fetchall()
            
            if tables:
                print("\n📊 Database Tables:")
                print("-" * 50)
                for table_name, column_count in tables:
                    print(f"📋 {table_name:<20} ({column_count} columns)")
            else:
                print("\n📋 No tables found in the database")
                print("💡 Run the schema.sql file to create tables")
                
    except Exception as e:
        print(f"❌ Error checking tables: {e}")

async def main():
    """Main function"""
    print("🚀 Gym Management System - Database Initialization")
    print("=" * 60)
    
    # Check if DATABASE_URL is set
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        print("💡 Create a .env file with your database connection string")
        return
    
    print(f"🔗 Database URL: {database_url[:50]}...")
    print()
    
    # Initialize database
    await init_database()
    
    # Check existing tables
    await check_tables()
    
    print("\n" + "=" * 60)
    print("🎯 Database initialization complete!")

if __name__ == "__main__":
    asyncio.run(main())
