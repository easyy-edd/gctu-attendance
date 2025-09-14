// Authentication utility functions
const API_BASE_URL = 'http://localhost:5000';

class Auth {
    constructor() {
        this.token = localStorage.getItem('auth_token');
        this.user = JSON.parse(localStorage.getItem('user_data') || 'null');
    }

    async login(userId, password, role) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    password: password,
                    role: role
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                this.token = data.token;
                this.user = data.user;

                // Store in localStorage
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('user_data', JSON.stringify(this.user));

                return { success: true, user: this.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '../index.html';
    }

    isAuthenticated() {
        return this.token && this.user;
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    getUserRole() {
        return this.user ? this.user.role : null;
    }

    // Check if user has required role
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    // Make authenticated API request
    async authenticatedRequest(url, options = {}) {
        const headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        return fetch(url, {
            ...options,
            headers
        });
    }
}

// Global auth instance
const auth = new Auth();

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DEBUG: Auth initialization started');
    console.log('DEBUG: Current path:', window.location.pathname);
    console.log('DEBUG: Is authenticated:', auth.isAuthenticated());

    // Check if user is already logged in and redirect to appropriate dashboard
    if (auth.isAuthenticated()) {
        const user = auth.getUser();
        const currentPath = window.location.pathname;
        console.log('DEBUG: Authenticated user:', user);

        // Redirect to appropriate dashboard if on login page
        if (currentPath.includes('login.html')) {
            switch (user.role) {
                case 'student':
                    window.location.href = 'index.html';
                    break;
                case 'lecturer':
                    window.location.href = 'index.html';
                    break;
                case 'examiner':
                    window.location.href = 'index.html';
                    break;
                case 'admin':
                    window.location.href = 'index.html';
                    break;
            }
        }
    } else {
        // User is not authenticated
        const currentPath = window.location.pathname;
        console.log('DEBUG: User not authenticated, checking path for redirect');

        // If trying to access admin pages without authentication, redirect to admin login
        if ((currentPath.includes('/admin/') || currentPath.includes('admin/')) && !currentPath.includes('login.html')) {
            console.log('DEBUG: Redirecting to admin login');
            window.location.href = 'login.html';
        }
        // If trying to access student pages without authentication, redirect to student login
        else if ((currentPath.includes('/student/') || currentPath.includes('student/')) && !currentPath.includes('login.html')) {
            console.log('DEBUG: Redirecting to student login');
            window.location.href = 'login.html';
        }
        // If trying to access lecturer pages without authentication, redirect to lecturer login
        else if ((currentPath.includes('/lecturer/') || currentPath.includes('lecturer/')) && !currentPath.includes('login.html')) {
            console.log('DEBUG: Redirecting to lecturer login');
            window.location.href = 'login.html';
        }
        // If trying to access examiner pages without authentication, redirect to examiner login
        else if ((currentPath.includes('/examiner/') || currentPath.includes('examiner/')) && !currentPath.includes('login.html')) {
            console.log('DEBUG: Redirecting to examiner login');
            window.location.href = 'login.html';
        }
    }

    // Add logout functionality to logout buttons
    const logoutButtons = document.querySelectorAll('.logout-btn, [onclick*="logout"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    });
});

// Export for use in other modules
window.Auth = Auth;
window.auth = auth;