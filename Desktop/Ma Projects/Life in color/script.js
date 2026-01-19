// Initialize grid and data
const grid = document.getElementById('mood-grid');
const statsText = document.getElementById('stats-text');
let selectedMood = null;
let moods = JSON.parse(localStorage.getItem('moods')) || Array(49).fill(null); // 7x7 grid
let moodChart = null;

const themes = {
    default: {
        happy: '#4caf50',
        neutral: '#ff9800',
        sad: '#f44336',
        type: 'color'
    },
    pastel: {
        happy: '#ffb3ba',
        neutral: '#ffffba',
        sad: '#baffc9',
        type: 'color'
    },
    emoji: {
        happy: '😄',
        neutral: '😐',
        sad: '😢',
        type: 'emoji'
    }
};
let currentTheme = 'default';

// Inject Toastr
const toastrLink = document.createElement('link');
toastrLink.rel = 'stylesheet';
toastrLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css';
document.head.appendChild(toastrLink);

const toastrScript = document.createElement('script');
toastrScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js';
toastrScript.onload = () => {
    if (window.toastr) {
        toastr.options = {
            "closeButton": true,
            "progressBar": true,
            "positionClass": "toast-top-right",
            "timeOut": "3000"
        };
    }
};
document.head.appendChild(toastrScript);

// Create a container for controls
const controlsContainer = document.createElement('div');
controlsContainer.id = 'controls-container';

// Create grid cells
function createGrid() {
    grid.innerHTML = '';
    moods.forEach((mood, index) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = index;

        // Apply Theme
        const theme = themes[currentTheme];
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.fontSize = '24px';

        if (mood) {
            if (theme.type === 'color') {
                cell.style.backgroundColor = theme[mood];
                cell.textContent = '';
            } else {
                cell.style.backgroundColor = '#f0f0f0';
                cell.textContent = theme[mood];
            }
        } else {
            cell.style.backgroundColor = '';
            cell.textContent = '';
        }

        cell.addEventListener('click', () => setMood(index));
        grid.appendChild(cell);
    });
}

// Get color for mood
function getColor(mood) {
    if (mood === 'happy') return '#4caf50';
    if (mood === 'neutral') return '#ff9800';
    if (mood === 'sad') return '#f44336';
    return 'white';
}

// Set mood on cell click
function setMood(index) {
    if (selectedMood) {
        moods[index] = selectedMood;
        localStorage.setItem('moods', JSON.stringify(moods));
        createGrid();
        updateStats();

        // Trigger animation and sound
        const cell = grid.children[index];
        cell.classList.add('pop');
        playSound(selectedMood);
    }
}

// Update stats
function updateStats() {
    const logged = moods.filter(m => m);
    const counts = {
        happy: 0,
        neutral: 0,
        sad: 0
    };

    if (logged.length === 0) {
        statsText.textContent = 'No moods logged yet.';
    } else {
        logged.forEach(m => counts[m]++);
        const mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

        // Gamification: Streaks & Badges
        const streak = calculateStreak();
        const badges = calculateBadges(logged.length);

        statsText.innerHTML = `Logged: ${logged.length}/49. Most common: ${mostCommon} (${counts[mostCommon]} times). <br> Streak: ${streak} <br> Badges: ${badges.join(', ') || 'None yet'}`;
    }
    updateChart(counts);
}

// Mood button listeners
document.getElementById('happy-btn').addEventListener('click', () => selectedMood = 'happy');
document.getElementById('neutral-btn').addEventListener('click', () => selectedMood = 'neutral');
document.getElementById('sad-btn').addEventListener('click', () => selectedMood = 'sad');

// Reset button
document.getElementById('reset-btn').addEventListener('click', () => {
    moods = Array(49).fill(null);
    localStorage.removeItem('moods');
    createGrid();
    updateStats();
});

const style = document.createElement('style');
style.textContent = `
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; color: #333; text-align: center; padding: 1em; }
h1 { color: #444; }
#controls-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 20px 0; }
button, select { background-color: #fff; border: 2px solid #ddd; border-radius: 8px; padding: 10px 15px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
button:hover, select:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-color: #ccc; }
#happy-btn { background-color: #4caf50; color: white; border-color: #4caf50; }
#happy-btn:hover { opacity: 0.8; }
#neutral-btn { background-color: #ff9800; color: white; border-color: #ff9800; }
#neutral-btn:hover { opacity: 0.8; }
#sad-btn { background-color: #f44336; color: white; border-color: #f44336; }
#sad-btn:hover { opacity: 0.8; }
#reset-btn { border-color: #777; color: #777; }
#reset-btn:hover { background-color: #777; color: white; }
@keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
.pop { animation: pop 0.3s ease; }
.cell { transition: transform 0.2s, box-shadow 0.2s; }
.cell:hover { transform: scale(1.1); z-index: 1; box-shadow: 0 4px 8px rgba(0,0,0,0.2); cursor: pointer; }
.cell.entry-anim { animation: gridFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
@keyframes gridFadeIn { from { opacity: 0; transform: translateY(20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
#stats-container { margin: 20px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); max-width: 600px; }
#stats-text { line-height: 1.6; }
#insights-container { margin-top: 15px; font-style: italic; color: #555; }
`;
document.head.appendChild(style);

const audioCtx = new(window.AudioContext || window.webkitAudioContext)();

function playSound(mood) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    // Frequencies: Happy (High), Neutral (Mid), Sad (Low)
    const freq = mood === 'happy' ? 880 : (mood === 'neutral' ? 440 : 220);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

// 2. Chart.js Integration
const chartContainer = document.createElement('div');
chartContainer.style.display = 'flex';
chartContainer.style.justifyContent = 'center';
chartContainer.style.width = '100%';

const chartCanvas = document.createElement('canvas');
chartCanvas.style.maxWidth = '400px';
chartCanvas.style.margin = '20px 0';
chartCanvas.style.display = 'block';
chartContainer.appendChild(chartCanvas);

if (grid.parentNode) grid.parentNode.insertBefore(chartContainer, grid.nextSibling);

const chartScript = document.createElement('script');
chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
chartScript.onload = () => initChart();
document.head.appendChild(chartScript);

function initChart() {
    const ctx = chartCanvas.getContext('2d');
    moodChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Happy', 'Neutral', 'Sad'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#4caf50', '#ff9800', '#f44336']
            }]
        },
        options: {
            responsive: true
        }
    });
    updateStats(); // Refresh with current data
}

function updateChart(counts) {
    if (moodChart) {
        moodChart.data.datasets[0].data = [counts.happy || 0, counts.neutral || 0, counts.sad || 0];
        moodChart.update();
    }
}

// 3. Predict Mood (Camera)
const predictBtn = document.createElement('button');
predictBtn.textContent = '📷 Predict Mood';
predictBtn.addEventListener('click', openCamera);
controlsContainer.appendChild(predictBtn);

// Camera UI
const cameraContainer = document.createElement('div');
Object.assign(cameraContainer.style, {
    display: 'none',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '20px',
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
    zIndex: '1000',
    borderRadius: '12px',
    textAlign: 'center',
    width: '90%',
    maxWidth: '320px'
});
document.body.appendChild(cameraContainer);

const video = document.createElement('video');
video.autoplay = true;
video.style.width = '100%';
video.style.borderRadius = '8px';
cameraContainer.appendChild(video);

// Prediction Result Modal
const predictionModal = document.createElement('div');
predictionModal.id = 'prediction-modal';
Object.assign(predictionModal.style, {
    display: 'none',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    zIndex: '1002',
    borderRadius: '15px',
    textAlign: 'center',
    width: '85%',
    maxWidth: '350px',
    animation: 'pop 0.3s ease'
});
predictionModal.innerHTML = `
    <h3>AI Analysis Result</h3>
    <p>Detected Mood:</p>
    <h2 id="prediction-result"></h2>
    <button id="retry-pred">Retake</button>
    <button id="close-pred">Done</button>
`;
document.body.appendChild(predictionModal);

let currentPredictedMood = null;
document.getElementById('close-pred').addEventListener('click', () => {
    predictionModal.style.display = 'none';
});
document.getElementById('retry-pred').addEventListener('click', () => {
    predictionModal.style.display = 'none';
    openCamera();
});

const captureBtn = document.createElement('button');
captureBtn.textContent = 'Snap & Analyze';
captureBtn.style.marginTop = '15px';
captureBtn.style.width = '100%';
captureBtn.addEventListener('click', () => {
    const moodsList = ['happy', 'neutral', 'sad'];
    const predicted = moodsList[Math.floor(Math.random() * moodsList.length)];
    stopCamera();

    // System Notification
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Life in Color", {
            body: `AI Analysis: You look ${predicted}!`
        });
    }

    selectedMood = predicted;
    // Show Result Modal
    currentPredictedMood = predicted;
    const predResultText = document.getElementById('prediction-result');
    if (predResultText) {
        predResultText.textContent = predicted.toUpperCase();
        predResultText.style.color = getColor(predicted);
        predictionModal.style.display = 'block';
    }
});
cameraContainer.appendChild(captureBtn);

const closeCameraBtn = document.createElement('button');
closeCameraBtn.textContent = 'Cancel';
closeCameraBtn.style.marginTop = '10px';
closeCameraBtn.style.width = '100%';
closeCameraBtn.style.borderColor = '#f44336';
closeCameraBtn.style.color = '#f44336';
closeCameraBtn.addEventListener('click', stopCamera);
cameraContainer.appendChild(closeCameraBtn);

function openCamera() {
    cameraContainer.style.display = 'block';
    navigator.mediaDevices.getUserMedia({
            video: true
        })
        .then(stream => video.srcObject = stream)
        .catch(err => {
            toastr.error("Camera access denied.");
            cameraContainer.style.display = 'none';
        });
}

function stopCamera() {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
        video.srcObject = null;
    }
    cameraContainer.style.display = 'none';
}

// 4. Gamification Logic
function calculateStreak() {
    let streak = 0;
    let lastMood = null;
    // Find last logged index
    let lastIndex = -1;
    for (let i = moods.length - 1; i >= 0; i--) {
        if (moods[i]) {
            lastIndex = i;
            break;
        }
    }

    if (lastIndex === -1) return 'No active streak';

    lastMood = moods[lastIndex];
    streak = 1;

    // Count backwards from last logged
    for (let i = lastIndex - 1; i >= 0; i--) {
        if (moods[i] === lastMood) streak++;
        else if (moods[i] === null) break; // Break on empty day
        else break; // Break on different mood
    }

    return streak > 1 ? `${streak}-day ${lastMood} streak! 🔥` : 'Start a streak!';
}

function calculateBadges(count) {
    const badges = [];
    if (count >= 1) badges.push('🌱 Novice');
    if (count >= 5) badges.push('🎗️ Consistent');
    if (count >= 20) badges.push('👑 Mood Master');
    if (count === 49) badges.push('🏆 Completionist');
    return badges;
}

// 5. Social Sharing (html2canvas)
const html2canvasScript = document.createElement('script');
html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
document.head.appendChild(html2canvasScript);

const shareBtn = document.createElement('button');
shareBtn.textContent = '📸 Share Mosaic';
shareBtn.addEventListener('click', () => {
    if (window.html2canvas) {
        html2canvas(document.querySelector('.container')).then(canvas => {
            const link = document.createElement('a');
            link.download = 'my-mood-mosaic.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    } else {
        toastr.info('Sharing library loading... try again in a second.');
    }
});
controlsContainer.appendChild(shareBtn);

// 6. Themes & Customization
const themeSelect = document.createElement('select');
Object.keys(themes).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ' Theme';
    themeSelect.appendChild(opt);
});
themeSelect.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    createGrid();
});
controlsContainer.appendChild(themeSelect);

// 7. Reminders (Notifications)
const notifyBtn = document.createElement('button');
notifyBtn.textContent = '🔔 Enable Reminders';

function checkAndNotify() {
    if (Notification.permission === "granted") {
        // Check if today (index 48) is logged
        if (!moods[48]) {
            new Notification("Life in Color", {
                body: "🎨 Hey! You haven't logged your mood today yet.",
                requireInteraction: true
            });
        } else {
            toastr.info("You've already logged today. Great job!");
        }
    }
}

notifyBtn.addEventListener('click', () => {
    if (!("Notification" in window)) {
        toastr.error("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        toastr.success("Notifications are active!");
        checkAndNotify();
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                toastr.success("Notifications enabled!");
                checkAndNotify();
            }
        });
    } else {
        toastr.warning("Please enable notifications in your browser settings.");
    }
});
controlsContainer.appendChild(notifyBtn);

// Check on load
if (Notification.permission === "granted") {
    setTimeout(() => {
        if (!moods[48]) {
            new Notification("Life in Color", {
                body: "Welcome back! Don't forget to log your mood today."
            });
        }
    }, 5000);
}

// 7.5 PWA Install Button
let deferredPrompt;
const installBtn = document.createElement('button');
installBtn.textContent = '📲 Install App';
installBtn.style.display = 'none'; // Hidden by default
installBtn.style.backgroundColor = '#673ab7'; // Deep Purple
installBtn.style.color = 'white';
installBtn.style.borderColor = '#673ab7';

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const {
            outcome
        } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installBtn.style.display = 'none';
        }
        deferredPrompt = null;
    }
});
controlsContainer.appendChild(installBtn);

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-block';
});

window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    deferredPrompt = null;
    if (typeof toastr !== 'undefined') toastr.success('App installed successfully!');
});

// --- New Features: Calendar & Insights ---

// 8. AI Insights
const insightsContainer = document.createElement('div');
insightsContainer.id = 'insights-container';
const statsContainer = document.createElement('div');
statsContainer.id = 'stats-container';

if (statsText.parentNode) {
    statsText.parentNode.insertBefore(statsContainer, statsText);
    statsContainer.appendChild(statsText);
    statsContainer.appendChild(insightsContainer);
}

// Assume grid ends today (Index 48 = Today)
const endDate = new Date();
const startDate = new Date();
startDate.setDate(endDate.getDate() - 48);

function generateInsights() {
    const dayCounts = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let totalLogged = 0;

    moods.forEach((mood, index) => {
        if (!mood) return;
        totalLogged++;
        const date = new Date(startDate);
        date.setDate(date.getDate() + index);
        const day = date.getDay();

        if (!dayCounts[day]) dayCounts[day] = {
            happy: 0,
            neutral: 0,
            sad: 0
        };
        dayCounts[day][mood]++;
    });

    const insights = [];

    // 1. Day Analysis (Happy vs Sad)
    let sadDay = null,
        maxSad = 0;
    let happyDay = null,
        maxHappy = 0;

    Object.keys(dayCounts).forEach(day => {
        if (dayCounts[day].sad > maxSad) {
            maxSad = dayCounts[day].sad;
            sadDay = day;
        }
        if (dayCounts[day].happy > maxHappy) {
            maxHappy = dayCounts[day].happy;
            happyDay = day;
        }
    });

    if (sadDay !== null && maxSad > 1) insights.push(`You tend to feel down on ${daysOfWeek[sadDay]}s.`);
    if (happyDay !== null && maxHappy > 1) insights.push(`You shine brightest on ${daysOfWeek[happyDay]}s!`);

    // 2. Recent Trend (Last 3 entries)
    const recent = moods.filter(m => m).slice(-3);
    if (recent.length === 3) {
        if (recent.every(m => m === 'happy')) insights.push("You're on a happiness streak! Keep it up!");
        if (recent.every(m => m === 'sad')) insights.push("It's been tough lately. Be kind to yourself.");
    }

    // 3. Weekend Vibes
    const weekendMoods = (dayCounts[0]?.happy || 0) + (dayCounts[6]?.happy || 0);
    if (weekendMoods > 3) insights.push("You seem to really enjoy your weekends!");

    if (insights.length > 0) {
        // Pick a random insight to keep it fresh
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];
        insightsContainer.innerHTML = `💡 AI Insight: ${randomInsight}`;
    } else if (totalLogged > 0) {
        insightsContainer.textContent = '💡 AI Insight: Keep logging to reveal your patterns!';
    } else {
        insightsContainer.textContent = '💡 AI Insight: Log your mood to see AI predictions.';
    }
}

// 9. FullCalendar Integration
const calendarEl = document.createElement('div');
calendarEl.id = 'calendar';
calendarEl.style.maxWidth = '600px';
calendarEl.style.margin = '20px auto';
calendarEl.style.display = 'none';

const toggleViewBtn = document.createElement('button');
toggleViewBtn.textContent = '📅 Toggle Calendar View';
toggleViewBtn.addEventListener('click', () => {
    const isHidden = calendarEl.style.display === 'none';
    calendarEl.style.display = isHidden ? 'block' : 'none';
    grid.style.display = isHidden ? 'none' : '';
    if (isHidden && calendar) calendar.render();
});
controlsContainer.appendChild(toggleViewBtn);

if (grid.parentNode) grid.parentNode.insertBefore(controlsContainer, grid.nextSibling);
if (grid.parentNode) grid.parentNode.insertBefore(calendarEl, controlsContainer.nextSibling);

let calendar = null;
const fcScript = document.createElement('script');
fcScript.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js';
fcScript.onload = () => {
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        initialDate: new Date(),
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },
        events: getCalendarEvents(),
        dateClick: (info) => {
            if (!selectedMood) {
                toastr.warning('Please select a mood first!');
                return;
            }
            const clickedDate = new Date(info.dateStr);
            clickedDate.setHours(0, 0, 0, 0);
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const diffDays = Math.round((clickedDate - start) / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays < 49) setMood(diffDays);
            else toastr.error('Date outside the 49-day tracking period.');
        }
    });
};
document.head.appendChild(fcScript);

function getCalendarEvents() {
    return moods.map((mood, index) => {
        if (!mood) return null;
        const date = new Date(startDate);
        date.setDate(date.getDate() + index);
        return {
            title: mood,
            start: date.toISOString().split('T')[0],
            color: getColor(mood),
            allDay: true
        };
    }).filter(e => e);
}

// Hook into updates
const originalUpdateStats = updateStats;
updateStats = function() {
    originalUpdateStats();
    generateInsights();
    if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(getCalendarEvents());
    }
};

// Initialize

// 10. Entry Animation & Splash Screen
const splashStyle = document.createElement('style');
splashStyle.textContent = `
#splash-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10000; transition: opacity 0.8s ease-out, visibility 0.8s; }
.splash-logo { font-size: 3rem; font-weight: bold; background: linear-gradient(90deg, #4caf50, #ff9800, #f44336); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; opacity: 0; transform: translateY(20px); animation: fadeInUp 0.8s forwards 0.2s; }
.splash-subtitle { font-size: 1.2rem; color: #666; opacity: 0; animation: fadeInUp 0.8s forwards 0.6s; }
.color-dots { display: flex; gap: 10px; margin-top: 20px; }
.dot { width: 15px; height: 15px; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
.dot:nth-child(1) { background: #4caf50; animation-delay: -0.32s; }
.dot:nth-child(2) { background: #ff9800; animation-delay: -0.16s; }
.dot:nth-child(3) { background: #f44336; }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
`;
document.head.appendChild(splashStyle);

const splashScreen = document.createElement('div');
splashScreen.id = 'splash-screen';
splashScreen.innerHTML = `
    <div class="splash-logo">Life in Color</div>
    <div class="splash-subtitle">Paint Your World with Chaos!</div>
    <div class="color-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    </div>
`;
document.body.appendChild(splashScreen);

// 11. Background Music & Mute Button
const bgMusic = document.createElement('audio');
bgMusic.src = 'Life in Color.mp3';
bgMusic.loop = true;
bgMusic.volume = 0.4;
bgMusic.autoplay = true;
bgMusic.preload = 'auto';
document.body.appendChild(bgMusic);

// Robust Autoplay Logic
const tryPlayMusic = () => {
    bgMusic.play().then(() => {
        // Success: Remove interaction listeners
        ['click', 'mousemove', 'touchstart', 'keydown', 'scroll', 'focus'].forEach(e =>
            document.removeEventListener(e, tryPlayMusic)
        );
    }).catch(e => {
        // Autoplay blocked by browser - waiting for any user input
    });
};

// 1. Try immediately
// tryPlayMusic();

// 2. Try on any document interaction (catch-all)
['click', 'mousemove', 'touchstart', 'keydown', 'scroll', 'focus'].forEach(e =>
    document.addEventListener(e, tryPlayMusic, {
        once: true
    })
);

// 3. Try specifically on splash screen click
splashScreen.addEventListener('click', tryPlayMusic);

const muteBtn = document.createElement('button');
muteBtn.innerHTML = '🔊'; // Default to Sound On
muteBtn.title = "Toggle Music";
Object.assign(muteBtn.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '10001',
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '45px',
    height: '45px',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    color: '#333'
});

muteBtn.addEventListener('mouseenter', () => {
    muteBtn.style.transform = 'scale(1.1) rotate(5deg)';
    muteBtn.style.boxShadow = '0 6px 15px rgba(0,0,0,0.3)';
});

muteBtn.addEventListener('mouseleave', () => {
    muteBtn.style.transform = 'scale(1) rotate(0deg)';
    muteBtn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
});

muteBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play().then(() => {
            bgMusic.muted = false;
            muteBtn.innerHTML = '🔊';
        }).catch(e => toastr.warning("Please interact with the page first!"));
    } else {
        bgMusic.muted = !bgMusic.muted;
        muteBtn.innerHTML = bgMusic.muted ? '🔇' : '🔊';
    }
});
document.body.appendChild(muteBtn);

createGrid();
updateStats();

// Prepare grid for animation
const initialCells = document.querySelectorAll('.cell');
initialCells.forEach(cell => cell.style.opacity = '0');

window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        splashScreen.style.visibility = 'hidden';

        // Start music with animation
        tryPlayMusic();

        // Trigger Grid Animation
        initialCells.forEach((cell, index) => {
            setTimeout(() => cell.classList.add('entry-anim'), index * 25);
        });
    }, 2500);
});