// Minimal Spotify panel module
// - Renders a top-right panel with a list of favorite tracks
// - Each track shows title/artist, an "Open in Spotify" link and an optional embed iframe
// - The user can paste a full Spotify track URL into the small input per track to enable the embed player

const tracks = [
    { title: 'Eye of the Tiger', artist: 'Survivor', embed: '2KH16WveTQWT6KOG9Rg6e2' },
    { title: 'Lose Yourself', artist: 'Eminem', embed: '7MJQ9Nfxzh8LPZ9e9u68Fq' },
    { title: 'Titanium', artist: 'David Guetta ft. Sia', embed: '4rhbTZGvATwkwYNz3LSC5A' },
    { title: "Don't Stop Me Now", artist: 'Queen', embed: '7hQJA50XrCWABAu5v6QZ4i' },
    { title: 'Hall of Fame', artist: 'The Script ft. will.i.am', embed: '0FB5ILDICqwK6xj7W1RP9u' },
    { title: "Can't Hold Us", artist: 'Macklemore & Ryan Lewis', embed: '6PwfLLwtXhCcp1PiBpjJkJ' }
];

const STORAGE_KEY = 'portfolio_spotify_panel_open';

function createTrackElement(track, index) {
    const wrap = document.createElement('div');
    wrap.className = 'spotify-track';

    const cover = document.createElement('div');
    cover.className = 'spotify-cover';
    cover.textContent = 'Cover';

    const meta = document.createElement('div');
    meta.className = 'spotify-meta';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = track.title;
    const artist = document.createElement('div');
    artist.className = 'artist';
    artist.textContent = track.artist;
    meta.appendChild(title);
    meta.appendChild(artist);

    // only show cover + meta (title/artist).
    // The iframe embed (if present) will be rendered below. User can edit track.embed in modules/spotify.js manually.
    wrap.appendChild(cover);
    wrap.appendChild(meta);

    // container to hold iframe if user adds an embed URL
    const embedContainer = document.createElement('div');
    embedContainer.className = 'spotify-embed-container';
    embedContainer.style.marginTop = '6px';

    // If pre-filled, render iframe embed
    if (track.embed) renderEmbed(track.embed, embedContainer);

    const container = document.createElement('div');
    container.appendChild(wrap);
    container.appendChild(embedContainer);

    return container;
}

function renderEmbed(id, container) {
    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.className = 'spotify-embed';
    iframe.src = `https://open.spotify.com/embed/track/${id}`;
    iframe.allow = 'encrypted-media; clipboard-write; autoplay; fullscreen';
    container.appendChild(iframe);
}

function extractTrackId(url) {
    if (!url) return null;
    try {
        // allow direct ids too
        if (/^[0-9A-Za-z]{10,}$/i.test(url)) return url;
        const u = new URL(url);
        // path segments like /track/{id}
        const parts = u.pathname.split('/').filter(Boolean);
        const idx = parts.indexOf('track');
        if (idx !== -1 && parts[idx+1]) return parts[idx+1];
        return null;
    } catch (e) {
        return null;
    }
}

export function initSpotifyPanel() {
    const toggle = document.getElementById('spotifyToggle');
    const panel = document.getElementById('spotifyPanel');
    if (!toggle || !panel) return;

    // Render tracks
    tracks.forEach((t, i) => {
        const el = createTrackElement(t, i);
        panel.appendChild(el);
    });

    // restore open state
    const openState = localStorage.getItem(STORAGE_KEY) === '1';
    if (openState) {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = panel.classList.toggle('open');
        panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        localStorage.setItem(STORAGE_KEY, isOpen ? '1' : '0');
    });

    // close when clicking outside
    document.addEventListener('click', (e) => {
        if (!panel.classList.contains('open')) return;
        const target = e.target;
        if (!target.closest('#spotifyPanel') && !target.closest('#spotifyToggle')) {
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
            localStorage.setItem(STORAGE_KEY, '0');
        }
    });
}

export default {
    init: initSpotifyPanel
};
