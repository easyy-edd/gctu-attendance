// Database API Client for GCTU Attendance System
// This module handles all database operations through the backend API

class DatabaseClient {
    constructor() {
        this.baseURL = 'http://localhost:5000';
        this.token = localStorage.getItem('auth_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Authentication methods
    async login(userId, password, role) {
        const data = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
                password: password,
                role: role
            })
        });
        
        if (data.status === 'success') {
            this.setToken(data.token);
        }
        
        return data;
    }

    async logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }

    // User management methods
    async getAllUsers() {
        return await this.request('/users');
    }

    async getUsersByRole(role) {
        return await this.request(`/users/by-role/${role}`);
    }

    async getUser(userId) {
        return await this.request(`/users/${userId}`);
    }

    async createUser(userData) {
        return await this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(userId, userData) {
        return await this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(userId) {
        return await this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    async changePassword(oldPassword, newPassword) {
        return await this.request('/change_password', {
            method: 'POST',
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword
            })
        });
    }

    // Bulk operations
    async bulkUploadUsers(file, defaultRole = 'student') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('default_role', defaultRole);

        return await this.request('/bulk-upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
                // Note: Don't set Content-Type for FormData, let browser set it
            },
            body: formData
        });
    }

    // Attendance methods
    async markAttendance(studentId, courseId, method = 'manual', status = 'present') {
        return await this.request('/mark_attendance', {
            method: 'POST',
            body: JSON.stringify({
                student_id: studentId,
                course_id: courseId,
                method: method,
                status: status
            })
        });
    }

    async getAttendance(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.courseId) params.append('course_id', filters.courseId);
        if (filters.date) params.append('date', filters.date);
        if (filters.studentId) params.append('student_id', filters.studentId);
        
        const queryString = params.toString();
        const endpoint = queryString ? `/get_attendance?${queryString}` : '/get_attendance';
        
        return await this.request(endpoint);
    }

    // Dashboard and statistics
    async getDashboardStats() {
        return await this.request('/dashboard/stats');
    }

    // Face recognition methods
    async registerFace(studentId, faceEncoding) {
        return await this.request('/register_face', {
            method: 'POST',
            body: JSON.stringify({
                student_id: studentId,
                face_encoding: faceEncoding
            })
        });
    }

    async trainModel() {
        return await this.request('/train_model', {
            method: 'POST'
        });
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    // Error handling helper
    handleError(error, context = '') {
        console.error(`Database error ${context}:`, error);
        
        // Handle specific error types
        if (error.message.includes('Token has expired')) {
            this.logout();
            window.location.href = '../index.html';
            return;
        }
        
        if (error.message.includes('Unauthorized')) {
            alert('You are not authorized to perform this action.');
            return;
        }
        
        // Generic error handling
        alert(`Error ${context}: ${error.message}`);
    }
}

// Create global instance
const dbClient = new DatabaseClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseClient;
} else {
    window.DatabaseClient = DatabaseClient;
    window.dbClient = dbClient;
}