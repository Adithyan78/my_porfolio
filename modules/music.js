export const musicContent = `
  <div class="music-app">
    <div class="music-controls">
      <label for="spotifyInput">Paste Spotify track/playlist/album URL or URI:</label>
      <div style="display:flex;gap:8px;margin-top:6px;">
        <input id="spotifyInput" placeholder="https://open.spotify.com/track/... or spotify:track:..." style="flex:1;padding:8px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);background:transparent;color:var(--text-color)">
        <button id="addSpotify" class="project-btn">Add</button>
      </div>
    </div>

    <div style="margin-top:12px;font-size:0.9rem;color:var(--secondary-text)">Saved favorites (local):</div>
    <div id="musicList" style="margin-top:8px;display:flex;flex-direction:column;gap:12px;">
      <!-- items inserted here -->
    </div>
  </div>
`;

// Helper to normalize input into an embeddable Spotify URL
function toSpotifyEmbedUrl(input) {
  if (!input) return null;
  input = input.trim();
  // If it's already an embed URL
  if (input.includes('open.spotify.com/embed/')) return input;
  // If it's an open.spotify.com link
  const openMatch = input.match(/open\.spotify\.com\/(playlist|track|album)\/(\w+)/);
  if (openMatch) {
    const kind = openMatch[1];
    const id = openMatch[2];
    return `https://open.spotify.com/embed/${kind}/${id}`;
  }
  // If it's a normal open.spotify.com with query params (e.g., ?si=)
  const openMatch2 = input.match(/open\.spotify\.com\/(playlist|track|album)\/([-\w]+)/);
  if (openMatch2) return `https://open.spotify.com/embed/${openMatch2[1]}/${openMatch2[2]}`;
  // If it's a spotify URI like spotify:track:ID
  const uriMatch = input.match(/spotify:(playlist|track|album):([\w]+)/i);
  if (uriMatch) return `https://open.spotify.com/embed/${uriMatch[1]}/${uriMatch[2]}`;
  // If it's just an ID and user specified kind=track by default
  const idMatch = input.match(/^([A-Za-z0-9]{22,})$/);
  if (idMatch) return `https://open.spotify.com/embed/track/${idMatch[1]}`;
  return null;
}

export function initMusic(windowElement, windowId) {
  try {
    const listEl = windowElement.querySelector('#musicList');
    const input = windowElement.querySelector('#spotifyInput');
    const addBtn = windowElement.querySelector('#addSpotify');
    if (!listEl || !input || !addBtn) return;

    const STORAGE_KEY = 'portfolio_music_favorites_v1';
    let favorites = [];
    try { favorites = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { favorites = []; }

    function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)); }

    function render() {
      listEl.innerHTML = '';
      if (!favorites.length) {
        const info = document.createElement('div');
        info.style.color = 'var(--secondary-text)';
        info.textContent = 'No favorites yet. Add a Spotify link above.';
        listEl.appendChild(info);
        return;
      }

      favorites.forEach((url, idx) => {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.gap = '12px';
        wrap.style.alignItems = 'center';

        const iframeWrap = document.createElement('div');
        iframeWrap.style.flex = '1';
        iframeWrap.innerHTML = `<iframe src="${url}" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;

        const btns = document.createElement('div');
        btns.style.display = 'flex';
        btns.style.flexDirection = 'column';
        btns.style.gap = '6px';

        const remove = document.createElement('button');
        remove.className = 'project-btn ghost';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
          favorites.splice(idx,1); save(); render();
        });

        btns.appendChild(remove);
        wrap.appendChild(iframeWrap);
        wrap.appendChild(btns);
        listEl.appendChild(wrap);
      });
    }

    addBtn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) return;
      const embed = toSpotifyEmbedUrl(val);
      if (!embed) {
        alert('Could not parse that Spotify URL/URI/ID. Paste a full URL like https://open.spotify.com/track/<id> or a spotify:track:<id> URI.');
        return;
      }
      favorites.unshift(embed);
      if (favorites.length > 20) favorites.pop();
      save();
      render();
      input.value = '';
    });

    render();
  } catch (e) {
    console.error('initMusic error', e);
  }
}
