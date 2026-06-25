// ==================== ADMIN PANEL ====================
document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    try {
        const result = await apiCall('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (result.success) {
            document.getElementById('adminLoginSection').style.display = 'none';
            document.getElementById('adminDashboardSection').style.display = 'block';
            loadAdminData();
        }
    } catch (error) {
        alert('Invalid credentials. Use admin / admin123');
    }
});

async function loadAdminData() {
    try {
        const stats = await apiCall('/admin/stats');
        document.getElementById('totalStudents').textContent = stats.students;
        document.getElementById('totalTeachers').textContent = stats.teachers;
        document.getElementById('totalRevenue').textContent = stats.totalRevenue + ' ETB';
        document.getElementById('pendingQuestions').textContent = stats.questions;

        const students = await apiCall('/admin/students');
        renderStudents(students);

        const teachers = await apiCall('/admin/teachers');
        renderTeachers(teachers);
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

function renderStudents(students) {
    const container = document.getElementById('allStudentsList');
    if (students.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.6);">No students registered.</p>';
        return;
    }
    container.innerHTML = `<div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="color:rgba(255,255,255,0.6); border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="padding:10px; text-align:left;">Name</th><th style="padding:10px; text-align:left;">Student ID</th><th style="padding:10px; text-align:left;">Grade</th><th style="padding:10px; text-align:left;">Actions</th>
            </tr></thead>
            <tbody>${students.map(s => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:10px; color:white;">${s.fullName}</td>
                    <td style="padding:10px; color:#a8b5ff;">${s.studentId}</td>
                    <td style="padding:10px; color:rgba(255,255,255,0.8);">${s.grade}</td>
                    <td style="padding:10px;">
                        <button onclick="deleteStudent('${s._id}')" class="btn-danger" style="padding:5px 15px; font-size:12px;">Delete</button>
                    </td>
                </tr>
            `).join('')}</tbody>
        </table>
    </div>`;
}

function renderTeachers(teachers) {
    const container = document.getElementById('allTeachersList');
    if (teachers.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.6);">No teachers registered.</p>';
        return;
    }
    container.innerHTML = `<div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="color:rgba(255,255,255,0.6); border-bottom:1px solid rgba(255,255,255,0.1);">
                <th style="padding:10px; text-align:left;">Name</th><th style="padding:10px; text-align:left;">Status</th><th style="padding:10px; text-align:left;">Actions</th>
            </tr></thead>
            <tbody>${teachers.map(t => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:10px; color:white;">${t.fullName}</td>
                    <td style="padding:10px; color:${t.status === 'approved' ? '#38ef7d' : '#fa709a'};">${t.status}</td>
                    <td style="padding:10px;">
                        <button onclick="deleteTeacher('${t._id}')" class="btn-danger" style="padding:5px 15px; font-size:12px;">Delete</button>
                    </td>
                </tr>
            `).join('')}</tbody>
        </table>
    </div>`;
}

async function deleteStudent(id) {
    if (!confirm('Delete this student permanently?')) return;
    try {
        await apiCall(`/admin/student/${id}`, { method: 'DELETE' });
        alert('✅ Student deleted.');
        loadAdminData();
    } catch (error) {
        alert('Failed to delete: ' + error.message);
    }
}

async function deleteTeacher(id) {
    if (!confirm('Delete this teacher permanently?')) return;
    try {
        await apiCall(`/admin/teacher/${id}`, { method: 'DELETE' });
        alert('✅ Teacher deleted.');
        loadAdminData();
    } catch (error) {
        alert('Failed to delete: ' + error.message);
    }
}

window.deleteStudent = deleteStudent;
window.deleteTeacher = deleteTeacher;
