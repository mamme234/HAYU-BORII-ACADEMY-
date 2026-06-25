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

// ==================== OPEN TELEGRAM BOT ====================
function openTelegramBot() {
    window.open('https://t.me/Hayubori_academyBot', '_blank');
    const studentId = localStorage.getItem('hayubori_student_id');
    const studentName = localStorage.getItem('hayubori_student_name');
    if (studentId && studentName) {
        alert(`📱 Opening Telegram bot @Hayubori_academyBot\n\n👤 Name: ${studentName}\n🆔 Your Student ID: ${studentId}\n\n💬 Click the bot to receive your ID via Telegram!\n\n⚠️ Make sure you have started a chat with @Hayubori_academyBot first!`);
    } else {
        alert('📱 Opening Telegram bot @Hayubori_academyBot\n\nPlease login first to get your Student ID.');
    }
}

// ==================== SHOW TAKE MY ID BUTTON AFTER PASSING EXAM ====================
function showTakeMyIdButton(studentId, fullName) {
    localStorage.setItem('hayubori_student_id', studentId);
    localStorage.setItem('hayubori_student_name', fullName);
    
    const examContainer = document.getElementById('examContainer');
    if (examContainer) {
        examContainer.innerHTML = `
            <div style="text-align:center; padding:50px; background:rgba(255,255,255,0.05); border-radius:30px; margin-top:50px; max-width:600px; margin-left:auto; margin-right:auto;">
                <div style="font-size:70px; margin-bottom:20px;">🎉</div>
                <h2 style="color:white; margin-bottom:20px;">Congratulations! You Passed the Exam!</h2>
                <p style="color:rgba(255,255,255,0.8); font-size:18px; margin-bottom:10px;">Your Student ID: <strong style="color:#a8b5ff; font-size:24px;">${studentId}</strong></p>
                <p style="color:rgba(255,255,255,0.6); margin-bottom:30px;">Click the button below to get your ID on Telegram</p>
                <button onclick="openTelegramBot()" class="btn-success" style="padding:15px 40px; font-size:18px; background:linear-gradient(135deg,#0088cc,#2a9fd6); color:white; border:none; border-radius:50px; cursor:pointer;">
                    <i class="fab fa-telegram"></i> Take My ID
                </button>
                <br><br>
                <button onclick="window.location.href='student.html'" class="btn-warning" style="padding:12px 30px; font-size:14px; border:none; border-radius:50px; cursor:pointer;">
                    Go to Dashboard →
                </button>
            </div>
        `;
    }
}

// ==================== STUDENT EXAM QUESTIONS ====================
function generateStudentExamQuestions(grade) {
    // Nursery
    if (grade === "Nursery") {
        return [
            { text: "What color is the sky?", options: ["Red", "Blue", "Green", "Yellow"], correct: 1 },
            { text: "Qubee meeqa harka tokko irra jira?", options: ["3", "4", "5", "6"], correct: 2 },
            { text: "Bineensi 'Moo' jedhu eenyu?", options: ["Adurree", "Saree", "Sa'a", "Leenca"], correct: 2 },
            { text: "ቀለም ሰማያዊ ምን ይባላል?", options: ["ቀይ", "ሰማያዊ", "አረንጓዴ", "ቢጫ"], correct: 1 },
            { text: "Saree miila meeqa qaba?", options: ["2", "3", "4", "5"], correct: 2 },
            { text: "Which is a fruit?", options: ["Carrot", "Onion", "Apple", "Potato"], correct: 2 },
            { text: "Simbiroon eessa jiraata?", options: ["Bishaan", "Mandhee", "Holqa", "Dachee"], correct: 1 },
            { text: "Biyyi keenya maal jedhama?", options: ["Kenya", "Itoophiyaa", "Sudan", "Egypt"], correct: 1 },
            { text: "Fakkoon kubbaa maal fakkaata?", options: ["Iskuweer", "Saddeetto", "Goorroo", "Reektangilii"], correct: 2 },
            { text: "ውሻ በእንግሊዝኛ ምን ይባላል?", options: ["Cat", "Dog", "Cow", "Lion"], correct: 1 }
        ];
    }
    // Lower KG
    if (grade === "Lower KG") {
        return [
            { text: "What letter does 'Ball' start with?", options: ["A", "B", "C", "D"], correct: 1 },
            { text: "Lakkoofsa: 1, 2, ___, 4. Maal hafa?", options: ["5", "6", "3", "7"], correct: 2 },
            { text: "Bineensi aannan nuu kennu eenyu?", options: ["Qeerransa", "Sa'a", "Leenca", "Yeeyyii"], correct: 1 },
            { text: "'በረድ' ተቃራኒ ምንድነው?", options: ["ሞቃት", "ቀዝቃዛ", "እሳት", "ፀሐያማ"], correct: 0 },
            { text: "Makiinaa golfaa meeqa qaba?", options: ["2", "3", "4", "5"], correct: 2 },
            { text: "What is the opposite of 'hot'?", options: ["Warm", "Cold", "Fire", "Sunny"], correct: 1 },
            { text: "Maal barbaadda?", options: ["Bishaan", "Qilleensa", "Biyyoo", "Ibidda"], correct: 1 },
            { text: "Guyyaa Wiixata booda maal?", options: ["Dilbata", "Kibxata", "Roobii", "Jimaata"], correct: 1 },
            { text: "Torban keessa guyyoota meeqa?", options: ["5", "6", "7", "8"], correct: 2 },
            { text: "'ቡና' በእንግሊዝኛ ምን ይባላል?", options: ["Tea", "Coffee", "Milk", "Juice"], correct: 1 }
        ];
    }
    // Upper KG
    if (grade === "Upper KG") {
        return [
            { text: "2 + 3 meeqa?", options: ["4", "5", "6", "7"], correct: 1 },
            { text: "Which word rhymes with 'sun'?", options: ["Run", "Sit", "Map", "Log"], correct: 0 },
            { text: "Bokkaan ba'u yeroo kami?", options: ["Bara bona", "Bara bokkaa", "Bara birraa", "Bara arfaasaa"], correct: 1 },
            { text: "'ታች' ተቃራኒ ምንድነው?", options: ["ላይ", "ታች", "ከፍ", "ጫፍ"], correct: 0 },
            { text: "5 – 2 meeqa?", options: ["2", "3", "4", "5"], correct: 1 },
            { text: "What do we call a baby dog?", options: ["Kitten", "Puppy", "Calf", "Chick"], correct: 1 },
            { text: "Ilmi saree maal jedhama?", options: ["Adurree", "Xiyyaree", "Jabbii", "Lammii"], correct: 1 },
            { text: "Biiftuun eessa baati?", options: ["Lixa", "Kibba", "Kaaba", "Bahaa"], correct: 3 },
            { text: "Harka tokko irra qubee meeqa?", options: ["3", "4", "5", "6"], correct: 2 },
            { text: "'ጥቁር' በእንግሊዝኛ ምን ይባላል?", options: ["Red", "White", "Black", "Blue"], correct: 2 }
        ];
    }
    // Grade 1
    if (grade === "Grade 1") {
        return [
            { text: "4 + 5 meeqa?", options: ["7", "8", "9", "10"], correct: 2 },
            { text: "Which word rhymes with 'hat'?", options: ["Cat", "Dog", "Sun", "Log"], correct: 0 },
            { text: "Caarrii miila meeqa qaba?", options: ["4", "6", "8", "10"], correct: 2 },
            { text: "'ትልቅ' ተቃራኒ ምንድነው?", options: ["ትንሽ", "ረጅም", "ከባድ", "ሰፊ"], correct: 0 },
            { text: "8 – 3 meeqa?", options: ["4", "5", "6", "7"], correct: 1 },
            { text: "Plural of 'dog' is:", options: ["Doges", "Dogs", "Dog", "Dogies"], correct: 1 },
            { text: "Maal fayyadamnee argina?", options: ["Gurra", "Ija", "Funyaan", "Afaan"], correct: 1 },
            { text: "Biyyi keenya maal jedhama?", options: ["Kenya", "Venees", "Dachee", "Juupitarii"], correct: 2 },
            { text: "Balkoon maal fakkaata?", options: ["Goorroo", "Iskuweer", "Saddeetto", "Reektangilii"], correct: 3 },
            { text: "'ውሃ' በእንግሊዝኛ ምን ይባላል?", options: ["Fire", "Water", "Soil", "Air"], correct: 1 }
        ];
    }
    // Grade 2
    if (grade === "Grade 2") {
        return [
            { text: "6 × 3 meeqa?", options: ["15", "16", "17", "18"], correct: 3 },
            { text: "Past tense of 'eat' is:", options: ["Eated", "Ate", "Eaten", "Eating"], correct: 1 },
            { text: "Bineensi hanqaaquu baasu eenyu?", options: ["Saree", "Adurree", "Luka", "Sa'a"], correct: 2 },
            { text: "'ቀዝቃዛ' ተቃራኒ ምንድነው?", options: ["ሞቃት", "ፀሐያማ", "በረድ", "ቀዝቃዛ"], correct: 0 },
            { text: "100 – 45 meeqa?", options: ["45", "50", "55", "65"], correct: 2 },
            { text: "Opposite of 'cold' is:", options: ["Cool", "Warm", "Hot", "Freezing"], correct: 2 },
            { text: "Maal fayyadamnee yaanna?", options: ["Onnee", "Sammuu", "Somba", "Garu"], correct: 1 },
            { text: "Kaarantii xiqqaa eenyu?", options: ["Afrikaa", "Eeshiyaa", "Awustiraaliyaa", "Yuurooppi"], correct: 2 },
            { text: "Sa'aatii tokko keessa daqiiqaa meeqa?", options: ["30", "45", "50", "60"], correct: 3 },
            { text: "'ቤት' በእንግሊዝኛ ምን ይባላል?", options: ["Water", "House", "Tree", "Road"], correct: 1 }
        ];
    }
    // Grade 3
    if (grade === "Grade 3") {
        return [
            { text: "7 × 8 meeqa?", options: ["48", "54", "56", "64"], correct: 2 },
            { text: "Plural of 'fox' is:", options: ["Foxs", "Foxes", "Foxies", "Foxen"], correct: 1 },
            { text: "Bishaan yeroo ho'u hundee isaa maal?", options: ["50°C", "75°C", "100°C", "120°C"], correct: 2 },
            { text: "'ከባድ' ተቃራኒ ምንድነው?", options: ["ቀላል", "ትልቅ", "ትንሽ", "ጠባብ"], correct: 0 },
            { text: "3/4 decimaliin maal ta'a?", options: ["0.25", "0.50", "0.75", "1.00"], correct: 2 },
            { text: "Past tense of 'write' is:", options: ["Wrote", "Written", "Writed", "Writing"], correct: 0 },
            { text: "Biqiltuun gaasii maal fudhatti?", options: ["Oksijiinii", "Naayitiroojiinii", "Kaarboonii daayi'oksaayidii", "Haayidiroojiinii"], correct: 2 },
            { text: "Magaalaan guddoon Itoophiyaa maal?", options: ["Adaamaa", "Bahir Dar", "Finfinnee", "Dirre Dhawaa"], correct: 2 },
            { text: "Heksaagoni qarqara meeqa qaba?", options: ["4", "5", "6", "7"], correct: 2 },
            { text: "'ጥቁር' ተቃራኒ ምንድነው?", options: ["ቀይ", "ነጭ", "ጥቁር", "ሰማያዊ"], correct: 1 }
        ];
    }
    // Grade 4
    if (grade === "Grade 4") {
        return [
            { text: "144 ÷ 12 meeqa?", options: ["10", "11", "12", "13"], correct: 2 },
            { text: "Past participle of 'eat' is:", options: ["Ate", "Eated", "Eaten", "Eating"], correct: 2 },
            { text: "Lafti jireenya nuuf kennu maal jedhama?", options: ["Qaama", "Cirracha", "Cuffi", "Gubba"], correct: 2 },
            { text: "'ትንሽ' ተቃራኒ ምንድነው?", options: ["ትልቅ", "ረጅም", "ከባድ", "ሰፊ"], correct: 0 },
            { text: "4 fi 6 LCM meeqa?", options: ["8", "10", "12", "24"], correct: 2 },
            { text: "Which is a verb?", options: ["House", "Run", "Book", "Chair"], correct: 1 },
            { text: "Lafoo lafti kan hafe maal jedhama?", options: ["Mantilii", "Oboo", "Cuffi", "Cirracha"], correct: 0 },
            { text: "Maallaqa Itoophiyaa maal?", options: ["Dollar", "Euro", "Birrii", "Poonndii"], correct: 2 },
            { text: "15% of 200 meeqa?", options: ["15", "20", "25", "30"], correct: 3 },
            { text: "'ውሃ' በአማርኛ ምን ይባላል?", options: ["ውሃ", "እሳት", "አየር", "መሬት"], correct: 0 }
        ];
    }
    // Grade 5
    if (grade === "Grade 5") {
        return [
            { text: "9 × 9 meeqa?", options: ["72", "81", "90", "99"], correct: 1 },
            { text: "Which is a verb?", options: ["An action word", "A naming word", "A describing word", "A joining word"], correct: 0 },
            { text: "Namni gaasii maal afuura baasa?", options: ["Oksijiinii", "Naayitiroojiinii", "Kaarboonii daayi'oksaayidii", "Haayidiroojiinii"], correct: 2 },
            { text: "'አዲስ' ተቃራኒ ምንድነው?", options: ["ጥንታዊ", "ልዩ", "ዘመናዊ", "ያረጀ"], correct: 3 },
            { text: "Iskuweerii rog isaa 5 cm ta'e bal'inni isaa meeqa?", options: ["20 cm²", "25 cm²", "30 cm²", "35 cm²"], correct: 1 },
            { text: "Which is a simile?", options: ["He is fast", "He runs like a cheetah", "He runs fast", "He is running"], correct: 1 },
            { text: "Biqiltuun maal keessatti soorata tolcha?", options: ["Hidda", "Foliin", "Daraaraa", "Fudura"], correct: 1 },
            { text: "Galaana baha Afrikaa maal?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: 2 },
            { text: "Lakkoofsa waliif qoodama 1 fi ofi qofa eenyu?", options: ["4", "6", "7", "9"], correct: 2 },
            { text: "'በረድ' ምንድነው?", options: ["Cold", "Ice", "Snow", "Cool"], correct: 1 }
        ];
    }
    // Grade 6
    if (grade === "Grade 6") {
        return [
            { text: "2/3 + 1/6 meeqa?", options: ["1/2", "5/6", "3/4", "7/6"], correct: 1 },
            { text: "Past tense of 'write' is:", options: ["Wrote", "Written", "Writed", "Writing"], correct: 0 },
            { text: "Galaana lafti isa guddaa eenyu?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: 1 },
            { text: "'ጠዋት' ተቃራኒ ምንድነው?", options: ["ሌሊት", "ማታ", "ቀን", "ምሽት"], correct: 1 },
            { text: "18 fi 24 GCF meeqa?", options: ["4", "6", "8", "12"], correct: 1 },
            { text: "Which is a conjunction?", options: ["Because", "Run", "Happy", "Book"], correct: 0 },
            { text: "Onneen hojiin isaa maal?", options: ["Yaasuu", "Dhiiga raasuu", "Sooruu", "Afuura baasuu"], correct: 1 },
            { text: "Haroo guddoo Itoophiyaa maal?", options: ["Abayaa", "Tanaa", "Ziway", "Langano"], correct: 1 },
            { text: "10% of 250 meeqa?", options: ["15", "20", "25", "30"], correct: 2 },
            { text: "'ፀሐይ' በእንግሊዝኛ ምን ይባላል?", options: ["Moon", "Sun", "Star", "Cloud"], correct: 1 }
        ];
    }
    // Grade 7
    if (grade === "Grade 7") {
        return [
            { text: "2x + 5 = 17, x meeqa?", options: ["4", "5", "6", "7"], correct: 2 },
            { text: "Which is a simile?", options: ["He is brave", "He is as brave as a lion", "He is bravery", "He bravely ran"], correct: 1 },
            { text: "Soogiddaa keemikaalaa maal?", options: ["H₂O", "CO₂", "NaCl", "HCl"], correct: 2 },
            { text: "'ራብ' ምን ማለት ነው?", options: ["Thirst", "Hunger", "Sleep", "Fear"], correct: 1 },
            { text: "10, 20, 30 mean meeqa?", options: ["15", "20", "25", "30"], correct: 1 },
            { text: "Past perfect of 'go' is:", options: ["Went", "Gone", "Had gone", "Going"], correct: 2 },
            { text: "Oksijiinii atoomii lakkoofsi isaa meeqa?", options: ["6", "7", "8", "9"], correct: 2 },
            { text: "Gammoojjii guddaa lafaa maal?", options: ["Gobi", "Kalahari", "Sahara", "Arabian"], correct: 2 },
            { text: "Pythagoras theorem maal?", options: ["a+b=c", "a²+b²=c²", "a²-b²=c²", "a×b=c"], correct: 1 },
            { text: "'ፍቅር' በእንግሊዝኛ ምን ይባላል?", options: ["Love", "Hate", "Joy", "Peace"], correct: 0 }
        ];
    }
    // Grade 8
    if (grade === "Grade 8") {
        return [
            { text: "5x – 3 = 2x + 12, x meeqa?", options: ["3", "4", "5", "6"], correct: 2 },
            { text: "Passive of 'The cat ate the fish' is:", options: ["The fish ate the cat", "The fish was eaten by the cat", "The cat was eaten", "None"], correct: 1 },
            { text: "Chlorophyll hojiin isaa maal?", options: ["Bishaan fudhachuu", "Ifa aduu qabachuu", "Hidda guddisuu", "Sanyii oomishuu"], correct: 1 },
            { text: "'ህገ መንግስት' በእንግሊዝኛ ምን ይባላል?", options: ["Law", "Constitution", "Policy", "Rule"], correct: 1 },
            { text: "Cube rog isaa 4 cm ta'e volyuumii meeqa?", options: ["16 cm³", "48 cm³", "64 cm³", "96 cm³"], correct: 2 },
            { text: "Lafa socho'uuf sababa maal?", options: ["Bubbee", "Bokkaa", "Lafa socho'u (Tectonic plates)", "Garaacha qofa"], correct: 2 },
            { text: "Laga guddoo Afrikaa maal?", options: ["Kongoo", "Naayilii", "Zambezi", "Niijer"], correct: 1 },
            { text: "Simple interest 1000 Birr 5% irratti waggaa 2:", options: ["50", "75", "100", "150"], correct: 2 },
            { text: "Which is a conjunction?", options: ["Although", "Run", "Happy", "Book"], correct: 0 },
            { text: "'ገነት' በእንግሊዝኛ ምን ይባላል?", options: ["Heaven", "Hell", "Earth", "Sky"], correct: 0 }
        ];
    }
}

// ==================== START EXAM ====================
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

    const examHTML = `
        <div id="examContainer" class="exam-container">
            <div class="exam-timer">⏱️ Time: <span id="timer">05:00</span></div>
            <div id="examContent"></div>
            <div style="text-align:center; padding:15px; color: rgba(255,255,255,0.5); font-size:14px;">
                ⚠️ DO NOT leave this page! 3 violations = termination
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', examHTML);
    try { await document.documentElement.requestFullscreen(); } catch(e) {}

    function render() {
        const q = questions[currentQuestion];
        document.getElementById('examContent').innerHTML = `
            <div class="exam-question" style="color: white;">
                <h3 style="color: #a8b5ff;">Question ${currentQuestion+1}/${questions.length}</h3>
                <p style="font-size:20px; margin:20px 0; color: white;">${q.text}</p>
                ${q.options.map((opt, idx) => `
                    <div class="exam-option ${answers[currentQuestion]===idx?'selected':''}" 
                         onclick="selectAnswer(${idx})" 
                         style="display:block; width:100%; padding:18px 25px; margin:12px 0; 
                                background: ${answers[currentQuestion]===idx ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.05)'}; 
                                border: ${answers[currentQuestion]===idx ? '2px solid #a8b5ff' : '2px solid rgba(255,255,255,0.15)'}; 
                                border-radius: 60px; cursor: pointer; text-align: left; 
                                font-size: 16px; color: white; transition: all 0.3s ease;">
                        ${String.fromCharCode(65+idx)}. ${opt}
                    </div>
                `).join('')}
                <div style="display:flex; gap:15px; margin-top:25px;">
                    <button onclick="prevQuestion()" class="${currentQuestion===0?'btn-danger':'btn-success'}" 
                            style="padding:12px 30px; border-radius:50px; border:none; font-weight:700; cursor:pointer;">
                        ◀ Previous
                    </button>
                    <button onclick="nextQuestion()" class="btn-success" 
                            style="padding:12px 30px; border-radius:50px; border:none; font-weight:700; cursor:pointer; flex:1;">
                        ${currentQuestion===questions.length-1 ? 'Submit Exam' : 'Next ▶'}
                    </button>
                </div>
            </div>
        `;
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
                
                // SHOW "TAKE MY ID" BUTTON AFTER PASSING EXAM
                showTakeMyIdButton(result.studentId, studentData.fullName);
                
                document.getElementById('studentRegistrationSection').style.display = 'none';
                document.getElementById('studentLoginSection').style.display = 'block';
            } catch (err) {
                console.error('Registration error:', err);
                alert(`❌ Registration failed: ${err.message}\n\nMake sure you started a chat with @Hayubori_academyBot first!`);
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

// Student Registration Form
document.getElementById('studentRegForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const photoFile = document.getElementById('stuPhoto').files[0];
    let telegramUsername = document.getElementById('stuTelegram').value.trim();
    if (!photoFile) { alert('📸 Please upload your photo!'); return; }
    if (!telegramUsername) { alert('🤖 Please enter your Telegram username (e.g., @username)'); return; }
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

// ==================== PAYMENT FUNCTIONS ====================
async function initiatePayment(type, amount) {
    const studentId = localStorage.getItem('hayubori_student_id');
    if (!studentId) {
        alert('Please login first');
        return;
    }

    const method = await showPaymentMethodSelector();
    if (!method) return;

    try {
        showLoading('Initiating payment...');

        const result = await apiCall('/payment/initiate', {
            method: 'POST',
            body: JSON.stringify({
                studentId,
                type,
                amount,
                method
            })
        });

        hideLoading();

        if (result.success && result.paymentUrl) {
            window.location.href = result.paymentUrl;
        } else {
            alert('Failed to initiate payment. Please try again.');
        }
    } catch (error) {
        hideLoading();
        alert('Payment initiation failed: ' + error.message);
    }
}

function showPaymentMethodSelector() {
    return new Promise((resolve) => {
        const methods = ['cbe', 'telebirr', 'coop', 'awash'];
        const methodNames = ['CBE Bank', 'Telebirr', 'Coopay E-birr', 'Awash Bank'];
        const methodIcons = ['🏦', '📱', '💰', '🏛️'];

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:500px;">
                <div class="modal-header">
                    <h2><i class="fas fa-credit-card"></i> Select Payment Method</h2>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; padding:20px 0;">
                    ${methods.map((m, i) => `
                        <button onclick="window._paymentMethod = '${m}'; this.closest('.modal').remove();" 
                                style="padding:20px; border:2px solid rgba(255,255,255,0.1); border-radius:15px; 
                                       background:rgba(255,255,255,0.05); color:white; cursor:pointer; 
                                       transition:all 0.3s; text-align:center; font-size:16px;">
                            <div style="font-size:40px; margin-bottom:10px;">${methodIcons[i]}</div>
                            <div>${methodNames[i]}</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const checkSelection = setInterval(() => {
            if (window._paymentMethod) {
                clearInterval(checkSelection);
                resolve(window._paymentMethod);
                delete window._paymentMethod;
            }
        }, 300);

        const observer = new MutationObserver(() => {
            if (!document.body.contains(modal)) {
                clearInterval(checkSelection);
                resolve(null);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true });
    });
}

function showLoading(message) {
    const loading = document.createElement('div');
    loading.id = 'loadingOverlay';
    loading.style.cssText = `
        position:fixed; top:0; left:0; width:100%; height:100%; 
        background:rgba(0,0,0,0.8); display:flex; justify-content:center; 
        align-items:center; z-index:99999; flex-direction:column; gap:20px;
    `;
    loading.innerHTML = `
        <div class="spinner" style="width:60px; height:60px; border:4px solid rgba(255,255,255,0.1); 
             border-top:4px solid #667eea; border-radius:50%; animation:spin 1s linear infinite;"></div>
        <p style="color:white; font-size:18px;">${message}</p>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.remove();
}

// Add spin animation
const style = document.createElement('style');
style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);

window.initiatePayment = initiatePayment;

// ==================== DISPLAY STUDENT PROFILE ====================
function displayStudentProfile(student) {
    document.getElementById('studentRegistrationSection').style.display = 'none';
    document.getElementById('studentLoginSection').style.display = 'none';
    document.getElementById('studentProfileSection').style.display = 'block';
    
    const photoUrl = student.photoUrl ? `${API_BASE_URL.replace('/api','')}${student.photoUrl}` : 'https://via.placeholder.com/150';
    const issueDate = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    const qrCode = student.qrCode || '';
    
    // Determine if payments are complete
    const paymentsComplete = student.registration_paid && student.term1_paid && student.term2_paid && student.term3_paid && student.term4_paid;
    
    document.getElementById('studentProfileContent').innerHTML = `
        <!-- Top Bar with Logout and Take My ID -->
        <div class="form-card">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <h2><i class="fas fa-id-card"></i> STUDENT IDENTIFICATION CARD</h2>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button onclick="openTelegramBot()" class="btn-success" style="padding:10px 25px; background:linear-gradient(135deg,#0088cc,#2a9fd6); color:white;">
                        <i class="fab fa-telegram"></i> Take My ID
                    </button>
                    <button onclick="logout()" class="btn-danger" style="padding:10px 25px;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        </div>

        <!-- ID CARD - FRONT SIDE (Photo + Basic Info ONLY - NO RANK/AVERAGE) -->
        <div class="id-card-front" id="student-id-card-front">
            <div style="text-align: center; margin-bottom: 15px;">
                <h1 style="color: #a8b5ff; font-size: 22px; letter-spacing: 2px;">HAYU BORI ACADEMY</h1>
                <h2 style="color: white; font-size: 14px; font-weight: normal;">STUDENT IDENTIFICATION CARD</h2>
                <div style="background: linear-gradient(90deg, #078930, #fcdd09, #da121a); height: 3px; width: 80px; margin: 8px auto; border-radius: 3px;"></div>
                <p style="color: rgba(255,255,255,0.6); font-size: 11px;">Ethiopia</p>
            </div>
            
            <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                <div style="text-align: center;">
                    <img src="${photoUrl}" onerror="this.src='https://via.placeholder.com/130'" style="width:120px; height:120px; object-fit:cover; border-radius:10px; border:2px solid #a8b5ff;">
                </div>
                <div style="flex:1;">
                    <div style="margin-bottom:8px;">
                        <p style="color:rgba(255,255,255,0.5); font-size:9px; margin:0;">Full Name:</p>
                        <p style="color:white; font-size:15px; font-weight:600; margin:0;">${student.fullName.toUpperCase()}</p>
                    </div>
                    <div style="margin-bottom:8px;">
                        <p style="color:rgba(255,255,255,0.5); font-size:9px; margin:0;">Student ID:</p>
                        <p style="color:#a8b5ff; font-size:13px; font-weight:600; margin:0;">${student.studentId}</p>
                    </div>
                    <div style="margin-bottom:8px;">
                        <p style="color:rgba(255,255,255,0.5); font-size:9px; margin:0;">Grade:</p>
                        <p style="color:white; font-size:13px; margin:0;">${student.grade}</p>
                    </div>
                    <div>
                        <p style="color:rgba(255,255,255,0.5); font-size:9px; margin:0;">Parent:</p>
                        <p style="color:white; font-size:13px; margin:0;">${student.parentName || 'N/A'}</p>
                    </div>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.08);">
                <div>
                    <p style="color:rgba(255,255,255,0.5); font-size:9px; margin:0;">Issued Date:</p>
                    <p style="color:white; font-size:12px; margin:0;">${issueDate}</p>
                </div>
                <div style="text-align:right;">
                    <p style="color:rgba(255,255,255,0.5); font-size:9px; margin:0;">Authorized Signature:</p>
                    <p style="color:white; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.3); min-width:100px; margin:0;">___________</p>
                </div>
            </div>
            
            <div style="text-align:center; padding-top:8px; border-top:1px solid rgba(255,255,255,0.08);">
                <p style="color:rgba(255,255,255,0.3); font-size:9px; margin:0;">www.hayuboriacademy.edu.et</p>
            </div>
        </div>

        <!-- ID CARD - BACK SIDE (QR Code with ALL Data: Rank, Average, Abilities) -->
        <div class="id-card-back" id="student-id-card-back">
            <div style="text-align: center; margin-bottom: 15px;">
                <h2 style="color: white; font-size: 16px;">🔐 VERIFICATION</h2>
                <div style="background: linear-gradient(90deg, #078930, #fcdd09, #da121a); height: 2px; width: 60px; margin: 8px auto; border-radius: 3px;"></div>
                <p style="color: rgba(255,255,255,0.5); font-size: 11px;">Scan to verify authenticity</p>
            </div>
            
            <div style="text-align:center; margin: 15px 0;">
                <div style="display:inline-block; background:white; padding:15px; border-radius:15px;">
                    ${qrCode ? `<img src="${qrCode}" style="width:180px; height:180px;" alt="QR Code">` : `<div style="width:180px; height:180px; background:rgba(255,255,255,0.1); border-radius:15px; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,0.3); font-size:14px;">QR Code<br>Loading...</div>`}
                </div>
            </div>

            <!-- QR Code Info - This data is embedded IN the QR code, not displayed here -->
            <div style="display:grid; grid-template-columns:1fr; gap:8px; margin:15px 0; padding:15px; background:rgba(255,255,255,0.05); border-radius:10px; text-align:center;">
                <p style="color:rgba(255,255,255,0.4); font-size:11px; margin:0;">
                    🔒 <strong style="color:white;">Scan QR Code</strong> with password<br>
                    <span style="color:#a8b5ff; font-size:12px;">Password: <strong>hayubori_student_id</strong></span>
                </p>
                <p style="color:rgba(255,255,255,0.3); font-size:10px; margin:0;">
                    QR contains: Student ID, Name, Grade, Rank, Average, Abilities, Status
                </p>
            </div>

            <div style="text-align:center; padding-top:10px; border-top:1px solid rgba(255,255,255,0.08);">
                <p style="color:rgba(255,255,255,0.3); font-size:9px; margin:0;">🔒 Password protected QR • Password: hayubori_student_id</p>
            </div>
        </div>

        <!-- Download Buttons -->
        <div style="text-align:center; margin:10px 0; display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
            <button onclick="downloadStudentIDCard('front')" class="btn-success"><i class="fas fa-download"></i> Download Front</button>
            <button onclick="downloadStudentIDCard('back')" class="btn-warning"><i class="fas fa-download"></i> Download Back</button>
            <button onclick="openTelegramBot()" class="btn" style="background:linear-gradient(135deg,#0088cc,#2a9fd6); color:white; padding:10px 25px;">
                <i class="fab fa-telegram"></i> Get ID on Telegram
            </button>
        </div>

        <!-- Payment Section -->
        <div class="form-card">
            <h2><i class="fas fa-credit-card"></i> Payments (4 Terms)</h2>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-top:20px;">
                <div class="card">
                    <h3>Registration</h3>
                    <p>1,000 ETB</p>
                    <span class="badge ${student.registration_paid ? 'badge-paid' : 'badge-unpaid'}">${student.registration_paid ? '✅ Paid' : '❌ Unpaid'}</span>
                    ${!student.registration_paid ? `<br><button onclick="initiatePayment('registration', 1000)" class="btn-success" style="margin-top:10px; padding:8px 15px; font-size:12px;">💳 Pay Now</button>` : ''}
                </div>
                <div class="card">
                    <h3>Term 1</h3>
                    <p>3,500 ETB</p>
                    <span class="badge ${student.term1_paid ? 'badge-paid' : 'badge-unpaid'}">${student.term1_paid ? '✅ Paid' : '❌ Unpaid'}</span>
                    ${!student.term1_paid ? `<br><button onclick="initiatePayment('term1', 3500)" class="btn-success" style="margin-top:10px; padding:8px 15px; font-size:12px;">💳 Pay Now</button>` : ''}
                </div>
                <div class="card">
                    <h3>Term 2</h3>
                    <p>3,500 ETB</p>
                    <span class="badge ${student.term2_paid ? 'badge-paid' : 'badge-unpaid'}">${student.term2_paid ? '✅ Paid' : '❌ Unpaid'}</span>
                    ${!student.term2_paid ? `<br><button onclick="initiatePayment('term2', 3500)" class="btn-success" style="margin-top:10px; padding:8px 15px; font-size:12px;">💳 Pay Now</button>` : ''}
                </div>
                <div class="card">
                    <h3>Term 3</h3>
                    <p>3,500 ETB</p>
                    <span class="badge ${student.term3_paid ? 'badge-paid' : 'badge-unpaid'}">${student.term3_paid ? '✅ Paid' : '❌ Unpaid'}</span>
                    ${!student.term3_paid ? `<br><button onclick="initiatePayment('term3', 3500)" class="btn-success" style="margin-top:10px; padding:8px 15px; font-size:12px;">💳 Pay Now</button>` : ''}
                </div>
                <div class="card">
                    <h3>Term 4</h3>
                    <p>3,500 ETB</p>
                    <span class="badge ${student.term4_paid ? 'badge-paid' : 'badge-unpaid'}">${student.term4_paid ? '✅ Paid' : '❌ Unpaid'}</span>
                    ${!student.term4_paid ? `<br><button onclick="initiatePayment('term4', 3500)" class="btn-success" style="margin-top:10px; padding:8px 15px; font-size:12px;">💳 Pay Now</button>` : ''}
                </div>
            </div>
            <div style="text-align:center; margin-top:15px; padding:10px; background:rgba(255,255,255,0.05); border-radius:10px;">
                <p style="color:rgba(255,255,255,0.6); font-size:12px;">💳 Pay with: CBE • Telebirr • Coopay • Awash</p>
            </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-links">
            <a onclick="openModal('purposeModal')"><i class="fas fa-lightbulb"></i> Purpose</a>
            <a onclick="openModal('feedbackModal')"><i class="fas fa-comment-dots"></i> Feedback</a>
            <a onclick="openModal('privacyModal')"><i class="fas fa-shield-alt"></i> Privacy</a>
            <a onclick="openModal('contactModal')"><i class="fas fa-address-card"></i> Contact</a>
            <a href="ask.html"><i class="fas fa-question-circle"></i> Ask</a>
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

window.downloadStudentIDCard = (side) => {
    const cardId = side === 'front' ? 'student-id-card-front' : 'student-id-card-back';
    const card = document.getElementById(cardId);
    if(card) html2canvas(card,{scale:2}).then(canvas=>{
        const a=document.createElement('a'); 
        a.download=`HayuBori_ID_${side}.png`; 
        a.href=canvas.toDataURL(); 
        a.click();
    });
};

// Make functions global
window.openTelegramBot = openTelegramBot;
window.showRegistration = showRegistration;
window.showLogin = showLogin;
window.logout = logout;
