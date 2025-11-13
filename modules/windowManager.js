import { fileSystem } from './fileSystem.js';
import { initCalendar, updateCalendar } from './calendar.js';
import { createTaskbarItem, updateTaskbarItem, removeTaskbarItem } from './taskbar.js';
import { isMobile, updateClock, handleIconClick, showSystemInfo, animateTyping } from './utils.js';
import { initMusic } from './music.js';

// Full window manager migrated from script.js
export let windows = [];
export let zIndex = 10;
export let activeWindow = null;

function setActiveWindow(id) {
    activeWindow = id;
    document.querySelectorAll('.taskbar-item').forEach(item => {
        if (item.getAttribute('data-window-id') === id) item.classList.add('active');
        else item.classList.remove('active');
    });
}

function bringToFront(id) {
    const windowElement = document.getElementById(id);
    if (!windowElement) return;
    windowElement.style.zIndex = zIndex++;
    setActiveWindow(id);
}

function updateTaskbarItemLocal(windowId, minimized) {
    const taskbarItem = document.querySelector(`.taskbar-item[data-window-id="${windowId}"]`);
    if (taskbarItem) {
        if (minimized) taskbarItem.classList.remove('active');
        else taskbarItem.classList.add('active');
    }
}

function handleWindowAction(id, action) {
    const windowObj = windows.find(w => w.id === id);
    if (!windowObj) return;
    const windowElement = windowObj.element;

    switch(action) {
        case 'minimize':
            windowElement.classList.add('minimized');
            windowObj.minimized = true;
            updateTaskbarItemLocal(id, true);
            break;
        case 'maximize':
            if (windowObj.maximized) {
                windowElement.classList.remove('maximized');
                windowObj.maximized = false;
                if (!isMobile) {
                    windowElement.style.width = '600px';
                    windowElement.style.height = '500px';
                    windowElement.style.left = (windows.length * 30 + 50) + 'px';
                    windowElement.style.top = (windows.length * 30 + 50) + 'px';
                }
            } else {
                windowElement.classList.add('maximized');
                windowObj.maximized = true;
            }
            break;
        case 'close':
            windowElement.remove();
            windows = windows.filter(w => w.id !== id);
            removeTaskbarItem(id);
            break;
    }
}

export function openWindow(type, title) {
    // If already open, bring to front (and unminimize)
    const existingWindow = windows.find(w => w.type === type && w.title === title);
    if (existingWindow) {
        if (existingWindow.element.classList.contains('minimized')) {
            existingWindow.element.classList.remove('minimized');
            existingWindow.minimized = false;
            updateTaskbarItemLocal(existingWindow.id, false);
        }
        bringToFront(existingWindow.id);
        return existingWindow;
    }

    const id = 'window-' + Date.now();
    const windowElement = document.createElement('div');
    windowElement.className = 'window';
    windowElement.id = id;

    if (isMobile) {
        windowElement.style.left = '2.5vw';
        windowElement.style.top = '5vh';
        windowElement.style.width = '95vw';
        windowElement.style.height = '70vh';
    } else {
        windowElement.style.left = (windows.length * 30 + 50) + 'px';
        windowElement.style.top = (windows.length * 30 + 50) + 'px';
        windowElement.style.width = '600px';
        windowElement.style.height = '500px';
    }

    windowElement.style.zIndex = zIndex++;
    const windowContent = fileSystem[title] ? fileSystem[title].content : '<p>Content not found</p>';

    const iconHtml = (fileSystem[title] && fileSystem[title].icon && (fileSystem[title].icon.endsWith('.svg') || fileSystem[title].icon.endsWith('.png'))) ?
        `<img src="${fileSystem[title].icon}" class="window-icon" alt="">` :
        `<i class="${fileSystem[title] ? fileSystem[title].icon : 'fas fa-file'}"></i>`;

    windowElement.innerHTML = `
        <div class="window-header">
            <div class="window-title">
                ${iconHtml}
                <span>${title}</span>
            </div>
            <div class="window-controls">
                <div class="window-control window-minimize" data-action="minimize"></div>
                <div class="window-control window-maximize" data-action="maximize"></div>
                <div class="window-control window-close" data-action="close"></div>
            </div>
        </div>
        <div class="window-body">
            <!-- content will be injected -->
            <div class="inner-content-placeholder"></div>
        </div>
    `;

    document.getElementById('desktop').appendChild(windowElement);

    const windowObj = { id, type, title, element: windowElement, minimized: false, maximized: false };
    windows.push(windowObj);

    // Window controls
    windowElement.querySelectorAll('.window-control').forEach(control => {
        control.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.getAttribute('data-action');
            handleWindowAction(id, action);
        });
    });

    // Header drag (desktop only)
    if (!isMobile) {
        const header = windowElement.querySelector('.window-header');
        header.addEventListener('mousedown', function(e) {
            bringToFront(id);
            if (e.button !== 0) return;
            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = parseInt(windowElement.style.left);
            const startTop = parseInt(windowElement.style.top);

            function onMouseMove(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                windowElement.style.left = (startLeft + dx) + 'px';
                windowElement.style.top = (startTop + dy) + 'px';
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // Body click brings to front
    windowElement.querySelector('.window-body').addEventListener('mousedown', function() {
        bringToFront(id);
    });

    

    // Create taskbar item (taskbar module creates clickable element that dispatches 'taskbar-click')
    createTaskbarItem(id, title, fileSystem[title] ? fileSystem[title].icon : 'fas fa-file');

    // Inject content — if it's the About window, use typing animation
    try {
        const bodyEl = windowElement.querySelector('.window-body .inner-content-placeholder');
        if (title === 'About Me' && bodyEl) {
            // If the about text has already been typed in this session, just inject raw HTML
            const typedFlag = sessionStorage.getItem('about_typed');
            if (typedFlag === '1') {
                bodyEl.innerHTML = windowContent;
            } else {
                // animate the HTML content into the placeholder and support skipping
                const controller = animateTyping(bodyEl, windowContent, { charDelay: 18, elementDelay: 120 });

                // create a visible Skip button in the window header so users can stop the typing
                try {
                    const headerEl = windowElement.querySelector('.window-header');
                    if (headerEl) {
                        const skipBtn = document.createElement('button');
                        skipBtn.className = 'typing-skip';
                        skipBtn.type = 'button';
                        skipBtn.textContent = 'Skip';
                        // place the skip button inside the window-controls so it appears on the right
                        const controls = headerEl.querySelector('.window-controls');
                        if (controls) {
                            controls.appendChild(skipBtn);
                        } else {
                            headerEl.appendChild(skipBtn);
                        }
                        skipBtn.addEventListener('click', (ev) => {
                            ev.stopPropagation();
                            if (controller && typeof controller.finish === 'function') controller.finish();
                        });

                        // remove the skip button after typing finishes
                        controller.done.then(() => {
                            try { sessionStorage.setItem('about_typed', '1'); } catch (e) { /* ignore */ }
                            if (skipBtn && skipBtn.parentNode) skipBtn.parentNode.removeChild(skipBtn);
                        });
                    } else {
                        // fallback: still mark session when done
                        controller.done.then(() => {
                            try { sessionStorage.setItem('about_typed', '1'); } catch (e) { /* ignore */ }
                        });
                    }
                } catch (e) {
                    // ensure we still mark session even if skip button handling fails
                    controller.done.then(() => {
                        try { sessionStorage.setItem('about_typed', '1'); } catch (e) { /* ignore */ }
                    });
                }
            }
        } else {
            // default: inject raw HTML
            const body = windowElement.querySelector('.window-body');
            if (body) body.innerHTML = windowContent;
        }
    } catch (e) { /* ignore content injection errors */ }

    // If file-explorer, wire folder-item open actions AFTER content is injected
    if (type === 'file-explorer') {
        const attachFolderListeners = () => {
            windowElement.querySelectorAll('.folder-item').forEach(item => {
                if (isMobile) {
                    item.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        openWindow(this.getAttribute('data-window'), this.getAttribute('data-title'));
                    }, { once: false });
                } else {
                    item.addEventListener('dblclick', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        openWindow(this.getAttribute('data-window'), this.getAttribute('data-title'));
                    }, { once: false });
                }
            });
            // sidebar items (e.g., System) — single-click to open
            windowElement.querySelectorAll('.sidebar-item').forEach(side => {
                const winType = side.getAttribute('data-window');
                const title = side.getAttribute('data-title');
                if (!winType) return;
                side.addEventListener('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    openWindow(winType, title || winType);
                }, { once: false });
            });
        };
        // attach immediately (content was just injected)
        try { attachFolderListeners(); } catch (e) { /* ignore */ }
    }

    // Initialize app-specific logic (music, calendar, etc.)
    try {
        if (title === 'Music' && typeof initMusic === 'function') {
            setTimeout(() => initMusic(windowElement, id), 50);
        }
    } catch (e) { /* ignore */ }

    // Listen for taskbar-click events to toggle minimize/restore
    // (Only attach once)
    if (!document._windowManagerTaskbarListenerAttached) {
        document.addEventListener('taskbar-click', (e) => {
            const windowId = e.detail && e.detail.windowId;
            const windowObj = windows.find(w => w.id === windowId);
            if (!windowObj) return;
            if (windowObj.minimized) {
                windowObj.element.classList.remove('minimized');
                windowObj.minimized = false;
                updateTaskbarItemLocal(windowId, false);
            } else {
                windowObj.element.classList.add('minimized');
                windowObj.minimized = true;
                updateTaskbarItemLocal(windowId, true);
            }
            bringToFront(windowId);
        });
        document._windowManagerTaskbarListenerAttached = true;
    }

    // Set as active
    setActiveWindow(id);

    return windowObj;
}

export function initWindowManager() {
    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Calendar
    try { initCalendar(); } catch (e) { /* ignore */ }

    // Desktop icons
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        if (isMobile) {
            icon.addEventListener('click', handleIconClick);
        } else {
            icon.addEventListener('dblclick', function() {
                openWindow(this.getAttribute('data-window'), this.getAttribute('data-title'));
            });
            icon.addEventListener('click', function() {
                document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
                this.classList.add('selected');
            });
        }
    });

    // Listen for custom open-window event (from mobile double-tap handler)
    document.addEventListener('open-window', (e) => {
        if (e.detail && e.detail.windowType && e.detail.title) {
            openWindow(e.detail.windowType, e.detail.title);
        }
    });

    // Start button
    const startBtn = document.getElementById('startButton');
    if (startBtn) startBtn.addEventListener('click', function() {
        const startMenu = document.getElementById('startMenu');
        if (startMenu) startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
        const calendarPopup = document.getElementById('calendarPopup');
        const systemInfoPopup = document.getElementById('systemInfoPopup');
        if (calendarPopup) calendarPopup.style.display = 'none';
        if (systemInfoPopup) systemInfoPopup.style.display = 'none';
    });

    // Start menu items (open windows)
    document.querySelectorAll('.start-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            if (this.getAttribute('data-window')) {
                openWindow(this.getAttribute('data-window'), this.getAttribute('data-title'));
                const startMenu = document.getElementById('startMenu');
                if (startMenu) startMenu.style.display = 'none';
            }
        });
    });

    // Wire the two new start menu system items
    const startInfo = document.getElementById('startInfoItem');
    if (startInfo) startInfo.addEventListener('click', function() { showSystemInfo(); });
    const startCal = document.getElementById('startCalendarItem');
    if (startCal) startCal.addEventListener('click', function() {
        const cal = document.getElementById('calendarPopup');
        if (cal) cal.style.display = cal.style.display === 'block' ? 'none' : 'block';
    });

    // System tray clock toggles calendar
    const clock = document.getElementById('clock');
    if (clock) clock.addEventListener('click', function() {
        const calendarPopup = document.getElementById('calendarPopup');
        if (calendarPopup) calendarPopup.style.display = calendarPopup.style.display === 'block' ? 'none' : 'block';
        const startMenu = document.getElementById('startMenu');
        const systemInfoPopup = document.getElementById('systemInfoPopup');
        if (startMenu) startMenu.style.display = 'none';
        if (systemInfoPopup) systemInfoPopup.style.display = 'none';
    });

    // Fullscreen toggle button in system tray
    const systemTray = document.querySelector('.system-tray');
    if (systemTray && !document.getElementById('fullscreenBtn')) {
        const fsBtn = document.createElement('button');
        fsBtn.id = 'fullscreenBtn';
        fsBtn.className = 'system-icon fullscreen-btn';
        fsBtn.type = 'button';
        fsBtn.title = 'Toggle Fullscreen';
        fsBtn.setAttribute('aria-label', 'Toggle Fullscreen');
        // use a simple glyph for fullscreen
        fsBtn.innerHTML = '<span class="fs-glyph">⤢</span>';
        systemTray.insertBefore(fsBtn, systemTray.firstChild);

        function updateFsState() {
            if (document.fullscreenElement) {
                fsBtn.classList.add('active');
                // ensure pseudo-fullscreen class is not left behind
                document.body.classList.remove('pseudo-fullscreen');
            } else if (document.body.classList.contains('pseudo-fullscreen')) {
                // pseudo mode is active
                fsBtn.classList.add('active');
            } else {
                fsBtn.classList.remove('active');
            }
        }

        function togglePseudoFullscreen(on) {
            try {
                if (on) {
                    document.body.classList.add('pseudo-fullscreen');
                    // attempt to hide mobile browser chrome by scrolling (works in some browsers)
                    if (isMobile) setTimeout(() => { try { window.scrollTo(0, 1); } catch (e) {} }, 300);
                } else {
                    document.body.classList.remove('pseudo-fullscreen');
                }
                updateFsState();
            } catch (e) { /* ignore */ }
        }

        fsBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            // Try native Fullscreen API first
            try {
                if (!document.fullscreenElement) {
                    if (document.documentElement.requestFullscreen) {
                        await document.documentElement.requestFullscreen();
                        // native fullscreen expected; update state in fullscreenchange handler
                        return;
                    }
                } else {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                        return;
                    }
                }
            } catch (err) {
                // fall through to pseudo fullscreen
            }

            // If native fullscreen not available or blocked (common on some mobile browsers), use CSS pseudo-fullscreen
            const isPseudo = document.body.classList.contains('pseudo-fullscreen');
            togglePseudoFullscreen(!isPseudo);
        });

        // When native fullscreen toggles, keep state in sync and clear pseudo mode
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                // entered native fullscreen
                document.body.classList.remove('pseudo-fullscreen');
            }
            updateFsState();
        });

        // handle orientation change / resize: if in pseudo mode, ensure layout fits
        window.addEventListener('orientationchange', () => { if (document.body.classList.contains('pseudo-fullscreen')) updateFsState(); });
        window.addEventListener('resize', () => { if (document.body.classList.contains('pseudo-fullscreen')) updateFsState(); });

        // initialize state
        updateFsState();
    }

    // System info icon
    const sysIcon = document.getElementById('systemInfoIcon');
    if (sysIcon) sysIcon.addEventListener('click', showSystemInfo);

    // Close popups when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#startMenu') && !e.target.closest('#startButton')) {
            const startMenu = document.getElementById('startMenu'); if (startMenu) startMenu.style.display = 'none';
        }
        if (!e.target.closest('#calendarPopup') && !e.target.closest('#clock')) {
            const cal = document.getElementById('calendarPopup'); if (cal) cal.style.display = 'none';
        }
        if (!e.target.closest('#systemInfoPopup') && !e.target.closest('#systemInfoIcon') && !e.target.closest('#startInfoItem')) {
            const sys = document.getElementById('systemInfoPopup'); if (sys) sys.style.display = 'none';
        }

        if (!e.target.closest('.desktop-icon') && !e.target.closest('.window')) {
            document.querySelectorAll('.desktop-icon').forEach(icon => icon.classList.remove('selected'));
        }
    });

    // Context menu (desktop only)
    if (!isMobile) {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            const contextMenu = document.getElementById('contextMenu');
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
            contextMenu.style.display = 'block';
            const selectedIcon = document.querySelector('.desktop-icon.selected');
            if (selectedIcon) {
                document.getElementById('contextOpen').onclick = function() {
                    openWindow(selectedIcon.getAttribute('data-window'), selectedIcon.getAttribute('data-title'));
                    contextMenu.style.display = 'none';
                };
            }
        });

        document.addEventListener('click', function() {
            const contextMenu = document.getElementById('contextMenu'); if (contextMenu) contextMenu.style.display = 'none';
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const contextMenu = document.getElementById('contextMenu'); if (contextMenu) contextMenu.style.display = 'none';
            }
        });
    }

    // Handle resize for mobile optimized windows
    window.addEventListener('resize', function() {
        if (isMobile) {
            windows.forEach(windowObj => {
                if (windowObj.maximized) {
                    const windowElement = windowObj.element;
                    windowElement.style.width = '95vw';
                    windowElement.style.height = '70vh';
                }
            });
        }
    });
}

export default {
    init: initWindowManager,
    openWindow
};
