// Utility function: Capitalize the first letter of a string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Utility function: Parse a time string (HH:MM) into seconds, with validation
function parseTime(timeStr) {
    // Check format: must be HH:MM, both numeric, and valid ranges
    if (!/^\d{1,2}:\d{2}$/.test(timeStr)) return null;
    const [hrs, mins] = timeStr.split(':').map(Number);
    if (
        isNaN(hrs) || isNaN(mins) ||
        hrs < 0 || hrs > 23 ||
        mins < 0 || mins > 59
    ) {
        return null;
    }
    return hrs * 3600 + mins * 60;
}

// Utility function: Get the current time in seconds since midnight
function getCurrentTimeInSeconds() {
    const now = new Date();
    return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

// Utility function: Get chart colors based on theme
function getChartColors() {
    const isDark = document.body.classList.contains('dark-mode');
    return isDark
        ? ['#388e3c', '#6a1b9a', '#ffb300', '#1565c0'] // Darker palette for dark mode
        : ['#4caf50', '#9c27b0', '#ff9800', '#2196f3']; // Original colors for light mode
}

// Utility function: Safely access localStorage with error handling
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.error('localStorage setItem error:', e);
        alert('Unable to save data. Your browser storage may be full or restricted.');
    }
}
function safeGetItem(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.error('localStorage getItem error:', e);
        alert('Unable to load data. Your browser storage may be restricted.');
        return null;
    }
}
function safeClear() {
    try {
        localStorage.clear();
    } catch (e) {
        console.error('localStorage clear error:', e);
        alert('Unable to clear data. Your browser storage may be restricted.');
    }
}

let timers = { study: 0, productive: 0, rest: 0, sleep: 0 };
let currentMode = 'rest';
let startTime = Date.now();
let sleepStartTime = null;
let sleepEndTime = null;
let chart;
let tabInactiveTime = null;
let currentStudyTime = 0;
let maxStudyTime = parseInt(localStorage.getItem('maxStudyTime'), 10) || 0;
let animationFrameId; // To store requestAnimationFrame



window.addEventListener('beforeunload', () => {
    // Save the timestamp before leaving the page (for recovery)
    safeSetItem('lastActiveTime', Date.now().toString());
});

// Initialize the app on page load
// Set the initial theme on page load
window.onload = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const body = document.body;
    const themeButton = document.getElementById('toggle-theme');

    // Apply the saved theme
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeButton.textContent = 'Switch to Light Mode';
    } else {
        themeButton.textContent = 'Switch to Dark Mode';
    }

    loadSavedData();
    initializeChart();
    updateDisplay();
    setInterval(updateCurrentTime, 1000); // Update current time every second
    startTracking(); // Start accurate time tracking

    // Accessibility improvements
    document.getElementById('add-time-slot').setAttribute('aria-label', 'Add a new time slot for the selected activity');
    document.getElementById('add-time-slot').setAttribute('tabindex', '0');
    document.getElementById('clear-button').setAttribute('aria-label', 'Clear all activity data');
    document.getElementById('clear-button').setAttribute('tabindex', '0');
    document.getElementById('toggle-theme').setAttribute('aria-label', 'Toggle dark or light mode');
    document.getElementById('toggle-theme').setAttribute('tabindex', '0');
    document.getElementById('reset-max-study').setAttribute('aria-label', 'Reset maximum study time');
    document.getElementById('reset-max-study').setAttribute('tabindex', '0');
    // Add ARIA role and label to chart canvas
    const chartCanvas = document.getElementById('activity-chart');
    if (chartCanvas) {
        chartCanvas.setAttribute('role', 'img');
        chartCanvas.setAttribute('aria-label', 'Pie chart showing time spent on studying, productive time, resting, and sleeping');
    }

};

function startTracking() {
    // Only update timers and display every second for efficiency
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    setInterval(() => {
        updateTimers();
        updateDisplay();
    }, 1000); // 1 second interval
}

// Stop tracking when necessary (optional)
function stopTracking() {
    cancelAnimationFrame(animationFrameId);
}

// Function to update the current time display
function updateCurrentTime() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('current-time').innerText = formattedTime;
}


document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        recoverElapsedTime();
        startTime = Date.now(); // Reset start time to now after recovering
    } else {
        localStorage.setItem('lastActiveTime', Date.now().toString());
    }
});

// Recover elapsed time from last known active time
function recoverElapsedTime() {
    const lastActiveTime = parseInt(safeGetItem('lastActiveTime'), 10) || startTime;
    const now = Date.now();
    const elapsed = Math.floor((now - lastActiveTime) / 1000);

    if (elapsed > 0) {
        if (elapsed >= 28800) { // 8 hours
            const isNewDay = confirm('Is this a new day?');
            if (isNewDay) {
                timers = { study: 0, productive: 0, rest: 0, sleep: 0 };
                currentStudyTime = 0;
                maxStudyTime = 0;
                safeClear();
                startTime = Date.now();
                updateDisplay();
                return;
            }
        }
        if (elapsed > 10800 && currentMode !== 'rest') { // 3 hours, not rest
            const stillInMode = confirm(`Are you still ${capitalize(currentMode)}? Click OK to continue, Cancel to switch to Resting.`);
            if (!stillInMode) {
                timers.rest += elapsed;
                startTime = Date.now();
                currentMode = 'rest';
                saveModeData();
                updateDisplay();
                saveData();
                return;
            }
        }
        timers[currentMode] += elapsed;
        if (currentMode === 'study') {
            currentStudyTime += elapsed;
        }
        updateDisplay();
        saveData();
    }
}

function recoverStudyTime() {
    if (currentMode === 'study') {
        const savedStartTime = parseInt(localStorage.getItem('studyStartTime'), 10);
        if (savedStartTime) {
            const elapsed = Math.floor((Date.now() - savedStartTime) / 1000);
            currentStudyTime += elapsed;
            timers.study += elapsed; // Accumulate the study time correctly
        }
    }
}

// Start a specific mode and update UI immediately
function startMode(mode) {
    if (mode === currentMode) return; // Prevent switching to the same mode

    // Only check max study time when leaving study mode
    if (currentMode === 'study') {
        checkMaxStudyTime(); // Check if we broke the max
    }

    updateTimers(); // Ensure timers are updated before switching
    currentMode = mode;
    startTime = Date.now(); // Start tracking the new mode

    if (mode === 'study') {
        localStorage.setItem('studyStartTime', startTime); // Save study start time
    }

    currentStudyTime = 0; // Reset the current study session
    saveModeData();
    updateDisplay();
}

function recoverStudyTime() {
    if (currentMode === 'study') {
        const savedStartTime = parseInt(localStorage.getItem('studyStartTime'), 10);
        if (savedStartTime) {
            const elapsed = Math.floor((Date.now() - savedStartTime) / 1000);
            currentStudyTime += elapsed;
            timers.study += elapsed; // Accumulate the study time correctly
        }
    }
}

// Track time spent in the current mode
function updateTimers() {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000); // Calculate elapsed seconds

    if (elapsed > 0) {
        timers[currentMode] += elapsed; // Increment the correct mode timer

        if (currentMode === 'study') {
            currentStudyTime += elapsed; // Track current study time
        }

        startTime = now; // Reset start time for next calculation
    }
}



// Check if the current study session exceeds the max session
function checkMaxStudyTime() {
    if (currentStudyTime > maxStudyTime) {
        maxStudyTime = currentStudyTime;
        localStorage.setItem('maxStudyTime', maxStudyTime);
        celebrateMaxStudy(); // Trigger celebration
    }
}

// Trigger a celebration when the max study time is surpassed
function celebrateMaxStudy() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    alert("Congratulations! You've broken your longest study session!");
}

// Update the appearance based on study progress
function updateStudyAppearance() {
    const studyElement = document.getElementById('study-time');
    const percentage = (currentStudyTime / maxStudyTime) * 100;
    studyElement.style.color = percentage >= 80 ? '#FF9800' : ''; // Change color if close to max
}

// Log the time spent in the previous mode
function logTime() {
    updateTimers(); // Only update timers here
    // No need to increment timers again
    saveData();
}

// Save timers and mode to localStorage
function saveData() {
    // Save timers to localStorage with error handling
    safeSetItem('activityData', JSON.stringify(timers));
}

function saveModeData() {
    // Save mode and start time to localStorage with error handling
    safeSetItem('currentMode', currentMode);
    safeSetItem('startTime', startTime.toString());
}

// Update the display and chart with the latest values
function updateDisplay() {
    document.getElementById('current-mode').innerText = capitalize(currentMode);
    document.getElementById('study-time').innerText = formatTime(timers.study);
    document.getElementById('productive-time').innerText = formatTime(timers.productive); // New mode
    document.getElementById('rest-time').innerText = formatTime(timers.rest);
    document.getElementById('sleep-time').innerText = formatTime(timers.sleep);
    document.getElementById('current-study').innerText = `Current Study: ${formatTime(currentStudyTime)}`;
    document.getElementById('max-study').innerText = `Max Study: ${formatTime(maxStudyTime)}`;
    updateChart(); // Refresh the chart
}

// Format the time in h, m, s format
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}

// Initialize the Chart.js chart
function initializeChart() {
    // Destroy existing chart instance if it exists to prevent memory leaks
    if (chart) {
        chart.destroy();
    }
    const ctx = document.getElementById('activity-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Studying', 'Productive Time', 'Resting', 'Sleeping'],
            datasets: [{
                data: [timers.study, timers.productive, timers.rest, timers.sleep],
                backgroundColor: getChartColors()
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Time: ${formatTime(context.raw)}`;
                        }
                    }
                }
            }
        }});
}

// Update the chart with new data whenever needed
function updateChart() {
    chart.data.datasets[0].data = [timers.study, timers.productive, timers.rest, timers.sleep];
    chart.update();
}

// Set the sleep schedule and validate input

function addSleepTimeSlot() {
    const start = document.getElementById('time-start').value;
    const end = document.getElementById('time-end').value;
    const errorElement = document.getElementById('time-slot-error');

    if (!start || !end) {
        errorElement.textContent = "Please provide both start and end times.";
        return;
    }

    const parsedStart = parseTime(start);
    const parsedEnd = parseTime(end);
    if (parsedStart === null || parsedEnd === null) {
        errorElement.textContent = "Invalid time format. Please use HH:MM (00-23:59).";
        return;
    }

    let duration = parsedEnd - parsedStart;
    if (duration < 0) duration += 24 * 3600; // Overnight sleep

    // If sleep time has already been set, just add duration to sleep and subtract from rest
    if (timers.sleep > 0) {
        if (timers.rest < duration) {
            errorElement.textContent = "Not enough resting time to allocate to sleep.";
            return;
        }
        timers.sleep += duration;
        timers.rest = Math.max(0, timers.rest - duration);
        errorElement.textContent = "";
        saveData();
        updateDisplay();
        return;
    }

    // If sleep time has NOT been set, proceed as before
    sleepStartTime = parsedStart;
    sleepEndTime = parsedEnd;
    if (sleepEndTime <= sleepStartTime) {
        sleepEndTime += 24 * 3600;
    }
    errorElement.textContent = "";
    accumulateSleepAndRest();
}



// Accumulate sleep and rest time
function accumulateSleepAndRest() {
    const now = getCurrentTimeInSeconds(); // Current time in seconds since midnight

    let totalSleepTime;
    if (sleepEndTime < sleepStartTime) {
        // Handle overnight sleep (e.g., 11 PM - 7 AM)
        totalSleepTime = (24 * 3600 - sleepStartTime) + sleepEndTime;
    } else {
        totalSleepTime = sleepEndTime - sleepStartTime;
    }

    timers.sleep = totalSleepTime; // Set sleep time directly

    // Calculate rest time from sleep end till current time
    let restTime = 0;
    if (now > sleepEndTime) {
        restTime = now - sleepEndTime; // Rest time after sleep ends
    } else {
        restTime = (24 * 3600 - sleepEndTime) + now; // If current time is before sleepEnd (overnight rest)
    }

    timers.rest += restTime; // Accumulate rest time
    saveData();
    updateDisplay();
}



function addTimeSlot() {
    const mode = document.getElementById('mode-selector').value; // Get selected mode

    if (mode === 'sleep') {
        addSleepTimeSlot(); // Call the dedicated sleep function
    } else {
        addActivityTimeSlot(mode); // Handle study/productive modes
    }
}

function addActivityTimeSlot(mode) {
    const start = document.getElementById('time-start').value;
    const end = document.getElementById('time-end').value;
    const errorElement = document.getElementById('time-slot-error');

    if (!start || !end) {
        errorElement.textContent = "Please provide both start and end times.";
        return;
    }

    const startTime = parseTime(start);
    const endTime = parseTime(end);
    const nowInSeconds = getCurrentTimeInSeconds();

    if (startTime === null || endTime === null) {
        errorElement.textContent = "Invalid time format. Please use HH:MM (00-23:59).";
        return;
    }
    if (endTime <= startTime) {
        errorElement.textContent = "End time must be after start time.";
        return;
    }
    if (endTime > nowInSeconds) {
        errorElement.textContent = "The time slot cannot extend beyond the current time.";
        return;
    }
    if (startTime < sleepEndTime && endTime > sleepStartTime) {
        errorElement.textContent = `${capitalize(mode)} time cannot overlap with sleep.`;
        return;
    }

    const duration = endTime - startTime;

    if (timers.rest >= duration) {
        timers.rest -= duration;
        timers[mode] += duration;

        if (mode==='study'&&duration > maxStudyTime) {
            maxStudyTime = duration;
            localStorage.setItem('maxStudyTime', maxStudyTime);
            celebrateMaxStudy(); // Trigger celebration
        }

        errorElement.textContent = "";
        saveData();
        updateDisplay();
    } else {
        errorElement.textContent = "Not enough resting time to allocate.";
    }
}

// Event listeners: Grouped for clarity

document.getElementById('add-time-slot').addEventListener('click', function handleAddTimeSlotClick() {
    const addBtn = document.getElementById('add-time-slot');
    addBtn.disabled = true;
    const originalText = addBtn.textContent;
    addBtn.textContent = 'Adding...';
    setTimeout(() => { // Simulate async processing for UI feedback
        addTimeSlot();
        addBtn.disabled = false;
        addBtn.textContent = originalText;
    }, 200); // 200ms delay for user feedback
});

document.getElementById('clear-button').addEventListener('click', () => {
    timers = { study: 0, productive: 0, rest: 0, sleep: 0 };
    safeClear();
    startTime = Date.now();
    updateDisplay();
});

document.getElementById('toggle-theme').addEventListener('click', () => {
    const body = document.body;
    const themeButton = document.getElementById('toggle-theme');
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    safeSetItem('theme', isDark ? 'dark' : 'light');
    themeButton.textContent = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    // Update chart colors on theme change
    if (chart) {
        chart.data.datasets[0].backgroundColor = getChartColors();
        chart.update();
    }
});

document.getElementById('reset-max-study').addEventListener('click', () => {
    maxStudyTime = 0;
    safeSetItem('maxStudyTime', maxStudyTime);
    updateDisplay();
});

// Load saved data from localStorage, fallback to defaults if not found
function loadSavedData() {
    // Load saved data from localStorage, fallback to defaults if not found
    const savedData = JSON.parse(safeGetItem('activityData')) || { study: 0, productive: 0, rest: 0, sleep: 0 };
    const savedMode = safeGetItem('currentMode') || 'rest';
    const savedStartTime = parseInt(safeGetItem('startTime'), 10) || Date.now();

    timers = savedData;
    currentMode = savedMode;
    startTime = savedStartTime;

    recoverStudyTime(); // Only recover study time if needed
    // Do not increment timers here to avoid double counting
}

// Add "Now" button for manual time slot
window.addEventListener('DOMContentLoaded', () => {
    const endInput = document.getElementById('time-end');
    if (endInput && !document.getElementById('now-btn')) {
        const nowBtn = document.createElement('button');
        nowBtn.id = 'now-btn';
        nowBtn.type = 'button';
        nowBtn.textContent = 'Now';
        nowBtn.style.marginLeft = '8px';
        nowBtn.onclick = function() {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            endInput.value = `${hh}:${mm}`;
        };
        endInput.parentNode.insertBefore(nowBtn, endInput.nextSibling);
    }
});
