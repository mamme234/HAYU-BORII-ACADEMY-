// server.js - Hayu Bori Academy Pro Max Backend
// Run: npm install
// Then: node server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('========================================');
console.log('🏫 HAYU BORI ACADEMY - PRO MAX');
console.log('========================================');
console.log('📧 TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✅ SET' : '❌ MISSING');
console.log('📧 ADMIN_CHAT_ID:', process.env.ADMIN_CHAT_ID ? '✅ SET' : '❌ MISSING');
console.log('📧 MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ MISSING');
console.log('========================================');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// ==================== FILE UPLOAD ====================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ==================== TELEGRAM BOT ====================
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Telegram Bot Commands & Menu
function sendTelegramMessage(chatId, message) {
    return new Promise((resolve) => {
        if (!TELEGRAM_BOT_TOKEN || !chatId) {
            resolve(false);
            return;
        }
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const postData = JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: '📊 My Student ID', callback_data: 'my_id' }],
                    [{ text: '📚 My Grades', callback_data: 'my_grades' }],
                    [{ text: '💳 Payments', callback_data: 'payments' }],
                    [{ text: '❓ Help', callback_data: 'help' }, { text: '📞 Contact', callback_data: 'contact' }]
                ]
            })
        });
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.ok) {
                        console.log('✅ Telegram message sent');
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch(e) {
                    resolve(false);
                }
            });
        });
        req.on('error', () => resolve(false));
        req.write(postData);
        req.end();
    });
}

// Send ID to Student via Telegram
async function sendStudentIdToTelegram(telegramUsername, studentId, fullName, grade, examScore) {
    if (!telegramUsername || !TELEGRAM_BOT_TOKEN) return false;
    
    let cleanTelegram = telegramUsername;
    if (telegramUsername.startsWith('@')) cleanTelegram = telegramUsername.substring(1);
    
    const userExists = await checkUserExists(cleanTelegram);
    if (!userExists) {
        console.log('⚠️ User not found:', cleanTelegram);
        return false;
    }
    
    const message = `🎉 <b>Welcome to Hayu Bori Academy!</b>\n\n👤 <b>Name:</b> ${fullName}\n🆔 <b>Student ID:</b> ${studentId}\n📚 <b>Grade:</b> ${grade}\n📊 <b>Exam Score:</b> ${examScore}%\n\n🔐 <b>Login:</b>\n   Student ID: ${studentId}\n   Full Name: ${fullName}\n\n📱 <b>Parent Access:</b> Same Student ID\n\nThank you for choosing Hayu Bori Academy! 🇪🇹`;
    
    return await sendTelegramMessage(cleanTelegram, message);
}

function checkUserExists(telegramUsername) {
    return new Promise((resolve) => {
        if (!TELEGRAM_BOT_TOKEN || !telegramUsername) {
            resolve(false);
            return;
        }
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.ok && json.result) {
                        const userExists = json.result.some(update => {
                            const username = update.message?.from?.username || update.message?.chat?.username;
                            return username && username.toLowerCase() === telegramUsername.toLowerCase();
                        });
                        resolve(userExists);
                    } else {
                        resolve(false);
                    }
                } catch(e) {
                    resolve(false);
                }
            });
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

// ==================== TELEGRAM WEBHOOK (Bot Commands) ====================
app.post('/api/telegram/webhook', async (req, res) => {
    try {
        const { message, callback_query } = req.body;
        
        // Handle Callback Queries (Menu)
        if (callback_query) {
            const chatId = callback_query.message.chat.id;
            const data = callback_query.data;
            
            if (data === 'my_id') {
                await sendTelegramMessage(chatId, '🆔 <b>Student ID</b>\n\nPlease visit the website and login to see your Student ID.\n\n🔗 https://hayu-borii-academy.vercel.app/student.html');
            } else if (data === 'my_grades') {
                await sendTelegramMessage(chatId, '📚 <b>Grades</b>\n\nPlease visit the website and login to see your grades.\n\n🔗 https://hayu-borii-academy.vercel.app/student.html');
            } else if (data === 'payments') {
                await sendTelegramMessage(chatId, '💳 <b>Payments</b>\n\nPay with: CBE • Telebirr • Coopay • Awash\n\n🔗 https://hayu-borii-academy.vercel.app/student.html');
            } else if (data === 'help') {
                await sendTelegramMessage(chatId, '❓ <b>Help</b>\n\n📌 How to register:\n1. Go to the website\n2. Click "Student"\n3. Fill the form\n4. Take the exam\n5. Pass to get your ID\n\n💳 Payment Methods:\n• CBE Bank\n• Telebirr\n• Coopay E-birr\n• Awash Bank\n\n📧 Email: ilyas@hayuboriacademy.edu.et');
            } else if (data === 'contact') {
                await sendTelegramMessage(chatId, '📞 <b>Contact</b>\n\n📧 Email: ilyas@hayuboriacademy.edu.et\n🤖 Telegram: @Hayubori_academyBot\n📞 Phone: +251-900-123456\n📍 Location: Addis Ababa, Ethiopia');
            }
            
            res.sendStatus(200);
            return;
        }
        
        // Handle Regular Messages (Commands)
        if (message && message.text) {
            const chatId = message.chat.id;
            const text = message.text;
            
            if (text === '/start' || text === '/menu') {
                const welcomeMsg = `🤖 <b>Hayu Bori Academy Bot</b>\n\nWelcome to Hayu Bori Academy! 🇪🇹\n\nI'm here to help you with:\n• Student ID & Login\n• Grades & Exam Scores\n• Payments & Receipts\n• School Information\n\n📌 Use the buttons below or type /help for assistance.`;
                await sendTelegramMessage(chatId, welcomeMsg);
            } else if (text === '/help') {
                await sendTelegramMessage(chatId, '❓ <b>Available Commands</b>\n\n/start - Welcome message\n/menu - Show menu\n/help - Show this help\n/id - Get your Student ID\n/grades - Get your grades\n/payments - Payment info\n/contact - Contact details\n/about - About the school');
            } else if (text === '/id') {
                await sendTelegramMessage(chatId, '🆔 <b>Student ID</b>\n\nPlease visit the website and login to see your Student ID.\n\n🔗 https://hayu-borii-academy.vercel.app/student.html');
            } else if (text === '/grades') {
                await sendTelegramMessage(chatId, '📚 <b>Grades</b>\n\nPlease visit the website and login to see your grades.\n\n🔗 https://hayu-borii-academy.vercel.app/student.html');
            } else if (text === '/payments') {
                await sendTelegramMessage(chatId, '💳 <b>Payments</b>\n\nPay with: CBE • Telebirr • Coopay • Awash\n\n🔗 https://hayu-borii-academy.vercel.app/student.html');
            } else if (text === '/contact') {
                await sendTelegramMessage(chatId, '📞 <b>Contact</b>\n\n📧 Email: ilyas@hayuboriacademy.edu.et\n🤖 Telegram: @Hayubori_academyBot\n📞 Phone: +251-900-123456');
            } else if (text === '/about') {
                await sendTelegramMessage(chatId, '🏫 <b>Hayu Bori Academy</b>\n\n📍 Addis Ababa, Ethiopia\n📚 KG • Elementary • Middle School\n\n🌟 <b>Mission:</b> Quality education for future leaders.\n\n🔗 https://hayu-borii-academy.vercel.app');
            }
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

// ==================== MONGODB ====================
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('✅ MongoDB Connected');
    await Student.collection.createIndex({ studentId: 1 }, { unique: true });
    initializeDemoData();
    setTelegramWebhook();
}).catch(err => {
    console.error('❌ MongoDB Error:', err.message);
});

// Set Telegram Webhook
async function setTelegramWebhook() {
    if (!TELEGRAM_BOT_TOKEN) return;
    const webhookUrl = `https://${process.env.BASE_URL || 'localhost:3000'}/api/telegram/webhook`;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${webhookUrl}`;
    const req = https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.ok) {
                    console.log('✅ Telegram webhook set');
                } else {
                    console.log('⚠️ Webhook error:', json.description);
                }
            } catch(e) {}
        });
    });
    req.on('error', () => {});
    req.end();
}

// ==================== SCHEMAS ====================
const studentSchema = new mongoose.Schema({
    studentId: { type: String, unique: true, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    telegram: { type: String },
    phone: String,
    grade: String,
    parentName: String,
    parentPhone: String,
    address: String,
    photoUrl: String,
    examScore: Number,
    examViolations: { type: Number, default: 0 },
    registration_paid: { type: Boolean, default: false },
    term1_paid: { type: Boolean, default: false },
    term2_paid: { type: Boolean, default: false },
    term3_paid: { type: Boolean, default: false },
    term4_paid: { type: Boolean, default: false },
    qrCode: { type: String },
    rank: { type: String },
    average: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

const teacherSchema = new mongoose.Schema({
    teacherId: { type: String, unique: true },
    fullName: String,
    email: String,
    telegram: String,
    phone: String,
    gradeLevel: String,
    subject: String,
    experience: Number,
    photoUrl: String,
    documentUrl: String,
    examScore: Number,
    approvalCode: String,
    status: { type: String, default: 'pending' },
    joinedDate: Date
});

const directorSchema = new mongoose.Schema({
    type: String,
    name: String,
    password: String
});

const paymentSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    amount: Number,
    type: String,
    method: { type: String, enum: ['cbe', 'telebirr', 'coop', 'awash'] },
    orderId: String,
    transactionId: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'processing'], default: 'pending' },
    receiptNumber: String,
    chappa: { type: String },
    date: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
    name: String,
    rating: Number,
    message: String,
    date: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
    name: String,
    email: String,
    question: String,
    answer: { type: String, default: '' },
    isAnswered: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
});

const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Director = mongoose.model('Director', directorSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Question = mongoose.model('Question', questionSchema);
const Admin = mongoose.model('Admin', adminSchema);

// ==================== INITIALIZE ====================
async function initializeDemoData() {
    const directors = await Director.find();
    if (directors.length === 0) {
        await Director.create([
            { type: 'kg', name: 'KG Director', password: 'kg123' },
            { type: 'elementary', name: 'Elementary Director', password: 'elem123' },
            { type: 'middle', name: 'Middle School Director', password: 'middle123' }
        ]);
        console.log('✅ Demo directors created');
    }
    const admins = await Admin.find();
    if (admins.length === 0) {
        await Admin.create({
            username: 'admin',
            password: 'admin123'
        });
        console.log('✅ Admin created');
    }
}

function generateStudentId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `HB${year}${random}`;
}

function generateTeacherId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TCH${year}${random}`;
}

function generateApprovalCode() {
    return 'AP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateReceiptNumber() {
    return 'RCP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// ==================== PAYMENT FUNCTIONS ====================
async function initiateCBEPayment(orderId, amount, customerName, customerEmail) {
    return {
        redirectUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/payment-gateway/cbe?orderId=${orderId}&amount=${amount}`,
        transactionId: 'CBE-' + Date.now()
    };
}

async function initiateTelebirrPayment(orderId, amount, customerName, customerEmail) {
    return {
        redirectUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/payment-gateway/telebirr?orderId=${orderId}&amount=${amount}`,
        transactionId: 'TELE-' + Date.now()
    };
}

async function initiateCoopPayment(orderId, amount, customerName, customerEmail) {
    return {
        redirectUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/payment-gateway/coop?orderId=${orderId}&amount=${amount}`,
        transactionId: 'COOP-' + Date.now()
    };
}

async function initiateAwashPayment(orderId, amount, customerName, customerEmail) {
    return {
        redirectUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/payment-gateway/awash?orderId=${orderId}&amount=${amount}`,
        transactionId: 'AWASH-' + Date.now()
    };
}

// ==================== ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        telegram: TELEGRAM_BOT_TOKEN ? 'configured' : 'not configured',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// ==================== STUDENT REGISTRATION ====================
app.post('/api/student/register', upload.single('photo'), async (req, res) => {
    try {
        const { fullName, email, telegram, phone, grade, parentName, parentPhone, address, examScore, examViolations } = req.body;
        
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ error: 'Email already registered.' });
        }
        
        const studentId = generateStudentId();
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
        let photoBase64 = null;
        
        if (req.file) {
            const photoPath = path.join(__dirname, req.file.path);
            const photoBuffer = fs.readFileSync(photoPath);
            photoBase64 = `data:image/jpeg;base64,${photoBuffer.toString('base64')}`;
        }
        
        const qrData = JSON.stringify({
            studentId: studentId,
            name: fullName,
            grade: grade,
            school: 'Hayu Bori Academy',
            verified: true
        });
        const qrCode = await QRCode.toDataURL(qrData);
        
        const student = await Student.create({
            studentId, fullName, email, telegram, phone, grade, parentName, parentPhone, address,
            photoUrl, examScore: parseInt(examScore), examViolations: parseInt(examViolations),
            qrCode
        });
        
        console.log('✅ Student saved:', studentId);
        
        // ==================== SEND STUDENT ID VIA TELEGRAM ====================
        let telegramSent = false;
        if (telegram && TELEGRAM_BOT_TOKEN) {
            telegramSent = await sendStudentIdToTelegram(telegram, studentId, fullName, grade, examScore);
        }
        
        // Notify Admin
        if (ADMIN_CHAT_ID && TELEGRAM_BOT_TOKEN) {
            const adminMsg = `🎓 NEW STUDENT!\n👤 ${fullName}\n🆔 ${studentId}\n📚 ${grade}\n📊 Score: ${examScore}%\n🤖 Telegram: ${telegram || 'N/A'}`;
            await sendTelegramMessage(ADMIN_CHAT_ID, adminMsg);
        }
        
        res.status(201).json({ 
            success: true, 
            studentId, 
            student,
            telegramSent,
            telegramNote: telegramSent ? '✅ Student ID sent to Telegram!' : '⚠️ Could not send. Please start a chat with @Hayubori_academyBot first!'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== STUDENT LOGIN ====================
app.post('/api/student/login', async (req, res) => {
    try {
        const { studentId, fullName } = req.body;
        const student = await Student.findOne({ studentId, fullName });
        if (!student) {
            return res.status(401).json({ error: 'Invalid Student ID or Name' });
        }
        res.json({ success: true, student });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== PAYMENT INITIATION ====================
app.post('/api/payment/initiate', async (req, res) => {
    try {
        const { studentId, type, amount, method } = req.body;

        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

        const payment = await Payment.create({
            studentId,
            studentName: student.fullName,
            amount,
            type,
            method,
            orderId,
            status: 'processing',
            receiptNumber: generateReceiptNumber()
        });

        let paymentUrl = '';
        let paymentData = {};

        switch (method) {
            case 'cbe':
                paymentData = await initiateCBEPayment(orderId, amount, student.fullName, student.email);
                paymentUrl = paymentData.redirectUrl;
                break;
            case 'telebirr':
                paymentData = await initiateTelebirrPayment(orderId, amount, student.fullName, student.email);
                paymentUrl = paymentData.redirectUrl;
                break;
            case 'coop':
                paymentData = await initiateCoopPayment(orderId, amount, student.fullName, student.email);
                paymentUrl = paymentData.redirectUrl;
                break;
            case 'awash':
                paymentData = await initiateAwashPayment(orderId, amount, student.fullName, student.email);
                paymentUrl = paymentData.redirectUrl;
                break;
            default:
                return res.status(400).json({ error: 'Invalid payment method' });
        }

        res.json({
            success: true,
            paymentUrl,
            orderId,
            paymentId: payment._id
        });

    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== PAYMENT WEBHOOKS ====================
app.post('/api/payment/webhook/:method', async (req, res) => {
    try {
        const { method } = req.params;
        const { orderId, status, transactionId } = req.body;
        
        const payment = await Payment.findOne({ orderId });
        if (payment) {
            payment.status = status === 'success' ? 'approved' : 'rejected';
            payment.transactionId = transactionId;
            payment.chappa = `✅ Payment confirmed via ${method.toUpperCase()}`;
            await payment.save();

            const student = await Student.findOne({ studentId: payment.studentId });
            if (student) {
                const updateField = {};
                if (payment.type === 'registration') updateField = { registration_paid: true };
                else if (payment.type === 'term1') updateField = { term1_paid: true };
                else if (payment.type === 'term2') updateField = { term2_paid: true };
                else if (payment.type === 'term3') updateField = { term3_paid: true };
                else if (payment.type === 'term4') updateField = { term4_paid: true };
                await Student.updateOne({ studentId: payment.studentId }, updateField);
            }

            // Send receipt via Telegram
            if (student?.telegram && TELEGRAM_BOT_TOKEN) {
                const cleanTelegram = student.telegram.startsWith('@') ? student.telegram.substring(1) : student.telegram;
                const receiptMsg = `🧾 <b>PAYMENT RECEIPT</b>\n\n👤 <b>Student:</b> ${student.fullName}\n🆔 <b>ID:</b> ${student.studentId}\n💵 <b>Amount:</b> ${payment.amount} ETB\n📋 <b>Type:</b> ${payment.type}\n📄 <b>Receipt:</b> ${payment.receiptNumber}\n✅ <b>Status:</b> ${payment.status.toUpperCase()}\n\n${payment.chappa}`;
                await sendTelegramMessage(cleanTelegram, receiptMsg);
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

// ==================== PAYMENT GATEWAY ====================
app.get('/payment-gateway/:method', (req, res) => {
    const { method } = req.params;
    const { orderId, amount } = req.query;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${method.toUpperCase()} Payment - Hayu Bori Academy</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh; 
                    margin: 0; 
                    background: radial-gradient(ellipse at center, #0a0a2a, #050510);
                    color: white;
                    padding: 20px;
                }
                .container { 
                    text-align: center; 
                    padding: 40px; 
                    background: rgba(255,255,255,0.05); 
                    border-radius: 30px; 
                    max-width: 500px; 
                    width: 100%;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .logo { font-size: 60px; margin-bottom: 20px; }
                h1 { color: #a8b5ff; font-size: 28px; }
                .amount { font-size: 36px; color: #ffd93d; margin: 20px 0; font-weight: 700; }
                .order { color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 20px; }
                .btn { 
                    background: linear-gradient(135deg, #11998e, #38ef7d); 
                    color: white; 
                    border: none; 
                    padding: 15px 40px; 
                    border-radius: 30px; 
                    font-size: 18px; 
                    cursor: pointer; 
                    margin: 10px; 
                    transition: all 0.3s;
                    font-weight: 600;
                }
                .btn:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(17,153,142,0.3); }
                .btn-danger { background: linear-gradient(135deg, #dc3545, #ff6b6b); }
                .btn-danger:hover { box-shadow: 0 10px 30px rgba(220,53,69,0.3); }
                .btn-back { 
                    background: rgba(255,255,255,0.1); 
                    color: white; 
                    border: none; 
                    padding: 12px 30px; 
                    border-radius: 30px; 
                    font-size: 14px; 
                    cursor: pointer; 
                    margin-top: 20px;
                    transition: all 0.3s;
                }
                .btn-back:hover { background: rgba(255,255,255,0.2); }
                .note { color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 20px; }
                @media (max-width: 480px) {
                    .container { padding: 25px; }
                    .amount { font-size: 28px; }
                    .btn { padding: 12px 25px; font-size: 16px; width: 100%; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">${method === 'cbe' ? '🏦' : method === 'telebirr' ? '📱' : method === 'coop' ? '💰' : '🏛️'}</div>
                <h1>${method.toUpperCase()} Payment</h1>
                <div class="order">Order ID: ${orderId}</div>
                <div class="amount">${amount} ETB</div>
                <p style="color:rgba(255,255,255,0.7); margin-bottom:20px;">Please complete your payment using ${method.toUpperCase()}</p>
                <button class="btn" onclick="simulatePayment()">✅ Simulate Payment Success</button>
                <br>
                <button class="btn btn-danger" onclick="simulatePaymentFail()">❌ Simulate Payment Failed</button>
                <br>
                <button class="btn-back" onclick="window.location.href='${process.env.FRONTEND_URL || 'https://hayu-borii-academy.vercel.app'}/student.html'">← Back to Dashboard</button>
                <p class="note">💡 This is a demo payment gateway. Real payments redirect to the bank's official page.</p>
            </div>
            <script>
                function simulatePayment() {
                    fetch('/api/payment/webhook/${method}', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: '${orderId}', status: 'success', transactionId: 'SIM-${Date.now()}' })
                    }).then(() => {
                        window.location.href = '${process.env.FRONTEND_URL || 'https://hayu-borii-academy.vercel.app'}/student.html?payment=success';
                    });
                }
                function simulatePaymentFail() {
                    fetch('/api/payment/webhook/${method}', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: '${orderId}', status: 'failed', transactionId: 'SIM-${Date.now()}' })
                    }).then(() => {
                        window.location.href = '${process.env.FRONTEND_URL || 'https://hayu-borii-academy.vercel.app'}/student.html?payment=failed';
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// ==================== PAYMENT QUERIES ====================
app.get('/api/payments', async (req, res) => {
    const payments = await Payment.find().sort({ date: -1 });
    res.json(payments);
});

app.get('/api/payments/pending', async (req, res) => {
    const payments = await Payment.find({ status: 'pending' }).sort({ date: -1 });
    res.json(payments);
});

app.get('/api/payments/today', async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const payments = await Payment.find({
        date: { $gte: today, $lt: tomorrow },
        status: 'approved'
    });
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ payments, total, count: payments.length });
});

app.get('/api/payments/week', async (req, res) => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const payments = await Payment.find({
        date: { $gte: weekAgo, $lte: today },
        status: 'approved'
    });
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ payments, total, count: payments.length });
});

app.get('/api/payments/month', async (req, res) => {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const payments = await Payment.find({
        date: { $gte: monthAgo, $lte: today },
        status: 'approved'
    });
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ payments, total, count: payments.length });
});

// ==================== PAYMENT APPROVAL ====================
app.post('/api/payment/:id/approve', async (req, res) => {
    try {
        const { chappa } = req.body;
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        
        payment.status = 'approved';
        payment.chappa = chappa || '✅ APPROVED';
        await payment.save();
        
        const student = await Student.findOne({ studentId: payment.studentId });
        if (student) {
            const updateField = {};
            if (payment.type === 'registration') updateField = { registration_paid: true };
            else if (payment.type === 'term1') updateField = { term1_paid: true };
            else if (payment.type === 'term2') updateField = { term2_paid: true };
            else if (payment.type === 'term3') updateField = { term3_paid: true };
            else if (payment.type === 'term4') updateField = { term4_paid: true };
            await Student.updateOne({ studentId: payment.studentId }, updateField);
        }
        
        if (student?.telegram && TELEGRAM_BOT_TOKEN) {
            const cleanTelegram = student.telegram.startsWith('@') ? student.telegram.substring(1) : student.telegram;
            const receiptMsg = `🧾 <b>PAYMENT RECEIPT</b>\n\n👤 <b>Student:</b> ${student.fullName}\n🆔 <b>ID:</b> ${student.studentId}\n💵 <b>Amount:</b> ${payment.amount} ETB\n📋 <b>Type:</b> ${payment.type}\n📄 <b>Receipt:</b> ${payment.receiptNumber}\n✅ <b>Status:</b> APPROVED\n\n${chappa || '✅ Payment Confirmed'}`;
            await sendTelegramMessage(cleanTelegram, receiptMsg);
        }
        
        res.json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/payment/:id/reject', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        payment.status = 'rejected';
        await payment.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== QR CODE VERIFICATION ====================
app.post('/api/verify-qr', async (req, res) => {
    try {
        const { studentId, password } = req.body;
        if (password !== 'hayubori_student_id') {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).json({ error: 'Student not found' });
        
        const average = student.examScore || 0;
        let rank = 'Average';
        if (average >= 90) rank = 'Excellent';
        else if (average >= 75) rank = 'Good';
        else if (average >= 60) rank = 'Satisfactory';
        else rank = 'Needs Improvement';
        
        res.json({
            verified: true,
            name: student.fullName,
            studentId: student.studentId,
            grade: student.grade,
            rank: rank,
            average: average,
            school: 'Hayu Bori Academy',
            status: 'Active'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== QUESTIONS ====================
app.post('/api/questions', async (req, res) => {
    try {
        const { name, email, question } = req.body;
        const q = await Question.create({ name, email, question });
        res.json({ success: true, question: q });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/questions', async (req, res) => {
    const questions = await Question.find().sort({ date: -1 });
    res.json(questions);
});

app.post('/api/questions/:id/answer', async (req, res) => {
    try {
        const { answer } = req.body;
        const q = await Question.findById(req.params.id);
        if (!q) return res.status(404).json({ error: 'Question not found' });
        q.answer = answer;
        q.isAnswered = true;
        await q.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TEACHER ====================
app.post('/api/teacher/apply', upload.fields([{ name: 'photo' }, { name: 'document' }]), async (req, res) => {
    try {
        const { fullName, email, telegram, phone, gradeLevel, subject, experience, reason, examScore } = req.body;
        const approvalCode = generateApprovalCode();
        const photoUrl = req.files['photo'] ? `/uploads/${req.files['photo'][0].filename}` : null;
        const documentUrl = req.files['document'] ? `/uploads/${req.files['document'][0].filename}` : null;
        
        const teacher = await Teacher.create({
            fullName, email, telegram, phone, gradeLevel, subject, experience,
            photoUrl, documentUrl, examScore: parseInt(examScore),
            approvalCode, status: 'pending', joinedDate: new Date()
        });
        
        if (telegram && TELEGRAM_BOT_TOKEN) {
            let cleanTelegram = telegram;
            if (telegram.startsWith('@')) cleanTelegram = telegram.substring(1);
            const userExists = await checkUserExists(cleanTelegram);
            if (userExists) {
                const msg = `👨‍🏫 <b>Thank you for applying, ${fullName}!</b>\n\n🔑 <b>Approval Code:</b> ${approvalCode}\n📚 <b>Grade Level:</b> ${gradeLevel}\n⏳ <b>Status:</b> Pending Review`;
                await sendTelegramMessage(cleanTelegram, msg);
            }
        }
        
        res.json({ success: true, approvalCode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/teacher/login', async (req, res) => {
    try {
        const { code, fullName } = req.body;
        const teacher = await Teacher.findOne({ approvalCode: code, fullName });
        if (!teacher) return res.status(401).json({ error: 'Invalid approval code' });
        if (teacher.status !== 'approved') return res.status(403).json({ error: 'Pending approval' });
        if (!teacher.teacherId) {
            teacher.teacherId = generateTeacherId();
            await teacher.save();
        }
        res.json({ success: true, teacher });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/teacher/:id/approve', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
        teacher.status = 'approved';
        teacher.teacherId = generateTeacherId();
        await teacher.save();
        
        if (teacher.telegram && TELEGRAM_BOT_TOKEN) {
            let cleanTelegram = teacher.telegram;
            if (cleanTelegram.startsWith('@')) cleanTelegram = cleanTelegram.substring(1);
            const userExists = await checkUserExists(cleanTelegram);
            if (userExists) {
                const msg = `✅ <b>Congratulations ${teacher.fullName}!</b>\n\nYour application has been APPROVED!\n🆔 <b>Teacher ID:</b> ${teacher.teacherId}\n🔑 <b>Approval Code:</b> ${teacher.approvalCode}`;
                await sendTelegramMessage(cleanTelegram, msg);
            }
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/teacher/:id/reject', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
        if (teacher.telegram && TELEGRAM_BOT_TOKEN) {
            let cleanTelegram = teacher.telegram;
            if (cleanTelegram.startsWith('@')) cleanTelegram = cleanTelegram.substring(1);
            const userExists = await checkUserExists(cleanTelegram);
            if (userExists) {
                const msg = `❌ <b>Dear ${teacher.fullName},</b>\n\nWe regret to inform you that your application has not been accepted.`;
                await sendTelegramMessage(cleanTelegram, msg);
            }
        }
        await Teacher.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/teachers/pending', async (req, res) => {
    const teachers = await Teacher.find({ status: 'pending' });
    res.json(teachers);
});

// ==================== BOARD ====================
app.post('/api/board/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'board@hayubori.edu' && password === 'board123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/api/board/stats', async (req, res) => {
    const students = await Student.find();
    const teachers = await Teacher.find({ status: 'approved' });
    const pendingTeachers = await Teacher.find({ status: 'pending' });
    const payments = await Payment.find();
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        pendingTeachers: pendingTeachers.length,
        totalRevenue,
        students,
        teachers,
        pendingTeachersList: pendingTeachers,
        payments
    });
});

// ==================== DIRECTOR ====================
app.post('/api/director/login', async (req, res) => {
    const { type, password } = req.body;
    const director = await Director.findOne({ type, password });
    if (!director) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true, director });
});

app.get('/api/director/:type/stats', async (req, res) => {
    const { type } = req.params;
    let gradeFilter = {};
    if (type === 'kg') gradeFilter = { grade: { $in: ['Nursery', 'Lower KG', 'Upper KG'] } };
    else if (type === 'elementary') gradeFilter = { grade: { $regex: 'Grade [1-4]', $options: 'i' } };
    else if (type === 'middle') gradeFilter = { grade: { $regex: 'Grade [5-8]', $options: 'i' } };
    const students = await Student.find(gradeFilter);
    const teachers = await Teacher.find({ gradeLevel: type === 'kg' ? 'KG' : type === 'elementary' ? 'Elementary' : 'Middle', status: 'approved' });
    const revenue = students.reduce((sum, s) => sum + (s.registration_paid ? 1000 : 0) + (s.term1_paid ? 3500 : 0) + (s.term2_paid ? 3500 : 0) + (s.term3_paid ? 3500 : 0) + (s.term4_paid ? 3500 : 0), 0);
    res.json({ students, teachers, revenue });
});

// ==================== PARENT ====================
app.post('/api/parent/login', async (req, res) => {
    const { studentId } = req.body;
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(401).json({ error: 'Student not found' });
    res.json({ success: true, student });
});

// ==================== FEEDBACK ====================
app.post('/api/feedback', async (req, res) => {
    const { name, rating, message } = req.body;
    await Feedback.create({ name, rating, message });
    if (ADMIN_CHAT_ID && TELEGRAM_BOT_TOKEN) {
        const msg = `💬 FEEDBACK!\n⭐ ${rating}/5\n💭 ${message}`;
        await sendTelegramMessage(ADMIN_CHAT_ID, msg);
    }
    res.json({ success: true });
});

app.get('/api/feedbacks', async (req, res) => {
    const feedbacks = await Feedback.find().sort({ date: -1 });
    res.json(feedbacks);
});

// ==================== ADMIN ====================
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username, password });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true, admin });
});

app.get('/api/admin/stats', async (req, res) => {
    const students = await Student.countDocuments();
    const teachers = await Teacher.countDocuments({ status: 'approved' });
    const pendingTeachers = await Teacher.countDocuments({ status: 'pending' });
    const payments = await Payment.find();
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const questions = await Question.countDocuments({ isAnswered: false });
    res.json({
        students, teachers, pendingTeachers, totalRevenue, pendingPayments, questions,
        totalPayments: payments.length
    });
});

app.get('/api/admin/students', async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

app.get('/api/admin/teachers', async (req, res) => {
    const teachers = await Teacher.find();
    res.json(teachers);
});

app.delete('/api/admin/student/:id', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.delete('/api/admin/teacher/:id', async (req, res) => {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// ==================== TOURIST ====================
app.get('/api/tourist/about', (req, res) => {
    res.json({
        name: 'Hayu Bori Academy',
        established: '2024',
        location: 'Addis Ababa, Ethiopia',
        mission: 'To provide quality education and develop future leaders of Ethiopia.',
        vision: 'To be the leading educational institution in Ethiopia.',
        values: ['Excellence', 'Integrity', 'Innovation', 'Community Service'],
        programs: ['KG', 'Elementary (Grade 1-4)', 'Middle School (Grade 5-8)'],
        facilities: ['Library', 'Computer Lab', 'Science Lab', 'Sports Field', 'Art Room'],
        contact: {
            email: 'info@hayuboriacademy.edu.et',
            phone: '+251-900-123456',
            address: 'Addis Ababa, Ethiopia'
        }
    });
});

// ==================== START ====================
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════════════════╗
    ║                 HAYU BORI ACADEMY - PRO MAX                        ║
    ╠═══════════════════════════════════════════════════════════════════╣
    ║  🚀 Server: http://localhost:${PORT}                               ║
    ║  🤖 Telegram Bot: ${TELEGRAM_BOT_TOKEN ? 'CONFIGURED ✅' : 'NOT CONFIGURED ❌'}
    ║  🗄️  Database: ${mongoose.connection.readyState === 1 ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}
    ║                                                                    ║
    ║  🔑 Demo Accounts:                                                ║
    ║     Admin: admin / admin123                                       ║
    ║     Board: board@hayubori.edu / board123                          ║
    ║     Director: kg123 / elem123 / middle123                         ║
    ║     Finance: finance@hayubori.edu / finance123                    ║
    ║                                                                    ║
    ║  💳 Payment Methods: CBE, Telebirr, Coopay, Awash                 ║
    ║  🤖 Bot Commands: /start, /menu, /help, /id, /grades, /payments  ║
    ╚═══════════════════════════════════════════════════════════════════╝
    `);
});
