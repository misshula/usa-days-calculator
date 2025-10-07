class USADaysCalculator {
    constructor() {
        this.usaDays = new Set();
        this.simulatedDate = null;
        this.isDragging = false;
        this.dragStartDay = null;
        this.dragMode = null; // 'select' or 'deselect'
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
        monthDiv.style.marginBottom = '15px';
        
        const monthTitle = document.createElement('h3');
        monthTitle.textContent = month.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
        monthTitle.style.margin = '0 0 8px 0';
        monthTitle.style.fontSize = '1em';
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

                dayDiv.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.startDrag(dateStr, dayDiv);
                });
                
                dayDiv.addEventListener('mouseenter', () => {
                    if (this.isDragging) {
                        this.handleDragOver(dateStr, dayDiv);
                    }
                });
                
                dayDiv.addEventListener('click', () => {
                    if (!this.isDragging) {
                        const input = document.getElementById('dateInput');
                        input.value = dateStr;
                        
                        if (this.usaDays.has(dateStr)) {
                            this.removeDay();
                        } else {
                            this.addDay();
                        }
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

    startDrag(dateStr, dayDiv) {
        this.isDragging = true;
        this.dragStartDay = dateStr;
        this.dragMode = this.usaDays.has(dateStr) ? 'deselect' : 'select';
        
        // Apply the drag action to the starting day
        const input = document.getElementById('dateInput');
        input.value = dateStr;
        
        if (this.dragMode === 'select') {
            this.addDay();
        } else {
            this.removeDay();
        }
    }

    handleDragOver(dateStr, dayDiv) {
        if (!this.isDragging) return;
        
        const input = document.getElementById('dateInput');
        input.value = dateStr;
        
        // Apply drag action based on drag mode
        const isCurrentlySelected = this.usaDays.has(dateStr);
        
        if (this.dragMode === 'select' && !isCurrentlySelected) {
            this.addDay();
        } else if (this.dragMode === 'deselect' && isCurrentlySelected) {
            this.removeDay();
        }
    }

    stopDrag() {
        this.isDragging = false;
        this.dragStartDay = null;
        this.dragMode = null;
    }
    
    showSaveConfirmation() {
        // Create or update save confirmation message
        let confirmDiv = document.getElementById('saveConfirmation');
        if (!confirmDiv) {
            confirmDiv = document.createElement('div');
            confirmDiv.id = 'saveConfirmation';
            confirmDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                z-index: 1000;
                font-weight: bold;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(confirmDiv);
        }
        
        const now = new Date().toLocaleString();
        confirmDiv.textContent = `✅ Saved at ${now}`;
        confirmDiv.style.opacity = '1';
        
        // Fade out after 3 seconds
        setTimeout(() => {
            confirmDiv.style.opacity = '0';
        }, 3000);
    }

    saveData() {
        const data = {
            usaDays: [...this.usaDays],
            simulatedDate: this.simulatedDate ? this.simulatedDate.toISOString() : null,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('usaCalculatorData', JSON.stringify(data));
        
        // Show save confirmation
        this.showSaveConfirmation();
    }

    loadData() {
        // Try new format first
        const savedData = localStorage.getItem('usaCalculatorData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.usaDays = new Set(data.usaDays || []);
                if (data.simulatedDate) {
                    this.simulatedDate = new Date(data.simulatedDate);
                }
                return;
            } catch (e) {
                console.warn('Failed to load new format data, trying legacy format');
            }
        }
        
        // Fallback to legacy format
        const legacySaved = localStorage.getItem('usaDays');
        if (legacySaved) {
            try {
                this.usaDays = new Set(JSON.parse(legacySaved));
            } catch (e) {
                console.warn('Failed to load legacy data');
            }
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

function saveData() {
    calculator.saveData();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    calculator = new USADaysCalculator();
    
    // Add global mouse event listeners for drag operations
    document.addEventListener('mouseup', () => {
        if (calculator && calculator.isDragging) {
            calculator.stopDrag();
        }
    });
    
    document.addEventListener('mouseleave', () => {
        if (calculator && calculator.isDragging) {
            calculator.stopDrag();
        }
    });
});