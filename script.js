// Store appliances data
let appliances = [];
const ELECTRICITY_RATE = 8; // Cost per kWh in Indian Rupees (₹)

// Initialize Chart.js
let consumptionChart;

function initChart() {
    const ctx = document.getElementById('consumptionChart').getContext('2d');
    consumptionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#2196F3', '#4CAF50', '#FFC107', '#F44336',
                    '#9C27B0', '#FF5722', '#795548', '#607D8B'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: 'Energy Consumption Distribution'
                }
            }
        }
    });
}

// Function to add a new appliance with animation
function addAppliance() {
    const name = document.getElementById('applianceName').value;
    const power = parseFloat(document.getElementById('powerRating').value);
    const hours = parseFloat(document.getElementById('hoursUsed').value);

    if (!name || !power || !hours) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (hours > 24) {
        showNotification('Hours per day cannot exceed 24', 'error');
        return;
    }

    const appliance = {
        id: Date.now(),
        name: name,
        power: power,
        hours: hours,
        dailyKWh: (power * hours) / 1000, // Convert Wh to kWh
        dailyCost: ((power * hours) / 1000) * ELECTRICITY_RATE
    };

    appliances.push(appliance);
    updateAppliancesList();
    clearForm();
    calculateTotalConsumption();
    updateChart();
    showNotification('Appliance added successfully!', 'success');
}

// Function to show notifications
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Function to clear the input form
function clearForm() {
    document.getElementById('applianceName').value = '';
    document.getElementById('powerRating').value = '';
    document.getElementById('hoursUsed').value = '';
}

// Function to delete an appliance with animation
function deleteAppliance(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    row.classList.add('fade-out');
    
    setTimeout(() => {
        appliances = appliances.filter(appliance => appliance.id !== id);
        updateAppliancesList();
        calculateTotalConsumption();
        updateChart();
        showNotification('Appliance removed', 'success');
    }, 300);
}

// Function to update the appliances list in the table
function updateAppliancesList() {
    const tableBody = document.getElementById('appliancesList');
    tableBody.innerHTML = '';

    appliances.forEach(appliance => {
        const row = document.createElement('tr');
        row.dataset.id = appliance.id;
        row.innerHTML = `
            <td>${appliance.name}</td>
            <td>${appliance.power.toFixed(1)}</td>
            <td>${appliance.hours.toFixed(1)}</td>
            <td>${appliance.dailyKWh.toFixed(2)}</td>
            <td>₹${appliance.dailyCost.toFixed(2)}</td>
            <td>
                <button class="delete-btn" onclick="deleteAppliance(${appliance.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to calculate total consumption and cost with animation
function calculateTotalConsumption() {
    const totalEnergy = appliances.reduce((sum, app) => sum + app.dailyKWh, 0);
    const totalCost = totalEnergy * ELECTRICITY_RATE;

    animateValue('totalEnergy', totalEnergy);
    animateValue('estimatedCost', totalCost, true);
}

// Function to animate value changes
function animateValue(elementId, value, isCurrency = false) {
    const element = document.getElementById(elementId);
    const start = parseFloat(element.textContent.replace('₹', ''));
    const duration = 1000;
    const steps = 60;
    const increment = (value - start) / steps;
    let current = start;
    let step = 0;

    const animation = setInterval(() => {
        current += increment;
        step++;
        
        if (step >= steps) {
            current = value;
            clearInterval(animation);
        }
        
        element.textContent = isCurrency 
            ? '₹' + current.toFixed(2)
            : current.toFixed(2);
    }, duration / steps);
}

// Function to update the chart
function updateChart() {
    const labels = appliances.map(app => app.name);
    const data = appliances.map(app => app.dailyKWh);

    consumptionChart.data.labels = labels;
    consumptionChart.data.datasets[0].data = data;
    consumptionChart.update();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    updateAppliancesList();
    calculateTotalConsumption();
});
