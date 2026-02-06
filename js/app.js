import { techniques } from '../data/content.js';
import { RevisionCard } from './components/RevisionCard.js';
import { ScheduleTable } from './components/ScheduleTable.js';

console.log("Brain-Buff Protocol Initiated...");

// DOM Elements
const soundBtn = document.getElementById('toggle-sound');
const deckContainer = document.getElementById('card-container');
let soundEnabled = true;

// 1. RENDER CARDS
function initDeck() {
    deckContainer.innerHTML = ''; // Clear loading text

    techniques.forEach(tech => {
        // Create the element
        const card = document.createElement('revision-card');
        
        // Pass data as a string attribute (so the component can read it)
        card.setAttribute('data-content', JSON.stringify(tech));
        
        // Accessibility: Make the card focusable
        card.setAttribute('tabindex', '0');

        deckContainer.appendChild(card);
    });
}

// 2. SETUP AUDIO (Simple Toggle for now)
soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? "SOUND: ON" : "SOUND: MUTE";
    soundBtn.setAttribute('aria-pressed', !soundEnabled);
});

// Run Initialization
initDeck();
