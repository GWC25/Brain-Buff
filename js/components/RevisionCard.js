export class RevisionCard extends HTMLElement {
    constructor() {
        super();
    }

    // This runs when the element is added to the HTML
    connectedCallback() {
        this.data = JSON.parse(this.getAttribute('data-content'));
        this.render();
        this.addEventListeners();
    }

    render() {
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
                           target="_blank" 
                           class="yt-link"
                           tabindex="-1">
                           ▶ Watch Tutorial
                        </a>
                    </div>

                </div>
            </div>
        `;
    }

    addEventListeners() {
        const cardObject = this.querySelector('.card-object');
        const starBtn = this.querySelector('.star-btn');
        const ytLink = this.querySelector('.yt-link');

        // 1. FLIP LOGIC (Click)
        this.addEventListener('click', (e) => {
            // Don't flip if clicking the star or the link
            if (e.target.closest('.star-btn') || e.target.closest('.yt-link')) return;
            this.toggleFlip(cardObject, ytLink);
        });

        // 2. KEYBOARD ACCESSIBILITY (Enter/Space)
        this.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleFlip(cardObject, ytLink);
            }
        });

        // 3. STAR LOGIC
        starBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop card from flipping
            starBtn.classList.toggle('active');
            // We will hook this up to the Favorites section in Phase 3
            console.log(`Starred: ${this.data.title}`); 
        });
    }

    toggleFlip(element, linkElement) {
        element.classList.toggle('is-flipped');
        
        const isFlipped = element.classList.contains('is-flipped');
        
        // Accessibility: Hide non-visible side from screen readers
        const front = this.querySelector('.card-front');
        const back = this.querySelector('.card-back');

        if (isFlipped) {
            front.setAttribute('aria-hidden', 'true');
            back.setAttribute('aria-hidden', 'false');
            linkElement.setAttribute('tabindex', '0'); // Make link clickable
            // TODO: Play "Flip" Sound here
        } else {
            front.setAttribute('aria-hidden', 'false');
            back.setAttribute('aria-hidden', 'true');
            linkElement.setAttribute('tabindex', '-1'); // Remove link from tab order
            // TODO: Play "Flip" Sound here
        }
    }
}

// Register the custom tag <revision-card>
customElements.define('revision-card', RevisionCard);
