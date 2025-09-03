const cfg = JSON.parse(document.querySelector('#config').textContent);
const els = {
  q: document.querySelector('#q'),
  results: document.querySelector('#resultsList'),
  status: document.querySelector('#status'),
  trending: document.querySelector('#trending'),
  audio: document.querySelector('#audio'),
  npTitle: document.querySelector('#npTitle'),
  npArtist: document.querySelector('#npArtist'),
  npArt: document.querySelector('#npArt'),
  npBadge: document.querySelector('#npBadge'),
  playPause: document.querySelector('#playPauseBtn'),
  searchBtn: document.querySelector('#searchBtn'),
  bgVideo: document.querySelector('#bg-video'),
  openPalette: document.querySelector('#openPalette'),
  palette: document.querySelector('#palette'),
  paletteInput: document.querySelector('#paletteInput'),
  paletteList: document.querySelector('#paletteList'),
  analytics: {
    likes: document.querySelector('#likesCount'),
    reposts: document.querySelector('#repostsCount'),
    followers: document.querySelector('#followersCount')
  }
};

const LIKED_KEY = 'likedTracks';
const PLAYLIST_KEY = 'customPlaylists';

function loadPreferences() {
  try {
    return {
      liked: JSON.parse(localStorage.getItem(LIKED_KEY)) || [],
      playlists: JSON.parse(localStorage.getItem(PLAYLIST_KEY)) || []
    };
  } catch {
    return { liked: [], playlists: [] };
  }
}

function savePreferences() {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(state.likedTracks));
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(state.customPlaylists));
  } catch {
    // Swallow write errors (e.g. storage quota exceeded)
  }
}

function isLiked(track) {
  return state.likedTracks.some(
    (t) => t.id === track.id && t.platform === track.platform
  );
}

function toggleLike(track) {
  if (isLiked(track)) {
    state.likedTracks = state.likedTracks.filter(
      (t) => !(t.id === track.id && t.platform === track.platform)
    );
  } else {
    state.likedTracks.push(track);
  }
  savePreferences();
}

function savePlaylist(pl) {
  const idx = state.customPlaylists.findIndex((p) => p.name === pl.name);
  if (idx > -1) state.customPlaylists[idx] = pl;
  else state.customPlaylists.push(pl);
  savePreferences();
}

const state = {
  queue: [],
  idx: -1,
  token: null,
  likedTracks: [],
  customPlaylists: []
};

({ liked: state.likedTracks, playlists: state.customPlaylists } =
  loadPreferences());

const RECENT_KEY = 'recentQueries';
let recent = [];
try {
  recent = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
} catch {
  recent = [];
}

const BG_VIDEO_URL = 'https://scontent-lis1-1.cdninstagram.com/o1/v/t2/f2/m86/AQNR8AIMGj0wZWfnc2E-oDy8hqhL4OzFTFkuQIWRUNgevSbye_jDRibDpsEf4u9akLDOKgjBJ9PrtCnjg6Bd-aBRaCsn0B8ZT3bBD2E.mp4?_nc_cat=101&_nc_sid=5e9851&_nc_ht=scontent-lis1-1.cdninstagram.com&_nc_ohc=0pl2MZaJ2DAQ7kNvwGc5inD&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6NzEzNjU5NzcxMDU2ODIxLCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6MTM5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=3952d4ec2590d28a&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC81NzQ1MjBFOEUyMDlEODQ0QzlDRkYwRDRDRERDOTI4OV92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTkgwbWgwV3RGd0I3ZXNFQUhydERsSWh5NE1pYnFfRUFBQUYVAgLIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAm6sqn0rvExAIVAigCQzMsF0BheZmZmZmaGBJkYXNoX2Jhc2VsaW5lXzFfdjERAHX-B2XmnQEA&_nc_gid=8YseOpuR_huJ3ix88klWxg&_nc_zt=28&oh=00_AfVvmQiGqR6wrk-x_afi20p5jHLjxVzqJWZLI8oFGI3mrw&oe=68B8C6AA';
if (els.bgVideo) els.bgVideo.src = BG_VIDEO_URL;

// Populate analytics metrics if provided in config.
if (cfg.analytics) {
  els.analytics.likes && (els.analytics.likes.textContent = String(cfg.analytics.likes || 0));
  els.analytics.reposts && (els.analytics.reposts.textContent = String(cfg.analytics.reposts || 0));
  els.analytics.followers && (els.analytics.followers.textContent = String(cfg.analytics.followers || 0));
}

// Gracefully handle missing configuration for Mr.FLEN identifiers.
function isMrFlenName(name){
  return (name||'').trim().toLowerCase() === (cfg.mrflens?.soundcloudUsername || 'mr-flen').toLowerCase();
}
function isMrFlenAudius(handle){
  return (handle||'').toLowerCase() === (cfg.mrflens?.audiusHandle || 'Mr.FLEN').toLowerCase();
}

async function audiusSearch(q){
  const u = new URL('https://discovery.audius.co/v1/tracks/search');
  u.searchParams.set('query', q);
  u.searchParams.set('app_name','MrFLEN');
  u.searchParams.set('limit','25');
  const r = await fetch(u, { headers:{ 'Accept':'application/json' }});
  const j = await r.json();
  return (j.data||[]).map(t => ({
    id: t.id, platform:'audius',
    title: t.title, artist: t.user?.name, artwork: t.artwork?.['150x150'] || t.artwork?.['480x480'],
    durationMs: t.duration * 1000, permalink: t.permalink,
    streamUrl: `https://discovery.audius.co/v1/tracks/${t.id}/stream?app_name=MrFLEN`,
    isMrFlen: isMrFlenAudius(t.user?.handle)
  }));
}

async function soundcloudSearch(q){
  const u = new URL('https://api.soundcloud.com/tracks');
  u.searchParams.set('q', q);
  u.searchParams.set('limit','25');
  if (cfg.scClientId) u.searchParams.set('client_id', cfg.scClientId);
  try{
    const r = await fetch(u);
    if(!r.ok) throw new Error(`status ${r.status}`);
    const j = await r.json();
    return (j.collection || j || []).map(t => ({
      id: String(t.id), platform:'soundcloud',
      title: t.title, artist: t.user?.username, artwork: (t.artwork_url || '').replace('-large','-t500x500'),
      durationMs: t.duration, permalink: t.permalink_url,
      isMrFlen: isMrFlenName(t.user?.username)
    }));
  }catch(err){
    console.warn('SoundCloud search failed', err);
    return [];
  }
}

function renderList(listEl, tracks){
  listEl.innerHTML = '';
  tracks.forEach((t,i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${t.artwork||''}" alt="" width="48" height="48" style="border-radius:8px">
      <div><div class="title">${t.title}</div><div class="artist">${t.artist||''}</div></div>
      <span class="badge">${t.platform === 'audius' ? 'Audius' : 'SC'}</span>
      <div class="track-actions">
        <button class="btn play" ${t.isMrFlen ? '' : 'disabled title="Playback limited to Mr.FLEN"'}>Play</button>
        <button class="btn secondary like">${isLiked(t) ? 'Unlike' : 'Like'}</button>
        <button class="btn secondary share" data-url="${t.permalink}">Share</button>
      </div>`;
    const playBtn = li.querySelector('.play');
    playBtn.onclick = () => t.isMrFlen && playFrom(tracks, i);
    const likeBtn = li.querySelector('.like');
    likeBtn.onclick = () => {
      toggleLike(t);
      likeBtn.textContent = isLiked(t) ? 'Unlike' : 'Like';
    };
    const shareBtn = li.querySelector('.share');
    shareBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(t.permalink);
        shareBtn.textContent = 'Copied';
        setTimeout(() => shareBtn.textContent = 'Share', 1000);
      } catch {
        window.prompt('Copy track link', t.permalink);
      }
    };
    listEl.appendChild(li);
  });
}

function saveRecent(){
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0,10))); } catch {}
}

function renderRecent(filter=''){
  if(!els.paletteList) return;
  const q = filter.trim().toLowerCase();
  els.paletteList.innerHTML = '';
  recent.filter(r => r.toLowerCase().includes(q)).forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    li.addEventListener('click', () => {
      els.q.value = r;
      hidePalette();
      runSearch();
    });
    els.paletteList.appendChild(li);
  });
}

function showPalette(){
  if(!els.palette) return;
  els.palette.classList.remove('hidden');
  renderRecent();
  els.paletteInput.value='';
  els.paletteInput.focus();
}

function hidePalette(){
  if(!els.palette) return;
  els.palette.classList.add('hidden');
}

async function ensureStreamUrl(track){
  if (track.platform==='soundcloud' && !track.streamUrl){
    const u = `https://api.soundcloud.com/tracks/${track.id}/streams${cfg.scClientId?`?client_id=${cfg.scClientId}`:''}`;
    try{
      const r = await fetch(u); const j = await r.json();
      track.streamUrl = j.http_mp3_128_url || j.hls_mp3_128_url;
    }catch{}
  }
  return track.streamUrl;
}

async function playFrom(arr, idx){
  state.queue = arr; state.idx = idx;
  const t = arr[idx];
  await ensureStreamUrl(t);
  if (!t.streamUrl){ alert('Stream unavailable'); return; }
  els.audio.src = t.streamUrl; els.audio.play();
  els.npTitle.textContent = t.title; els.npArtist.textContent = t.artist||''; els.npArt.src = t.artwork||''; els.npBadge.textContent = t.platform.toUpperCase();
  navigator.mediaSession?.metadata = new MediaMetadata({ title: t.title, artist: t.artist, artwork: [{src:t.artwork,sizes:'512x512',type:'image/jpeg'}] });
}

async function runSearch(){
  const q = els.q.value.trim();
  if(!q) return;
  if(!recent.includes(q)){
    recent.unshift(q);
    if(recent.length>10) recent.pop();
    saveRecent();
  }
  els.searchBtn.disabled = true;
  els.searchBtn.classList.add('loading');
  if(els.status) els.status.textContent = 'Searching…';

  const [aRes, sRes] = await Promise.allSettled([
    audiusSearch(q),
    soundcloudSearch(`${q} ${cfg.mrflens?.soundcloudUsername || 'mr-flen'}`)
  ]);
  const a = aRes.status === 'fulfilled' ? aRes.value : [];
  const s = sRes.status === 'fulfilled' ? sRes.value : [];
  const results = [...a, ...s].filter(t => t.isMrFlen);
  renderList(els.results, results);
  if(els.status) els.status.textContent = results.length ? '' : 'No tracks found.';
  els.searchBtn.disabled = false;
  els.searchBtn.classList.remove('loading');
}

els.searchBtn.onclick = runSearch;
els.q.addEventListener('keydown', e => { if(e.key === 'Enter') runSearch(); });

els.openPalette?.addEventListener('click', showPalette);
document.addEventListener('keydown', e => {
  if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
    e.preventDefault(); showPalette();
  } else if(e.key === 'Escape') {
    hidePalette();
  }
});
els.paletteInput?.addEventListener('input', () => renderRecent(els.paletteInput.value));
els.paletteInput?.addEventListener('keydown', e => {
  if(e.key === 'Enter'){
    els.q.value = els.paletteInput.value.trim();
    hidePalette();
    runSearch();
  } else if(e.key === 'Escape') {
    hidePalette();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
