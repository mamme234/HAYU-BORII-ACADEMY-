// ==================== STUDENT SPECIFIC ====================
const SAVED_STUDENT_ID = localStorage.getItem('hayubori_student_id');
const SAVED_STUDENT_NAME = localStorage.getItem('hayubori_student_name');
const SAVED_STUDENT_DATA = localStorage.getItem('hayubori_student_data');

// Check existing login
if (SAVED_STUDENT_ID && SAVED_STUDENT_NAME) {
    document.getElementById('studentRegistrationSection').style.display = 'none';
    document.getElementById('studentLoginSection').style.display = 'none';
    document.getElementById('studentProfileSection').style.display = 'block';
    
    if (SAVED_STUDENT_DATA) {
        try {
            const studentData = JSON.parse(SAVED_STUDENT_DATA);
            displayStudentProfile(studentData);
        } catch(e) {
            refreshStudentData(SAVED_STUDENT_ID, SAVED_STUDENT_NAME);
        }
    } else {
        refreshStudentData(SAVED_STUDENT_ID, SAVED_STUDENT_NAME);
    }
}

async function refreshStudentData(studentId, fullName) {
    try {
        const data = await apiCall('/student/login', { method: 'POST', body: JSON.stringify({ studentId, fullName }) });
        localStorage.setItem('hayubori_student_data', JSON.stringify(data.student));
        displayStudentProfile(data.student);
    } catch (err) {
        localStorage.removeItem('hayubori_student_id');
        localStorage.removeItem('hayubori_student_name');
        localStorage.removeItem('hayubori_student_data');
        window.location.href = 'index.html';
    }
}

function showRegistration() {
    document.getElementById('studentRegistrationSection').style.display = 'block';
    document.getElementById('studentLoginSection').style.display = 'none';
    document.getElementById('studentProfileSection').style.display = 'none';
}

function showLogin() {
    document.getElementById('studentRegistrationSection').style.display = 'none';
    document.getElementById('studentLoginSection').style.display = 'block';
    document.getElementById('studentProfileSection').style.display = 'none';
}

// Student Registration Form
document.getElementById('studentRegForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const photoFile = document.getElementById('stuPhoto').files[0];
    let telegramUsername = document.getElementById('stuTelegram').value.trim();
    if (!photoFile) { alert('📸 Please upload your photo!'); return; }
    if (!telegramUsername) { alert('🤖 Please enter your Telegram username!'); return; }
    if (!telegramUsername.startsWith('@')) telegramUsername = '@' + telegramUsername;
    
    const fullName = document.getElementById('stuFullName').value.trim();
    const email = document.getElementById('stuEmail').value.trim();
    if (!fullName || !email) { alert('❌ Full Name and Email are required.'); return; }

    startSecureStudentExam({
        fullName, email,
        phone: document.getElementById('stuPhone').value,
        grade: document.getElementById('stuGrade').value,
        parentName: document.getElementById('stuParentName').value,
        parentPhone: document.getElementById('stuParentPhone').value,
        address: document.getElementById('stuAddress').value
    }, photoFile, telegramUsername);
});

// Student Login
document.getElementById('studentLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('studentLoginId').value;
    const fullName = document.getElementById('studentLoginName').value;
    
    try {
        const data = await apiCall('/student/login', { method: 'POST', body: JSON.stringify({ studentId, fullName }) });
        localStorage.setItem('hayubori_student_id', studentId);
        localStorage.setItem('hayubori_student_name', fullName);
        localStorage.setItem('hayubori_student_data', JSON.stringify(data.student));
        displayStudentProfile(data.student);
    } catch (err) {
        alert('❌ Invalid Student ID or Name.\n\nCheck your Telegram for the correct Student ID.');
    }
});

async function startSecureStudentExam(studentData, photoFile, telegramUsername) {
    const questions = generateStudentExamQuestions(studentData.grade);
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
            ${q.options.map((opt, idx) => `<div class="exam-option ${answers[currentQuestion]===idx?'selected':''}" onclick="selectAnswer(${idx})">${String.fromCharCode(65+idx)}. ${opt}</div>`).join('')}</div>
            <div style="display:flex; gap:15px; margin-top:20px;">
                <button onclick="prevQuestion()" class="${currentQuestion===0?'btn-danger':'btn-success'}">◀ Previous</button>
                <button onclick="nextQuestion()" class="btn-success" style="flex:1;">${currentQuestion===questions.length-1?'Submit Exam':'Next ▶'}</button>
            </div>`;
    }

    window.selectAnswer = (idx) => { answers[currentQuestion] = idx; render(); };
    window.nextQuestion = () => { if(currentQuestion === questions.length-1) submitExam(); else { currentQuestion++; render(); } };
    window.prevQuestion = () => { if(currentQuestion > 0) { currentQuestion--; render(); } };

    function terminateExam() {
        examActive = false;
        document.body.style.overflow = '';
        document.getElementById('examContainer')?.remove();
        alert("❌ Exam terminated due to violations.");
        document.getElementById('studentRegistrationSection').style.display = 'block';
    }

    async function submitExam() {
        clearInterval(timerInterval);
        let correct = 0;
        answers.forEach((ans,i) => { if(ans === questions[i].correct) correct++; });
        const percentage = (correct/questions.length)*100;
        examActive = false;
        document.body.style.overflow = '';
        document.getElementById('examContainer')?.remove();

        if(percentage >= 50) {
            const formData = new FormData();
            formData.append('fullName', studentData.fullName);
            formData.append('email', studentData.email);
            formData.append('telegram', telegramUsername);
            formData.append('phone', studentData.phone);
            formData.append('grade', studentData.grade);
            formData.append('parentName', studentData.parentName);
            formData.append('parentPhone', studentData.parentPhone);
            formData.append('address', studentData.address);
            formData.append('examScore', percentage);
            formData.append('examViolations', examViolations);
            if (photoFile) formData.append('photo', photoFile);

            try {
                const result = await apiCall('/student/register', { method: 'POST', body: formData });
                alert(`🎉 Passed! Score: ${percentage}%\nYour Student ID: ${result.studentId}\n\n📱 Check your Telegram for login details!`);
                document.getElementById('studentRegistrationSection').style.display = 'none';
                document.getElementById('studentLoginSection').style.display = 'block';
            } catch (err) {
                console.error('Registration error:', err);
                alert(`❌ Registration failed: ${err.message}\n\nMake sure you started a chat with the Telegram bot first!`);
                document.getElementById('studentRegistrationSection').style.display = 'block';
            }
        } else {
            alert(`❌ Failed! Score: ${percentage}%. Need 50% to pass.`);
            document.getElementById('studentRegistrationSection').style.display = 'block';
        }
    }

    const timerInterval = setInterval(() => {
        if(!examActive) return clearInterval(timerInterval);
        if(timeLeft <= 0) { clearInterval(timerInterval); submitExam(); }
        else { timeLeft--; const mins = Math.floor(timeLeft/60); const secs = timeLeft%60; document.getElementById('timer') && (document.getElementById('timer').innerText = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`); }
    }, 1000);
    render();
}

function displayStudentProfile(student) {
    document.getElementById('studentRegistrationSection').style.display = 'none';
    document.getElementById('studentLoginSection').style.display = 'none';
    document.getElementById('studentProfileSection').style.display = 'block';
    
    const photoUrl = student.photoUrl ? `${API_BASE_URL.replace('/api','')}${student.photoUrl}` : 'https://via.placeholder.com/150';
    const issueDate = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    
    document.getElementById('studentProfileContent').innerHTML = `
        <div class="form-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2><i class="fas fa-id-card"></i> STUDENT IDENTIFICATION CARD</h2>
                <button onclick="logout()" class="btn-danger"><i class="fas fa-sign-out-alt"></i> Logout</button>
            </div>
        </div>
        
        <div class="id-card" id="student-id-card">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #a8b5ff; font-size: 24px; letter-spacing: 2px;">HAYU BORI ACADEMY</h1>
                <h2 style="color: white; font-size: 16px; font-weight: normal;">STUDENT IDENTIFICATION CARD</h2>
                <div style="background: linear-gradient(90deg, #078930, #fcdd09, #da121a); height: 3px; width: 80px; margin: 10px auto; border-radius: 3px;"></div>
                <p style="color: rgba(255,255,255,0.6); font-size: 12px;">Ethiopia</p>
            </div>
            
            <div style="display: flex; gap: 25px; margin-bottom: 20px;">
                <div><img src="${photoUrl}" onerror="this.src='https://via.placeholder.com/150'" style="width:130px;height:130px;object-fit:cover;border-radius:10px;border:2px solid #a8b5ff;"></div>
                <div style="flex:1;">
                    <div style="margin-bottom:12px;"><p style="color:rgba(255,255,255,0.5);font-size:10px;">Full Name:</p><p style="color:white;font-size:16px;font-weight:600;">${student.fullName.toUpperCase()}</p></div>
                    <div style="margin-bottom:12px;"><p style="color:rgba(255,255,255,0.5);font-size:10px;">Student ID:</p><p style="color:#a8b5ff;font-size:14px;font-weight:600;">${student.studentId}</p></div>
                    <div><p style="color:rgba(255,255,255,0.5);font-size:10px;">Ethiopian ID:</p><p style="color:white;font-size:14px;">${student.ethiopianId || '5085920174375293'}</p></div>
                </div>
            </div>
            
            <div style="display:flex; gap:20px; margin-bottom:15px; padding:10px; background:rgba(255,255,255,0.05); border-radius:10px;">
                <div style="flex:1;"><p style="color:rgba(255,255,255,0.5);font-size:10px;">Grade:</p><p style="color:white;font-size:16px;font-weight:600;">${student.grade}</p></div>
                <div style="flex:1;"><p style="color:rgba(255,255,255,0.5);font-size:10px;">From/To Grade:</p><p style="color:white;font-size:14px;">${student.grade} - ${parseInt(student.grade.match(/\d+/)?.[0] || 12) + 1 || 12}</p></div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:15px;">
                <div><p style="color:rgba(255,255,255,0.5);font-size:10px;">Issued Date:</p><p style="color:white;font-size:14px;">${issueDate}</p></div>
                <div style="text-align:right;"><p style="color:rgba(255,255,255,0.5);font-size:10px;">Authorized Signature:</p><p style="color:white;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.3);min-width:120px;">___________</p></div>
            </div>
            
            <div style="text-align:center; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
                <p style="color:rgba(255,255,255,0.4);font-size:11px;">www.hayuboriacademy.edu.et</p>
            </div>
        </div>
        
        <div style="text-align:center; margin:10px 0;">
            <button onclick="downloadStudentIDCard()" class="btn-success"><i class="fas fa-download"></i> Download ID Card</button>
        </div>
        
        <div class="grid-3">
            <div class="card"><h3>Registration Fee</h3><p>1000 ETB</p><span class="badge ${student.registration_paid?'badge-passed':'badge-pending'}">${student.registration_paid?'Paid':'Unpaid'}</span>${!student.registration_paid?'<br><button onclick="makeStudentPayment(\'registration\',1000)" style="margin-top:15px;padding:10px 20px;">Pay Now</button>':''}</div>
            <div class="card"><h3>Term 1 + Bus</h3><p>3500 ETB</p><span class="badge ${student.term1_paid?'badge-passed':'badge-pending'}">${student.term1_paid?'Paid':'Unpaid'}</span>${!student.term1_paid?'<br><button onclick="makeStudentPayment(\'term1\',3500)" style="margin-top:15px;padding:10px 20px;">Pay Now</button>':''}</div>
            <div class="card"><h3>Term 2 + Bus</h3><p>3500 ETB</p><span class="badge ${student.term2_paid?'badge-passed':'badge-pending'}">${student.term2_paid?'Paid':'Unpaid'}</span>${!student.term2_paid?'<br><button onclick="makeStudentPayment(\'term2\',3500)" style="margin-top:15px;padding:10px 20px;">Pay Now</button>':''}</div>
        </div>
    `;
}

window.makeStudentPayment = async (type, amount) => {
    const studentId = localStorage.getItem('hayubori_student_id');
    if (!studentId) { alert('Please login again'); logout(); return; }
    try {
        await apiCall(`/student/${studentId}/payment`, { method: 'POST', body: JSON.stringify({ type, amount }) });
        alert(`✅ Paid ${amount} ETB successfully!`);
        refreshStudentData(studentId, localStorage.getItem('hayubori_student_name'));
    } catch (err) {
        alert('Payment failed: ' + err.message);
    }
};

window.downloadStudentIDCard = () => {
    const card = document.getElementById('student-id-card');
    if(card) html2canvas(card,{scale:2}).then(canvas=>{const a=document.createElement('a'); a.download='HayuBori_Student_ID.png'; a.href=canvas.toDataURL(); a.click();});
};
