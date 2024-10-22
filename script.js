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
    localStorage.setItem('lastActiveTime', Date.now().toString()); // Save the timestamp
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

};

function startTracking() {
    function track() {
        updateTimers(); // Update timers with accurate elapsed time
        updateDisplay(); // Update the display in real-time
        animationFrameId = requestAnimationFrame(track); // Keep tracking
    }
    track(); // Start tracking immediately
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
        recoverElapsedTime(); // Recover time when the tab becomes visible
        startTracking(); // Resume tracking
    } else {
        stopTracking(); // Stop tracking when the tab becomes hidden
    }
});

// Recover elapsed time from last known active time
function recoverElapsedTime() {
    const lastActiveTime = parseInt(localStorage.getItem('lastActiveTime'), 10) || startTime;
    const now = Date.now();
    const elapsed = Math.floor((now - lastActiveTime) / 1000); // Calculate elapsed time

    if (elapsed > 0) {
        timers[currentMode] += elapsed; // Increment the correct mode timer

        if (currentMode === 'study') {
            currentStudyTime += elapsed; // Track current study time
        }

        startTime = now; // Reset the start time
        saveData(); // Save the updated data
        updateDisplay(); // Refresh the UI
    }
}



// Load saved data from localStorage
function loadSavedData() {
    const savedData = JSON.parse(localStorage.getItem('activityData')) || { study: 0, productive: 0, rest: 0, sleep: 0 };
    const savedMode = localStorage.getItem('currentMode') || 'rest';
    const savedStartTime = parseInt(localStorage.getItem('startTime'), 10) || Date.now();

    timers = savedData;
    currentMode = savedMode;
    startTime = savedStartTime;

    recoverStudyTime(); // Recover study time without duplicate increment

    // We no longer increment timers here to prevent double counting
    startTime = Date.now(); // Reset start time to now
    saveData(); // Save data without adding extra time
}

// Start a specific mode and update UI immediately
function startMode(mode) {
    if (mode === currentMode) return; // Prevent switching to the same mode

    if (currentMode === 'study') {
        checkMaxStudyTime(); // Check if we broke the max
    }

    logTime(); // Log time for the previous mode
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
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);

    if (elapsed > 0) {
        timers[currentMode] += elapsed;
        if (currentMode === 'study') {
            currentStudyTime += elapsed;
        }
    }

    startTime = Date.now(); // Reset start time for new mode
    saveData();
}

// Save timers and mode to localStorage
function saveData() {
    localStorage.setItem('activityData', JSON.stringify(timers));
}

function saveModeData() {
    localStorage.setItem('currentMode', currentMode);
    localStorage.setItem('startTime', startTime.toString());
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
    const ctx = document.getElementById('activity-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Studying', 'Productive Time', 'Resting', 'Sleeping'],
            datasets: [{
                data: [timers.study, timers.productive, timers.rest, timers.sleep],
                backgroundColor: ['#4caf50', '#9c27b0', '#ff9800', '#2196f3']
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
        }
    });
}

// Update the chart with new data whenever needed
function updateChart() {
    chart.data.datasets[0].data = [timers.study, timers.productive, timers.rest, timers.sleep];
    chart.update();
}

// Set the sleep schedule and validate input
document.getElementById('set-sleep-schedule').addEventListener('click', () => {
    const start = document.getElementById('sleep-start').value;
    const end = document.getElementById('sleep-end').value;
    const errorElement = document.getElementById('sleep-schedule-error');

    if (!start || !end) {
        errorElement.textContent = "Please provide both start and end times.";
        return;
    }

    sleepStartTime = parseTime(start);
    sleepEndTime = parseTime(end);

    // Allow for overnight sleep periods (e.g., 11:00 PM - 6:00 AM)
    if (sleepEndTime <= sleepStartTime) {
        sleepEndTime += 24 * 3600; // Add 24 hours to the end time to handle overnight
    }

    errorElement.textContent = "";
    accumulateSleepAndRest();
});


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



// Add a manual study slot
document.getElementById('add-study-slot').addEventListener('click', addManualStudySlot);

function addManualStudySlot() {
    const start = document.getElementById('manual-study-start').value;
    const end = document.getElementById('manual-study-end').value;
    const errorElement = document.getElementById('manual-study-error');

    if (!start || !end) {
        errorElement.textContent = "Please provide both start and end times.";
        return;
    }

    const studyStartTime = parseTime(start);
    const studyEndTime = parseTime(end);
    const nowInSeconds = getCurrentTimeInSeconds();

    if (studyEndTime <= studyStartTime) {
        errorElement.textContent = "End time must be after start time.";
        return;
    }

    if (studyEndTime > nowInSeconds) {
        errorElement.textContent = "The study slot cannot extend beyond the current time.";
        return;
    }

    const studyDuration = studyEndTime - studyStartTime;

    if (timers.rest >= studyDuration) {
        timers.rest -= studyDuration;
        timers.study += studyDuration;

        // Compare with max study session and update if needed
        if (studyDuration > maxStudyTime) {
            maxStudyTime = studyDuration;
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

// Parse a time string (HH:MM) into seconds
function parseTime(timeStr) {
    const [hrs, mins] = timeStr.split(':').map(Number);
    return hrs * 3600 + mins * 60;
}

// Get the current time in seconds since midnight
function getCurrentTimeInSeconds() {
    const now = new Date();
    return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

// Capitalize the first letter of a string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Clear all data
document.getElementById('clear-button').addEventListener('click', () => {
    timers = { study: 0, productive: 0, rest: 0, sleep: 0 };
    localStorage.clear();
    startTime = Date.now();
    updateDisplay();
});

// Handle dark mode toggle
// Handle dark mode toggle
document.getElementById('toggle-theme').addEventListener('click', () => {
    const body = document.body;
    const themeButton = document.getElementById('toggle-theme');

    // Toggle the 'dark-mode' class on the body
    body.classList.toggle('dark-mode');

    // Update the button text based on the new theme
    if (body.classList.contains('dark-mode')) {
        themeButton.textContent = 'Switch to Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        themeButton.textContent = 'Switch to Dark Mode';
        localStorage.setItem('theme', 'light');
    }
});


// Reset max study time and update display
document.getElementById('reset-max-study').addEventListener('click', () => {
    maxStudyTime = 0;
    localStorage.setItem('maxStudyTime', maxStudyTime);
    updateDisplay();
});
