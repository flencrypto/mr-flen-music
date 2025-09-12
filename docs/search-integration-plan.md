# Search Integration Plan: Audius, SoundCloud & Spotify

This plan describes how **Mr.FLENs Music Finder** will query Audius, SoundCloud and Spotify for
tracks, merge the responses, and present them with in-app playback. A
placeholder is used for the SoundCloud API key.

## 1. API Call Design

### Audius
- Endpoint: `GET https://api.audius.co/v1/search/tracks`
- Params: `query` (user input), `app_name` `MrFLENMusicFinder`
- Filter: only keep results where `track.user.handle === "Mr.FLEN"`

### SoundCloud
- Primary endpoint: `GET https://api.soundcloud.com/tracks`
- Params: `client_id=YOUR_SOUNDCLOUD_API_KEY`, `q=mr-flen`, `limit=20`
- Filter locally so `track.user.username === "mr-flen"`
- Alternative: fetch user ID via `GET /users?q=Mr.FLEN` then `GET /users/{id}/tracks`
  and cache the ID for future calls.

### Spotify
- Endpoint: `GET https://api.spotify.com/v1/search?type=track`
- Params: `q` (user input), `limit`, `offset`
- Authentication: client credentials using `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`

## 2. Merging SoundCloud, Spotify and Audius Results

1. Fire Audius, SoundCloud and Spotify requests in parallel.
2. After all responses resolve, merge into a single array or keep separate
   arrays depending on UI needs.
3. Tag each track with a `platform` field (`"audius"`, `"soundcloud"` or `"spotify"`).
4. Optionally sort by title or `created_at`; duplicate titles remain separate
   entries for now.

## 3. UI Design Considerations

- **Layout**: either a unified list with badges or platform tabs
  ("Audius" / "SoundCloud" / "Spotify").
- **Track Card**: artwork, title, duration, source badge, and a **Go To Track**
  button that navigates to a track details page.
- **Playback Bar**: sticky footer player that can play both Audius and
  SoundCloud tracks.

## 4. In-App Playback

- **Embed**: obtain an iframe via `https://soundcloud.com/oembed?format=json&url=<track_permalink>`.
  Inject the returned HTML into the player area.
- **Audius**: request `GET /tracks/{id}/stream` and feed the URL into an `<audio>` tag.
- **Spotify**: use the `preview_url` from the track object with an `<audio>` tag.
  Some tracks may expose only preview URLs; fall back to opening on spotify.com if unavailable.

## 5. Error Handling & Fallback Behavior

- If SoundCloud search fails, show Audius and Spotify results and display a warning.
- If Spotify search fails, show Audius and SoundCloud results with a notice.
- If Audius fails, show SoundCloud and Spotify results with a notice.
- If all fail, display a "No results" state with a retry option.
- When an embed fails to load or a stream errors, present an "Open on
  the provider" link for that track.

## 6. Authentication & Rate Limit Considerations

- Use a client ID (`YOUR_SOUNDCLOUD_API_KEY`) for public SoundCloud calls; store
  it securely (environment variable or config) rather than hard‑coding.
- Spotify requires both `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` for the token exchange.
- SoundCloud allows ~15k stream requests per 24h per client; monitor `429`
  responses and disable playback if the limit is reached.
- Audius tracks are public and require no API key, but respect informal rate
  limits and cache responses where possible.

## 7. Configuration Placeholder

```html
<script>
  const SOUNDCLOUD_CLIENT_ID = 'YOUR_SOUNDCLOUD_API_KEY';
</script>
```

## 8. Next Steps

- Implement parallel fetch logic and track merging.
- Create a utility for SoundCloud embed rendering.
- Style platform badges and ensure mobile responsiveness.
- Add error notices for failed platform requests.
