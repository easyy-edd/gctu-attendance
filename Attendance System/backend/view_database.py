#!/usr/bin/env python3
"""
Script to view the contents of the attendance system database
"""

import sqlite3
import json

def view_database():
    """View all tables and their contents"""
    db_path = 'attendance_system.db'

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()

        print("=== ATTENDANCE SYSTEM DATABASE CONTENTS ===\n")

        for table in tables:
            table_name = table['name']
            print(f"TABLE: {table_name}")
            print("-" * (7 + len(table_name)))

            # Get table contents
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()

            if rows:
                # Get column names
                columns = [description[0] for description in cursor.description]
                print(f"Columns: {', '.join(columns)}")
                print(f"Total rows: {len(rows)}\n")

                # Print first 10 rows
                for i, row in enumerate(rows[:10]):
                    row_dict = dict(row)
                    # Pretty print JSON fields
                    for key, value in row_dict.items():
                        if isinstance(value, str) and (value.startswith('[') or value.startswith('{')):
                            try:
                                row_dict[key] = json.loads(value)
                            except:
                                pass
                    print(f"Row {i+1}: {row_dict}")

                if len(rows) > 10:
                    print(f"... and {len(rows) - 10} more rows\n")
                else:
                    print()
            else:
                print("No data in this table\n")

        conn.close()

    except Exception as e:
        print(f"Error accessing database: {e}")

if __name__ == "__main__":
    view_database()