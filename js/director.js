// ==================== DIRECTOR DASHBOARD ====================

let currentDirectorType = '';
let currentGradeFilter = '';

// ==================== DIRECTOR LOGIN ====================
document.getElementById('directorLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const photoFile = document.getElementById('directorPhoto').files[0];
    if (!photoFile) { alert('📸 Please upload your photo for verification!'); return; }
    
    const type = document.getElementById('directorType').value;
    const password = document.getElementById('directorPassword').value;
    
    try {
        const result = await apiCall('/director/login', {
            method: 'POST',
            body: JSON.stringify({ type, password })
        });
        
        if (result.success) {
            currentDirectorType = type;
            document.getElementById('directorLoginSection').style.display = 'none';
            document.getElementById('directorDashboardSection').style.display = 'block';
            loadDirectorData(type);
        }
    } catch (error) {
        alert('❌ Invalid credentials. Default passwords: kg123, elem123, middle123');
    }
});

// ==================== LOAD DIRECTOR DATA ====================
async function loadDirectorData(type) {
    try {
        const stats = await apiCall(`/director/${type}/stats`);
        
        document.getElementById('dirTotalStudents').textContent = stats.students.length;
        document.getElementById('dirTotalTeachers').textContent = stats.teachers.length;
        document.getElementById('dirPendingTeachers').textContent = stats.pendingTeachers || 0;
        document.getElementById('dirRevenue').textContent = stats.revenue + ' ETB';
        
        renderGrades(type);
        renderTeachers(stats.teachers);
        renderPendingRequests(type);
    } catch (error) {
        console.error('Error loading director data:', error);
    }
}

// ==================== RENDER GRADES ====================
function renderGrades(type) {
    const container = document.getElementById('gradeGrid');
    
    let gradeFilter = [];
    if (type === 'kg') {
        gradeFilter = ['Nursery', 'Lower KG', 'Upper KG'];
    } else if (type === 'elementary') {
        gradeFilter = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'];
    } else if (type === 'middle') {
        gradeFilter = ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
    }
    
    // Generate random attendance for demo
    const generateAttendance = () => {
        return {
            present: Math.floor(Math.random() * 20) + 10,
            absent: Math.floor(Math.random() * 5) + 1,
            late: Math.floor(Math.random() * 3)
        };
    };
    
    container.innerHTML = gradeFilter.map(grade => {
        const attendance = generateAttendance();
        return `
            <div class="grade-card" onclick="showGradeDetail('${grade}')">
                <div class="grade-name">${grade}</div>
                <div class="grade-count">
                    <i class="fas fa-user-graduate"></i> Students: ${Math.floor(Math.random() * 30) + 5}
                </div>
                <div class="grade-attendance">
                    <span class="present">✅ ${attendance.present}</span>
                    <span class="absent">❌ ${attendance.absent}</span>
                    <span class="late">⏰ ${attendance.late}</span>
                </div>
                <div style="margin-top:10px; font-size:12px; color:rgba(255,255,255,0.3);">
                    <i class="fas fa-arrow-right"></i> Tap to view
                </div>
            </div>
        `;
    }).join('');
}

// ==================== SHOW GRADE DETAIL ====================
async function showGradeDetail(grade) {
    currentGradeFilter = grade;
    document.getElementById('gradeDetailView').classList.add('active');
    document.getElementById('gradesSection').style.display = 'none';
    document.getElementById('gradeNameDisplay').textContent = grade;
    
    try {
        // Get students for this grade
        const allStudents = await apiCall('/students');
        const filteredStudents = allStudents.filter(s => s.grade === grade);
        
        const tbody = document.getElementById('gradeStudentsBody');
        if (filteredStudents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:rgba(255,255,255,0.5);">No students found in ${grade}</td></tr>`;
            return;
        }
        
        // Generate random attendance for each student
        const getAttendance = () => {
            const statuses = ['Present', 'Absent', 'Late'];
            const weights = [70, 20, 10];
            const random = Math.random() * 100;
            if (random < weights[0]) return { status: 'Present', class: 'status-present', icon: '✅' };
            else if (random < weights[0] + weights[1]) return { status: 'Absent', class: 'status-absent', icon: '❌' };
            else return { status: 'Late', class: 'status-late', icon: '⏰' };
        };
        
        tbody.innerHTML = filteredStudents.map((s, index) => {
            const attendance = getAttendance();
            const paymentStatus = s.registration_paid && s.term1_paid && s.term2_paid && s.term3_paid && s.term4_paid 
                ? '✅ Complete' 
                : '⏳ Pending';
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong style="color:white;">${s.fullName}</strong></td>
                    <td style="color:#a8b5ff;">${s.studentId}</td>
                    <td>${s.parentName || 'N/A'}</td>
                    <td>${s.examScore || 0}%</td>
                    <td>${paymentStatus}</td>
                    <td class="${attendance.class}">${attendance.icon} ${attendance.status}</td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading grade students:', error);
        document.getElementById('gradeStudentsBody').innerHTML = `<tr><td colspan="7" style="text-align:center; color:#ff6b6b;">Failed to load students</td></tr>`;
    }
}

function hideGradeDetail() {
    document.getElementById('gradeDetailView').classList.remove('active');
    document.getElementById('gradesSection').style.display = 'block';
}

// ==================== RENDER TEACHERS ====================
function renderTeachers(teachers) {
    const container = document.getElementById('directorTeachersList');
    if (!teachers || teachers.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.6);">No teachers under your supervision.</p>';
        return;
    }
    container.innerHTML = teachers.map(t => `
        <div style="background:rgba(255,255,255,0.05); border-radius:15px; padding:15px; margin-bottom:10px; border-left: 3px solid #38ef7d; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
                <strong style="color:white;">${t.fullName}</strong>
                <span style="color:rgba(255,255,255,0.5); font-size:13px;"> | ${t.gradeLevel}</span>
            </div>
            <div>
                <span style="color:#38ef7d; font-size:13px;">✅ Active</span>
                <span style="color:rgba(255,255,255,0.3); font-size:12px; margin-left:10px;">ID: ${t.teacherId || 'N/A'}</span>
            </div>
        </div>
    `).join('');
}

// ==================== PENDING TEACHER REQUESTS ====================
async function renderPendingRequests(type) {
    const container = document.getElementById('pendingTeacherRequests');
    try {
        const allPending = await apiCall('/teachers/pending');
        
        // Filter pending teachers by grade level matching director type
        let gradeFilter = [];
        if (type === 'kg') gradeFilter = ['KG'];
        else if (type === 'elementary') gradeFilter = ['Elementary'];
        else if (type === 'middle') gradeFilter = ['Middle'];
        
        const filtered = allPending.filter(t => gradeFilter.includes(t.gradeLevel));
        
        if (filtered.length === 0) {
            container.innerHTML = '<p style="color:rgba(255,255,255,0.6);">✅ No pending requests</p>';
            return;
        }
        
        container.innerHTML = filtered.map(t => `
            <div class="teacher-request">
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                    <div>
                        <div class="name">${t.fullName}</div>
                        <div class="email">${t.email}</div>
                    </div>
                    <div>
                        <span class="score">📊 ${t.examScore || 0}%</span>
                    </div>
                </div>
                <div style="margin-top:5px; color:rgba(255,255,255,0.4); font-size:13px;">
                    Subject: ${t.subject || 'General'} | Experience: ${t.experience || 0} years
                </div>
                <div class="actions">
                    <button class="btn-approve" onclick="approveTeacherByDirector('${t._id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-reject" onclick="rejectTeacherByDirector('${t._id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading pending requests:', error);
        container.innerHTML = '<p style="color:rgba(255,255,255,0.6);">Failed to load pending requests.</p>';
    }
}

// ==================== APPROVE/REJECT TEACHER (Director) ====================
async function approveTeacherByDirector(id) {
    try {
        const result = await apiCall(`/teacher/${id}/approve`, { method: 'POST' });
        if (result.success) {
            alert('✅ Teacher approved successfully!');
            // Reload data
            loadDirectorData(currentDirectorType);
        }
    } catch (error) {
        alert('Failed to approve teacher: ' + error.message);
    }
}

async function rejectTeacherByDirector(id) {
    if (!confirm('Are you sure you want to reject this teacher?')) return;
    try {
        const result = await apiCall(`/teacher/${id}/reject`, { method: 'POST' });
        if (result.success) {
            alert('❌ Teacher rejected.');
            loadDirectorData(currentDirectorType);
        }
    } catch (error) {
        alert('Failed to reject teacher: ' + error.message);
    }
}

// ==================== AUTO-LOAD ON PAGE LOAD ====================
// Check if already logged in
const savedDirectorType = localStorage.getItem('hayubori_director_type');
if (savedDirectorType) {
    document.getElementById('directorLoginSection').style.display = 'none';
    document.getElementById('directorDashboardSection').style.display = 'block';
    currentDirectorType = savedDirectorType;
    loadDirectorData(savedDirectorType);
}

// Make functions global
window.showGradeDetail = showGradeDetail;
window.hideGradeDetail = hideGradeDetail;
window.approveTeacherByDirector = approveTeacherByDirector;
window.rejectTeacherByDirector = rejectTeacherByDirector;
