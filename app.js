// Main Application JavaScript
const CONFIG = {
    whatsappNumber: "01748320647",
    paymentNumber: "01540651159",
    adminPassword: "19923581", // নতুন পাসওয়ার্ড
    storageKey: "bhaiBrothersData"
};

// Application State
let appState = {
    orders: [],
    stats: {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        todayOrders: 0,
        todayRevenue: 0,
        totalRevenue: 0
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    setupEventListeners();
    setupScrollAnimations();
    startLiveUpdates();
});

// Initialize Application
function initApp() {
    loadFromStorage();
    updateStatsDisplay();
    updateMainStats();
    loadLiveOrders();
    setupPackageSelection();
    
    // Hide preloader
    setTimeout(() => {
        document.getElementById('preloader').style.display = 'none';
    }, 1500);
}

// Setup Event Listeners
function setupEventListeners() {
    // Admin Panel Toggle
    document.getElementById('adminToggle').addEventListener('click', toggleAdminPanel);
    document.getElementById('closeAdmin').addEventListener('click', closeAdminPanel);
    
    // Order Modal
    document.getElementById('closeModal').addEventListener('click', closeOrderModal);
    
    // Mobile Menu
    document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
    
    // Refresh Orders
    document.getElementById('refreshOrders').addEventListener('click', loadLiveOrders);
    
    // Order Form
    document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);
    
    // Add Package Form
    document.getElementById('addPackageForm')?.addEventListener('submit', handleAddPackage);
    
    // Close modals on outside click
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Package Selection
function setupPackageSelection() {
    // Package selection is handled in packages.js
    window.selectPackage = function(pkg) {
        document.getElementById('selectedPackageName').textContent = pkg.name;
        document.getElementById('selectedPackagePrice').textContent = `${pkg.price} Tk`;
        document.getElementById('orderModal').style.display = 'flex';
        document.getElementById('step1').classList.add('active');
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step3').classList.remove('active');
        
        // Update step indicators
        updateStepIndicators(1);
    };
}

// Order Form Steps
window.nextStep = function() {
    const currentStep = document.querySelector('.form-step.active');
    const nextStep = currentStep.nextElementSibling;
    
    if (nextStep && nextStep.classList.contains('form-step')) {
        // Validate current step
        if (currentStep.id === 'step2') {
            if (!validateStep2()) return;
        }
        
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
        
        // Update step indicators
        const stepNum = parseInt(nextStep.id.replace('step', ''));
        updateStepIndicators(stepNum);
    }
};

window.prevStep = function() {
    const currentStep = document.querySelector('.form-step.active');
    const prevStep = currentStep.previousElementSibling;
    
    if (prevStep && prevStep.classList.contains('form-step')) {
        currentStep.classList.remove('active');
        prevStep.classList.add('active');
        
        // Update step indicators
        const stepNum = parseInt(prevStep.id.replace('step', ''));
        updateStepIndicators(stepNum);
    }
};

function validateStep2() {
    const playerId = document.getElementById('playerId').value.trim();
    const playerName = document.getElementById('playerName').value.trim();
    const playerServer = document.getElementById('playerServer').value;
    
    if (!playerId) {
        showNotification('Please enter your Free Fire Player ID', 'error');
        return false;
    }
    
    if (!playerName) {
        showNotification('Please enter your Player Name', 'error');
        return false;
    }
    
    if (!playerServer) {
        showNotification('Please select your server region', 'error');
        return false;
    }
    
    return true;
}

function updateStepIndicators(step) {
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
        if (index < step) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Order Submission
function handleOrderSubmit(e) {
    e.preventDefault();
    
    const playerId = document.getElementById('playerId').value.trim();
    const playerName = document.getElementById('playerName').value.trim();
    const playerServer = document.getElementById('playerServer').value;
    const transactionId = document.getElementById('transactionId').value.trim();
    const paymentNumber = document.getElementById('paymentNumber').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;
    const packageName = document.getElementById('selectedPackageName').textContent;
    const packagePrice = document.getElementById('selectedPackagePrice').textContent;
    
    // Validate
    if (!transactionId) {
        showNotification('Please enter Transaction ID', 'error');
        return;
    }
    
    if (!paymentNumber) {
        showNotification('Please enter your payment number', 'error');
        return;
    }
    
    if (!paymentMethod) {
        showNotification('Please select payment method', 'error');
        return;
    }
    
    // Create order
    const order = {
        id: generateOrderId(),
        playerId,
        playerName,
        playerServer,
        transactionId,
        paymentNumber,
        paymentMethod,
        package: packageName,
        amount: parseInt(packagePrice),
        status: 'pending',
        timestamp: new Date().toISOString(),
        completedAt: null,
        cancelledAt: null,
        cancelledReason: null
    };
    
    // Add to orders
    appState.orders.unshift(order);
    updateStats();
    saveToStorage();
    
    // Prepare WhatsApp message
    const message = `*NEW DIAMOND TOP-UP ORDER*%0A%0A` +
                   `*Order ID:* ${order.id}%0A` +
                   `*Player ID:* ${playerId}%0A` +
                   `*Player Name:* ${playerName}%0A` +
                   `*Server:* ${playerServer}%0A` +
                   `*Package:* ${packageName}%0A` +
                   `*Amount:* ${packagePrice}%0A` +
                   `*Transaction ID:* ${transactionId}%0A` +
                   `*Payment From:* ${paymentNumber}%0A` +
                   `*Payment Method:* ${paymentMethod}%0A%0A` +
                   `*Order Time:* ${new Date().toLocaleString()}`;
    
    // Open WhatsApp
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${message}`, '_blank');
    
    // Close modal and reset form
    closeOrderModal();
    document.getElementById('orderForm').reset();
    
    // Show success message
    showNotification('Order submitted successfully! WhatsApp opened for confirmation.', 'success');
    
    // Update displays
    loadLiveOrders();
    if (document.getElementById('adminPanel').style.display === 'block') {
        loadAdminOrders();
    }
}

// Generate Order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
}

// Admin Panel Functions
function toggleAdminPanel() {
    const password = prompt("Enter admin password:");
    if (password === CONFIG.adminPassword) {
        document.getElementById('adminPanel').style.display = 'block';
        loadAdminOrders();
        updateAdminStats();
    } else {
        showNotification('Invalid password!', 'error');
    }
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
}

// Tab Management
window.showTab = function(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Activate button
    event.target.classList.add('active');
    
    // Load tab content if needed
    if (tabName === 'allOrders') {
        loadAdminOrders();
    } else if (tabName === 'pendingOrders') {
        loadPendingOrders();
    } else if (tabName === 'completedOrders') {
        loadCompletedOrders();
    } else if (tabName === 'cancelledOrders') {
        loadCancelledOrders();
    }
};

// Order Management Functions
function loadAdminOrders() {
    const tableBody = document.getElementById('adminOrdersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    appState.orders.forEach(order => {
        const row = createOrderTableRow(order);
        tableBody.appendChild(row);
    });
}

function loadPendingOrders() {
    const tableBody = document.getElementById('pendingOrdersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const pendingOrders = appState.orders.filter(order => order.status === 'pending');
    
    pendingOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>
                <strong>${order.playerName}</strong><br>
                <small>ID: ${order.playerId}</small><br>
                <small>Server: ${order.playerServer}</small>
            </td>
            <td>${order.package}</td>
            <td>${order.amount} Tk</td>
            <td>${formatTime(order.timestamp)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-complete" onclick="completeOrder('${order.id}')">
                        <i class="fas fa-check"></i> Complete
                    </button>
                    <button class="action-btn btn-cancel" onclick="showCancelModal('${order.id}')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="action-btn btn-view" onclick="viewOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadCompletedOrders() {
    const tableBody = document.getElementById('completedOrdersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const completedOrders = appState.orders.filter(order => order.status === 'completed');
    
    completedOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>
                <strong>${order.playerName}</strong><br>
                <small>ID: ${order.playerId}</small>
            </td>
            <td>${order.package}</td>
            <td>${order.amount} Tk</td>
            <td>${formatTime(order.completedAt)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function loadCancelledOrders() {
    const tableBody = document.getElementById('cancelledOrdersTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const cancelledOrders = appState.orders.filter(order => order.status === 'cancelled');
    
    cancelledOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>
                <strong>${order.playerName}</strong><br>
                <small>ID: ${order.playerId}</small>
            </td>
            <td>${order.package}</td>
            <td>${order.amount} Tk</td>
            <td>${formatTime(order.cancelledAt)}</td>
            <td>${order.cancelledReason || 'No reason provided'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function createOrderTableRow(order) {
    const row = document.createElement('tr');
    
    // Determine status badge
    let statusBadge = '';
    if (order.status === 'pending') {
        statusBadge = '<span class="status-pending">Pending</span>';
    } else if (order.status === 'processing') {
        statusBadge = '<span class="status-processing">Processing</span>';
    } else if (order.status === 'completed') {
        statusBadge = '<span class="status-completed">Completed</span>';
    } else if (order.status === 'cancelled') {
        statusBadge = '<span class="status-cancelled">Cancelled</span>';
    }
    
    // Determine actions based on status
    let actions = '';
    if (order.status === 'pending') {
        actions = `
            <div class="action-buttons">
                <button class="action-btn btn-complete" onclick="completeOrder('${order.id}')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-btn btn-cancel" onclick="showCancelModal('${order.id}')">
                    <i class="fas fa-times"></i>
                </button>
                <button class="action-btn btn-view" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
    } else if (order.status === 'processing') {
        actions = `
            <div class="action-buttons">
                <button class="action-btn btn-complete" onclick="completeOrder('${order.id}')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="action-btn btn-view" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
    } else {
        actions = `
            <div class="action-buttons">
                <button class="action-btn btn-view" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
    }
    
    row.innerHTML = `
        <td>${order.id}</td>
        <td>
            <strong>${order.playerName}</strong><br>
            <small>ID: ${order.playerId}</small><br>
            <small>Server: ${order.playerServer}</small>
        </td>
        <td>${order.package}</td>
        <td>${order.amount} Tk</td>
        <td>${statusBadge}</td>
        <td>${formatTime(order.timestamp)}</td>
        <td>${actions}</td>
    `;
    
    return row;
}

// Order Actions
window.completeOrder = function(orderId) {
    const order = appState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (confirm(`Mark order ${orderId} as completed?`)) {
        order.status = 'completed';
        order.completedAt = new Date().toISOString();
        
        updateStats();
        saveToStorage();
        loadAdminOrders();
        loadPendingOrders();
        loadCompletedOrders();
        updateAdminStats();
        
        showNotification(`Order ${orderId} marked as completed`, 'success');
    }
};

window.showCancelModal = function(orderId) {
    const reason = prompt('Enter cancellation reason:');
    if (reason === null) return;
    
    cancelOrder(orderId, reason);
};

window.cancelOrder = function(orderId, reason) {
    const order = appState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (confirm(`Cancel order ${orderId}?`)) {
        order.status = 'cancelled';
        order.cancelledAt = new Date().toISOString();
        order.cancelledReason = reason || 'No reason provided';
        
        updateStats();
        saveToStorage();
        loadAdminOrders();
        loadPendingOrders();
        loadCancelledOrders();
        updateAdminStats();
        
        showNotification(`Order ${orderId} cancelled`, 'success');
    }
};

window.viewOrderDetails = function(orderId) {
    const order = appState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const details = `
        Order ID: ${order.id}
        Player Name: ${order.playerName}
        Player ID: ${order.playerId}
        Server: ${order.playerServer}
        Package: ${order.package}
        Amount: ${order.amount} Tk
        Status: ${order.status}
        Payment Method: ${order.paymentMethod}
        Transaction ID: ${order.transactionId}
        Payment Number: ${order.paymentNumber}
        Order Time: ${formatTime(order.timestamp)}
        ${order.completedAt ? `Completed: ${formatTime(order.completedAt)}` : ''}
        ${order.cancelledAt ? `Cancelled: ${formatTime(order.cancelledAt)}` : ''}
        ${order.cancelledReason ? `Reason: ${order.cancelledReason}` : ''}
    `;
    
    alert(details);
};

// Live Orders Display
function loadLiveOrders() {
    const container = document.getElementById('liveOrdersContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get recent 6 orders
    const recentOrders = appState.orders.slice(0, 6);
    
    recentOrders.forEach(order => {
        const orderCard = createLiveOrderCard(order);
        container.appendChild(orderCard);
    });
}

function createLiveOrderCard(order) {
    const div = document.createElement('div');
    div.className = 'order-card';
    
    // Format time
    const timeAgo = getTimeAgo(order.timestamp);
    
    div.innerHTML = `
        <div class="order-info">
            <h4>${order.playerName}</h4>
            <p>${order.package}</p>
            <small>${timeAgo}</small>
        </div>
        <div class="order-status status-${order.status}">
            ${order.status === 'completed' ? 'DELIVERED' : 
              order.status === 'processing' ? 'PROCESSING' : 
              order.status === 'cancelled' ? 'CANCELLED' : 'PENDING'}
        </div>
    `;
    
    return div;
}

// Statistics Management
function updateStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Reset today's stats
    appState.stats.todayOrders = 0;
    appState.stats.todayRevenue = 0;
    
    // Calculate stats
    appState.stats.totalOrders = appState.orders.length;
    appState.stats.pendingOrders = appState.orders.filter(o => o.status === 'pending').length;
    appState.stats.completedOrders = appState.orders.filter(o => o.status === 'completed').length;
    appState.stats.cancelledOrders = appState.orders.filter(o => o.status === 'cancelled').length;
    
    // Calculate revenue
    appState.stats.totalRevenue = appState.orders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + order.amount, 0);
    
    // Calculate today's stats
    appState.orders.forEach(order => {
        const orderDate = new Date(order.timestamp).toISOString().split('T')[0];
        if (orderDate === today && order.status === 'completed') {
            appState.stats.todayOrders++;
            appState.stats.todayRevenue += order.amount;
        }
    });
    
    // Update displays
    updateStatsDisplay();
    updateMainStats();
    updateAdminStats();
}

function updateStatsDisplay() {
    // This updates the main page stats
    document.getElementById('totalCustomers').textContent = appState.orders.length.toLocaleString() + '+';
    document.getElementById('totalOrders').textContent = appState.stats.totalOrders.toLocaleString() + '+';
}

function updateMainStats() {
    // Update main dashboard stats if needed
}

function updateAdminStats() {
    document.getElementById('adminTotalOrders').textContent = appState.stats.totalOrders;
    document.getElementById('adminPendingOrders').textContent = appState.stats.pendingOrders;
    document.getElementById('adminCompletedOrders').textContent = appState.stats.completedOrders;
    document.getElementById('adminTodayRevenue').textContent = `৳ ${appState.stats.todayRevenue.toLocaleString()}`;
}

// Package Management
window.showAddPackageModal = function() {
    document.getElementById('addPackageModal').style.display = 'flex';
};

window.closeAddPackageModal = function() {
    document.getElementById('addPackageModal').style.display = 'none';
    document.getElementById('addPackageForm').reset();
};

function handleAddPackage(e) {
    e.preventDefault();
    
    const name = document.getElementById('packageName').value.trim();
    const price = document.getElementById('packagePrice').value;
    const category = document.getElementById('packageCategory').value;
    const popular = document.getElementById('packagePopular').checked;
    
    if (!name || !price || !category) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    const newPackage = {
        name,
        price: parseInt(price),
        category,
        popular
    };
    
    // Add package using function from packages.js
    if (typeof addNewPackage === 'function') {
        addNewPackage(newPackage);
    }
    
    // Close modal and reset form
    closeAddPackageModal();
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');
    
    text.textContent = message;
    notification.className = 'notification';
    
    if (type === 'error') {
        notification.classList.add('error');
    } else if (type === 'warning') {
        notification.classList.add('warning');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('orderForm').reset();
    
    // Reset steps
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    updateStepIndicators(1);
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('show');
}

function formatTime(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago';
}

// Local Storage
function saveToStorage() {
    const data = {
        orders: appState.orders,
        stats: appState.stats,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
}

function loadFromStorage() {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (saved) {
        const data = JSON.parse(saved);
        appState.orders = data.orders || [];
        appState.stats = data.stats || appState.stats;
    }
}

// Animations
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Live Updates
function startLiveUpdates() {
    // Update order times every minute
    setInterval(() => {
        loadLiveOrders();
    }, 60000);
    
    // Simulate some completed orders occasionally
    setInterval(() => {
        const pendingOrders = appState.orders.filter(o => o.status === 'pending');
        if (pendingOrders.length > 0 && Math.random() > 0.7) {
            const order = pendingOrders[0];
            order.status = 'completed';
            order.completedAt = new Date().toISOString();
            
            updateStats();
            saveToStorage();
            loadLiveOrders();
            
            if (document.getElementById('adminPanel').style.display === 'block') {
                loadAdminOrders();
                updateAdminStats();
            }
        }
    }, 300000); // Every 5 minutes
}

// Initialize sample data if empty
function initializeSampleData() {
    if (appState.orders.length === 0) {
        const sampleOrders = [
            {
                id: 'ORD-001',
                playerId: '123456789',
                playerName: 'ShadowHunter',
                playerServer: 'Bangladesh',
                transactionId: 'TX001234',
                paymentNumber: '01712345678',
                paymentMethod: 'bkash',
                package: '1240 Diamonds',
                amount: 795,
                status: 'completed',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                completedAt: new Date(Date.now() - 3500000).toISOString()
            },
            {
                id: 'ORD-002',
                playerId: '987654321',
                playerName: 'FireStorm',
                playerServer: 'India',
                transactionId: 'TX002345',
                paymentNumber: '01887654321',
                paymentMethod: 'nagad',
                package: '480 Diamonds',
                amount: 310,
                status: 'completed',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                completedAt: new Date(Date.now() - 7100000).toISOString()
            },
            {
                id: 'ORD-003',
                playerId: '456123789',
                playerName: 'GhostRider',
                playerServer: 'Pakistan',
                transactionId: 'TX003456',
                paymentNumber: '01911223344',
                paymentMethod: 'rocket',
                package: 'Monthly Pass',
                amount: 780,
                status: 'pending',
                timestamp: new Date(Date.now() - 1800000).toISOString()
            }
        ];
        
        appState.orders = sampleOrders;
        updateStats();
        saveToStorage();
    }
}

// Run initialization
setTimeout(initializeSampleData, 1000);