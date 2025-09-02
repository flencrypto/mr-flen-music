# Search Integration Plan: Audius & SoundCloud

This plan describes how **Mr.FLENs Music Finder** will query Audius and SoundCloud for
tracks, merge the responses, and present them with in-app playback. A
placeholder is used for the SoundCloud API key.

## 1. API Call Design

### Audius
- Endpoint: `GET https://api.audius.co/v1/search/tracks`
- Params: `query` (user input), `app_name` `MrFLENMusicFinder`
- Filter: only keep results where `track.user.handle === "mrflen"`

### SoundCloud
- Primary endpoint: `GET https://api.soundcloud.com/tracks`
- Params: `client_id=YOUR_SOUNDCLOUD_API_KEY`, `q=Mr.FLEN`, `limit=20`
- Filter locally so `track.user.username === "Mr.FLEN"`
- Alternative: fetch user ID via `GET /users?q=Mr.FLEN` then `GET /users/{id}/tracks`
  and cache the ID for future calls.

## 2. Merging SoundCloud and Audius Results

1. Fire Audius and SoundCloud requests in parallel.
2. After both responses resolve, merge into a single array or keep separate
   arrays depending on UI needs.
3. Tag each track with a `platform` field (`"audius"` or `"soundcloud"`).
4. Optionally sort by title or `created_at`; duplicate titles remain separate
   entries for now.

## 3. UI Design Considerations

- **Layout**: either a unified list with badges or platform tabs
  ("Audius" / "SoundCloud").
- **Track Card**: artwork, title, duration, source badge, and a **Go To Track**
  button that navigates to a track details page.
- **Playback Bar**: sticky footer player that can play both Audius and
  SoundCloud tracks.

## 4. In-App Playback: SoundCloud Embed vs Streaming

- **Embed**: obtain an iframe via `https://soundcloud.com/oembed?format=json&url=<track_permalink>`.
  Inject the returned HTML into the player area.
- **Direct stream** (future enhancement): request
  `GET /tracks/{id}/streams` and use `http_mp3_128_url` with an `<audio>` tag.
  Some tracks may expose only preview URLs; fall back to opening on
  soundcloud.com if streaming fails.

## 5. Error Handling & Fallback Behavior

- If SoundCloud search fails, show Audius results and display a warning.
- If Audius fails, show SoundCloud results with a notice.
- If both fail, display a "No results" state with a retry option.
- When an embed fails to load or a stream errors, present an "Open on
  SoundCloud" link for that track.

## 6. Authentication & Rate Limit Considerations

- Use a client ID (`YOUR_SOUNDCLOUD_API_KEY`) for public SoundCloud calls; store
  it securely (environment variable or config) rather than hard‑coding.
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
