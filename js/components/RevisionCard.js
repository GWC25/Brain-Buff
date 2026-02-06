export class RevisionCard extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.data = JSON.parse(this.getAttribute('data-content'));
        this.render();
        this.checkStarStatus(); // <--- NEW: Check memory on load
        this.addEventListeners();
    }

    render() {
        // ... (Keep your existing render HTML exactly the same) ...
        this.innerHTML = `
            <div class="card-scene">
                <div class="card-object">
                    <div class="card-face card-front">
                        <div class="card-header">
                            <span class="category-tag">${this.data.category}</span>
                            <button class="star-btn" aria-label="Star this technique">★</button>
                        </div>
                        <h3>${this.data.title}</h3>
                        <p>${this.data.frontSummary}</p>
                        <div class="hint-text">[ Click or Space to Flip ]</div>
                    </div>
                    <div class="card-face card-back" aria-hidden="true">
                        <h3>Why it works:</h3>
                        <p>${this.data.backDetails}</p>
                        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(this.data.youtubeQuery)}" 
                           target="_blank" class="yt-link" tabindex="-1">▶ Watch Tutorial</a>
                    </div>
                </div>
            </div>
        `;
    }

    // NEW: Check if this card ID is in localStorage
    checkStarStatus() {
        const stars = JSON.parse(localStorage.getItem('brainBuff_stars') || '[]');
        if (stars.includes(this.data.id)) {
            this.querySelector('.star-btn').classList.add('active');
        }
    }

    addEventListeners() {
        const cardObject = this.querySelector('.card-object');
        const starBtn = this.querySelector('.star-btn');
        const ytLink = this.querySelector('.yt-link');

        // 1. FLIP LOGIC
        this.addEventListener('click', (e) => {
            if (e.target.closest('.star-btn') || e.target.closest('.yt-link')) return;
            this.toggleFlip(cardObject, ytLink);
        });

        // 2. KEYBOARD FLIP
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleFlip(cardObject, ytLink);
            }
        });

        // 3. UPDATED STAR LOGIC
        starBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            this.toggleStar(starBtn);
        });
    }

    // NEW: Save/Remove from LocalStorage
    toggleStar(btn) {
        let stars = JSON.parse(localStorage.getItem('brainBuff_stars') || '[]');
        const id = this.data.id;

        if (stars.includes(id)) {
            // Remove it
            stars = stars.filter(s => s !== id);
            btn.classList.remove('active');
        } else {
            // Add it
            stars.push(id);
            btn.classList.add('active');
        }

        localStorage.setItem('brainBuff_stars', JSON.stringify(stars));
    }

    toggleFlip(element, linkElement) {
        element.classList.toggle('is-flipped');
        const isFlipped = element.classList.contains('is-flipped');
        const front = this.querySelector('.card-front');
        const back = this.querySelector('.card-back');

        if (isFlipped) {
            front.setAttribute('aria-hidden', 'true');
            back.setAttribute('aria-hidden', 'false');
            linkElement.setAttribute('tabindex', '0');
        } else {
            front.setAttribute('aria-hidden', 'false');
            back.setAttribute('aria-hidden', 'true');
            linkElement.setAttribute('tabindex', '-1');
        }
    }
}
customElements.define('revision-card', RevisionCard);
