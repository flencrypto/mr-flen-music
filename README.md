# Mr.FLEN Music - Offline-First Training App

An offline-first training app with downloadable music packs for guided workout sessions. Train anywhere, anytime—no internet required after initial setup.

## 🎯 Product Goal

Deliver a training app where:
- **Training plans work offline by default** - All plan content bundled with the app
- **Music packs are downloadable** - Choose what you want, when you want it
- **No bloated install size** - Start small, grow as needed
- **No accounts required** - Privacy-first, local-only data

## ✨ Key Features

### 🏃 Training System
- **Guided workout sessions** with coach voice cues
- **Couch to 5K** training plan (8 weeks, 3 sessions/week)
- **Phase-based progression** (warmup → intervals → cooldown)
- **Offline-ready** - All training data bundled with app

### 🎵 Music Pack System
- **Downloadable packs** optimized for different training phases
- **Offline playback** - Works completely offline after download
- **Smart selection** - Auto-picks tracks based on workout phase:
  - Warmup: Low energy, steady tempo
  - Intervals: High energy, faster tempo  
  - Cooldown: Relaxing, recovery tempo

### 🎧 Audio Experience
- **Coach cue overlay** - Voice guidance plays over music
- **Music ducking** - Volume auto-lowers during cues
- **Interruption handling** - Gracefully handles calls/notifications
- **Bluetooth support** - Works with wireless headphones

### 💾 Storage Management
- **1GB default storage limit** (configurable)
- **Auto cleanup** - Removes least-used packs when needed
- **Favorite protection** - Mark packs to prevent auto-deletion
- **Visual monitoring** - See usage at a glance

## 📱 Screens

### Music Home
- Browse available music packs
- Featured pack recommendations
- Quick access to Downloads and Storage
- Toggle music on/off for sessions

### Pack Detail
- View track list with BPM and energy levels
- Download controls (download, pause, resume, cancel)
- Real-time download progress
- Pack metadata (size, duration, tags)

### Active Session
- Live workout timer with segment tracking
- Current exercise type (warmup, jog, walk, etc.)
- Progress bar for current segment
- Now Playing music strip
- Pause/resume controls

### Downloads
- Active downloads with progress bars
- Pause/resume/cancel individual downloads
- Retry failed downloads
- Download queue management

### Storage Manager
- Storage usage overview
- Installed packs list with sizes
- Mark packs as favorites (★)
- Enable auto-cleanup
- Delete individual packs

## 🏗️ Architecture

### Offline-First Design

**Always Offline (Bundled)**:
- Training plan content
- Coach cue audio files
- Help library content
- App code and UI

**Offline After Download**:
- Music packs (tracks + artwork)
- Pack metadata and checksums

**Never Required**:
- Network access during workouts
- User accounts or login
- Streaming-only dependencies

### Download State Machine

```
NOT_INSTALLED → QUEUED → DOWNLOADING → VERIFYING → INSTALLED
                           ↓           ↓
                        PAUSED      FAILED
```

- **Pause/Resume**: Download can be paused and resumed
- **Cancel**: Cleanup temp files and remove from queue
- **Retry**: Failed downloads can be retried
- **Concurrent Limit**: Max 2 simultaneous downloads

### Pack Architecture

```
packs/
  pack_<id>_<version>/
    manifest.json           # Pack metadata + checksums
    tracks/
      track_001.m4a        # AAC audio files
      track_002.m4a
    art/
      cover.webp           # Pack artwork
      track_001.webp       # Track artwork
```

### Audio Formats
- **Primary**: M4A AAC (192-256 kbps)
- **Wide compatibility** (iOS, Android, Web)
- **Efficient compression** (~3-4MB per track)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- iOS: Xcode 14+ and iOS 13+
- Android: Android Studio and Android 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/flencrypto/mr-flen-music.git
cd mr-flen-music/mobile

# Install dependencies
npm install

# Start the app
npm start
```

### First Run
1. App opens to Music Home screen
2. Browse available music packs
3. Download your first pack (recommended: Starter Pack)
4. Start a training session
5. Music plays automatically based on workout phase

## 🧪 Testing

```bash
cd mobile
npm test
```

Test coverage includes:
- Download state machine
- Storage management and auto-cleanup
- Track filtering for session phases
- Integrity verification (SHA-256)
- Concurrent download limiting

## 📖 Documentation

- [Mobile App README](/mobile/README.md) - Detailed mobile app documentation
- [Pack Delivery System](/docs/pack-delivery-system.md) - Hosting and delivery architecture
- [Training Plan Data](/mobile/src/data/training/trainingPlan.ts) - Couch to 5K plan structure

## 🎨 Design Principles

1. **Offline First** - Works without internet after initial setup
2. **Progressive Enhancement** - Start small, grow as needed
3. **User Privacy** - No accounts, no tracking, local-only data
4. **Performance** - Fast, responsive, battery-efficient
5. **Simplicity** - Focus on core features, skip complexity

## 📦 Pack Catalog

### Starter Run Pack (~174 MB)
- Perfect for Week 1-3
- Steady rhythms and clean beats
- Low to medium energy (2-3/5)
- BPM: 110-128

### High Energy Pack (~205 MB)
- For advanced interval training
- Aggressive, high-tempo tracks
- High energy (4-5/5)
- BPM: 135-150

### Chill Recovery Pack (~149 MB)
- Warmup and cooldown vibes
- Relaxed, recovery tempos
- Low energy (1-2/5)
- BPM: 95-115

## 🛣️ Roadmap

### v1.0 (Current)
- ✅ Offline training plans
- ✅ Downloadable music packs
- ✅ Coach cue overlay
- ✅ Storage management
- ✅ Basic session tracking

### v2.0 (Future)
- [ ] BPM-matched transitions
- [ ] Custom playlist creation
- [ ] Workout history and stats
- [ ] Multiple training plans
- [ ] Social sharing (optional)
- [ ] Cloud backup (optional)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🎵 Music Attribution

Music packs curated by Mr.FLEN. All tracks are properly licensed for use in this application.

## 🔗 Links

- [Mr.FLEN on Audius](https://audius.co/mrflen)
- [Mr.FLEN on SoundCloud](https://soundcloud.com/mrflen)
- [Mr.FLEN on Spotify](https://open.spotify.com/artist/mrflen)

---

**Built with ❤️ by the Mr.FLEN team**
