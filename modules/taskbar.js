// Taskbar helpers - decoupled via events
export function createTaskbarItem(windowId, title, icon) {
    const taskbarItems = document.getElementById('taskbarItems');
    if (!taskbarItems) return null;

    const taskbarItem = document.createElement('button');
    taskbarItem.className = 'taskbar-item active';
    taskbarItem.setAttribute('data-window-id', windowId);
    // Support either image icons (svg/png path) or font-awesome class names
    const isImage = typeof icon === 'string' && (icon.endsWith('.svg') || icon.endsWith('.png'));
    taskbarItem.innerHTML = `${isImage ? `<img src="${icon}" class="taskbar-icon" alt="">` : `<i class="${icon}"></i>`}<span>${title}</span>`;

    taskbarItem.addEventListener('click', function() {
        // Dispatch a custom event; window manager should listen for this
        const ev = new CustomEvent('taskbar-click', { detail: { windowId } });
        document.dispatchEvent(ev);
    });

    taskbarItems.appendChild(taskbarItem);
    return taskbarItem;
}

export function updateTaskbarItem(windowId, minimized) {
    const taskbarItem = document.querySelector(`.taskbar-item[data-window-id="${windowId}"]`);
    if (taskbarItem) {
        if (minimized) {
            taskbarItem.classList.remove('active');
        } else {
            taskbarItem.classList.add('active');
        }
    }
}

export function removeTaskbarItem(windowId) {
    const taskbarItem = document.querySelector(`.taskbar-item[data-window-id="${windowId}"]`);
    if (taskbarItem) taskbarItem.remove();
}
