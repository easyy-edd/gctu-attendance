// Dashboard functionality

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('active');
        mainContent.classList.toggle('active');
    }
}

// Initialize dashboard components
document.addEventListener('DOMContentLoaded', function() {
    // Profile dropdown toggle
    const profileDropdown = document.querySelector('.profile');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function() {
            // Toggle dropdown menu (would be implemented with actual dropdown)
            alert('Profile dropdown clicked');
        });
    }
    
    // Notification click handler
    const notificationBell = document.querySelector('.notifications i');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            // Show notifications (would be implemented with actual notifications panel)
            alert('Notifications clicked');
        });
    }
    
    // Add student button
    const addStudentBtn = document.querySelector('.add-student-btn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', function() {
            // Open add student modal (would be implemented with actual modal)
            alert('Add student form will appear here');
        });
    }
    
    // Action buttons in student list
    const actionButtons = document.querySelectorAll('table td i');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Show action menu for student (would be implemented with actual dropdown)
            alert('Student actions menu clicked');
        });
    });
    
    // Simulate loading attendance data
    simulateAttendanceData();
});

// Function to simulate attendance data for the chart
function simulateAttendanceData() {
    // In a real application, this would fetch data from an API
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const presentData = [85, 90, 75, 95, 80]; // Percentages
    const absentData = days.map(day => 100 - presentData[days.indexOf(day)]);
    
    // Update the chart bars with the simulated data
    const barWrappers = document.querySelectorAll('.bar-wrapper');
    
    barWrappers.forEach((wrapper, index) => {
        if (index < days.length) {
            const presentBar = wrapper.querySelector('.bar.present');
            const absentBar = wrapper.querySelector('.bar.absent');
            
            if (presentBar && absentBar) {
                presentBar.style.height = presentData[index] + '%';
                absentBar.style.height = absentData[index] + '%';
            }
        }
    });
}

// Handle absence request actions
function handleAbsenceRequest(studentId, action) {
    // In a real application, this would send a request to an API
    console.log(`Absence request for student ${studentId} ${action}`);
    alert(`Absence request ${action}`);
}

// Create/Schedule Attendance functionality
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'createAttendanceBtn') {
        // Open attendance creation form (would be implemented with actual form)
        alert('Create/Schedule Attendance form will appear here');
    }
});

// Download attendance report functionality
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'downloadBtn') {
        // Generate and download attendance report
        alert('Generating attendance report PDF...');
    }
});

// QR Code Generation functionality
document.addEventListener('DOMContentLoaded', function() {
    // QR Code Generation
    const generateQRBtn = document.getElementById('generateQRBtn');
    const qrCourseSelect = document.getElementById('qrCourse');
    const qrExpirySelect = document.getElementById('qrExpiry');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const downloadQRBtn = document.getElementById('downloadQRBtn');
    const printQRBtn = document.getElementById('printQRBtn');
    
    if (generateQRBtn) {
        generateQRBtn.addEventListener('click', function() {
            const selectedCourse = qrCourseSelect.value;
            const expiryTime = qrExpirySelect.value;
            
            if (!selectedCourse) {
                alert('Please select a course');
                return;
            }
            
            // Show loading state
            qrCodeContainer.innerHTML = '<div class="qr-loading"><i class="fas fa-spinner fa-spin"></i><p>Generating QR code...</p></div>';
            
            // Simulate QR code generation (in a real app, this would create an actual QR code)
            setTimeout(function() {
                // Create a mock QR code (in a real app, use a library like qrcode.js)
                const mockQRCode = `
                    <div class="generated-qr">
                        <div class="qr-image">
                            <!-- This would be a real QR code in production -->
                            <svg width="150" height="150" viewBox="0 0 150 150">
                                <rect x="0" y="0" width="150" height="150" fill="#ffffff"/>
                                <g fill="#000000">
                                    <!-- Outer frame -->
                                    <rect x="10" y="10" width="130" height="10"/>
                                    <rect x="10" y="10" width="10" height="130"/>
                                    <rect x="10" y="130" width="130" height="10"/>
                                    <rect x="130" y="10" width="10" height="130"/>
                                    
                                    <!-- Position detection patterns -->
                                    <rect x="25" y="25" width="30" height="30"/>
                                    <rect x="35" y="35" width="10" height="10" fill="#ffffff"/>
                                    
                                    <rect x="95" y="25" width="30" height="30"/>
                                    <rect x="105" y="35" width="10" height="10" fill="#ffffff"/>
                                    
                                    <rect x="25" y="95" width="30" height="30"/>
                                    <rect x="35" y="105" width="10" height="10" fill="#ffffff"/>
                                    
                                    <!-- Random data bits (would be actual QR data) -->
                                    <rect x="70" y="30" width="5" height="5"/>
                                    <rect x="80" y="40" width="5" height="5"/>
                                    <rect x="60" y="50" width="5" height="5"/>
                                    <rect x="90" y="60" width="5" height="5"/>
                                    <rect x="50" y="70" width="5" height="5"/>
                                    <rect x="75" y="80" width="5" height="5"/>
                                    <rect x="65" y="90" width="5" height="5"/>
                                    <rect x="85" y="100" width="5" height="5"/>
                                    <rect x="95" y="110" width="5" height="5"/>
                                    <rect x="40" y="85" width="5" height="5"/>
                                    <rect x="110" y="75" width="5" height="5"/>
                                    <rect x="115" y="95" width="5" height="5"/>
                                </g>
                            </svg>
                        </div>
                        <div class="qr-info">
                            <p><strong>Course:</strong> ${selectedCourse}</p>
                            <p><strong>Expires in:</strong> ${expiryTime} minutes</p>
                            <p><strong>Generated:</strong> ${new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                `;
                
                qrCodeContainer.innerHTML = mockQRCode;
                
                // Enable download and print buttons
                downloadQRBtn.disabled = false;
                printQRBtn.disabled = false;
            }, 1500);
        });
    }
    
    // Download QR Code
    if (downloadQRBtn) {
        downloadQRBtn.addEventListener('click', function() {
            if (downloadQRBtn.disabled) return;
            
            // In a real app, this would download the actual QR code image
            alert('QR code would be downloaded as an image file');
        });
    }
    
    // Print QR Code
    if (printQRBtn) {
        printQRBtn.addEventListener('click', function() {
            if (printQRBtn.disabled) return;
            
            // In a real app, this would open the print dialog
            alert('Print dialog would open to print the QR code');
        });
    }
    
    // Student ID Scanning
    const startScanningBtn = document.getElementById('startScanningBtn');
    const scannerContainer = document.getElementById('scannerContainer');
    const scannerCourseSelect = document.getElementById('scannerCourse');
    const studentIdInput = document.getElementById('studentIdInput');
    const submitIdBtn = document.getElementById('submitIdBtn');
    
    if (startScanningBtn) {
        startScanningBtn.addEventListener('click', function() {
            const selectedCourse = scannerCourseSelect.value;
            
            if (!selectedCourse) {
                alert('Please select a course');
                return;
            }
            
            // Show scanner activation
            scannerContainer.innerHTML = '<div class="scanner-active"><i class="fas fa-camera"></i><p>Camera activated. Point at student ID...</p></div>';
            
            // In a real app, this would activate the device camera
            // For this demo, we'll simulate a successful scan after a delay
            setTimeout(function() {
                // Simulate a successful scan
                const mockStudentId = 'S' + Math.floor(Math.random() * 900 + 100);
                recordAttendance(mockStudentId, selectedCourse, 'QR Code');
                
                // Reset scanner
                scannerContainer.innerHTML = '<div class="scanner-success"><i class="fas fa-check-circle"></i><p>Successfully scanned ID: ' + mockStudentId + '</p></div>';
                
                // Reset after 3 seconds
                setTimeout(function() {
                    scannerContainer.innerHTML = '<div class="scanner-placeholder"><i class="fas fa-id-card"></i><p>Scanner will activate here</p></div>';
                }, 3000);
            }, 2000);
        });
    }
    
    // Manual ID submission
    if (submitIdBtn) {
        submitIdBtn.addEventListener('click', function() {
            const studentId = studentIdInput.value.trim();
            const selectedCourse = scannerCourseSelect.value;
            
            if (!studentId) {
                alert('Please enter a student ID');
                return;
            }
            
            if (!selectedCourse) {
                alert('Please select a course');
                return;
            }
            
            // Record attendance
            recordAttendance(studentId, selectedCourse, 'Manual');
            
            // Clear input
            studentIdInput.value = '';
            
            // Show success message
            alert('Attendance recorded for student ID: ' + studentId);
        });
    }
    
    // Attendance table filtering
    const attendanceFilter = document.getElementById('attendanceFilter');
    if (attendanceFilter) {
        attendanceFilter.addEventListener('change', function() {
            filterAttendanceTable(this.value);
        });
    }
    
    // Refresh attendance button
    const refreshAttendanceBtn = document.getElementById('refreshAttendanceBtn');
    if (refreshAttendanceBtn) {
        refreshAttendanceBtn.addEventListener('click', function() {
            // In a real app, this would fetch the latest attendance data
            this.classList.add('rotating');
            
            setTimeout(() => {
                this.classList.remove('rotating');
                alert('Attendance data refreshed');
            }, 1000);
        });
    }
    
    // Export attendance button
    const exportAttendanceBtn = document.getElementById('exportAttendanceBtn');
    if (exportAttendanceBtn) {
        exportAttendanceBtn.addEventListener('click', function() {
            // In a real app, this would export the attendance data to CSV/Excel
            alert('Attendance data would be exported to CSV/Excel');
        });
    }
});

// Function to record attendance
function recordAttendance(studentId, course, method) {
    // In a real app, this would send the data to a server
    // For this demo, we'll add a row to the attendance table
    
    const tableBody = document.getElementById('attendanceTableBody');
    if (!tableBody) return;
    
    // Get student name (in a real app, this would come from a database)
    const studentNames = {
        'S001': 'John Smith',
        'S002': 'Sarah Johnson',
        'S003': 'Michael Brown',
        'S004': 'Emily Davis',
        'S005': 'David Wilson'
    };
    
    // Use the known name or generate a placeholder
    const studentName = studentNames[studentId] || 'Student ' + studentId;
    
    // Create new row
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${studentName}</td>
        <td>${studentId}</td>
        <td style="color:green;">Present</td>
        <td>${new Date().toLocaleTimeString()}</td>
        <td><span class="method ${method.toLowerCase()}">${method}</span></td>
    `;
    
    // Add to table (prepend to show newest first)
    tableBody.insertBefore(newRow, tableBody.firstChild);
}

// Function to filter attendance table
function filterAttendanceTable(filter) {
    const rows = document.querySelectorAll('#attendanceTableBody tr');
    
    rows.forEach(row => {
        const status = row.querySelector('td:nth-child(3)').textContent;
        
        if (filter === 'all') {
            row.style.display = '';
        } else if (filter === 'present' && status.includes('Present')) {
            row.style.display = '';
        } else if (filter === 'absent' && status.includes('Absent')) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
