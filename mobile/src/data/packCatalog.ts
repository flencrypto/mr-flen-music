/**
 * Sample pack catalog data
 */

import type { PackCatalogItem, PackManifest } from '../types/pack'

export const packCatalog: PackCatalogItem[] = [
  {
    packId: 'starter_run_pack',
    latestVersion: 1,
    name: 'Starter Run Pack',
    sizeBytes: 182334120, // ~174 MB
    totalSeconds: 5420, // ~90 minutes
    tags: ['beginner', 'steady', 'week1-3'],
    coverUrl: 'https://placekitten.com/300/300',
    description: 'Week 1–3: steady uplift, clean rhythm. Perfect for building your base.'
  },
  {
    packId: 'energy_pack_01',
    latestVersion: 1,
    name: 'High Energy Pack',
    sizeBytes: 215000000, // ~205 MB
    totalSeconds: 4200,
    tags: ['advanced', 'high-energy', 'interval'],
    coverUrl: 'https://placekitten.com/301/301',
    description: 'High BPM tracks for intense interval training and peak performance.'
  },
  {
    packId: 'chill_recovery_pack',
    latestVersion: 1,
    name: 'Chill Recovery Pack',
    sizeBytes: 156000000, // ~149 MB
    totalSeconds: 3600,
    tags: ['recovery', 'cooldown', 'warmup'],
    coverUrl: 'https://placekitten.com/302/302',
    description: 'Relaxed tempos for warmup and cooldown sessions.'
  }
]

// Sample manifest for starter pack
export const sampleManifest: PackManifest = {
  packId: 'starter_run_pack',
  packVersion: 1,
  minAppVersion: '1.0.0',
  name: 'Starter Run Pack',
  description: 'Week 1–3: steady uplift, clean rhythm.',
  totalSeconds: 5420,
  sizeBytes: 182334120,
  art: {
    cover: 'art/cover.webp'
  },
  tracks: [
    {
      id: 'flen_track_001',
      title: 'Morning Momentum',
      bpm: 124,
      energy: 3,
      durationSec: 260,
      file: 'tracks/track_001.m4a',
      art: 'art/track_001.webp',
      tags: ['warmup', 'steady']
    },
    {
      id: 'flen_track_002',
      title: 'Steady State',
      bpm: 128,
      energy: 3,
      durationSec: 280,
      file: 'tracks/track_002.m4a',
      art: 'art/track_002.webp',
      tags: ['steady', 'interval']
    },
    {
      id: 'flen_track_003',
      title: 'Easy Rhythm',
      bpm: 118,
      energy: 2,
      durationSec: 240,
      file: 'tracks/track_003.m4a',
      art: 'art/track_003.webp',
      tags: ['cooldown', 'recovery']
    }
  ],
  checksums: {
    'manifest.json': 'sha256:abc123...',
    'tracks/track_001.m4a': 'sha256:def456...',
    'tracks/track_002.m4a': 'sha256:ghi789...',
    'tracks/track_003.m4a': 'sha256:jkl012...'
  }
}
