// Phase 1: Initialization
console.log("Brain-Buff Protocol Initiated...");

// DOM Elements
const soundBtn = document.getElementById('toggle-sound');
let soundEnabled = true;

// Basic Event Listeners (To test the UI)
soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? "SOUND: ON" : "SOUND: MUTE";
    soundBtn.setAttribute('aria-pressed', !soundEnabled);
    console.log(`Audio System: ${soundEnabled ? 'Active' : 'Disabled'}`);
});
