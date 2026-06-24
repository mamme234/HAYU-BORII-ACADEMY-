// ==================== TEACHER SPECIFIC ====================
// ==================== OPEN TELEGRAM BOT ====================
function openTelegramBot() {
    window.open('https://t.me/Hayubori_academyBot', '_blank');
    
    const approvalCode = localStorage.getItem('hayubori_teacher_code');
    const teacherName = localStorage.getItem('hayubori_teacher_name');
    if (approvalCode && teacherName) {
        alert(`📱 Opening Telegram bot @Hayubori_academyBot\n\n👤 Name: ${teacherName}\n🔑 Your Approval Code: ${approvalCode}\n\n💬 Click the bot to receive your code via Telegram!\n\n⚠️ Make sure you have started a chat with @Hayubori_academyBot first!`);
    } else {
        alert('📱 Opening Telegram bot @Hayubori_academyBot\n\nPlease login first to get your Approval Code.');
    }
}

async function startTeacherExam(teacherData, photoFile, docFile, telegramUsername) {
    const questions = generateTeacherExamQuestions();
    let currentQuestion = 0, answers = new Array(questions.length).fill(-1), timeLeft = 300;
    examActive = true;
    examViolations = 0;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 200;
        canvas.getContext('2d').drawImage(video, 0, 0, 200, 200);
        stream.getTracks().forEach(t => t.stop());
    } catch(e) { console.warn("Camera error"); }

    const violationHandler = () => {
        if(examActive) {
            examViolations++;
            alert(`⚠️ Violation ${examViolations}/3 – Do not switch tabs!`);
            if(examViolations >= 3) terminateExam();
        }
    };
    document.addEventListener('contextmenu', violationHandler);
    document.addEventListener('keydown', (e) => {
        if(examActive && (e.key==='F12'||(e.ctrlKey&&e.shiftKey&&e.key==='I'))) {
            e.preventDefault();
            violationHandler();
        }
    });
    document.addEventListener('visibilitychange', () => { if(examActive && document.hidden) violationHandler(); });
    window.addEventListener('blur', violationHandler);

    const examHTML = `<div id="examContainer" class="exam-container"><div class="exam-timer">⏱️ Time: <span id="timer">05:00</span></div><div id="examContent"></div><div style="text-align:center; padding:15px; color:rgba(255,255,255,0.5);">⚠️ DO NOT leave this page! 3 violations = termination</div></div>`;
    document.body.insertAdjacentHTML('beforeend', examHTML);
    try { await document.documentElement.requestFullscreen(); } catch(e) {}

    function render() {
        const q = questions[currentQuestion];
        document.getElementById('examContent').innerHTML = `
            <div class="exam-question"><h3 style="color:#a8b5ff;">Question ${currentQuestion+1}/${questions.length}</h3><p style="font-size:20px; margin:20px 0; color:white;">${q.text}</p>
            ${q.options.map((opt, idx) => `<div class="exam-option ${answers[currentQuestion]===idx?'selected':''}" onclick="selectTeacherAnswer(${idx})" style="display:block; width:100%; padding:18px 25px; margin:12px 0; background:${answers[currentQuestion]===idx?'linear-gradient(135deg,#667eea,#764ba2)':'rgba(255,255,255,0.05)'}; border:${answers[currentQuestion]===idx?'2px solid #a8b5ff':'2px solid rgba(255,255,255,0.15)'}; border-radius:60px; cursor:pointer; text-align:left; font-size:16px; color:white; transition:all 0.3s ease;">${String.fromCharCode(65+idx)}. ${opt}</div>`).join('')}</div>
            <div style="display:flex; gap:15px; margin-top:25px;">
                <button onclick="prevTeacher()" class="${currentQuestion===0?'btn-danger':'btn-success'}" style="padding:12px 30px; border-radius:50px; border:none; font-weight:700; cursor:pointer;">◀ Previous</button>
                <button onclick="nextTeacher()" class="btn-success" style="padding:12px 30px; border-radius:50px; border:none; font-weight:700; cursor:pointer; flex:1;">${currentQuestion===questions.length-1?'Submit Application':'Next ▶'}</button>
            </div>
        `;
    }

    window.selectTeacherAnswer = (idx) => { answers[currentQuestion] = idx; render(); };
    window.nextTeacher = () => { if(currentQuestion === questions.length-1) submitExam(); else { currentQuestion++; render(); } };
    window.prevTeacher = () => { if(currentQuestion > 0) { currentQuestion--; render(); } };

    function terminateExam() {
        examActive = false;
        document.body.style.overflow = '';
        document.getElementById('examContainer')?.remove();
        alert("❌ Exam terminated due to violations.");
        document.getElementById('teacherRegistrationSection').style.display = 'block';
    }

    async function submitExam() {
        clearInterval(timerInterval);
        let correct = 0;
        answers.forEach((ans,i) => { if(ans === questions[i].correct) correct++; });
        const percentage = (correct/questions.length)*100;
        examActive = false;
        document.body.style.overflow = '';
        document.getElementById('examContainer')?.remove();

        if(percentage >= 60) {
            const formData = new FormData();
            formData.append('fullName', teacherData.fullName);
            formData.append('email', teacherData.email);
            formData.append('telegram', telegramUsername);
            formData.append('phone', teacherData.phone);
            formData.append('gradeLevel', teacherData.gradeLevel);
            formData.append('subject', teacherData.subject);
            formData.append('experience', teacherData.experience);
            formData.append('reason', teacherData.reason);
            formData.append('examScore', percentage);
            if (photoFile) formData.append('photo', photoFile);
            if (docFile) formData.append('document', docFile);

            try {
                const result = await apiCall('/teacher/apply', { method: 'POST', body: formData });
                
                // Save approval code for the "Take My Code" button
                localStorage.setItem('hayubori_teacher_code', result.approvalCode);
                localStorage.setItem('hayubori_teacher_name', teacherData.fullName);
                
                alert(`✅ Exam passed! Score: ${percentage}%\n\n🔑 Approval Code: ${result.approvalCode}\n\n📱 Click "Take My Code" on your dashboard to get it on Telegram!\n\n⚠️ Make sure you have started a chat with @Hayubori_academyBot first!`);
                
                document.getElementById('teacherRegistrationSection').style.display = 'none';
                document.getElementById('teacherWaitingSection').style.display = 'block';
            } catch (err) {
                alert(`❌ Application failed: ${err.message}`);
                document.getElementById('teacherRegistrationSection').style.display = 'block';
            }
        } else {
            alert(`❌ Failed! Score: ${percentage}%. Need 60% to pass.`);
            document.getElementById('teacherRegistrationSection').style.display = 'block';
        }
    }

    const timerInterval = setInterval(() => {
        if(!examActive) return clearInterval(timerInterval);
        if(timeLeft <= 0) { clearInterval(timerInterval); submitExam(); }
        else { timeLeft--; const mins = Math.floor(timeLeft/60); const secs = timeLeft%60; document.getElementById('timer') && (document.getElementById('timer').innerText = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`); }
    }, 1000);
    render();
}

// Teacher Registration Form
document.getElementById('teacherRegForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const docFile = document.getElementById('teacherDoc').files[0];
    const photoFile = document.getElementById('teacherPhoto').files[0];
    let telegramUsername = document.getElementById('teacherTelegram').value.trim();
    if (!docFile) { alert('📄 Please upload your education document!'); return; }
    if (!photoFile) { alert('📸 Please upload your photo!'); return; }
    if (telegramUsername && !telegramUsername.startsWith('@')) telegramUsername = '@' + telegramUsername;

    startTeacherExam({
        fullName: document.getElementById('teacherFullName').value,
        email: document.getElementById('teacherEmail').value,
        phone: document.getElementById('teacherPhone').value,
        gradeLevel: document.getElementById('teacherGradeLevel').value,
        subject: document.getElementById('teacherSubject').value,
        experience: document.getElementById('teacherExperience').value,
        reason: document.getElementById('teacherReason').value
    }, photoFile, docFile, telegramUsername);
});

// Teacher Login
document.getElementById('teacherLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('teacherCode').value;
    const fullName = document.getElementById('teacherLoginName').value;
    try {
        const data = await apiCall('/teacher/login', { method: 'POST', body: JSON.stringify({ code, fullName }) });
        
        // Save approval code for "Take My Code" button
        localStorage.setItem('hayubori_teacher_code', code);
        localStorage.setItem('hayubori_teacher_name', fullName);
        
        alert(`✅ Welcome ${data.teacher.fullName}!`);
        document.getElementById('teacherRegistrationSection').style.display = 'none';
        document.getElementById('teacherWaitingSection').style.display = 'none';
        document.getElementById('teacherLoginSection').style.display = 'none';
        document.getElementById('teacherProfileSection').style.display = 'block';
        document.getElementById('teacherProfileContent').innerHTML = `
            <div class="form-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <h2>Welcome, Teacher ${data.teacher.fullName}!</h2>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <button onclick="openTelegramBot()" class="btn-success" style="padding:10px 25px; background:linear-gradient(135deg,#0088cc,#2a9fd6); color:white;">
                            <i class="fab fa-telegram"></i> Take My Code
                        </button>
                        <button onclick="logout()" class="btn-danger" style="padding:10px 25px;">Logout</button>
                    </div>
                </div>
            </div>
            <div class="card"><h3>Your Information</h3><p><strong>Teacher ID:</strong> ${data.teacher.teacherId}</p><p><strong>Grade Level:</strong> ${data.teacher.gradeLevel}</p><p><strong>Subject:</strong> ${data.teacher.subject || 'General'}</p><p><strong>Approval Code:</strong> ${data.teacher.approvalCode}</p><p><strong>Status:</strong> ✅ Approved</p></div>
            <div style="text-align:center; margin:15px 0;">
                <button onclick="openTelegramBot()" class="btn-warning" style="background:linear-gradient(135deg,#0088cc,#2a9fd6); color:white; padding:10px 25px;">
                    <i class="fab fa-telegram"></i> Get Code on Telegram
                </button>
            </div>
        `;
    } catch (err) {
        alert('❌ Invalid approval code. Please check your Telegram for the correct code.');
    }
});

function generateTeacherExamQuestions() {
    return [
        { text: "What is your teaching philosophy?", options: ["Student-centered","Teacher-centered","Both","None"], correct:0 },
        { text: "How do you handle classroom discipline?", options: ["Strict rules","Positive reinforcement","Ignore minor issues","Send to principal"], correct:1 },
        { text: "What is the best way to assess student learning?", options: ["Final exam only","Continuous assessment","Homework only","Class participation only"], correct:1 },
        { text: "How do you engage struggling students?", options: ["Extra homework","One-on-one support","Ignore them","Move them to back"], correct:1 },
        { text: "What is your approach to parent communication?", options: ["Only when issues arise","Regular updates","Never","Only at parent-teacher conferences"], correct:1 }
    ];
}

// Make functions global
window.openTelegramBot = openTelegramBot;
window.logout = logout;
