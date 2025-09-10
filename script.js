class USADaysCalculator {
    constructor() {
        this.usaDays = new Set();
        this.simulatedDate = null;
        this.loadData();
        this.init();
    }

    init() {
        const today = this.getCurrentDate();
        document.getElementById('dateInput').value = today.toISOString().split('T')[0];
        document.getElementById('simulatedDate').value = today.toISOString().split('T')[0];
        this.updateSimulationStatus();
        this.updateDisplay();
        this.renderCalendar();
    }

    addDay() {
        const dateInput = document.getElementById('dateInput');
        const date = dateInput.value;
        if (date) {
            this.usaDays.add(date);
            this.saveData();
            this.updateDisplay();
            this.renderCalendar();
        }
    }

    removeDay() {
        const dateInput = document.getElementById('dateInput');
        const date = dateInput.value;
        if (date && this.usaDays.has(date)) {
            this.usaDays.delete(date);
            this.saveData();
            this.updateDisplay();
            this.renderCalendar();
        }
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all USA days?')) {
            this.usaDays.clear();
            this.saveData();
            this.updateDisplay();
            this.renderCalendar();
        }
    }

    getCurrentDate() {
        return this.simulatedDate ? new Date(this.simulatedDate) : new Date();
    }

    setSimulatedDate(dateStr) {
        this.simulatedDate = dateStr ? new Date(dateStr) : null;
        this.updateSimulationStatus();
        this.updateDisplay();
        this.renderCalendar();
    }

    updateSimulationStatus() {
        const statusElement = document.getElementById('simulationStatus');
        if (this.simulatedDate) {
            const dateStr = this.simulatedDate.toLocaleDateString('en-US');
            statusElement.textContent = `Simulating: ${dateStr}`;
        } else {
            statusElement.textContent = 'Using actual current date';
        }
    }

    loadSampleData() {
        const today = this.getCurrentDate();
        const sampleDays = [];
        
        // Add some scattered days over the past year
        for (let i = 0; i < 120; i++) {
            const randomDaysAgo = Math.floor(Math.random() * 365);
            const date = new Date(today);
            date.setDate(date.getDate() - randomDaysAgo);
            sampleDays.push(date.toISOString().split('T')[0]);
        }
        
        sampleDays.forEach(day => this.usaDays.add(day));
        this.saveData();
        this.updateDisplay();
        this.renderCalendar();
    }

    getDaysInRollingWindow(referenceDate = new Date()) {
        const windowStart = new Date(referenceDate);
        windowStart.setDate(windowStart.getDate() - 364); // 365 days total including today
        
        const daysInWindow = [];
        
        for (const dayStr of this.usaDays) {
            const day = new Date(dayStr);
            if (day >= windowStart && day <= referenceDate) {
                daysInWindow.push(dayStr);
            }
        }
        
        return daysInWindow.sort();
    }

    getNextRollOffDate() {
        const today = this.getCurrentDate();
        const daysInWindow = this.getDaysInRollingWindow(today);
        
        if (daysInWindow.length === 0) return null;
        
        const oldestDay = new Date(daysInWindow[0]);
        const rollOffDate = new Date(oldestDay);
        rollOffDate.setDate(rollOffDate.getDate() + 365);
        
        return rollOffDate;
    }

    updateDisplay() {
        const today = this.getCurrentDate();
        const daysInWindow = this.getDaysInRollingWindow(today);
        const totalDays = this.usaDays.size;
        const remaining = Math.max(0, 365 - daysInWindow.length);
        const nextRollOff = this.getNextRollOffDate();
        
        document.getElementById('daysInWindow').textContent = daysInWindow.length;
        document.getElementById('daysRemaining').textContent = remaining;
        document.getElementById('totalDays').textContent = totalDays;
        
        if (nextRollOff) {
            const daysUntilRollOff = Math.ceil((nextRollOff - today) / (1000 * 60 * 60 * 24));
            document.getElementById('nextRollOff').textContent = daysUntilRollOff > 0 ? 
                `${daysUntilRollOff} days` : 'Today';
        } else {
            document.getElementById('nextRollOff').textContent = '-';
        }

        // Update timeline bar
        const percentage = (daysInWindow.length / 365) * 100;
        document.getElementById('timelineFill').style.width = `${percentage}%`;
    }

    renderCalendar() {
        const calendarDiv = document.getElementById('calendar');
        calendarDiv.innerHTML = '';

        // Create a 24-month calendar view (today-year to today+year)
        const today = this.getCurrentDate();
        
        for (let monthOffset = -12; monthOffset <= 11; monthOffset++) {
            const month = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
            const monthDiv = this.createMonthCalendar(month);
            calendarDiv.appendChild(monthDiv);
        }
    }

    createMonthCalendar(month) {
        const monthDiv = document.createElement('div');
        monthDiv.style.marginBottom = '20px';
        
        const monthTitle = document.createElement('h3');
        monthTitle.textContent = month.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
        monthTitle.style.margin = '0 0 10px 0';
        monthDiv.appendChild(monthTitle);

        const calendar = document.createElement('div');
        calendar.className = 'calendar';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.textContent = day;
            header.style.fontWeight = 'bold';
            header.style.backgroundColor = '#e9ecef';
            header.className = 'calendar-day';
            calendar.appendChild(header);
        });

        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const today = this.getCurrentDate();
        today.setHours(0, 0, 0, 0);

        for (let date = new Date(startDate); date <= lastDay || date.getDay() !== 0; date.setDate(date.getDate() + 1)) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            
            if (date.getMonth() === month.getMonth()) {
                dayDiv.textContent = date.getDate();
                
                const dateStr = date.toISOString().split('T')[0];
                
                if (this.usaDays.has(dateStr)) {
                    dayDiv.classList.add('usa-day');
                }
                
                if (date.getTime() === today.getTime()) {
                    dayDiv.classList.add('today');
                }

                dayDiv.addEventListener('click', () => {
                    const input = document.getElementById('dateInput');
                    input.value = dateStr;
                    
                    if (this.usaDays.has(dateStr)) {
                        this.removeDay();
                    } else {
                        this.addDay();
                    }
                });
            } else {
                dayDiv.style.color = '#ccc';
                dayDiv.textContent = date.getDate();
            }
            
            calendar.appendChild(dayDiv);
        }

        monthDiv.appendChild(calendar);
        return monthDiv;
    }

    saveData() {
        localStorage.setItem('usaDays', JSON.stringify([...this.usaDays]));
    }

    loadData() {
        const saved = localStorage.getItem('usaDays');
        if (saved) {
            this.usaDays = new Set(JSON.parse(saved));
        }
    }
}

// Global functions for HTML buttons
let calculator;

function addDay() {
    calculator.addDay();
}

function removeDay() {
    calculator.removeDay();
}

function clearAll() {
    calculator.clearAll();
}

function loadSampleData() {
    calculator.loadSampleData();
}

function setSimulatedDate() {
    const simulatedDateInput = document.getElementById('simulatedDate');
    calculator.setSimulatedDate(simulatedDateInput.value);
}

function resetToActualToday() {
    calculator.setSimulatedDate(null);
    const actualToday = new Date().toISOString().split('T')[0];
    document.getElementById('simulatedDate').value = actualToday;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    calculator = new USADaysCalculator();
});