### Assumptions
- Repository is static; no server or build process is required.  
- `.env` variables for SoundCloud and other providers are already configured.
- Mock‑ups are textual because no image generation is performed.

### Commands to run
- `npx serve public` – serve the PWA locally (or open `public/index.html` in a browser).

### File tree (excerpt)
```
public/
├─ index.html          # Main PWA shell
├─ app.js              # UI logic, search, playback, persistence
├─ drive.js            # Google Drive backup/restore helpers
├─ manifest.webmanifest
└─ service-worker.js   # Offline shell caching
```

---

## Step‑by‑step walkthrough

### 1. Launch screen
```
┌─────────────────────────────────────────────────────────┐
│[⌘K] Mr.FLEN’s   [Search for music…      (Search)]       │
│[Connect with SoundCloud] [Library] [⚙️]                 │
└─────────────────────────────────────────────────────────┘
| Hero: “Midnight Vibes”                                  |
| Trending covers (grid of thumbnails)                    |
```
- Top bar provides command palette (`⌘K`), search input, SoundCloud OAuth, library button and settings.
- Background video loops with a dark gradient overlay for visual depth.

### 2. Command palette (`⌘K`)
```
┌───────────── Command Palette ──────────────┐
│ Type a search…                             │
│ • recent query 1                           │
│ • recent query 2                           │
└────────────────────────────────────────────┘
```
- Accessible via the “⌘K” button or `Ctrl/⌘+K`.
- Recent searches are stored in `localStorage`; selecting one populates the main search box and triggers a new search.

### 3. Searching
1. Enter a query and press **Search** or `Enter`.
2. `app.js` calls both Audius and SoundCloud APIs, appending the author handle so only Mr.FLEN tracks remain.
3. Results are rendered inside the “Tracks (Mr.FLEN)” tab.

```
Results
├─ Track Title – Artist          [Play] [♥] [Add]
├─ …
```
- Status line updates (“Searching…”, “No tracks found.”).

### 4. Playback
```
┌───────────── Player (sticky footer) ─────────────┐
│[Art] Track Title – Artist           SC/AUDIUS     │
│[⏮] [▶️/⏸] [⏭] ────────────── slider ──────────│
└──────────────────────────────────────────────────┘
```
- Clicking **Play** queues the track; `MediaSession` metadata populates `title`, `artist`, and artwork.
- If SoundCloud requires a stream URL, `ensureStreamUrl()` fetches it before playback.
- Previous/Next buttons traverse the queue.

### 5. Library & likes
```
Library panel
Tabs: [My Tracks] [Liked Tracks] [Reposts]

Liked Tracks:
• Track Title – Artist           [Play] [♥]
```
- `toggleLike()` adds/removes tracks from `localStorage` (`likedTracks` key).
- `customPlaylists` are handled similarly and can be persisted via backup.

### 6. Analytics & Social panels
```
Analytics                   Connect
Likes     123               • Audius
Reposts   45                • SoundCloud
Followers 678               • Twitter
```
- Numbers are injected from the config JSON block.
- Social links open new tabs.

### 7. Backup & restore
- Hidden buttons appear after Google OAuth script loads:
  - **Backup to Google Drive** uploads `localStorage` JSON.
  - **Restore Backup** downloads and repopulates local data.

### 8. Progressive Web App
- `service-worker.js` caches the shell for offline usage.
- Mobile browsers can **Add to Home Screen** for an app-like experience.

### 9. Background & accessibility
- Background video URL fetched in `app.js`; muted, looped, and covered.
- Focus outlines (`outline:2px`) and ARIA labels ensure keyboard and screen‑reader support.

---

### Testing
- No tests executed during this documentation task.

### Notes
- Replace placeholder client IDs in the embedded config before deployment.
- Real screenshots can be captured by running the app and using browser dev tools.
