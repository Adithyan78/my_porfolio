# My Portfolio (Static ES Modules)

This is a static, modular portfolio website built with plain HTML, CSS and JavaScript (ES modules). It behaves like a small desktop environment in the browser with windows, a taskbar, start menu and a file explorer. The project is designed to be served as static files .

## Features

- Desktop-like UI with draggable windows, taskbar and start menu.
- File Explorer with folder items that open windows (Tech Skills, Projects, Resume, Contact, About, System, Music).
- Typing animation for the About window (runs once per browser session, with optional Skip control).
- Animated canvas/background (particle/gradient) for a modern feel.
- Fullscreen toggle in the system tray with a mobile-friendly fallback (pseudo-fullscreen) when native Fullscreen API is blocked.
- Modular codebase: functionality split into ES modules under `modules/`.
- Lightweight: no bundler required, works as a static site.

## Quick start (local)

From the project root run a simple static server and open the site in your browser:

```powershell
# using Python 3 in PowerShell
python -m http.server 8000
# then open http://localhost:8000
```



## Project structure (important files)

- `index.html` — main shell and static markup
- `style.css` — global styles, CSS variables and responsive rules
- `script.js` — bootloader that initializes background and window manager
- `modules/` — ES modules that implement apps and UI pieces
  - `windowManager.js` — creates and manages windows, header, controls and wiring
  - `fileSystem.js` — central content registry for file/folder entries and the File Explorer markup
  - `utils.js` — helpers (isMobile, clock updater, typing animation)
  - `taskbar.js` — taskbar item creation and interactions
  - `background.js` — canvas-based animated background
  - content modules: `about.js`, `resume.js`, `skills.js`, `projects.js`, `contact.js`, `music.js`, etc.
- `assets/icons/` — project icons and SVGs

## Customization & development notes

- Content: edit the relevant content modules in `modules/` (for instance `about.js`, `skills.js`, `resume.js`) to change the displayed text.
- Typing animation:
  - Implemented in `modules/utils.js` as `animateTyping(targetEl, htmlString, opts)`.
  - Called from `modules/windowManager.js` when opening the "About Me" window.
  - Options: `charDelay` (ms between characters) and `elementDelay` (pause between elements).
  - Behavior: it runs once per browsing session (flag stored in `sessionStorage` key `about_typed`). A visible "Skip" control appears in the About window header to finish the typing immediately.
  - To change speed, edit the call in `windowManager.js` or adjust defaults in `utils.js`.

- Fullscreen behavior:
  - Uses the browser Fullscreen API when available.
  - On mobile (or if the API is blocked), a `body.pseudo-fullscreen` CSS mode is toggled to make the site occupy the viewport as a fallback. This is a best-effort workaround — it can't force browser chrome away on all devices.
  - For a true native-like fullscreen experience on mobile, consider adding a minimal PWA manifest and `apple-mobile-web-app-capable` meta tag so users can "Add to Home Screen" and launch the site in standalone mode.


## Troubleshooting

- Taskbar or UI elements hidden:
  - Check `style.css` for stacking and `z-index` rules. The taskbar is fixed to the bottom and the desktop has bottom padding to avoid overlap.
- Typing animation not showing:
  - Typing runs once per tab session; open a new tab or clear sessionStorage `about_typed` to see it again.
- Fullscreen not entering on mobile:
  - Many mobile browsers restrict or don't fully support the Fullscreen API. Use the pseudo-fullscreen fallback or install as PWA for the best experience.

## Contributing

- Make changes on a branch, add a clear commit message, and open a PR. The codebase is intentionally small and modular: add or update modules under `modules/`.
- If you add dependencies, include a `package.json` and explain why (currently the project uses no external JS dependencies).



