const cfg = JSON.parse(document.querySelector('#config').textContent);
const els = {
  q: document.querySelector('#q'),
  results: document.querySelector('#resultsList'),
  trending: document.querySelector('#trending'),
  audio: document.querySelector('#audio'),
  npTitle: document.querySelector('#npTitle'),
  npArtist: document.querySelector('#npArtist'),
  npArt: document.querySelector('#npArt'),
  npBadge: document.querySelector('#npBadge'),
  playPause: document.querySelector('#playPauseBtn'),
  bgVideo: document.querySelector('#bg-video'),
};

const state = { queue: [], idx: -1, token: null };

const BG_VIDEO_URL = 'https://scontent-lis1-1.cdninstagram.com/o1/v/t2/f2/m86/AQNR8AIMGj0wZWfnc2E-oDy8hqhL4OzFTFkuQIWRUNgevSbye_jDRibDpsEf4u9akLDOKgjBJ9PrtCnjg6Bd-aBRaCsn0B8ZT3bBD2E.mp4?_nc_cat=101&_nc_sid=5e9851&_nc_ht=scontent-lis1-1.cdninstagram.com&_nc_ohc=0pl2MZaJ2DAQ7kNvwGc5inD&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5JTlNUQUdSQU0uQ0xJUFMuQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6NzEzNjU5NzcxMDU2ODIxLCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6MTM5LCJ1cmxnZW5fc291cmNlIjoid3d3In0%3D&ccb=17-1&vs=3952d4ec2590d28a&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC81NzQ1MjBFOEUyMDlEODQ0QzlDRkYwRDRDRERDOTI4OV92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HTkgwbWgwV3RGd0I3ZXNFQUhydERsSWh5NE1pYnFfRUFBQUYVAgLIARIAKAAYABsCiAd1c2Vfb2lsATEScHJvZ3Jlc3NpdmVfcmVjaXBlATEVAAAm6sqn0rvExAIVAigCQzMsF0BheZmZmZmaGBJkYXNoX2Jhc2VsaW5lXzFfdjERAHX-B2XmnQEA&_nc_gid=8YseOpuR_huJ3ix88klWxg&_nc_zt=28&oh=00_AfVvmQiGqR6wrk-x_afi20p5jHLjxVzqJWZLI8oFGI3mrw&oe=68B8C6AA';
if (els.bgVideo) els.bgVideo.src = BG_VIDEO_URL;

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
  const r = await fetch(u);
  const j = await r.json();
  return (j.collection || j || []).map(t => ({
    id: String(t.id), platform:'soundcloud',
    title: t.title, artist: t.user?.username, artwork: (t.artwork_url || '').replace('-large','-t500x500'),
    durationMs: t.duration, permalink: t.permalink_url,
    isMrFlen: isMrFlenName(t.user?.username)
  }));
}

function renderList(listEl, tracks){
  listEl.innerHTML = '';
  tracks.forEach((t,i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${t.artwork||''}" alt="" width="48" height="48" style="border-radius:8px">
      <div><div class="title">${t.title}</div><div class="artist">${t.artist||''}</div></div>
      <span class="badge">${t.platform === 'audius' ? 'Audius' : 'SC'}</span>
      <button class="btn" ${t.isMrFlen ? '' : 'disabled title="Playback limited to Mr.FLEN"'}>Play</button>`;
    li.querySelector('button').onclick = () => t.isMrFlen && playFrom(tracks, i);
    listEl.appendChild(li);
  });
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

document.querySelector('#searchBtn').onclick = async () => {
  const q = els.q.value.trim();
  const [a, s] = await Promise.all([
    audiusSearch(q),
    soundcloudSearch(`${q} ${cfg.mrflens?.soundcloudUsername || 'mr-flen'}`)
  ]);
  const results = [...a, ...s].filter(t => t.isMrFlen);
  renderList(els.results, results);
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
