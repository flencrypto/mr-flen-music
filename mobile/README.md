# Mr.FLEN Music - Mobile Training App

An offline-first training app with downloadable music packs for workout sessions.

## Features

### 🎵 Music Pack System
- **Downloadable Music Packs**: Download curated music packs optimized for different training phases
- **Offline Playback**: All downloaded music works completely offline
- **Smart Pack Management**: Automatic storage management with favorite pack protection

### 📦 Pack Types
- **Starter Pack**: Beginner-friendly tracks with steady rhythms (Week 1-3)
- **Energy Packs**: High BPM tracks for intense interval training
- **Chill Packs**: Relaxed tempos for warmup and cooldown

### 🎧 Audio System
- **Coach Cue Overlay**: Voice cues play over music during sessions
- **Music Ducking**: Music volume automatically lowers during cues
- **Interruption Handling**: Gracefully handles calls and notifications
- **Bluetooth Support**: Works with wireless headphones

### 💾 Storage Management
- **1GB Default Limit**: Configurable storage quota
- **Auto Cleanup**: Automatically removes least-used packs when needed
- **Favorite Protection**: Mark packs as favorites to protect from auto-cleanup
- **Storage Monitoring**: Visual indicators when approaching storage limits

### 🏃 Session Integration
- **Phase-Based Selection**: Automatically selects appropriate tracks for:
  - Warmup: Low energy, steady tempo
  - Intervals: High energy, faster tempo
  - Cooldown: Relaxing, recovery tempo
- **Track Filtering**: Filter by BPM, energy level, and tags

## Architecture

### State Machine
Downloads follow a robust state machine:
- `NOT_INSTALLED` → `QUEUED` → `DOWNLOADING` → `VERIFYING` → `INSTALLED`
- Supports pause, resume, cancel, and retry operations
- Concurrent download limiting (max 2 simultaneous)

### Integrity & Safety
- SHA-256 checksum verification for all downloaded files
- Atomic installation (download to temp, verify, then move)
- Resumable downloads on network interruptions
- Graceful failure handling with retry capability

### Pack Structure
```
packs/
  pack_<id>_<version>/
    manifest.json
    tracks/
      track_001.m4a
      track_002.m4a
    art/
      cover.webp
```

### Pack Manifest
Each pack includes metadata:
```json
{
  "packId": "starter_run_pack",
  "packVersion": 1,
  "name": "Starter Run Pack",
  "totalSeconds": 5420,
  "sizeBytes": 182334120,
  "tracks": [
    {
      "id": "flen_track_001",
      "title": "Morning Momentum",
      "bpm": 124,
      "energy": 3,
      "durationSec": 260,
      "tags": ["warmup", "steady"]
    }
  ],
  "checksums": {
    "tracks/track_001.m4a": "sha256:..."
  }
}
```

## Screens

### Music Home
- Featured pack showcase
- List of all available packs with metadata
- Toggle for using music in sessions
- Quick access to Downloads and Storage

### Pack Detail
- Track listing with BPM and energy indicators
- Download controls (download, pause, resume, cancel)
- Progress bar for active downloads
- Pack metadata (size, duration, tags)

### Downloads
- Active downloads with progress indicators
- Pause/resume/cancel controls
- Failed download retry
- Download queue management

### Storage Manager
- Storage usage overview with visual progress bar
- List of installed packs with sizes
- Favorite pack marking
- Auto-cleanup toggle
- Individual pack deletion

## Usage

### Download a Pack
1. Open the Music tab
2. Browse available packs
3. Tap a pack to view details
4. Tap "Download Pack"
5. Monitor progress in Downloads screen

### Use in Sessions
1. Ensure "Use music in sessions" is enabled
2. Download at least one pack
3. Start a training session
4. Music will automatically play based on session phase:
   - Warmup: Low energy tracks
   - Intervals: High energy tracks
   - Cooldown: Recovery tracks

### Manage Storage
1. Navigate to Storage screen
2. View current usage and installed packs
3. Mark important packs as favorites (★)
4. Enable auto-cleanup if desired
5. Manually delete packs to free space

## Testing

The app includes comprehensive tests:

```bash
cd mobile
npm test
```

Test coverage includes:
- Download state machine transitions
- Storage management and cleanup
- Track filtering for session phases
- Integrity verification
- Concurrent download limiting

## Technical Details

### Services
- **DownloadManager**: Handles pack downloads with state machine
- **StorageManager**: Tracks storage usage and manages cleanup
- **AudioPlayer**: Playback with coach cue overlay and ducking
- **SessionManager**: Coordinates sessions with music selection

### Utilities
- **sessionTracks**: Filter and select tracks based on session phase
- Track filtering by BPM, energy, and tags
- Sequential and shuffled playback support

## Future Enhancements (v2)

- [ ] BPM-matched track transitions
- [ ] Smart track recommendations based on workout history
- [ ] Pack updates with delta downloads
- [ ] Cross-platform sync (optional cloud backup)
- [ ] Custom playlist creation
- [ ] Social features (share workouts)
- [ ] Advanced beatmatching

## Requirements

- React Native 0.79+
- Expo SDK 53+
- iOS 13+ / Android 8+
- Minimum 1GB free storage recommended

## License

MIT
