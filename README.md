# Mr.FLEN Music — Audius (HTML only)

A single-file web app that searches and plays tracks from **Audius**. Built as a lightweight, futuristic library for **Mr.FLEN**.

## User interface

The app ships as plain HTML files. Open `index.html` in a browser to explore the UI.

- **Header** – brand title with a login placeholder and global search bar (press `Ctrl/⌘+K`).
- **Genre chips** – quickly filter trending tracks by UKG, Grime, House, or DNB.
- **Trending carousel & featured banner** – showcase the latest release and popular tracks.
- **Track cards** – hover to reveal play controls and a **Go To Track** button that links to `track.html`.
- **Playlist cards** – navigate to `playlist.html` to browse trending playlists.
- **Sticky player bar** – always-visible audio controls with a queue indicator.

## Quick start

1. Replace the placeholder in `index.html`:
   ```js
   const AUDIUS_API_KEY  = "YOUR_AUDIUS_API_KEY";
   // const AUDIUS_API_SECRET = "YOUR_AUDIUS_API_SECRET"; // backend-only placeholder
   ```

2. Open `index.html` in a browser (or host with GitHub Pages).

## GitHub Pages

- Push `index.html` to the repo root on the `main` branch.
- In the repo settings → **Pages** → **Build and deployment** → Source: **Deploy from a branch** → Branch: `main` (root).
- Your site will publish at: `https://<your-username-or-org>.github.io/mr-flen-music/`.

## Notes

- Uses REST endpoints via `https://api.audius.co` to pick a host and call:
  - `GET /v1/tracks/search?query=...`
  - `GET /v1/tracks/{trackId}/stream`
- The API key is used **client-side (read-only)**. Keep any secrets on a backend only.
