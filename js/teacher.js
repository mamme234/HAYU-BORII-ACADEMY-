// ==================== TEACHER SPECIFIC ====================
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

    const examHTML = `<div id="examContainer" class="exam-container"><div class="exam-timer">⏱️ Time: <span id="timer">05:00</span></div><div id="examContent"></div><div style="text-align:center; padding:15px; color:#ccc;">⚠️ DO NOT leave this page! 3 violations = termination</div></div>`;
    document.body.insertAdjacentHTML('beforeend', examHTML);
    try { await document.documentElement.requestFullscreen(); } catch(e) {}

    function render() {
        const q = questions[currentQuestion];
        document.getElementById('examContent').innerHTML = `
            <div class="exam-question"><h3>Question ${currentQuestion+1}/${questions.length}</h3><p style="font-size:20px; margin:20px 0;">${q.text}</p>
            ${q.options.map((opt, idx) => `<div class="exam-option ${answers[currentQuestion]===idx?'selected':''}" onclick="selectTeacherAnswer(${idx})">${String.fromCharCode(65+idx)}. ${opt}</div>`).join('')}</div>
            <div style="display:flex; gap:15px; margin-top:20px;">
                <button onclick="prevTeacher()" class="${currentQuestion===0?'btn-danger':'btn-success'}">◀ Previous</button>
                <button onclick="nextTeacher()" class="btn-success" style="flex:1;">${currentQuestion===questions.length-1?'Submit Application':'Next ▶'}</button>
            </div>`;
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
                alert(`✅ Exam passed! Score: ${percentage}%\n\nApplication submitted!\nApproval Code: ${result.approvalCode}`);
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
        alert(`✅ Welcome ${data.teacher.fullName}!`);
        document.getElementById('teacherRegistrationSection').style.display = 'none';
        document.getElementById('teacherWaitingSection').style.display = 'none';
        document.getElementById('teacherLoginSection').style.display = 'none';
        document.getElementById('teacherProfileSection').style.display = 'block';
        document.getElementById('teacherProfileContent').innerHTML = `
            <div class="form-card"><h2>Welcome, Teacher ${data.teacher.fullName}!</h2><button onclick="logout()" class="btn-danger">Logout</button></div>
            <div class="card"><h3>Your Information</h3><p><strong>Teacher ID:</strong> ${data.teacher.teacherId}</p><p><strong>Grade Level:</strong> ${data.teacher.gradeLevel}</p><p><strong>Subject:</strong> ${data.teacher.subject || 'General'}</p><p><strong>Status:</strong> ✅ Approved</p></div>`;
    } catch (err) {
        alert('❌ Invalid approval code.');
    }
});
