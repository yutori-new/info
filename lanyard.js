const DISCORD_ID = '1474075672526852158';

let spotifyInterval = null;
let lastSong        = null;
let currentSpotify  = null;

window.lanyardReady = false;

function connectLanyard() {
  const ws = new WebSocket('wss://api.lanyard.rest/socket');

  ws.onopen = () => {
    ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
  };

  ws.onclose = () => {
    setTimeout(connectLanyard, 3000);
  };

  ws.onmessage = (e) => {
    const { t, d } = JSON.parse(e.data);
    if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
      updateProfile(d);
      if (!window.lanyardReady) {
        window.lanyardReady = true;
        window.dispatchEvent(new Event('lanyard:ready'));
      }
    }
  };
}

function updateProfile(data) {
  const { discord_user, listening_to_spotify, spotify, activities } = data;

  const nameEl = document.getElementById('discord-name');
  const avEl   = document.getElementById('discord-av');
  if (nameEl) nameEl.textContent = discord_user.global_name || discord_user.username;
  if (avEl)   avEl.src = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=160`;

  const customStatus = activities?.find(a => a.type === 4);
  const miniStatus   = document.getElementById('custom-status-mini');
  if (miniStatus) {
    if (customStatus?.state) {
      miniStatus.style.display = 'flex';
      const emoji = customStatus.emoji
        ? (customStatus.emoji.id
            ? `<img src="https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.png">`
            : customStatus.emoji.name)
        : '';
      miniStatus.innerHTML = `${emoji}${customStatus.state}`;
    } else {
      miniStatus.style.display = 'none';
    }
  }

  const dynamicTile = document.getElementById('dynamic-tile');

  if (listening_to_spotify && spotify) {
    currentSpotify = spotify;
    dynamicTile.style.display = 'block';

    if (spotify.song !== lastSong) {
      lastSong = spotify.song;
      dynamicTile.innerHTML = `
        <div class="sp-flex">
          <img src="${spotify.album_art_url}" class="sp-art">
          <div class="sp-info">
            <div class="sp-label">▶ SPOTIFY</div>
            <div class="sp-song">${spotify.song}</div>
            <div class="sp-bar"><div class="sp-prog" id="sp-prog"></div></div>
          </div>
        </div>`;
    }

    if (!spotifyInterval) {
      spotifyInterval = setInterval(() => {
        const prog = document.getElementById('sp-prog');
        if (!prog || !currentSpotify) return;
        const dur  = currentSpotify.timestamps.end - currentSpotify.timestamps.start;
        const cur  = Date.now() - currentSpotify.timestamps.start;
        prog.style.width = Math.min(100, (cur / dur) * 100) + '%';
      }, 1000);
    }

  } else {
    dynamicTile.style.display = 'none';
    if (spotifyInterval) { clearInterval(spotifyInterval); spotifyInterval = null; }
    lastSong = null;
    currentSpotify = null;
  }
}

connectLanyard();
