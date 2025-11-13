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

// Simple typing animation that renders HTML progressively.
export function animateTyping(targetEl, htmlString, opts = {}) {
    const charDelay = typeof opts.charDelay === 'number' ? opts.charDelay : 25;
    const elementDelay = typeof opts.elementDelay === 'number' ? opts.elementDelay : 120;

    function sleep(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    async function typeTextNode(text, container) {
        const tn = document.createTextNode('');
        container.appendChild(tn);
        for (let i = 0; i < text.length; i++) {
            tn.nodeValue += text[i];
            await sleep(charDelay);
        }
    }

    async function typeElement(node, parent) {
        if (node.nodeType === Node.TEXT_NODE) {
            const txt = node.nodeValue.trim();
            if (txt.length) await typeTextNode(txt, parent);
            return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = document.createElement(node.tagName.toLowerCase());
            // copy attributes
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                el.setAttribute(attr.name, attr.value);
            }
            parent.appendChild(el);
            // small pause before typing children so headings appear then type
            await sleep(elementDelay);
            for (let child of Array.from(node.childNodes)) {
                await typeElement(child, el);
            }
        }
    }

    // Kick off typing asynchronously
    (async () => {
        // parse html into a fragment
        const tmp = document.createElement('div');
        tmp.innerHTML = htmlString;
        // clear target
        targetEl.innerHTML = '';
        for (let child of Array.from(tmp.childNodes)) {
            await typeElement(child, targetEl);
        }
    })();
}
