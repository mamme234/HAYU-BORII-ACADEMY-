// ==================== CONFIGURATION ====================
const API_BASE_URL = 'https://hayu-borii-academy.onrender.com/api';
let examActive = false, examViolations = 0;

// ==================== API CALL ====================
async function apiCall(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json', ...options.headers }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
}

// ==================== SERVER STATUS ====================
async function checkServerConnection() {
    const statusDiv = document.getElementById('serverStatus');
    if (!statusDiv) return;
    try {
        await apiCall('/health');
        statusDiv.innerHTML = '✅ Server Connected';
        statusDiv.className = 'server-status online';
    } catch (error) {
        statusDiv.innerHTML = '⚠️ Server Offline';
        statusDiv.className = 'server-status offline';
    }
}
checkServerConnection();

// ==================== MODAL HELPERS ====================
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ==================== STUDENT EXAM QUESTIONS ====================
function generateStudentExamQuestions(grade) {
    if (grade.includes("KG") || grade === "Nursery") {
        return [
            { text: "What color is the sun?", options: ["Red","Yellow","Blue","Green"], correct:1 },
            { text: "Which animal says 'Moo'?", options: ["Cat","Dog","Cow","Lion"], correct:2 },
            { text: "What is 1 + 1?", options: ["1","2","3","4"], correct:1 },
            { text: "First letter of alphabet?", options: ["B","C","A","D"], correct:2 },
            { text: "Shape with 3 sides?", options: ["Square","Circle","Triangle","Rectangle"], correct:2 }
        ];
    } else if (parseInt(grade.match(/\d+/)?.[0] || 5) <= 4) {
        return [
            { text: "15 + 27 = ?", options: ["42","40","38","45"], correct:0 },
            { text: "የኢትዮጵያ ዋና ከተማ?", options: ["ጎንደር","አዲስ አበባ","ሀዋሳ","ባህርዳር"], correct:1 },
            { text: "8 × 7 = ?", options: ["48","56","64","49"], correct:1 },
            { text: "Red Planet?", options: ["Jupiter","Mars","Venus","Saturn"], correct:1 },
            { text: "Capital of Ethiopia?", options: ["Adama","Addis Ababa","Harar","Dire Dawa"], correct:1 }
        ];
    } else {
        return [
            { text: "3x - 7 = 11, x = ?", options: ["4","5","6","7"], correct:2 },
            { text: "√144 = ?", options: ["10","11","12","13"], correct:2 },
            { text: "Chemical symbol for Gold?", options: ["Go","Gd","Au","Ag"], correct:2 },
            { text: "Oxygen atomic number?", options: ["6","7","8","9"], correct:2 },
            { text: "Who wrote Ethiopian national anthem?", options: ["Tsegaye","Haddis","Baalu","Afewerk"], correct:0 }
        ];
    }
}

// ==================== TEACHER EXAM QUESTIONS ====================
function generateTeacherExamQuestions() {
    return [
        { text: "What is your teaching philosophy?", options: ["Student-centered","Teacher-centered","Both","None"], correct:0 },
        { text: "How do you handle classroom discipline?", options: ["Strict rules","Positive reinforcement","Ignore minor issues","Send to principal"], correct:1 },
        { text: "What is the best way to assess student learning?", options: ["Final exam only","Continuous assessment","Homework only","Class participation only"], correct:1 },
        { text: "How do you engage struggling students?", options: ["Extra homework","One-on-one support","Ignore them","Move them to back"], correct:1 },
        { text: "What is your approach to parent communication?", options: ["Only when issues arise","Regular updates","Never","Only at parent-teacher conferences"], correct:1 }
    ];
}

// ==================== LOGOUT ====================
function logout() {
    localStorage.removeItem('hayubori_student_id');
    localStorage.removeItem('hayubori_student_name');
    localStorage.removeItem('hayubori_student_data');
    window.location.href = 'index.html';
}

// ==================== CHECK EXISTING LOGIN ====================
function checkExistingLogin() {
    const studentId = localStorage.getItem('hayubori_student_id');
    const studentName = localStorage.getItem('hayubori_student_name');
    if (studentId && studentName) {
        return true;
    }
    return false;
}

// ==================== PROTECT PAGE ====================
function protectPage() {
    if (!checkExistingLogin()) {
        window.location.href = 'index.html';
    }
}

// ==================== FEEDBACK ====================
let selectedRating = 0;
document.querySelectorAll('#starRating .star')?.forEach(star => {
    star.addEventListener('click', function() {
        selectedRating = parseInt(this.getAttribute('data-value'));
        document.querySelectorAll('#starRating .star').forEach(s => s.classList.remove('active'));
        for(let i=0; i<selectedRating; i++) document.querySelectorAll('#starRating .star')[i].classList.add('active');
        document.getElementById('feedbackRating').value = selectedRating;
    });
});

document.getElementById('feedbackForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rating = document.getElementById('feedbackRating').value;
    const text = document.getElementById('feedbackText').value;
    if (!rating || rating == 0) { alert('⭐ Please rate us!'); return; }
    if (!text.trim()) { alert('💬 Please write your feedback!'); return; }
    try {
        await apiCall('/feedback', { method: 'POST', body: JSON.stringify({ rating, message: text, name: 'Anonymous' }) });
        document.getElementById('feedbackThanks').style.display = 'block';
        document.getElementById('feedbackForm').reset();
        document.querySelectorAll('#starRating .star').forEach(s => s.classList.remove('active'));
        document.getElementById('feedbackRating').value = '0';
        selectedRating = 0;
        setTimeout(() => { document.getElementById('feedbackThanks').style.display = 'none'; closeModal('feedbackModal'); }, 2000);
    } catch (err) { alert('Failed: ' + err.message); }
});

// ==================== EXPOSE TO WINDOW ====================
window.openModal = openModal;
window.closeModal = closeModal;
window.logout = logout;
window.apiCall = apiCall;
window.generateStudentExamQuestions = generateStudentExamQuestions;
window.generateTeacherExamQuestions = generateTeacherExamQuestions;
window.protectPage = protectPage;
window.checkExistingLogin = checkExistingLogin;
