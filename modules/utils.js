export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Clock updater
export function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateString = now.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'});
    const el = document.getElementById('clock');
    if (el) el.innerHTML = `${timeString}<br>${dateString}`;
}

// System info toggle
export function showSystemInfo() {
    const systemInfoPopup = document.getElementById('systemInfoPopup');
    if (!systemInfoPopup) return;
    systemInfoPopup.style.display = systemInfoPopup.style.display === 'block' ? 'none' : 'block';

    const start = document.getElementById('startMenu');
    const cal = document.getElementById('calendarPopup');
    if (start) start.style.display = 'none';
    if (cal) cal.style.display = 'none';
}

// Mobile single-click handler
export function handleIconClick(e) {
    const icon = e.currentTarget;
    e.preventDefault();
    const windowType = icon.getAttribute('data-window');
    const title = icon.getAttribute('data-title');
    const ev = new CustomEvent('open-window', { detail: { windowType, title } });
    document.dispatchEvent(ev);
}
