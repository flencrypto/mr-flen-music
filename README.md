# Mr.FLEN Music Library

A sleek, HTML-only music browser that unifies **Audius** and **SoundCloud** tracks for Mr.FLEN. The `/public` folder contains the minimal Progressive Web App:

- Dark, glassy dashboard UI.
- Unified search (Audius + SoundCloud) with playback restricted to Mr.FLEN tracks.
- Platform filters to show Audius and/or SoundCloud results.
- Sticky player bar powered by the MediaSession API.
- Installable PWA with offline shell caching.

## Getting started

1. Copy `.env.example` to `.env` and fill in credentials for SoundCloud, Instagram, X, Snapchat, and TikTok.
2. Serve the `public/` directory with any static host or open `public/index.html` directly in a browser.

### OAuth configuration

Each provider requires a client ID exposed via environment variables:

| Provider | Variable | Notes |
| --- | --- | --- |
| Instagram | `INSTAGRAM_CLIENT_ID` | Create an app at [developers.facebook.com](https://developers.facebook.com/apps/) and enable Instagram Basic Display. |
| X | `X_CLIENT_ID` | Register at [developer.twitter.com](https://developer.twitter.com/) and create an OAuth 2.0 Client. |
| Snapchat | `SNAPCHAT_CLIENT_ID` | Use the [Snap Kit portal](https://kit.snapchat.com/portal) to obtain credentials. |
| TikTok | `TIKTOK_CLIENT_ID` | Create an app in the [TikTok developer portal](https://developers.tiktok.com/). |

Populate these values in `.env` before running locally.

## Mobile installation

To use the app like a native player on your phone:

1. Open the hosted `public/index.html` in mobile Chrome (Android) or Safari (iOS).
2. Use the browser menu and choose **Add to Home Screen**.
3. Launch the new home screen icon; the PWA will run full screen and cache assets for offline use.

## Icons

The app icon is loaded from an external source so no binary images live in the repo:

- [Preview](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaF4gcqMi2_jDFJv-rNCvSR7LdGeumndQkew&s)

## Attribution

Powered by the [Audius API](https://audius.org/) and [SoundCloud](https://soundcloud.com/).
