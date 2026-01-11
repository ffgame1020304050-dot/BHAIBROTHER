// Package Data - Separate files for different categories
const packageData = {
    diamond: [
        { id: 1, name: "25 Diamonds", price: 24, popular: false, category: "diamond" },
        { id: 2, name: "50 Diamonds", price: 45, popular: true, category: "diamond" },
        { id: 3, name: "115 Diamonds", price: 78, popular: true, category: "diamond" },
        { id: 4, name: "240 Diamonds", price: 160, popular: false, category: "diamond" },
        { id: 5, name: "480 Diamonds", price: 310, popular: true, category: "diamond" },
        { id: 6, name: "610 Diamonds", price: 390, popular: false, category: "diamond" },
        { id: 7, name: "1240 Diamonds", price: 795, popular: true, category: "diamond" },
        { id: 8, name: "2530 Diamonds", price: 1679, popular: false, category: "diamond" },
        { id: 9, name: "5060 Diamonds", price: 3358, popular: true, category: "diamond" },
        { id: 10, name: "10120 Diamonds", price: 6716, popular: false, category: "diamond" }
    ],
    weekly: [
        { id: 11, name: "Weekly Pass", price: 160, popular: true, category: "weekly" },
        { id: 12, name: "Weekly Lite", price: 45, popular: false, category: "weekly" },
        { id: 13, name: "Monthly Pass", price: 780, popular: true, category: "weekly" }
    ],
    evo: [
        { id: 14, name: "3 Day Evo Access", price: 60, popular: false, category: "evo" },
        { id: 15, name: "7 Days Evo Access", price: 100, popular: true, category: "evo" },
        { id: 16, name: "30 Days Evo Access", price: 250, popular: true, category: "evo" }
    ]
};

// Function to load packages on the main page
function loadPackages() {
    loadDiamondPackages();
    loadWeeklyPackages();
    loadEvoPackages();
    loadAdminPackages();
}

// Load Diamond Packages
function loadDiamondPackages() {
    const container = document.getElementById('diamondPackages');
    if (!container) return;
    
    container.innerHTML = '';
    
    packageData.diamond.forEach(pkg => {
        const packageElement = createPackageElement(pkg);
        container.appendChild(packageElement);
    });
}

// Load Weekly Packages
function loadWeeklyPackages() {
    const container = document.getElementById('weeklyPackages');
    if (!container) return;
    
    container.innerHTML = '';
    
    packageData.weekly.forEach(pkg => {
        const packageElement = createPackageElement(pkg);
        container.appendChild(packageElement);
    });
}

// Load Evolution Packages
function loadEvoPackages() {
    const container = document.getElementById('evoPackages');
    if (!container) return;
    
    container.innerHTML = '';
    
    packageData.evo.forEach(pkg => {
        const packageElement = createPackageElement(pkg);
        container.appendChild(packageElement);
    });
}

// Create Package Element for Main Page
function createPackageElement(pkg) {
    const div = document.createElement('div');
    div.className = 'diamond-card animate-on-scroll';
    div.innerHTML = `
        ${pkg.popular ? '<div class="popular-badge">MOST POPULAR</div>' : ''}
        <div class="diamond-icon">
            <i class="fas fa-gem"></i>
        </div>
        <div class="diamond-amount">${pkg.name}</div>
        <div class="diamond-price">${pkg.price} Tk</div>
        ${pkg.popular ? '<div class="save-badge">Best Value</div>' : ''}
        <button class="buy-btn" data-package="${pkg.name}" data-price="${pkg.price}" data-id="${pkg.id}">
            <i class="fas fa-bolt"></i> INSTANT BUY
        </button>
    `;
    
    const button = div.querySelector('.buy-btn');
    button.addEventListener('click', () => selectPackage(pkg));
    
    return div;
}

// Load Packages in Admin Panel
function loadAdminPackages() {
    loadAdminDiamondPackages();
    loadAdminWeeklyPackages();
    loadAdminEvoPackages();
}

function loadAdminDiamondPackages() {
    const container = document.getElementById('manageDiamondPackages');
    if (!container) return;
    
    container.innerHTML = '';
    
    packageData.diamond.forEach(pkg => {
        const packageElement = createAdminPackageElement(pkg);
        container.appendChild(packageElement);
    });
}

function loadAdminWeeklyPackages() {
    const container = document.getElementById('manageWeeklyPackages');
    if (!container) return;
    
    container.innerHTML = '';
    
    packageData.weekly.forEach(pkg => {
        const packageElement = createAdminPackageElement(pkg);
        container.appendChild(packageElement);
    });
}

function loadAdminEvoPackages() {
    const container = document.getElementById('manageEvoPackages');
    if (!container) return;
    
    container.innerHTML = '';
    
    packageData.evo.forEach(pkg => {
        const packageElement = createAdminPackageElement(pkg);
        container.appendChild(packageElement);
    });
}

// Create Package Element for Admin Panel
function createAdminPackageElement(pkg) {
    const div = document.createElement('div');
    div.className = 'package-item';
    div.innerHTML = `
        <div class="package-item-info">
            <h5>${pkg.name}</h5>
            <p>${pkg.price} Tk</p>
        </div>
        <div class="package-item-actions">
            <button class="btn-edit" onclick="editPackage(${pkg.id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-delete" onclick="deletePackage(${pkg.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return div;
}

// Package Management Functions
function addNewPackage(packageData) {
    // Generate new ID
    const newId = Math.max(...Object.values(packageData).flat().map(p => p.id)) + 1;
    
    const newPackage = {
        id: newId,
        name: packageData.name,
        price: parseInt(packageData.price),
        popular: packageData.popular || false,
        category: packageData.category
    };
    
    // Add to appropriate category
    if (packageData.category === 'diamond') {
        packageData.diamond.push(newPackage);
    } else if (packageData.category === 'weekly') {
        packageData.weekly.push(newPackage);
    } else if (packageData.category === 'evo') {
        packageData.evo.push(newPackage);
    }
    
    // Reload all packages
    loadPackages();
    showNotification('Package added successfully!', 'success');
}

function editPackage(packageId) {
    // Find package
    let packageToEdit = null;
    let category = null;
    
    for (const [cat, packages] of Object.entries(packageData)) {
        const found = packages.find(p => p.id === packageId);
        if (found) {
            packageToEdit = found;
            category = cat;
            break;
        }
    }
    
    if (!packageToEdit) return;
    
    // Show edit modal
    const newName = prompt('Enter new package name:', packageToEdit.name);
    if (!newName) return;
    
    const newPrice = prompt('Enter new price:', packageToEdit.price);
    if (!newPrice) return;
    
    // Update package
    packageToEdit.name = newName;
    packageToEdit.price = parseInt(newPrice);
    
    // Reload packages
    loadPackages();
    showNotification('Package updated successfully!', 'success');
}

function deletePackage(packageId) {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    // Remove from appropriate category
    for (const [category, packages] of Object.entries(packageData)) {
        const index = packages.findIndex(p => p.id === packageId);
        if (index !== -1) {
            packages.splice(index, 1);
            break;
        }
    }
    
    // Reload packages
    loadPackages();
    showNotification('Package deleted successfully!', 'success');
}

// Initialize packages when DOM is loaded
document.addEventListener('DOMContentLoaded', loadPackages);

// Export package data for use in app.js
window.packageData = packageData;