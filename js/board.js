// ==================== BOARD SPECIFIC ====================
document.getElementById('boardLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const photoFile = document.getElementById('boardPhoto').files[0];
    if (!photoFile) { alert('📸 Upload photo!'); return; }
    try {
        await apiCall('/board/login', { method: 'POST', body: JSON.stringify({ email: document.getElementById('boardEmail').value, password: document.getElementById('boardPassword').value }) });
        const stats = await apiCall('/board/stats');
        document.getElementById('boardLoginSection').style.display = 'none';
        document.getElementById('boardProfileSection').style.display = 'block';
        document.getElementById('boardProfileContent').innerHTML = `
            <div class="form-card"><h2>Board Dashboard</h2><button onclick="window.location.href='index.html'" class="btn-danger">Back</button></div>
            <div class="grid-4">
                <div class="card"><h3>Students</h3><p style="font-size:28px;">${stats.totalStudents}</p></div>
                <div class="card"><h3>Teachers</h3><p style="font-size:28px;">${stats.totalTeachers}</p></div>
                <div class="card"><h3>Pending</h3><p style="font-size:28px;">${stats.pendingTeachers}</p></div>
                <div class="card"><h3>Revenue</h3><p style="font-size:28px;">${stats.totalRevenue.toLocaleString()} ETB</p></div>
            </div>
            <div class="card"><h3>Pending Applications</h3><div class="student-table"><table><thead><tr><th>Name</th><th>Email</th><th>Grade Level</th><th>Score</th><th>Action</th></tr></thead><tbody>${stats.pendingTeachersList.map(t => `<tr><td>${t.fullName}</td><td>${t.email}</td><td>${t.gradeLevel}</td><td>${t.examScore}%</td><td><button onclick="approveTeacher('${t._id}')" style="background:#11998e;padding:8px 15px;">Approve</button> <button onclick="rejectTeacher('${t._id}')" style="background:#dc3545;padding:8px 15px;">Reject</button></td></tr>`).join('')}</tbody></table></div></div>
        `;
    } catch (err) {
        alert('❌ Invalid credentials. Default: board@hayubori.edu / board123');
    }
});

window.approveTeacher = async (id) => {
    try {
        await apiCall(`/teacher/${id}/approve`, { method: 'POST' });
        alert('✅ Teacher approved!');
        location.reload();
    } catch (err) { alert('Failed: ' + err.message); }
};

window.rejectTeacher = async (id) => {
    if (confirm('Reject this teacher?')) {
        try {
            await apiCall(`/teacher/${id}/reject`, { method: 'POST' });
            alert('❌ Teacher rejected.');
            location.reload();
        } catch (err) { alert('Failed: ' + err.message); }
    }
};
