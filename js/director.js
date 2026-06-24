// ==================== DIRECTOR SPECIFIC ====================
document.getElementById('directorLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const photoFile = document.getElementById('directorPhoto').files[0];
    if (!photoFile) { alert('📸 Upload photo!'); return; }
    try {
        const data = await apiCall('/director/login', { method: 'POST', body: JSON.stringify({ type: document.getElementById('directorType').value, password: document.getElementById('directorPassword').value }) });
        const stats = await apiCall(`/director/${data.director.type}/stats`);
        document.getElementById('directorLoginSection').style.display = 'none';
        document.getElementById('directorProfileSection').style.display = 'block';
        document.getElementById('directorProfileContent').innerHTML = `
            <div class="form-card"><h2>${data.director.name} Dashboard</h2><button onclick="window.location.href='index.html'" class="btn-danger">Back</button></div>
            <div class="grid-3">
                <div class="card"><h3>Students</h3><p style="font-size:36px;">${stats.students.length}</p></div>
                <div class="card"><h3>Revenue</h3><p style="font-size:36px;">${stats.revenue.toLocaleString()} ETB</p></div>
                <div class="card"><h3>Teachers</h3><p style="font-size:36px;">${stats.teachers.length}</p></div>
            </div>
            <div class="card"><h3>Student List</h3><div class="student-table"><table><thead><tr><th>Name</th><th>ID</th><th>Grade</th><th>Paid</th></tr></thead><tbody>${stats.students.map(s => `<tr><td>${s.fullName}</td><td>${s.studentId}</td><td>${s.grade}</td><td>${s.registration_paid ? '✅' : '❌'}</td></tr>`).join('')}</tbody></table></div></div>
        `;
    } catch (err) {
        alert('❌ Invalid credentials. Default: kg123, elem123, high123');
    }
});
