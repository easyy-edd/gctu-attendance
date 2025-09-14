from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db  # Your Supabase DatabaseManager
import jwt
import os
import bcrypt
from functools import wraps

app = Flask(__name__)
CORS(app)

# JWT Secret Key
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user_id = data.get('user_id')
    password = data.get('password')

    user = db.get_user(user_id)
    if not user:
        return jsonify({'status': 'error', 'message': 'User not found'}), 401

    if not db.verify_password(user_id, password):
        return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

    # Create JWT token with expiration
    import datetime
    token = jwt.encode({
        'user_id': user['user_id'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)  # Token expires in 24 hours
    }, JWT_SECRET, algorithm='HS256')

    return jsonify({
        'status': 'success',
        'token': token,
        'user': {
            'user_id': user['user_id'],
            'role': user['role'],
            'name': user.get('name', '')
        }
    })

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            print(f"DEBUG: Authorization header: {auth_header}")
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                print(f"DEBUG: Extracted token: {token[:20]}...")  # Only show first 20 chars for security

        if not token:
            print("DEBUG: No token found")
            return jsonify({'status': 'error', 'message': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            print(f"DEBUG: Decoded token data: {data}")
            current_user = db.get_user(data['user_id'])
            if not current_user:
                print(f"DEBUG: User not found: {data['user_id']}")
                return jsonify({'status': 'error', 'message': 'User not found'}), 401
            print(f"DEBUG: Authenticated user: {current_user['name']} ({current_user['role']})")
        except jwt.ExpiredSignatureError:
            print("DEBUG: Token expired")
            return jsonify({'status': 'error', 'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            print(f"DEBUG: Token validation error: {e}")
            return jsonify({'status': 'error', 'message': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/change_password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({'status': 'error', 'message': 'Old and new passwords are required'}), 400

    # Verify old password
    if not bcrypt.checkpw(old_password.encode('utf-8'), current_user['password'].encode('utf-8')):
        return jsonify({'status': 'error', 'message': 'Old password is incorrect'}), 401

    # Hash new password
    hashed_new_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Update password in database
    success = db.update_user(current_user['user_id'], {'password': hashed_new_password})
    if success:
        return jsonify({'status': 'success', 'message': 'Password changed successfully'})
    else:
        return jsonify({'status': 'error', 'message': 'Failed to update password'}), 500

@app.route('/register', methods=['POST'])
@token_required
def register(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    data = request.get_json()
    print(f"DEBUG: Register request data: {data}")

    if not data:
        return jsonify({'status': 'error', 'message': 'No data provided'}), 400

    user_data = {
        'user_id': data.get('user_id'),
        'name': data.get('name'),
        'email': data.get('email'),
        'role': data.get('role'),
        'password': data.get('password')
    }

    print(f"DEBUG: Processed user_data: {user_data}")

    # Validate required fields
    if not all([user_data['user_id'], user_data['name'], user_data['email'], user_data['role'], user_data['password']]):
        return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400

    try:
        success = db.create_user(user_data)
        print(f"DEBUG: Database create_user result: {success}")
        if success:
            return jsonify({'status': 'success', 'message': 'User created successfully'})
        else:
            return jsonify({'status': 'error', 'message': 'Failed to create user'}), 400
    except Exception as e:
        print(f"DEBUG: Exception during user creation: {e}")
        return jsonify({'status': 'error', 'message': f'Database error: {str(e)}'}), 500

@app.route('/users', methods=['GET'])
@token_required
def get_users(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    users = db.get_all_users()
    return jsonify({'status': 'success', 'users': users})

@app.route('/users/by-role', methods=['GET'])
@token_required
def get_users_by_role(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    # Get users organized by role
    students = db.get_users_by_role('student')
    lecturers = db.get_users_by_role('lecturer')
    examiners = db.get_users_by_role('examiner')
    admins = db.get_users_by_role('admin')

    return jsonify({
        'status': 'success',
        'users_by_role': {
            'students': students,
            'lecturers': lecturers,
            'examiners': examiners,
            'admins': admins
        },
        'stats': {
            'total_students': len(students),
            'total_lecturers': len(lecturers),
            'total_examiners': len(examiners),
            'total_admins': len(admins),
            'total_users': len(students) + len(lecturers) + len(examiners) + len(admins)
        }
    })

@app.route('/users/<user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    if current_user['role'] != 'admin':
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    success = db.delete_user(user_id)
    if success:
        return jsonify({'status': 'success', 'message': 'User deleted successfully'})
    else:
        return jsonify({'status': 'error', 'message': 'Failed to delete user'}), 400

# Student-specific endpoints
@app.route('/student/dashboard', methods=['GET'])
@token_required
def get_student_dashboard(current_user):
    if current_user['role'] != 'student':
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    # Get student's courses (mock data for now - in real app, this would come from database)
    courses = [
        {'id': 'CSC201', 'name': 'Data Structures', 'lecturer': 'Dr. Smith', 'schedule': 'Mon & Wed, 8:00-10:00 AM', 'room': '203, Block A'},
        {'id': 'CSC301', 'name': 'Database Systems', 'lecturer': 'Dr. Johnson', 'schedule': 'Tue & Thu, 11:00-1:00 PM', 'room': '105, Block B'},
        {'id': 'MTH102', 'name': 'Calculus II', 'lecturer': 'Dr. Williams', 'schedule': 'Mon & Fri, 2:00-4:00 PM', 'room': 'Lab 3, Block C'},
        {'id': 'ENG205', 'name': 'Digital Logic Design', 'lecturer': 'Dr. Brown', 'schedule': 'Wed & Fri, 9:00-11:00 AM', 'room': '301, Block D'}
    ]

    # Get today's attendance (mock data)
    today_attendance = [
        {'course': 'Data Structures', 'status': 'present', 'time': '09:00 AM'},
        {'course': 'Database Systems', 'status': 'absent', 'time': '11:00 AM'},
        {'course': 'Calculus II', 'status': 'present', 'time': '02:00 PM'}
    ]

    # Get attendance stats (mock data)
    attendance_stats = {
        'monthly': [90, 92, 88, 95, 93, 97, 91],
        'courses': [97, 88, 92, 85]
    }

    return jsonify({
        'status': 'success',
        'data': {
            'courses': courses,
            'today_attendance': today_attendance,
            'attendance_stats': attendance_stats
        }
    })

@app.route('/student/attendance', methods=['GET'])
@token_required
def get_student_attendance(current_user):
    if current_user['role'] != 'student':
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    # Mock attendance history data
    attendance_history = [
        {'date': '2024-01-15', 'course': 'Data Structures', 'status': 'present'},
        {'date': '2024-01-16', 'course': 'Database Systems', 'status': 'present'},
        {'date': '2024-01-17', 'course': 'Calculus II', 'status': 'absent'},
        {'date': '2024-01-18', 'course': 'Data Structures', 'status': 'present'},
        {'date': '2024-01-19', 'course': 'Database Systems', 'status': 'present'}
    ]

    return jsonify({
        'status': 'success',
        'attendance': attendance_history
    })

# Lecturer-specific endpoints
@app.route('/lecturer/dashboard', methods=['GET'])
@token_required
def get_lecturer_dashboard(current_user):
    if current_user['role'] != 'lecturer':
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    # Mock dashboard data for lecturer
    stats = {
        'total_students': 120,
        'total_present': 98,
        'total_absent': 22,
        'total_courses': 5
    }

    # Mock courses data
    courses = [
        {'name': 'Computer Science 101', 'students': 85, 'attendance_rate': 85},
        {'name': 'Mathematics 202', 'students': 65, 'attendance_rate': 65},
        {'name': 'Physics 101', 'students': 45, 'attendance_rate': 45}
    ]

    # Mock absence requests
    absence_requests = [
        {'student_name': 'John Smith', 'reason': 'Medical', 'status': 'approved'},
        {'student_name': 'Sarah Johnson', 'reason': 'Family Emergency', 'status': 'rejected'},
        {'student_name': 'Michael Brown', 'reason': 'Medical', 'status': 'pending'}
    ]

    # Mock student list
    students = [
        {'name': 'John Smith', 'id': 'S001', 'email': 'john@example.com', 'course': 'Computer Science', 'attendance_rate': 95},
        {'name': 'Sarah Johnson', 'id': 'S002', 'email': 'sarah@example.com', 'course': 'Mathematics', 'attendance_rate': 85},
        {'name': 'Michael Brown', 'id': 'S003', 'email': 'michael@example.com', 'course': 'Physics', 'attendance_rate': 65},
        {'name': 'Emily Davis', 'id': 'S004', 'email': 'emily@example.com', 'course': 'Computer Science', 'attendance_rate': 92}
    ]

    return jsonify({
        'status': 'success',
        'data': {
            'stats': stats,
            'courses': courses,
            'absence_requests': absence_requests,
            'students': students
        }
    })

@app.route('/lecturer/attendance', methods=['GET'])
@token_required
def get_lecturer_attendance(current_user):
    if current_user['role'] != 'lecturer':
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403

    # Mock attendance data
    attendance_data = [
        {'student_name': 'John Smith', 'student_id': 'S001', 'status': 'Present', 'time': '09:00 AM', 'method': 'QR Code'},
        {'student_name': 'Sarah Johnson', 'student_id': 'S002', 'status': 'Present', 'time': '09:05 AM', 'method': 'Manual'},
        {'student_name': 'Michael Brown', 'student_id': 'S003', 'status': 'Absent', 'time': '-', 'method': '-'}
    ]

    return jsonify({
        'status': 'success',
        'attendance': attendance_data
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
