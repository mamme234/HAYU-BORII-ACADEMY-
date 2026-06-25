// server.js - Real Payment Integration

// ==================== PAYMENT INITIATION ====================

app.post('/api/payment/initiate', async (req, res) => {
    try {
        const { studentId, type, amount, method } = req.body;

        // 1. Find the student
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // 2. Create a unique order ID
        const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

        // 3. Save the pending payment
        const payment = await Payment.create({
            studentId,
            studentName: student.fullName,
            amount,
            type,
            method,
            orderId,
            status: 'pending',
            receiptNumber: generateReceiptNumber()
        });

        // 4. Generate payment URL based on method
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

        // 5. Send payment URL to frontend
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

// ==================== CBE PAYMENT INTEGRATION ====================

async function initiateCBEPayment(orderId, amount, customerName, customerEmail) {
    // CBE Payment Gateway Integration
    // You need to register as a merchant with CBE to get these credentials
    const CBE_API_URL = process.env.CBE_API_URL || 'https://cbe-api.com/v1/payment';
    const CBE_MERCHANT_ID = process.env.CBE_MERCHANT_ID;
    const CBE_API_KEY = process.env.CBE_API_KEY;

    // For REAL CBE integration, you would make a POST request to CBE's API
    // Since CBE requires merchant registration, here's the structure:

    const payload = {
        merchantId: CBE_MERCHANT_ID,
        orderId: orderId,
        amount: amount,
        currency: 'ETB',
        customerName: customerName,
        customerEmail: customerEmail,
        returnUrl: `${process.env.BASE_URL}/payment/return?orderId=${orderId}`,
        notifyUrl: `${process.env.BASE_URL}/payment/webhook/cbe`
    };

    // In production, you would make an HTTPS request:
    // const response = await fetch(CBE_API_URL, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${CBE_API_KEY}`
    //     },
    //     body: JSON.stringify(payload)
    // });
    // const data = await response.json();

    // For demo/testing, return a mock payment URL
    return {
        redirectUrl: `https://cbe-payment-simulator.com/pay?orderId=${orderId}&amount=${amount}`,
        transactionId: 'CBE-' + Date.now()
    };
}

// ==================== TELEBIRR PAYMENT INTEGRATION ====================

async function initiateTelebirrPayment(orderId, amount, customerName, customerEmail) {
    // Telebirr Web Checkout Integration
    // You need to register as a merchant with Ethio Telecom
    const TELEBIRR_API_URL = process.env.TELEBIRR_API_URL || 'https://openapi.telebirr.com';
    const TELEBIRR_MERCHANT_ID = process.env.TELEBIRR_MERCHANT_ID;
    const TELEBIRR_APP_ID = process.env.TELEBIRR_APP_ID;
    const TELEBIRR_APP_SECRET = process.env.TELEBIRR_APP_SECRET;
    const TELEBIRR_PRIVATE_KEY = process.env.TELEBIRR_PRIVATE_KEY;

    // For REAL Telebirr integration, you need to:
    // 1. Get Fabric Token
    // 2. Create Order with Telebirr
    // 3. Get checkout URL

    // Using the Telebirr PHP Library or Node.js equivalent [citation:7]

    // In production:
    // const fabricToken = await getTelebirrFabricToken();
    // const orderResult = await createTelebirrOrder(fabricToken, { amount, orderId, customerName, customerEmail });

    // For demo/testing:
    return {
        redirectUrl: `https://telebirr-payment-simulator.com/pay?orderId=${orderId}&amount=${amount}`,
        transactionId: 'TELE-' + Date.now()
    };
}

// ==================== COOP (COOPAY E-BIRR) PAYMENT INTEGRATION ====================

async function initiateCoopPayment(orderId, amount, customerName, customerEmail) {
    // Coopay E-birr Integration
    // Coopbank provides Coopay E-birr for digital payments [citation:8][citation:9][citation:10]

    const COOP_API_URL = process.env.COOP_API_URL || 'https://coopay.coopbankoromia.com.et/api/v1';
    const COOP_MERCHANT_ID = process.env.COOP_MERCHANT_ID;
    const COOP_API_KEY = process.env.COOP_API_KEY;

    // Coopay E-birr supports payments through USSD (*841#) and app [citation:11]

    // In production, you would integrate with Coopay's API
    // For demo/testing:
    return {
        redirectUrl: `https://coopay-simulator.com/pay?orderId=${orderId}&amount=${amount}`,
        transactionId: 'COOP-' + Date.now()
    };
}

// ==================== AWASH BANK PAYMENT INTEGRATION ====================

async function initiateAwashPayment(orderId, amount, customerName, customerEmail) {
    // Awash Bank Payment Gateway Integration
    const AWASH_API_URL = process.env.AWASH_API_URL || 'https://awashbank.com/api/payment';
    const AWASH_MERCHANT_ID = process.env.AWASH_MERCHANT_ID;
    const AWASH_API_KEY = process.env.AWASH_API_KEY;

    // For demo/testing:
    return {
        redirectUrl: `https://awash-payment-simulator.com/pay?orderId=${orderId}&amount=${amount}`,
        transactionId: 'AWASH-' + Date.now()
    };
}

// ==================== PAYMENT WEBHOOKS (Real Payment Confirmation) ====================

app.post('/api/payment/webhook/cbe', async (req, res) => {
    try {
        // CBE will send payment confirmation here
        const { orderId, status, transactionId, amount, chappa } = req.body;

        // Verify the webhook signature (in production)
        // Update payment status
        const payment = await Payment.findOne({ orderId });
        if (payment) {
            payment.status = status === 'success' ? 'approved' : 'rejected';
            payment.transactionId = transactionId;
            payment.chappa = chappa || '✅ Payment confirmed';
            await payment.save();

            // Update student's payment status
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
                const userExists = await checkUserExists(cleanTelegram);
                if (userExists) {
                    const receiptMsg = `🧾 <b>PAYMENT RECEIPT</b>\n\n👤 <b>Student:</b> ${student.fullName}\n🆔 <b>ID:</b> ${student.studentId}\n💵 <b>Amount:</b> ${payment.amount} ETB\n📋 <b>Type:</b> ${payment.type}\n📄 <b>Receipt:</b> ${payment.receiptNumber}\n✅ <b>Status:</b> ${payment.status.toUpperCase()}\n\n${payment.chappa}`;
                    await sendTelegramMessage(cleanTelegram, receiptMsg);
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

// Same webhook pattern for Telebirr, Coop, and Awash
app.post('/api/payment/webhook/telebirr', async (req, res) => {
    // Handle Telebirr webhook
    res.sendStatus(200);
});

app.post('/api/payment/webhook/coop', async (req, res) => {
    // Handle Coopay webhook
    res.sendStatus(200);
});

app.post('/api/payment/webhook/awash', async (req, res) => {
    // Handle Awash webhook
    res.sendStatus(200);
});

// ==================== PAYMENT RETURN (After Payment) ====================

app.get('/api/payment/return', async (req, res) => {
    const { orderId, status, transactionId } = req.query;

    // Redirect to frontend with payment status
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    res.redirect(`${frontendUrl}/student.html?payment=${status}&orderId=${orderId}`);
});
