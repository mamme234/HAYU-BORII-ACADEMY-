// ==================== ASK PAGE ====================
document.getElementById('askForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('askName').value;
    const email = document.getElementById('askEmail').value;
    const question = document.getElementById('askQuestion').value;

    try {
        const response = await apiCall('/questions', {
            method: 'POST',
            body: JSON.stringify({ name, email, question })
        });
        if (response.success) {
            document.getElementById('askSuccess').style.display = 'block';
            document.getElementById('askForm').reset();
            loadQuestions();
        }
    } catch (error) {
        alert('Failed to submit question: ' + error.message);
    }
});

async function loadQuestions() {
    try {
        const questions = await apiCall('/questions');
        const container = document.getElementById('questionsList');
        if (questions.length === 0) {
            container.innerHTML = '<p style="color:rgba(255,255,255,0.6);">No questions yet. Be the first to ask!</p>';
            return;
        }
        container.innerHTML = questions.map(q => `
            <div style="background:rgba(255,255,255,0.05); border-radius:15px; padding:20px; margin-bottom:15px; border-left: 3px solid ${q.isAnswered ? '#38ef7d' : '#fa709a'};">
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                    <strong style="color:white;">${q.name}</strong>
                    <span style="color:rgba(255,255,255,0.4); font-size:12px;">${new Date(q.date).toLocaleDateString()}</span>
                </div>
                <p style="color:rgba(255,255,255,0.8); margin:10px 0;">${q.question}</p>
                ${q.isAnswered ? `
                    <div style="background:rgba(56,239,125,0.1); border-radius:10px; padding:15px; margin-top:10px;">
                        <p style="color:#38ef7d; font-weight:600;">📌 Answer:</p>
                        <p style="color:rgba(255,255,255,0.8);">${q.answer}</p>
                    </div>
                ` : `
                    <span style="color:#fa709a; font-size:12px;">⏳ Awaiting response...</span>
                `}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

loadQuestions();
