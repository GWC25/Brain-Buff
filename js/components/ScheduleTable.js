export class ScheduleTable extends HTMLElement {
    constructor() {
        super();
        // Days of the week
        this.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        // Hours: 6am (6) to 10pm (22)
        this.startHour = 6;
        this.endHour = 22;
        this.storageKey = 'brainBuff_schedule';
    }

    connectedCallback() {
        this.loadData();
        this.render();
        this.setupEventListeners();
        this.setupViewFilters();
    }

    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        this.tasks = saved ? JSON.parse(saved) : {};
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }

    render() {
        // Create the Grid Container
        const grid = document.createElement('div');
        grid.className = 'schedule-grid';
        grid.id = 'main-grid';

        // 1. HEADER ROW (Empty corner + Days)
        grid.appendChild(this.createCell('div', 'header-cell', 'TIME'));
        this.days.forEach((day, index) => {
            const cell = this.createCell('div', `header-cell day-${index}`, day);
            cell.setAttribute('data-day-index', index);
            grid.appendChild(cell);
        });

        // 2. TIME ROWS
        for (let hour = this.startHour; hour <= this.endHour; hour++) {
            // Time Label (e.g., "06:00")
            const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
            grid.appendChild(this.createCell('div', 'time-cell', timeLabel));

            // Task Slots for each day
            this.days.forEach((day, dayIndex) => {
                const slotId = `${day}-${hour}`; // e.g., "Mon-6"
                const taskContent = this.tasks[slotId] || "";
                const isComplete = this.tasks[`${slotId}_status`] === 'done';

                const slot = document.createElement('div');
                slot.className = `task-slot day-${dayIndex}`;
                if (isComplete) slot.classList.add('is-complete');
                
                // Content Attributes
                slot.setAttribute('data-id', slotId);
                slot.setAttribute('contenteditable', 'true'); // Allow typing
                slot.setAttribute('draggable', 'true');       // Allow dragging
                slot.textContent = taskContent;

                // Event Listeners for this specific slot
                this.attachSlotEvents(slot);

                grid.appendChild(slot);
            });
        }

        this.innerHTML = '';
        this.appendChild(grid);
    }

    createCell(type, className, text) {
        const el = document.createElement(type);
        el.className = className;
        el.textContent = text;
        return el;
    }

    attachSlotEvents(slot) {
        const id = slot.getAttribute('data-id');

        // 1. SAVE ON BLUR (When user stops typing)
        slot.addEventListener('blur', () => {
            this.tasks[id] = slot.textContent;
            this.saveData();
        });

        // 2. DOUBLE CLICK TO COMPLETE
        slot.addEventListener('dblclick', () => {
            slot.classList.toggle('is-complete');
            if (slot.classList.contains('is-complete')) {
                this.tasks[`${id}_status`] = 'done';
                this.playGraffitiSound();
            } else {
                delete this.tasks[`${id}_status`];
            }
            this.saveData();
        });

        // 3. DRAG START
        slot.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', id); // Carry the ID
            e.dataTransfer.effectAllowed = 'move';
            slot.classList.add('dragging');
        });

        // 4. DRAG END
        slot.addEventListener('dragend', () => {
            slot.classList.remove('dragging');
            document.querySelectorAll('.task-slot').forEach(s => s.classList.remove('drag-over'));
        });

        // 5. DRAG OVER (Allow Dropping)
        slot.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow dropping
            e.dataTransfer.dropEffect = 'move';
            slot.classList.add('drag-over');
        });

        // 6. DRAG LEAVE
        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        // 7. DROP
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            const sourceId = e.dataTransfer.getData('text/plain');
            const sourceSlot = this.querySelector(`[data-id="${sourceId}"]`);
            
            // Move text
            if (sourceSlot && sourceSlot !== slot) {
                const textToMove = sourceSlot.textContent;
                
                // Update UI
                slot.textContent = textToMove;
                sourceSlot.textContent = '';
                
                // Update Data
                this.tasks[id] = textToMove;
                this.tasks[sourceId] = '';
                
                // Handle Completion Status (Reset on move usually, or move status too? Let's reset)
                slot.classList.remove('is-complete');
                delete this.tasks[`${id}_status`];

                this.saveData();
            }
            slot.classList.remove('drag-over');
        });
    }

    playGraffitiSound() {
        // Simple check if sound is enabled in localStorage
        if (localStorage.getItem('brainBuff_sound') !== 'false') {
             // Create a temporary oscillator or play a file
             // For this standalone, we'll just log it to avoid missing asset errors
             console.log("🔊 Pschhh! (Graffiti Sound)");
        }
    }

    setupViewFilters() {
        // This is handled by external buttons in schedule.html
        // We look for them in the global document
        const btnWeek = document.getElementById('view-week');
        const btn3Day = document.getElementById('view-3day');
        const btnToday = document.getElementById('view-today');
        const grid = this.querySelector('#main-grid');

        const resetViews = () => {
            grid.className = 'schedule-grid'; // Reset classes
            [btnWeek, btn3Day, btnToday].forEach(b => b?.classList.remove('active-view'));
        };

        if(btnWeek) btnWeek.onclick = () => {
            resetViews();
            btnWeek.classList.add('active-view');
            // CSS Grid defaults to week, no extra class needed
        };

        if(btn3Day) btn3Day.onclick = () => {
            resetViews();
            btn3Day.classList.add('active-view');
            grid.classList.add('view-3day');
            this.applyColumnHiding(3);
        };

        if(btnToday) btnToday.onclick = () => {
            resetViews();
            btnToday.classList.add('active-view');
            grid.classList.add('view-today');
            this.applyColumnHiding(1);
        };
    }

    applyColumnHiding(daysToShow) {
        // Logic to set display:none on specific columns based on current day
        // For simplified MVP: We just rely on CSS Grid classes defined in style.css
        // To make this truly dynamic (showing "Today"), we would need JS to calculate the current day index
        // and add a class like .hide-others to the non-current days.
        
        const todayIndex = new Date().getDay() - 1; // 0 = Mon, 6 = Sun
        // (Adjusting JS Day 0=Sun to our 0=Mon)
        
        const correctedToday = todayIndex < 0 ? 6 : todayIndex;

        const allSlots = this.querySelectorAll('.task-slot, .header-cell');
        
        allSlots.forEach(slot => {
            slot.style.display = ''; // Reset
            
            // If it's a day-specific slot
            let slotDayClass = Array.from(slot.classList).find(c => c.startsWith('day-'));
            if (slotDayClass) {
                const slotIndex = parseInt(slotDayClass.split('-')[1]);
                
                if (daysToShow === 1) {
                    if (slotIndex !== correctedToday) slot.style.display = 'none';
                }
                // For 3 Day view, show today + next 2
                else if (daysToShow === 3) {
                    let endRange = (correctedToday + 2) % 7; 
                    // This logic gets complex with wrapping weeks. 
                    // Simplified: Show Today, Today+1, Today+2
                    if (slotIndex < correctedToday || slotIndex > correctedToday + 2) {
                         slot.style.display = 'none';
                    }
                }
            }
        });
    }
}

customElements.define('schedule-table', ScheduleTable);
