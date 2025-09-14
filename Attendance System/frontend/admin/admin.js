  // Admin Dashboard JavaScript for GCTU Attendance System
// Handles user management, bulk operations, and system administration

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated and has admin role
    if (!auth.isAuthenticated() || !auth.hasRole('admin')) {
        window.location.href = '../index.html';
        return;
    }

    // Initialize dashboard components
    initializeDashboard();
    loadDashboardData();
    setupEventListeners();
});

// Initialize dashboard components
function initializeDashboard() {
    const user = auth.getUser();

    // Update user info in header
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }

    const userRoleElement = document.querySelector('.user-role');
    if (userRoleElement) {
        userRoleElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        showLoading(true);

        // Load dashboard statistics
        await loadDashboardStats();

        // Load all users
        await loadAllUsers();

        showLoading(false);
    } catch (error) {
        showLoading(false);
        dbClient.handleError(error, 'loading dashboard data');
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await dbClient.getDashboardStats();

        if (response.status === 'success') {
            updateStatsCards(response.stats);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Update statistics cards
function updateStatsCards(stats) {
    // Update total users
    const totalUsersElement = document.querySelector('.stat-card .stat-number');
    if (totalUsersElement) {
        totalUsersElement.textContent = stats.total_users || 0;
    }

    // Update individual role counts
    const roleStats = [
        { selector: '.students-count', value: stats.students || 0 },
        { selector: '.lecturers-count', value: stats.lecturers || 0 },
        { selector: '.examiners-count', value: stats.examiners || 0 }
    ];

    roleStats.forEach(stat => {
        const element = document.querySelector(stat.selector);
        if (element) {
            element.textContent = stat.value;
        }
    });
}

// Load all users and display in table
async function loadAllUsers() {
    try {
        const response = await dbClient.getAllUsers();

        if (response.status === 'success') {
            displayUsersTable(response.users);
            updateUserCounts(response.users);
        }
    } catch (error) {
        dbClient.handleError(error, 'loading users');
    }
}

// Display users in table
function displayUsersTable(users) {
    const tableBody = document.querySelector('#usersTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    users.forEach(user => {
        const row = createUserTableRow(user);
        tableBody.appendChild(row);
    });
}

// Create user table row
function createUserTableRow(user) {
    const row = document.createElement('tr');

    // Role-specific additional info
    let additionalInfo = '';
    if (user.role === 'student') {
        additionalInfo = `Level ${user.level || 'N/A'} - ${user.program || 'N/A'}`;
    } else if (user.role === 'lecturer') {
        additionalInfo = `${user.department || 'N/A'} - ${(user.courses || []).length} courses`;
    }

    row.innerHTML = `
        <td>
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-id">${user.user_id}</div>
            </div>
        </td>
        <td>${user.email}</td>
        <td>
            <span class="role-badge role-${user.role}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
        </td>
        <td class="additional-info">${additionalInfo}</td>
        <td>
            <div class="action-buttons">
                <button class="btn-icon" onclick="viewUser('${user.user_id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" onclick="editUser('${user.user_id}')" title="Edit User">
                    <i class="fas fa-edit"></i>
                </button>
                ${user.user_id !== 'admin' ? `
                <button class="btn-icon btn-danger" onclick="deleteUser('${user.user_id}')" title="Delete User">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </div>
        </td>
    `;

    return row;
}

// Update user counts
function updateUserCounts(users) {
    const counts = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        lecturers: users.filter(u => u.role === 'lecturer').length,
        examiners: users.filter(u => u.role === 'examiner').length,
        admins: users.filter(u => u.role === 'admin').length
    };

    // Update count displays
    Object.keys(counts).forEach(key => {
        const element = document.querySelector(`.${key}-count`);
        if (element) {
            element.textContent = counts[key];
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add user button
    const addUserBtn = document.querySelector('#addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', showAddUserModal);
    }

    // Bulk upload button
    const bulkUploadBtn = document.querySelector('#bulkUploadBtn');
    if (bulkUploadBtn) {
        bulkUploadBtn.addEventListener('click', showBulkUploadModal);
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const role = this.dataset.role;
            filterUsersByRole(role);
        });
    });

    // Search functionality
    const searchInput = document.querySelector('#userSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchUsers(this.value);
        });
    }

    // Refresh button
    const refreshBtn = document.querySelector('#refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadAllUsers);
    }
}

// Filter users by role
async function filterUsersByRole(role) {
    try {
        showLoading(true);

        let response;
        if (role === 'all') {
            response = await dbClient.getAllUsers();
        } else {
            response = await dbClient.getUsersByRole(role);
        }

        if (response.status === 'success') {
            displayUsersTable(response.users);
        }

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-role="${role}"]`).classList.add('active');

        showLoading(false);
    } catch (error) {
        showLoading(false);
        dbClient.handleError(error, 'filtering users');
    }
}

// Search users
function searchUsers(query) {
    const rows = document.querySelectorAll('#usersTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matches = text.includes(query.toLowerCase());
        row.style.display = matches ? '' : 'none';
    });
}

// User management functions
async function viewUser(userId) {
    try {
        const response = await dbClient.getUser(userId);

        if (response.status === 'success') {
            showUserDetailsModal(response.user);
        }
    } catch (error) {
        dbClient.handleError(error, 'loading user details');
    }
}

function editUser(userId) {
    // TODO: Implement edit user modal
    alert(`Edit user functionality for ${userId} will be implemented here`);
}

async function deleteUser(userId) {
    if (!confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await dbClient.deleteUser(userId);

        if (response.status === 'success') {
            alert('User deleted successfully');
            loadAllUsers(); // Refresh the table
        }
    } catch (error) {
        dbClient.handleError(error, 'deleting user');
    }
}

// Function to add a new user (student or lecturer)
async function addUser(userData) {
    try {
        console.log('DEBUG: Token used for addUser:', auth.getToken());
        const res = await auth.authenticatedRequest('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await res.json();
        if (result.status === 'success') {
            alert('User added successfully!');
            // Optionally refresh user list or UI here
        } else {
            alert('Error adding user: ' + result.message);
        }
    } catch (error) {
        alert('Network error: ' + error.message);
    }
}

// Show modal or form to collect user data and call addUser on submit
function showAddUserModal() {
    const modalHTML = `
        <div class="modal-overlay" id="addUserModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New User</h3>
                    <button class="close-modal" onclick="closeModal('addUserModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addUserForm">
                        <div class="form-group">
                            <label for="userRole">Role:</label>
                            <select id="userRole" name="role" required onchange="updateFormFields()">
                                <option value="">Select Role</option>
                                <option value="student">Student</option>
                                <option value="lecturer">Lecturer</option>
                                <option value="examiner">Examiner</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="userId">User ID:</label>
                            <input type="text" id="userId" name="user_id" required>
                        </div>

                        <div class="form-group">
                            <label for="userName">Name:</label>
                            <input type="text" id="userName" name="name" required>
                        </div>

                        <div class="form-group">
                            <label for="userEmail">Email:</label>
                            <input type="email" id="userEmail" name="email" required>
                        </div>

                        <div class="form-group">
                            <label for="userPassword">Password:</label>
                            <input type="password" id="userPassword" name="password" required>
                        </div>

                        <!-- Student-specific fields -->
                        <div id="studentFields" style="display: none;">
                            <div class="form-group">
                                <label for="studentLevel">Level:</label>
                                <input type="number" id="studentLevel" name="level" min="100" max="400">
                            </div>
                            <div class="form-group">
                                <label for="studentProgram">Program:</label>
                                <input type="text" id="studentProgram" name="program">
                            </div>
                            <div class="form-group">
                                <label for="studentDepartment">Department:</label>
                                <input type="text" id="studentDepartment" name="department">
                            </div>
                        </div>

                        <!-- Lecturer-specific fields -->
                        <div id="lecturerFields" style="display: none;">
                            <div class="form-group">
                                <label for="lecturerDepartment">Department:</label>
                                <input type="text" id="lecturerDepartment" name="department">
                            </div>
                            <div class="form-group">
                                <label for="lecturerCourses">Courses (comma-separated):</label>
                                <input type="text" id="lecturerCourses" name="courses" placeholder="e.g., CS101, CS102">
                            </div>
                            <div class="form-group">
                                <label for="lecturerLevels">Levels (comma-separated):</label>
                                <input type="text" id="lecturerLevels" name="levels" placeholder="e.g., 100, 200">
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('addUserModal')">Cancel</button>
                            <button type="submit" class="btn-primary">Add User</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add form submission handler
    document.getElementById('addUserForm').addEventListener('submit', handleAddUserSubmit);
}

function showBulkUploadModal() {
    // TODO: Implement bulk upload modal
    alert('Bulk upload modal will be implemented here');
}

function showUserDetailsModal(user) {
    // Create modal content
    let additionalFields = '';

    if (user.role === 'student') {
        additionalFields = `
            <div class="detail-row">
                <span class="detail-label">Level:</span>
                <span class="detail-value">${user.level || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Program:</span>
                <span class="detail-value">${user.program || 'N/A'}</span>
            </div>
        `;
    } else if (user.role === 'lecturer') {
        additionalFields = `
            <div class="detail-row">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${user.department || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Courses:</span>
                <span class="detail-value">${(user.courses || []).join(', ') || 'None'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Levels:</span>
                <span class="detail-value">${(user.levels || []).join(', ') || 'None'}</span>
            </div>
        `;
    }

    const modalHTML = `
        <div class="modal-overlay" id="userDetailsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>User Details</h3>
                    <button class="close-modal" onclick="closeModal('userDetailsModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="user-details">
                        <div class="detail-row">
                            <span class="detail-label">User ID:</span>
                            <span class="detail-value">${user.user_id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${user.name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${user.email}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Role:</span>
                            <span class="detail-value">
                                <span class="role-badge role-${user.role}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                            </span>
                        </div>
                        ${additionalFields}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Utility functions
function showLoading(show) {
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }

    // Disable/enable buttons during loading
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.disabled = show;
    });
}

// Add CSS for new elements
const style = document.createElement('style');
style.textContent = `
    .user-info {
        display: flex;
        flex-direction: column;
    }

    .user-name {
        font-weight: 500;
        color: #333;
    }

    .user-id {
        font-size: 0.85em;
        color: #666;
    }

    .role-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: 500;
        text-transform: uppercase;
    }

    .role-student { background: #e3f2fd; color: #1976d2; }
    .role-lecturer { background: #f3e5f5; color: #7b1fa2; }
    .role-examiner { background: #e8f5e8; color: #388e3c; }
    .role-admin { background: #fff3e0; color: #f57c00; }

    .action-buttons {
        display: flex;
        gap: 5px;
    }

    .btn-icon {
        padding: 6px;
        border: none;
        border-radius: 4px;
        background: #f5f5f5;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-icon:hover {
        background: #e0e0e0;
    }

    .btn-danger:hover {
        background: #ffebee;
        color: #d32f2f;
    }

    .additional-info {
        font-size: 0.9em;
        color: #666;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
    }

    .modal-body {
        padding: 20px;
    }

    .close-modal {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }

    .user-details {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
    }

    .detail-label {
        font-weight: 500;
        color: #333;
    }

    .detail-value {
        color: #666;
    }

    .loading {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.9);
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        display: none;
    }

    .filter-btn.active {
        background: #1976d2;
        color: white;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
    }

    .form-group input,
    .form-group select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }

    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }

    .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }

    .btn-primary {
        background: #1976d2;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
    }

    .btn-primary:hover {
        background: #1565c0;
    }

    .btn-secondary {
        background: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    .btn-secondary:hover {
        background: #e0e0e0;
    }
`;

// Function to update form fields based on selected role
function updateFormFields() {
    const role = document.getElementById('userRole').value;
    const studentFields = document.getElementById('studentFields');
    const lecturerFields = document.getElementById('lecturerFields');

    // Hide all role-specific fields first
    if (studentFields) studentFields.style.display = 'none';
    if (lecturerFields) lecturerFields.style.display = 'none';

    // Show fields based on selected role
    if (role === 'student' && studentFields) {
        studentFields.style.display = 'block';
    } else if (role === 'lecturer' && lecturerFields) {
        lecturerFields.style.display = 'block';
    }
}

// Function to handle add user form submission
async function handleAddUserSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = {
        user_id: formData.get('user_id'),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    // Add role-specific fields
    if (userData.role === 'student') {
        userData.level = parseInt(formData.get('level')) || 100;
        userData.program = formData.get('program') || 'General';
        userData.department = formData.get('department') || 'General';
    } else if (userData.role === 'lecturer') {
        userData.department = formData.get('department') || 'General';
        const coursesStr = formData.get('courses');
        userData.courses = coursesStr ? coursesStr.split(',').map(c => c.trim()) : [];
        const levelsStr = formData.get('levels');
        userData.levels = levelsStr ? levelsStr.split(',').map(l => parseInt(l.trim())).filter(l => !isNaN(l)) : [100];
    }

    try {
        // Show loading
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding...';
        submitBtn.disabled = true;

        // Call addUser function
        await addUser(userData);

        // Close modal and refresh user list
        closeModal('addUserModal');
        loadAllUsers();

    } catch (error) {
        alert('Error adding user: ' + error.message);
    } finally {
        // Reset button
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Add User';
        submitBtn.disabled = false;
    }
}

document.head.appendChild(style);
