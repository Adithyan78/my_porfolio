// Calendar utilities extracted from script.js
export function initCalendar() {
    const now = new Date();
    updateCalendar(now.getFullYear(), now.getMonth());

    // Calendar navigation
    const prev = document.getElementById('prevMonth');
    const next = document.getElementById('nextMonth');
    if (prev) {
        prev.addEventListener('click', function() {
            const currentMonthText = document.getElementById('currentMonth').textContent;
            const [month, year] = currentMonthText.split(' ');
            const date = new Date(`${month} 1, ${year}`);
            date.setMonth(date.getMonth() - 1);
            updateCalendar(date.getFullYear(), date.getMonth());
        });
    }
    if (next) {
        next.addEventListener('click', function() {
            const currentMonthText = document.getElementById('currentMonth').textContent;
            const [month, year] = currentMonthText.split(' ');
            const date = new Date(`${month} 1, ${year}`);
            date.setMonth(date.getMonth() + 1);
            updateCalendar(date.getFullYear(), date.getMonth());
        });
    }
}

export function updateCalendar(year, month) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const currentMonthEl = document.getElementById('currentMonth');
    if (currentMonthEl) currentMonthEl.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();

    let calendarHTML = '';

    // Day headers
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day">${day}</div>`;
    });

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        calendarHTML += `<div class="calendar-date"></div>`;
    }

    // Dates of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
        calendarHTML += `<div class="calendar-date ${isToday ? 'today' : ''}">${i}</div>`;
    }

    const grid = document.getElementById('calendarGrid');
    if (grid) grid.innerHTML = calendarHTML;
}
