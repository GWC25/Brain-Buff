document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    
    // 1. Define the Menu Structure
    const navHTML = `
        <header class="app-header">
            <div class="logo">BRAIN_BUFF <span class="blink">_</span></div>
            <nav class="main-nav">
                <a href="index.html" id="link-home">START</a>
                <a href="deck.html" id="link-deck">DECK</a>
                <a href="favorites.html" id="link-fav">STARS</a>
                <a href="schedule.html" id="link-sched">PLAN</a>
            </nav>
            <div class="controls">
                <button id="toggle-sound" aria-label="Toggle Sound">SOUND: ON</button>
            </div>
        </header>
    `;

    // 2. Inject it at the top of the body
    body.insertAdjacentHTML('afterbegin', navHTML);

    // 3. Highlight the Active Page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const activeLink = document.querySelector(`.main-nav a[href="${currentPage}"]`);
    if (activeLink) {
        activeLink.classList.add('active-page');
    }

    // 4. Global Sound Toggle Logic (Persists via LocalStorage)
    const soundBtn = document.getElementById('toggle-sound');
    let soundState = localStorage.getItem('brainBuff_sound') !== 'false'; // Default to true

    function updateSoundUI() {
        soundBtn.textContent = soundState ? "SOUND: ON" : "SOUND: MUTE";
        soundBtn.classList.toggle('muted', !soundState);
    }

    soundBtn.addEventListener('click', () => {
        soundState = !soundState;
        localStorage.setItem('brainBuff_sound', soundState);
        updateSoundUI();
    });

    updateSoundUI();
});
