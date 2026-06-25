// ==================== BOARD DASHBOARD ====================

// Video Call Variables
let localStream = null;
let peerConnection = null;
let isMuted = false;
let callActive = false;

// ==================== BOARD LOGIN ====================
document.getElementById('boardLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const photoFile = document.getElementById('boardPhoto').files[0];
    if (!photoFile) { alert('📸 Upload photo!'); return; }
    
    try {
        const result = await apiCall('/board/login', {
            method: 'POST',
            body: JSON.stringify({
                email: document.getElementById('boardEmail').value,
                password: document.getElementById('boardPassword').value
            })
        });
        
        if (result.success) {
            document.getElementById('boardLoginSection').style.display = 'none';
            document.getElementById('boardDashboardSection').style.display = 'block';
            loadBoardData();
        }
    } catch (error) {
        alert('❌ Invalid credentials. Default: board@hayubori.edu / board123');
    }
});

// ==================== LOAD BOARD DATA ====================
async function loadBoardData() {
    try {
        const stats = await apiCall('/board/stats');
        
        document.getElementById('totalStudents').textContent = stats.totalStudents;
        document.getElementById('totalTeachers').textContent = stats.totalTeachers;
        document.getElementById('pendingTeachers').textContent = stats.pendingTeachers;
        document.getElementById('totalRevenue').textContent = stats.totalRevenue + ' ETB';
        
        renderDirectors();
        renderPendingTeachers(stats.pendingTeachersList);
    } catch (error) {
        console.error('Error loading board data:', error);
    }
}

// ==================== DIRECTORS ====================
async function renderDirectors() {
    const container = document.getElementById('directorsList');
    
    const directorTypes = [
        { type: 'kg', name: 'KG Director', icon: '👶', grades: 'Nursery - Upper KG' },
        { type: 'elementary', name: 'Elementary Director', icon: '📚', grades: 'Grade 1-4' },
        { type: 'middle', name: 'Middle School Director', icon: '🏫', grades: 'Grade 5-8' }
    ];
    
    let html = '';
    for (const d of directorTypes) {
        try {
            const stats = await apiCall(`/director/${d.type}/stats`);
            html += `
                <div class="director-card" onclick="showUnderDirector('${d.type}', '${d.name}')">
                    <div class="icon">${d.icon}</div>
                    <h3>${d.name}</h3>
                    <p>${d.grades}</p>
                    <div class="count">👨‍🎓 ${stats.students.length} Students</div>
                    <div class="count">👨‍🏫 ${stats.teachers.length} Teachers</div>
                    <div class="count" style="background:rgba(255,215,0,0.2); color:#ffd93d;">💰 ${stats.revenue} ETB</div>
                </div>
            `;
        } catch (e) {
            console.error('Error loading director:', d.type, e);
        }
    }
    container.innerHTML = html || '<p style="color:rgba(255,255,255,0.6);">No directors found.</p>';
}

// ==================== SHOW UNDER DIRECTOR ====================
async function showUnderDirector(type, name) {
    try {
        const stats = await apiCall(`/director/${type}/stats`);
        
        document.getElementById('underDirectorView').classList.add('active');
        document.getElementById('directorsList').style.display = 'none';
        
        document.getElementById('underDirectorContent').innerHTML = `
            <div class="form-card">
                <h2><i class="fas fa-user-tie"></i> ${name}</h2>
                <p style="color:rgba(255,255,255,0.6);">Students: ${stats.students.length} | Teachers: ${stats.teachers.length} | Revenue: ${stats.revenue} ETB</p>
            </div>
            <div class="sub-grid">
                <div class="sub-card">
                    <h4><i class="fas fa-users"></i> Students (${stats.students.length})</h4>
                    <ul>
                        ${stats.students.length > 0 ? stats.students.map(s => `
                            <li>
                                <span>${s.fullName}</span>
                                <span class="badge-small">${s.grade}</span>
                            </li>
                        `).join('') : '<li style="color:rgba(255,255,255,0.4);">No students</li>'}
                    </ul>
                </div>
                <div class="sub-card">
                    <h4><i class="fas fa-chalkboard-user"></i> Teachers (${stats.teachers.length})</h4>
                    <ul>
                        ${stats.teachers.length > 0 ? stats.teachers.map(t => `
                            <li>
                                <span>${t.fullName}</span>
                                <span class="badge-small">${t.gradeLevel}</span>
                            </li>
                        `).join('') : '<li style="color:rgba(255,255,255,0.4);">No teachers</li>'}
                    </ul>
                </div>
            </div>
        `;
    } catch (error) {
        alert('Error loading director data: ' + error.message);
    }
}

function hideUnderDirector() {
    document.getElementById('underDirectorView').classList.remove('active');
    document.getElementById('directorsList').style.display = 'grid';
}

// ==================== PENDING TEACHERS ====================
function renderPendingTeachers(teachers) {
    const container = document.getElementById('pendingTeachersList');
    if (!teachers || teachers.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.6);">✅ No pending applications</p>';
        return;
    }
    container.innerHTML = teachers.map(t => `
        <div style="background:rgba(255,255,255,0.05); border-radius:15px; padding:20px; margin-bottom:15px; border-left: 3px solid #fa709a;">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                <div>
                    <strong style="color:white;">${t.fullName}</strong>
                    <span style="color:rgba(255,255,255,0.6); font-size:12px;"> | ${t.email}</span>
                </div>
                <span style="color:#fa709a; font-weight:600;">${t.gradeLevel}</span>
            </div>
            <div style="display:flex; gap:10px; margin-top:15px; flex-wrap:wrap;">
                <button onclick="approveTeacher('${t._id}')" class="btn-success" style="padding:8px 20px; font-size:13px;">✅ Approve</button>
                <button onclick="rejectTeacher('${t._id}')" class="btn-danger" style="padding:8px 20px; font-size:13px;">❌ Reject</button>
            </div>
        </div>
    `).join('');
}

// ==================== APPROVE/REJECT TEACHER ====================
window.approveTeacher = async (id) => {
    try {
        await apiCall(`/teacher/${id}/approve`, { method: 'POST' });
        alert('✅ Teacher approved!');
        loadBoardData();
    } catch (error) {
        alert('Failed to approve: ' + error.message);
    }
};

window.rejectTeacher = async (id) => {
    if (confirm('Reject this teacher?')) {
        try {
            await apiCall(`/teacher/${id}/reject`, { method: 'POST' });
            alert('❌ Teacher rejected.');
            loadBoardData();
        } catch (error) {
            alert('Failed to reject: ' + error.message);
        }
    }
};

// ==================== VIDEO CALL FUNCTIONS ====================

// Get local media stream
async function getLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        document.getElementById('localVideo').srcObject = localStream;
        document.getElementById('callStatus').textContent = '📹 Camera ready';
        document.getElementById('callStatus').className = 'call-status';
        return true;
    } catch (error) {
        console.error('Camera error:', error);
        document.getElementById('callStatus').textContent = '❌ Camera access denied';
        document.getElementById('callStatus').className = 'call-status inactive';
        return false;
    }
}

// Start Call
async function startCall() {
    if (callActive) {
        alert('Call already active!');
        return;
    }
    
    const hasCamera = await getLocalStream();
    if (!hasCamera) return;
    
    document.getElementById('callStatus').textContent = '📞 Connecting...';
    document.getElementById('callStatus').className = 'call-status';
    
    // For demo, simulate remote video
    setTimeout(() => {
        // Simulate remote participant
        const remoteVideo = document.getElementById('remoteVideo');
        // Use a sample video or create a simulated stream
        // For demo, we'll use a canvas stream
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1a1a3e';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#a8b5ff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤 Participant', 320, 240);
        ctx.font = '18px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Live Video Call', 320, 300);
        
        const stream = canvas.captureStream(30);
        remoteVideo.srcObject = stream;
        
        callActive = true;
        document.getElementById('callStatus').textContent = '📞 Call Active - Live';
        document.getElementById('callStatus').className = 'call-status active';
    }, 2000);
}

// Toggle Mute
function toggleMute() {
    if (!localStream) return;
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
    });
    document.querySelector('.btn-mute').innerHTML = isMuted ? 
        '<i class="fas fa-microphone-slash"></i> Unmute' : 
        '<i class="fas fa-microphone"></i> Mute';
}

// End Call
function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    document.getElementById('localVideo').srcObject = null;
    document.getElementById('remoteVideo').srcObject = null;
    callActive = false;
    isMuted = false;
    document.getElementById('callStatus').textContent = '📞 Call ended';
    document.getElementById('callStatus').className = 'call-status inactive';
    document.querySelector('.btn-mute').innerHTML = '<i class="fas fa-microphone"></i> Mute';
}

// Make functions global
window.startCall = startCall;
window.toggleMute = toggleMute;
window.endCall = endCall;
window.showUnderDirector = showUnderDirector;
window.hideUnderDirector = hideUnderDirector;

// ==================== AUTO-LOAD ON PAGE LOAD ====================
// Check if already logged in
const boardEmail = localStorage.getItem('hayubori_board_email');
if (boardEmail) {
    document.getElementById('boardLoginSection').style.display = 'none';
    document.getElementById('boardDashboardSection').style.display = 'block';
    loadBoardData();
}
