#!/usr/bin/env python3
"""
Script to clear all users except admin from the database
"""

import sqlite3

def clear_users():
    """Clear all users except admin"""
    db_path = 'attendance_system.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Delete all users except admin
        cursor.execute("DELETE FROM users WHERE user_id != 'admin'")
        rows_deleted = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        print(f"Successfully deleted {rows_deleted} users (keeping admin)")
        
    except Exception as e:
        print(f"Error clearing users: {e}")

if __name__ == "__main__":
    clear_users()