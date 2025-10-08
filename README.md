# Mr.FLEN Music Library

A sleek, HTML-only music browser that unifies **Audius**, **SoundCloud**, and **Spotify** tracks for Mr.FLEN. The `/public` folder contains the minimal Progressive Web App:

- Dark, glassy dashboard UI.
- Unified search (Audius + SoundCloud + Spotify) with playback restricted to Mr.FLEN tracks.
- Sticky player bar powered by the MediaSession API.
- Playback controls include previous/next, shuffle, and queue management.
- Installable PWA with offline shell caching.
- Light/dark theme toggle across pages with preference stored in local storage.
- Player supports mute toggle and keyboard shortcuts for play/pause and mute.
- ReFLENgineered section listing all remix tracks.
- New Releases section auto-populated with latest tracks and dropdown linking to month pages.
- Track lists display play and like counts throughout the UI.

## Getting started

1. Copy `.env.example` to `.env` and fill in credentials for Audius, SoundCloud, Spotify, Instagram, X, Snapchat, and TikTok.
2. Serve the `public/` directory with any static host or open `public/index.html` directly in a browser.

## Mobile installation

To use the app like a native player on your phone:

1. Open the hosted `public/index.html` in mobile Chrome (Android) or Safari (iOS).
2. Use the browser menu and choose **Add to Home Screen**.
3. Launch the new home screen icon; the PWA will run full screen and cache assets for offline use.

## Icons

The app icon is loaded from an external source so no binary images live in the repo:

- [Preview](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaF4gcqMi2_jDFJv-rNCvSR7LdGeumndQkew&s)

## Attribution

Powered by the [Audius API](https://audius.org/), [SoundCloud](https://soundcloud.com/), and [Spotify](https://spotify.com/).

## Android app

A React Native mobile client lives in `mobile/` offering native navigation and a track browser.

### Run
1. cd mobile
2. pnpm install
3. pnpm start
