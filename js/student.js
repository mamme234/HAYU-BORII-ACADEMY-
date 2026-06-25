// ==================== PAYMENT INITIATION ====================

async function initiatePayment(type, amount) {
    const studentId = localStorage.getItem('hayubori_student_id');
    if (!studentId) {
        alert('Please login first');
        return;
    }

    // Show payment method selection
    const method = await showPaymentMethodSelector();
    if (!method) return;

    try {
        // Show loading
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
            // Redirect to payment gateway
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

        // Wait for selection
        const checkSelection = setInterval(() => {
            if (window._paymentMethod) {
                clearInterval(checkSelection);
                resolve(window._paymentMethod);
                delete window._paymentMethod;
            }
        }, 300);

        // Cleanup if modal closed
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

// Update payment buttons to use initiatePayment
function updatePaymentButtons() {
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            const amount = parseInt(this.dataset.amount);
            initiatePayment(type, amount);
        });
    });
}

// Call after profile display
window.initiatePayment = initiatePayment;
