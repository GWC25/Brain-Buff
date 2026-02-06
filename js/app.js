import { techniques } from '../data/content.js';
import { RevisionCard } from './components/RevisionCard.js';
import { ScheduleTable } from './components/ScheduleTable.js';

console.log("Brain-Buff Protocol Initiated...");

// DOM Elements
const deckContainer = document.getElementById('card-container');      // Found on deck.html
const favContainer = document.getElementById('favorites-container');  // Found on favorites.html

// Function to create and append a card
function renderCard(tech, container) {
    const card = document.createElement('revision-card');
    card.setAttribute('data-content', JSON.stringify(tech));
    card.setAttribute('tabindex', '0');
    container.appendChild(card);
}

// MAIN LOGIC
function init() {
    
    // SCENARIO 1: WE ARE ON THE MAIN DECK PAGE
    if (deckContainer) {
        deckContainer.innerHTML = ''; 
        techniques.forEach(tech => {
            renderCard(tech, deckContainer);
        });
    }

    // SCENARIO 2: WE ARE ON THE FAVORITES PAGE
    if (favContainer) {
        favContainer.innerHTML = '';
        
        // 1. Get list of starred IDs
        const stars = JSON.parse(localStorage.getItem('brainBuff_stars') || '[]');

        // 2. Filter content based on stars
        const starredTechs = techniques.filter(tech => stars.includes(tech.id));

        // 3. Render or Show Empty State
        if (starredTechs.length > 0) {
            starredTechs.forEach(tech => {
                renderCard(tech, favContainer);
            });
        } else {
            favContainer.innerHTML = `
                <div class="empty-state">
                    <p>No favorites yet.</p>
                    <a href="deck.html" style="color:var(--neon-green)">Go to Deck ></a>
                </div>
            `;
        }
    }
}

// Run
init();
