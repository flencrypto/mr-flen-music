# Music Pack Delivery System

This document describes the pack delivery architecture for hosting and serving music packs.

## Overview

Music packs are delivered as downloadable archives over HTTP, designed to work across web (PWA), native mobile, and desktop platforms. The system is CDN-friendly and doesn't require dynamic backend infrastructure.

## Pack Hosting Architecture

### Storage Structure

```
/packs/
  index.json                    # Pack catalog
  starter_run_pack/
    1/
      pack.zip                  # Full pack archive
      manifest.json            # Pack metadata
      checksums.txt            # File checksums
    2/
      pack.zip
      manifest.json
      checksums.txt
  energy_pack_01/
    1/
      pack.zip
      manifest.json
      checksums.txt
```

### Pack Catalog (index.json)

The catalog lists all available packs with metadata:

```json
{
  "lastUpdated": "2026-01-15T00:00:00Z",
  "packs": [
    {
      "packId": "starter_run_pack",
      "latestVersion": 1,
      "name": "Starter Run Pack",
      "description": "Week 1–3: steady uplift, clean rhythm.",
      "sizeBytes": 182334120,
      "totalSeconds": 5420,
      "tags": ["beginner", "steady", "week1-3"],
      "coverUrl": "/packs/starter_run_pack/1/art/cover.webp",
      "manifestUrl": "/packs/starter_run_pack/1/manifest.json",
      "downloadUrl": "/packs/starter_run_pack/1/pack.zip",
      "minAppVersion": "1.0.0"
    }
  ]
}
```

### Pack Archive (pack.zip)

Each pack.zip contains:

```
pack_starter_run_pack_1/
  manifest.json
  tracks/
    track_001.m4a
    track_002.m4a
    track_003.m4a
  art/
    cover.webp
    track_001.webp
    track_002.webp
```

## Pack Manifest Schema

```json
{
  "packId": "starter_run_pack",
  "packVersion": 1,
  "minAppVersion": "1.0.0",
  "name": "Starter Run Pack",
  "description": "Week 1–3: steady uplift, clean rhythm.",
  "totalSeconds": 5420,
  "sizeBytes": 182334120,
  "art": {
    "cover": "art/cover.webp"
  },
  "tracks": [
    {
      "id": "flen_track_001",
      "title": "Morning Momentum",
      "bpm": 124,
      "energy": 3,
      "durationSec": 260,
      "file": "tracks/track_001.m4a",
      "art": "art/track_001.webp",
      "tags": ["warmup", "steady"]
    }
  ],
  "checksums": {
    "manifest.json": "sha256:abc123...",
    "tracks/track_001.m4a": "sha256:def456...",
    "tracks/track_002.m4a": "sha256:ghi789...",
    "art/cover.webp": "sha256:jkl012..."
  }
}
```

## Audio Format Specifications

### Primary Format: M4A AAC
- Container: MP4 (M4A)
- Codec: AAC-LC
- Sample Rate: 44.1 kHz
- Bitrate: 192-256 kbps (VBR or CBR)
- Channels: Stereo

**Rationale**: 
- Wide platform support (iOS, Android, Web)
- Good compression (smaller files than MP3)
- Acceptable quality for workout music

### Optional Web Format: Opus
For web-only optimization:
- Container: WebM or Ogg
- Codec: Opus
- Sample Rate: 48 kHz
- Bitrate: 128-192 kbps (VBR)

**Use Case**: 
- PWA installations can download smaller Opus versions
- Native apps use M4A for better system integration

## Hosting Options

### Option 1: Vercel + R2/S3 (Recommended for MVP)

**Setup**:
1. Host Next.js PWA on Vercel
2. Store packs in Cloudflare R2 or AWS S3
3. Use Vercel rewrites to proxy pack requests

**Vercel Config** (`vercel.json`):
```json
{
  "rewrites": [
    {
      "source": "/api/packs/:path*",
      "destination": "https://packs.r2.dev/:path*"
    }
  ]
}
```

**Pros**:
- Simple setup
- CDN included
- No bandwidth limits on Vercel rewrites to R2
- Cheap storage (~$0.015/GB/month on R2)

**Cons**:
- Initial setup with R2
- Two services to manage

### Option 2: Static CDN (Cloudflare, Bunny, etc.)

**Setup**:
1. Upload packs to CDN origin
2. Configure CORS headers
3. Point app to CDN URLs

**Required Headers**:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Cache-Control: public, max-age=31536000
```

**Pros**:
- Simple architecture
- Great performance
- Cost-effective for read-heavy workloads

**Cons**:
- No dynamic updates without cache purging

### Option 3: GitHub Releases (Dev/Testing)

**Setup**:
1. Create GitHub release for each pack version
2. Upload pack.zip as release asset
3. Apps download from GitHub CDN

**Pros**:
- Free for public repos
- Version control built-in
- Good for testing

**Cons**:
- Not ideal for production
- Rate limits on large files

## Download Flow

### Client-Side Process

```
1. App fetches /packs/index.json
2. User selects pack
3. App downloads pack.zip to temp folder
4. Extract to: packs/.tmp/pack_<id>_<version>_downloading/
5. Verify checksums from manifest
6. Atomic move to: packs/pack_<id>_<version>/
7. Mark as installed
```

### Error Handling

**Network Failure**:
- Keep partial download
- Resume from last byte (if server supports Range requests)
- Retry with exponential backoff

**Checksum Mismatch**:
- Delete corrupted files
- Mark download as FAILED
- Allow user retry

**Storage Full**:
- Show storage warning
- Suggest enabling auto-cleanup
- Offer manual pack deletion

## Versioning & Updates

### Version Scheme
- Use semantic versioning: `1, 2, 3...`
- Each version gets its own folder
- Apps track installed version

### Update Flow

```
1. App checks catalog for pack updates
2. If latestVersion > installed version:
   - Show "Update Available" badge
   - User taps "Update"
3. Download new version to temp
4. Verify integrity
5. Atomic swap (delete old, move new)
6. Update database
```

### Delta Updates (Future)
For large packs, consider binary diffs:
- Use tools like `bsdiff` or `xdelta3`
- Store `.delta` files alongside full archives
- Reduces update bandwidth by 60-90%

## Caching Strategy

### Service Worker (PWA)

```javascript
// Cache catalog for 1 hour
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/packs/index.json')) {
    event.respondWith(
      caches.open('pack-catalog').then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
          return response || fetchPromise
        })
      })
    )
  }
})
```

### HTTP Headers

**Catalog**:
```
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

**Pack Archives**:
```
Cache-Control: public, max-age=31536000, immutable
```

## Security Considerations

### Integrity Verification (Must-Have)
- SHA-256 checksums for all files
- Verify after download, before installation
- Reject corrupted packs

### Optional: Manifest Signing
For tamper protection:
```json
{
  "packId": "starter_run_pack",
  "signature": "base64_encoded_signature",
  "signedBy": "Mr.FLEN Official",
  ...
}
```

**Process**:
1. Sign manifest with private key
2. Bake public key into app
3. Verify signature before accepting pack

### HTTPS Only
- Enforce HTTPS for all pack downloads
- Reject HTTP requests

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Catalog Load | < 1s | On good network |
| Download Start | < 300ms | From tap to first byte |
| UI Responsiveness | Always | Downloads don't block UI |
| Pack Install | < 5s | After download complete |

## Testing Checklist

### Functional
- [ ] Download pack successfully
- [ ] Pause and resume download
- [ ] Cancel download (cleanup temp files)
- [ ] Retry failed download
- [ ] Install and verify integrity
- [ ] Update pack to new version
- [ ] Handle network interruptions
- [ ] Handle storage full scenarios

### Performance
- [ ] Large pack (300MB) downloads in reasonable time
- [ ] UI remains responsive during download
- [ ] Memory usage stable during extraction
- [ ] No battery drain from background downloads

### Security
- [ ] Checksum verification catches corruption
- [ ] Invalid manifests are rejected
- [ ] HTTPS enforced
- [ ] Temp files cleaned up on failure

## Monitoring & Analytics

Track these metrics:
- Download success rate
- Download duration (by pack size)
- Failed downloads (by reason)
- Storage usage distribution
- Pack popularity
- Update adoption rate

## Example Implementation

See `/mobile/src/services/DownloadManager.ts` for the client-side implementation.

For a complete hosting setup example, refer to the Vercel deployment guide in `/docs/vercel-deployment.md`.
