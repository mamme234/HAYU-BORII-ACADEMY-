// ==================== PARENT SPECIFIC ====================
document.getElementById('parentLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('parentStudentId').value;
    try {
        const data = await apiCall('/parent/login', { method: 'POST', body: JSON.stringify({ studentId }) });
        document.getElementById('parentLoginSection').style.display = 'none';
        document.getElementById('parentProfileSection').style.display = 'block';
        document.getElementById('parentProfileContent').innerHTML = `
            <div class="form-card"><div style="display:flex; justify-content:space-between;"><h2>Parent Dashboard - ${data.student.fullName}</h2><button onclick="window.location.href='index.html'" class="btn-danger">Back</button></div></div>
            <div class="card"><h3>Student Information</h3><p><strong>Name:</strong> ${data.student.fullName}</p><p><strong>Student ID:</strong> ${data.student.studentId}</p><p><strong>Grade:</strong> ${data.student.grade}</p></div>
            <div class="card"><h3>Payment Status</h3><p>Registration: ${data.student.registration_paid ? '✅ Paid' : '❌ Unpaid'}</p><p>Term 1: ${data.student.term1_paid ? '✅ Paid' : '❌ Unpaid'}</p><p>Term 2: ${data.student.term2_paid ? '✅ Paid' : '❌ Unpaid'}</p></div>
        `;
    } catch (err) {
        alert('❌ Student not found.');
    }
});
