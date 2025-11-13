import WindowManager from './modules/windowManager.js';
import { initBackground } from './modules/background.js';

// Boot: initialize the animated tech background and the modular window manager when the page loads
window.addEventListener('load', () => {
    try { initBackground(); } catch (e) { /* ignore */ }
    WindowManager.init();
});