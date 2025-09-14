#!/usr/bin/env python3
"""
Database initialization script for GCTU Attendance System
This script initializes the database and imports sample users from CSV
"""

import os
import sys
from database import db

def init_database():
    """Initialize database with sample data"""
    print("Initializing GCTU Attendance System Database...")
    
    # Database is already initialized in the DatabaseManager constructor
    print("[OK] Database tables created successfully")
    
    # Import sample users from CSV
    csv_file = '../sample_users.csv'
    if os.path.exists(csv_file):
        print(f"Importing users from {csv_file}...")
        imported_count, errors = db.import_users_from_csv(csv_file, 'student')
        
        print(f"[OK] Successfully imported {imported_count} users")
        if errors:
            print("[WARNING] Errors encountered:")
            for error in errors:
                print(f"  - {error}")
    else:
        print(f"[WARNING] Sample CSV file not found at {csv_file}")
    
    # Add some sample data for testing
    print("Adding additional sample users...")
    
    sample_users = [
        {
            'user_id': '123456789',
            'password': 'student @gctu',
            'name': 'John Doe',
            'email': 'john.doe@gctu.edu.gh',
            'role': 'student',
            'level': 100,
            'program': 'Computer Science',
            'department': 'Computer Science'
        },
        {
            'user_id': '1704448490',
            'password': 'student @gctu',
            'name': 'Sample Student',
            'email': 'sample.student@gctu.edu.gh',
            'role': 'student',
            'level': 200,
            'program': 'Information Technology',
            'department': 'Information Technology'
        },
        {
            'user_id': 'john.lecturer@gctu.edu.gh',
            'password': 'staff@gctu',
            'name': 'Dr. John Lecturer',
            'email': 'john.lecturer@gctu.edu.gh',
            'role': 'lecturer',
            'department': 'Computer Science',
            'courses': ['CSC 101', 'CSC 102', 'CSC 201'],
            'levels': [100, 200]
        },
        {
            'user_id': 'jane.examiner@gctu.edu.gh',
            'password': 'staff@gctu',
            'name': 'Prof. Jane Examiner',
            'email': 'jane.examiner@gctu.edu.gh',
            'role': 'examiner'
        }
    ]
    
    added_count = 0
    for user_data in sample_users:
        if not db.get_user(user_data['user_id']):
            if db.create_user(user_data):
                added_count += 1
                print(f"  [OK] Added {user_data['role']}: {user_data['name']}")
            else:
                print(f"  [ERROR] Failed to add {user_data['name']}")
        else:
            print(f"  - User {user_data['user_id']} already exists")
    
    print(f"[OK] Added {added_count} additional sample users")
    
    # Display summary
    print("\n" + "="*50)
    print("DATABASE INITIALIZATION COMPLETE")
    print("="*50)
    
    all_users = db.get_all_users()
    print(f"Total users in database: {len(all_users)}")
    
    # Count by role
    role_counts = {}
    for user in all_users:
        role = user['role']
        role_counts[role] = role_counts.get(role, 0) + 1
    
    for role, count in role_counts.items():
        print(f"  {role.capitalize()}s: {count}")
    
    print("\nDefault login credentials:")
    print("  Admin: admin / admin123")
    print("  Students: [student_id] / student @gctu")
    print("  Staff (Lecturers/Examiners): [email] / staff@gctu")
    print("\nDatabase file: attendance_system.db")
    print("Backend server: python app.py")

if __name__ == '__main__':
    try:
        init_database()
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)