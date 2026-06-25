// ==================== ASK PAGE - AUTO-ANSWER ====================

// Load questions on page load
document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    // Auto-refresh every 5 seconds for real-time updates
    setInterval(loadQuestions, 5000);
});

// Submit Question
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
            let message = '✅ Your question has been submitted!';
            if (response.autoAnswered) {
                message = `🤖 Auto-Answered!\n\n${response.answer}`;
            }
            document.getElementById('askSuccess').style.display = 'block';
            document.getElementById('askSuccess').innerHTML = message.replace(/\n/g, '<br>');
            document.getElementById('askForm').reset();
            loadQuestions();
            setTimeout(() => {
                document.getElementById('askSuccess').style.display = 'none';
            }, 8000);
        }
    } catch (error) {
        alert('Failed to submit question: ' + error.message);
    }
});

// Load Questions with Auto-Answers
async function loadQuestions() {
    try {
        const questions = await apiCall('/questions');
        const container = document.getElementById('questionsList');
        
        if (questions.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:rgba(255,255,255,0.4);">
                    <i class="fas fa-comments" style="font-size:48px; margin-bottom:15px; display:block;"></i>
                    No questions yet. Be the first to ask!
                </div>
            `;
            return;
        }
        
        container.innerHTML = questions.map(q => `
            <div style="background:rgba(255,255,255,0.05); border-radius:15px; padding:20px; margin-bottom:15px; border-left: 3px solid ${q.isAnswered ? '#38ef7d' : '#fa709a'}; transition: all 0.3s;">
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                    <div>
                        <strong style="color:white;">${q.name}</strong>
                        <span style="color:rgba(255,255,255,0.4); font-size:12px; margin-left:10px;">
                            <i class="far fa-clock"></i> ${new Date(q.date).toLocaleString()}
                        </span>
                    </div>
                    <span style="color:${q.isAnswered ? '#38ef7d' : '#fa709a'}; font-size:12px; font-weight:600;">
                        ${q.isAnswered ? '✅ Auto-Answered' : '⏳ Awaiting response'}
                    </span>
                </div>
                <p style="color:rgba(255,255,255,0.85); margin:10px 0; font-size:15px; line-height:1.6;">
                    💬 ${q.question}
                </p>
                ${q.isAnswered ? `
                    <div style="background:rgba(56,239,125,0.08); border-radius:12px; padding:15px; margin-top:10px; border-left: 3px solid #38ef7d;">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                            <span style="color:#38ef7d; font-weight:600;">🤖 Auto-Answer:</span>
                        </div>
                        <p style="color:rgba(255,255,255,0.85); margin:0; font-size:14px; line-height:1.6; white-space:pre-line;">${q.answer}</p>
                    </div>
                ` : `
                    <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
                        <span style="display:inline-block; width:8px; height:8px; background:#fa709a; border-radius:50%; animation: pulse-dot 1.5s infinite;"></span>
                        <span style="color:rgba(255,255,255,0.4); font-size:12px;">Waiting for auto-response...</span>
                    </div>
                `}
            </div>
        `).join('');
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse-dot {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('questionsList').innerHTML = `
            <div style="text-align:center; padding:20px; color:#ff6b6b;">
                <i class="fas fa-exclamation-circle"></i> Failed to load questions. Please refresh.
            </div>
        `;
    }
}

// Make loadQuestions available globally
window.loadQuestions = loadQuestions;
