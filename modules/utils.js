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

    let finished = false;
    let finishRequested = false;
    let finishResolve;
    const done = new Promise(res => { finishResolve = res; });

    function sleep(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    async function typeTextNode(text, container) {
        const tn = document.createTextNode('');
        container.appendChild(tn);
        // ensure caret stays at the end
        if (caret.parentNode) container.appendChild(caret);
        for (let i = 0; i < text.length; i++) {
            if (finishRequested) {
                // immediately finish
                container.removeChild(tn);
                const wrapper = document.createElement('span');
                wrapper.textContent = text;
                container.appendChild(wrapper);
                if (caret.parentNode) container.appendChild(caret);
                return;
            }
            tn.nodeValue += text[i];
            await sleep(charDelay);
        }
    }

    async function typeElement(node, parent) {
        if (node.nodeType === Node.TEXT_NODE) {
            const txt = node.nodeValue;
            if (txt && txt.trim().length) await typeTextNode(txt, parent);
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
            // ensure caret remains at end
            if (caret.parentNode) parent.appendChild(caret);
            // small pause before typing children so headings appear then type
            await sleep(elementDelay);
            for (let child of Array.from(node.childNodes)) {
                if (finishRequested) break;
                await typeElement(child, el);
            }
        }
    }

    // caret element
    const caret = document.createElement('span');
    caret.className = 'typing-caret';

    async function run() {
        try {
            const tmp = document.createElement('div');
            tmp.innerHTML = htmlString;
            targetEl.innerHTML = '';
            // attach caret at the end
            targetEl.appendChild(caret);
            for (let child of Array.from(tmp.childNodes)) {
                if (finishRequested) break;
                await typeElement(child, targetEl);
            }
            if (finishRequested) {
                targetEl.innerHTML = htmlString;
                targetEl.appendChild(caret);
            }
        } catch (e) {
            // on error, fallback to full render
            targetEl.innerHTML = htmlString;
            targetEl.appendChild(caret);
        }
        finished = true;
        finishResolve();
    }

    // start
    run();

    function finish() {
        if (finished) return;
        finishRequested = true;
    }

    return { done, finish, isTyping: () => !finished };
}
