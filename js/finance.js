// ==================== FINANCE DASHBOARD ====================
document.getElementById('financeLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('financeEmail').value;
    const password = document.getElementById('financePassword').value;

    // Demo credentials: finance@hayubori.edu / finance123
    if (email === 'finance@hayubori.edu' && password === 'finance123') {
        document.getElementById('financeLoginSection').style.display = 'none';
        document.getElementById('financeDashboardSection').style.display = 'block';
        loadFinanceData();
    } else {
        alert('Invalid credentials. Use finance@hayubori.edu / finance123');
    }
});

async function loadFinanceData() {
    try {
        // Load stats
        const [today, week, month, pending] = await Promise.all([
            apiCall('/payments/today'),
            apiCall('/payments/week'),
            apiCall('/payments/month'),
            apiCall('/payments/pending')
        ]);

        document.getElementById('todayRevenue').textContent = today.total + ' ETB';
        document.getElementById('weekRevenue').textContent = week.total + ' ETB';
        document.getElementById('monthRevenue').textContent = month.total + ' ETB';
        document.getElementById('pendingCount').textContent = pending.length;

        // Load pending payments
        renderPendingPayments(pending);

        // Load payment history
        const history = await apiCall('/payments');
        renderPaymentHistory(history);
    } catch (error) {
        console.error('Error loading finance data:', error);
    }
}

function renderPendingPayments(payments) {
    const container = document.getElementById('pendingPaymentsList');
    if (payments.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.6);">No pending payments ✅</p>';
        return;
    }
    container.innerHTML = payments.map(p => `
        <div style="background:rgba(255,255,255,0.05); border-radius:15px; padding:20px; margin-bottom:15px; border-left: 3px solid #fa709a;">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                <div>
                    <strong style="color:white;">${p.studentName}</strong>
                    <span style="color:rgba(255,255,255,0.6); font-size:12px;"> | ${p.studentId}</span>
                </div>
                <span style="color:#fa709a; font-weight:600;">${p.amount} ETB</span>
            </div>
            <div style="display:flex; gap:15px; flex-wrap:wrap; margin:10px 0;">
                <span style="color:rgba(255,255,255,0.6); font-size:12px;">📋 ${p.type}</span>
                <span style="color:rgba(255,255,255,0.6); font-size:12px;">🏦 ${p.method.toUpperCase()}</span>
                <span style="color:rgba(255,255,255,0.6); font-size:12px;">📄 ${p.receiptNumber}</span>
            </div>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button onclick="openChappaModal('${p._id}')" class="btn-success" style="padding:8px 20px; font-size:13px;">✅ Approve</button>
                <button onclick="rejectPayment('${p._id}')" class="btn-danger" style="padding:8px 20px; font-size:13px;">❌ Reject</button>
            </div>
        </div>
    `).join('');
}

function renderPaymentHistory(payments) {
    const container = document.getElementById('paymentHistoryList');
    if (payments.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.6);">No payment history.</p>';
        return;
    }
    container.innerHTML = payments.slice(0, 20).map(p => `
        <div style="background:rgba(255,255,255,0.03); border-radius:15px; padding:15px; margin-bottom:10px; border-left: 3px solid ${p.status === 'approved' ? '#38ef7d' : '#fa709a'};">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                <div>
                    <strong style="color:white;">${p.studentName}</strong>
                    <span style="color:rgba(255,255,255,0.4); font-size:11px;"> | ${new Date(p.date).toLocaleDateString()}</span>
                </div>
                <div>
                    <span style="color:${p.status === 'approved' ? '#38ef7d' : '#fa709a'}; font-weight:600;">${p.amount} ETB</span>
                    <span style="color:rgba(255,255,255,0.4); font-size:11px; margin-left:10px;">${p.status.toUpperCase()}</span>
                </div>
            </div>
            ${p.chappa ? `<div style="margin-top:8px; padding:8px 12px; background:rgba(56,239,125,0.1); border-radius:8px;"><span style="color:#38ef7d;">📌 ${p.chappa}</span></div>` : ''}
        </div>
    `).join('');
}

function openChappaModal(paymentId) {
    document.getElementById('chappaPaymentId').value = paymentId;
    document.getElementById('chappaModal').style.display = 'flex';
}

function closeChappaModal() {
    document.getElementById('chappaModal').style.display = 'none';
}

document.getElementById('chappaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const paymentId = document.getElementById('chappaPaymentId').value;
    const chappa = document.getElementById('chappaText').value;

    try {
        const result = await apiCall(`/payment/${paymentId}/approve`, {
            method: 'POST',
            body: JSON.stringify({ chappa })
        });
        if (result.success) {
            alert('✅ Payment approved! Chappa and receipt sent to student and parent.');
            closeChappaModal();
            document.getElementById('chappaText').value = '';
            loadFinanceData();
        }
    } catch (error) {
        alert('Failed to approve: ' + error.message);
    }
});

async function rejectPayment(paymentId) {
    if (!confirm('Are you sure you want to reject this payment?')) return;
    try {
        const result = await apiCall(`/payment/${paymentId}/reject`, { method: 'POST' });
        if (result.success) {
            alert('❌ Payment rejected.');
            loadFinanceData();
        }
    } catch (error) {
        alert('Failed to reject: ' + error.message);
    }
}

window.openChappaModal = openChappaModal;
window.closeChappaModal = closeChappaModal;
window.rejectPayment = rejectPayment;
