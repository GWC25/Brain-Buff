export class ScheduleTable extends HTMLElement {
    constructor() {
        super();
        this.days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        this.startHour = 6;
        this.endHour = 22;
        this.storageKey = 'brainBuff_schedule';
    }

    connectedCallback() {
        this.loadData();
        this.render();
        this.setupViewFilters(); // <--- FIXED: Was 'setupEventListeners'
        this.handleMobileView();
        
        // Listen for resize to adjust view if they rotate screen
        window.addEventListener('resize', () => this.handleMobileView());
    }

    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        this.tasks = saved ? JSON.parse(saved) : {};
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }

    render() {
        const grid = document.createElement('div');
        grid.className = 'schedule-grid';
        grid.id = 'main-grid';

        // 1. HEADER ROW
        grid.appendChild(this.createCell('div', 'header-cell', 'TIME'));
        
        this.days.forEach((day, index) => {
            const cell = this.createCell('div', `header-cell day-${index}`, day);
            grid.appendChild(cell);
        });

        // 2. TIME ROWS
        for (let hour = this.startHour; hour <= this.endHour; hour++) {
            const timeLabel = `${hour}:00`;
            grid.appendChild(this.createCell('div', 'time-cell', timeLabel));

            this.days.forEach((day, dayIndex) => {
                const slotId = `${day}-${hour}`;
                const taskContent = this.tasks[slotId] || "";
                const isComplete = this.tasks[`${slotId}_status`] === 'done';

                const slot = document.createElement('div');
                slot.className = `task-slot day-${dayIndex}`;
                
                if (isComplete) slot.classList.add('is-complete');
                
                slot.setAttribute('data-id', slotId);
                slot.setAttribute('contenteditable', 'true');
                slot.setAttribute('draggable', 'true');
                slot.textContent = taskContent;

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

    handleMobileView() {
        const isMobile = window.innerWidth < 768;
        let jsDay = new Date().getDay(); 
        let appDay = jsDay === 0 ? 6 : jsDay - 1; 

        const allSlots = this.querySelectorAll('.header-cell, .task-slot');
        
        allSlots.forEach(slot => {
            slot.classList.remove('active-day-mobile'); 
            
            if (isMobile) {
                if (slot.classList.contains(`day-${appDay}`)) {
                    slot.classList.add('active-day-mobile');
                }
            }
        });
        
        const hint = document.querySelector('.hint-text');
        if(hint) {
            hint.textContent = isMobile 
                ? "Tap a slot to edit. Double-tap to finish." 
                : "Drag to move. Click to type. Double-click to finish.";
        }
    }

    attachSlotEvents(slot) {
        const id = slot.getAttribute('data-id');

        slot.addEventListener('blur', () => {
            this.tasks[id] = slot.textContent;
            this.saveData();
        });

        slot.addEventListener('dblclick', () => {
            slot.classList.toggle('is-complete');
            if (slot.classList.contains('is-complete')) {
                this.tasks[`${id}_status`] = 'done';
            } else {
                delete this.tasks[`${id}_status`];
            }
            this.saveData();
        });

        slot.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', id);
            slot.classList.add('dragging');
        });

        slot.addEventListener('dragend', () => {
            slot.classList.remove('dragging');
            document.querySelectorAll('.task-slot').forEach(s => s.classList.remove('drag-over'));
        });

        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            const sourceId = e.dataTransfer.getData('text/plain');
            const sourceSlot = this.querySelector(`[data-id="${sourceId}"]`);
            
            if (sourceSlot && sourceSlot !== slot) {
                const textToMove = sourceSlot.textContent;
                slot.textContent = textToMove;
                sourceSlot.textContent = '';
                
                this.tasks[id] = textToMove;
                this.tasks[sourceId] = '';
                
                slot.classList.remove('is-complete');
                delete this.tasks[`${id}_status`];
                this.saveData();
            }
            slot.classList.remove('drag-over');
        });
    }

    setupViewFilters() {
        const btnWeek = document.getElementById('view-week');
        const btn3Day = document.getElementById('view-3day');
        const btnToday = document.getElementById('view-today');
        const grid = this.querySelector('#main-grid');

        const resetViews = () => {
            grid.className = 'schedule-grid'; 
            [btnWeek, btn3Day, btnToday].forEach(b => b?.classList.remove('active-view'));
        };

        if(btnWeek) btnWeek.onclick = () => {
            resetViews();
            btnWeek.classList.add('active-view');
        };

        if(btn3Day) btn3Day.onclick = () => {
            resetViews();
            btn3Day.classList.add('active-view');
            grid.classList.add('view-3day');
        };

        if(btnToday) btnToday.onclick = () => {
            resetViews();
            btnToday.classList.add('active-view');
            grid.classList.add('view-today');
        };
    }
}

customElements.define('schedule-table', ScheduleTable);
