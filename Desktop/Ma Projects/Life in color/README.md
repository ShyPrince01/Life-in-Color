# Life in Color 🎨

**Life in Color** is an interactive mood tracker that allows users to log their daily emotions, visualize their mood history over time, and gain insights into their emotional well-being. It transforms daily data into a colorful mosaic and statistical charts.

## ✨ Features

### Core Functionality
- **Mood Logging**: Select from Happy, Neutral, or Sad to log your mood for the day.
- **Interactive Grid**: A 7x7 grid (49 days) representing your mood history.
- **Visual Themes**: Switch between 'Default', 'Pastel', and 'Emoji' themes to customize the look.
- **Audio Feedback**: Unique sounds play based on the mood selected (High pitch for happy, low for sad).
- **Background Ambience**: Looping background music with a toggle button.

### Analytics & Insights
- **Weekly Stats**: Tracks the count of each mood and calculates the most common mood.
- **Chart.js Integration**: A doughnut chart visualizes the distribution of your moods.
- **AI Insights**: Basic algorithmic insights that analyze patterns (e.g., "You've been sadder on Mondays").
- **Gamification**: Earn badges (e.g., "Mood Master") and track streaks for consistent logging.

### Advanced Features
- **AI Mood Prediction**: Uses the device camera to "scan" your face and predict your mood (Simulated AI).
- **Calendar View**: A full calendar integration (FullCalendar) to see moods mapped to specific dates.
- **Social Sharing**: Export your entire mood dashboard (Grid, Chart, Stats) as an image to share with friends.
- **Reminders**: Browser notifications to remind you to log your mood.

## 🚀 How to Run

Since this is a static web application, you can run it by simply opening the `index.html` file in any modern web browser.

1. Clone or download the repository.
2. Open `index.html`.
3. Grant permissions for Camera and Notifications when prompted to use those specific features.
4. **Important**: Add an MP3 file named `bg-music.mp3` to the project root folder for the background music to work.

## 📂 Code Structure

### `index.html`
The main entry point. It sets up the basic DOM structure:
- `.container`: Wraps the main application content.
- `.mood-selector`: Buttons for manual mood input.
- `#mood-grid`: The main visual component for the mood history.
- `.stats`: Container for text-based statistics.

### `styles.css`
Contains the base styling for the application. Note that additional dynamic styling is injected via JavaScript for components like the splash screen and camera UI.

### `script.js`
The core logic of the application. It handles:

1.  **Initialization**:
    - Loads saved data from `localStorage`.
    - Injects external libraries (`Toastr`, `Chart.js`, `FullCalendar`, `html2canvas`).
    - Creates the dynamic UI controls.

2.  **Grid Management**:
    - `createGrid()`: Renders the 7x7 grid based on the `moods` array.
    - `setMood(index)`: Updates the state, saves to local storage, and triggers animations.

3.  **Features Implementation**:
    - **Themes**: managed via the `themes` object and applied during grid creation.
    - **Audio**: Uses the `AudioContext` API to generate oscillator sounds.
    - **Chart**: Renders a doughnut chart using `Chart.js`.
    - **Camera**: Uses `navigator.mediaDevices.getUserMedia` to access the webcam for the "Predict Mood" feature.
    - **Music**: Handles background audio looping and the mute toggle UI.
    - **Sharing**: Uses `html2canvas` to capture the `.container` element and download it as a PNG.

## 🛠 Dependencies

The project uses the following CDNs (injected dynamically):
- **Toastr.js**: For non-blocking notifications.
- **Chart.js**: For data visualization.
- **FullCalendar**: For the calendar view.
- **html2canvas**: For taking screenshots of the dashboard.

## 🤝 Contributing

Feel free to fork this project and submit pull requests. Suggestions for new themes or improved AI prediction algorithms are welcome!

---

*Paint Your World with Chaos!*