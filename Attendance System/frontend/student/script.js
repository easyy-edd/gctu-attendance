// Student Dashboard JavaScript

// Toggle Sidebar for Mobile View
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar.style.left === '-250px' || sidebar.style.left === '') {
        sidebar.style.left = '0';
        mainContent.style.marginLeft = '250px';
    } else {
        sidebar.style.left = '-250px';
        mainContent.style.marginLeft = '0';
    }
}

// Initialize Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Add mobile menu toggle button if it doesn't exist
    if (!document.querySelector('.mobile-menu-toggle')) {
        const header = document.querySelector('.header');
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.addEventListener('click', toggleSidebar);
        
        if (header) {
            header.prepend(mobileToggle);
        }
    }
    
    // Initialize profile dropdown
    const profileElement = document.querySelector('.profile');
    if (profileElement) {
        profileElement.addEventListener('click', function() {
            const dropdown = document.querySelector('.profile-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('show');
            } else {
                const newDropdown = document.createElement('div');
                newDropdown.className = 'profile-dropdown';
                newDropdown.innerHTML = `
                    <ul>
                        <li><a href="#"><i class="fas fa-user"></i> My Profile</a></li>
                        <li><a href="#"><i class="fas fa-cog"></i> Settings</a></li>
                        <li><a href="#"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                    </ul>
                `;
                // Find a suitable parent element or create one
                let parentElement = document.querySelector('.user-profile') || document.querySelector('.sidebar') || document.body;
                parentElement.appendChild(newDropdown);
                newDropdown.classList.add('show');
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.querySelector('.profile-dropdown');
        const profile = document.querySelector('.profile');
        
        if (dropdown && profile && !profile.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    // Initialize attendance scanner
    const scanBtn = document.getElementById('scanBtn');
    if (scanBtn) {
        scanBtn.addEventListener('click', function() {
            const scannerContainer = document.querySelector('.scanner-container');
            if (scannerContainer) {
                scannerContainer.innerHTML = '<div class="scanning-animation"><i class="fas fa-qrcode"></i><p>Scanning...</p></div>';
                
                // Simulate scanning process
                setTimeout(function() {
                    scannerContainer.innerHTML = '<div class="scanner-success"><i class="fas fa-check-circle"></i><p>Attendance Recorded Successfully!</p></div>';
                    
                    // Reset after 3 seconds
                    setTimeout(function() {
                        scannerContainer.innerHTML = '<div class="scanner-placeholder"><i class="fas fa-qrcode"></i><p>Click "Scan Attendance" to start scanning</p></div>';
                    }, 3000);
                }, 2000);
            }
        });
    }
    
    // Request Absence functionality
    const requestAbsenceBtn = document.querySelector('.action-btn.secondary');
    if (requestAbsenceBtn) {
        requestAbsenceBtn.addEventListener('click', function() {
            // Create modal for absence request
            const modal = document.createElement('div');
            modal.className = 'absence-modal';
            modal.innerHTML = `
                <div class="absence-modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Request Absence</h2>
                    <form id="absence-form">
                        <div class="form-group">
                            <label for="absence-date">Date</label>
                            <input type="date" id="absence-date" required>
                        </div>
                        <div class="form-group">
                            <label for="absence-reason">Reason</label>
                            <select id="absence-reason" required>
                                <option value="">Select a reason</option>
                                <option value="medical">Medical</option>
                                <option value="family">Family Emergency</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="absence-details">Details</label>
                            <textarea id="absence-details" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="absence-file">Supporting Document (optional)</label>
                            <input type="file" id="absence-file">
                        </div>
                        <button type="submit" class="action-btn primary">Submit Request</button>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Close modal functionality
            const closeModal = modal.querySelector('.close-modal');
            closeModal.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            // Submit form functionality
            const absenceForm = document.getElementById('absence-form');
            absenceForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // Simulate form submission
                const submitBtn = absenceForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitBtn.disabled = true;
                
                setTimeout(function() {
                    document.body.removeChild(modal);
                    
                    // Show success notification
                    const notification = document.createElement('div');
                    notification.className = 'notification success';
                    notification.innerHTML = '<i class="fas fa-check-circle"></i> Absence request submitted successfully!';
                    document.body.appendChild(notification);
                    
                    // Remove notification after 3 seconds
                    setTimeout(function() {
                        document.body.removeChild(notification);
                    }, 3000);
                }, 2000);
            });
        });
    }
});

// Add CSS for new elements
const style = document.createElement('style');
style.textContent = `
    .mobile-menu-toggle {
        display: none;
        background: none;
        border: none;
        font-size: 20px;
        color: #6c757d;
        cursor: pointer;
    }
    
    .profile-dropdown {
        position: absolute;
        top: 50px;
        right: 0;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        width: 200px;
        z-index: 100;
        display: none;
    }
    
    .profile-dropdown.show {
        display: block;
    }
    
    .profile-dropdown ul {
        list-style: none;
        padding: 0;
    }
    
    .profile-dropdown ul li {
        padding: 0;
        margin: 0;
    }
    
    .profile-dropdown ul li a {
        display: flex;
        align-items: center;
        padding: 12px 15px;
        color: #333;
        text-decoration: none;
        transition: background-color 0.3s;
    }
    
    .profile-dropdown ul li a:hover {
        background-color: #f5f5f5;
    }
    
    .profile-dropdown ul li a i {
        margin-right: 10px;
        font-size: 14px;
        color: #6c757d;
    }
    
    .scanning-animation {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #1890ff;
    }
    
    .scanning-animation i {
        font-size: 48px;
        margin-bottom: 15px;
        animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    .scanner-success {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #28a745;
    }
    
    .scanner-success i {
        font-size: 48px;
        margin-bottom: 15px;
    }
    
    .absence-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .absence-modal-content {
        background-color: #fff;
        border-radius: 10px;
        padding: 30px;
        width: 500px;
        max-width: 90%;
        position: relative;
    }
    
    .close-modal {
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 24px;
        cursor: pointer;
        color: #6c757d;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        font-size: 14px;
    }
    
    .form-group input, .form-group select, .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }
    
    .notification.success {
        background-color: #e6f7e6;
        color: #28a745;
    }
    
    .notification i {
        margin-right: 10px;
        font-size: 18px;
    }
    
    @media (max-width: 768px) {
        .mobile-menu-toggle {
            display: block;
        }
        
        .sidebar {
            left: -250px;
            transition: left 0.3s ease;
        }
        
        .main-content {
            margin-left: 0;
            transition: margin-left 0.3s ease;
        }
    }
`;

document.head.appendChild(style);