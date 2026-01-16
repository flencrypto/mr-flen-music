/**
 * Music pack types for offline-first training app
 */

export interface Track {
  id: string
  title: string
  bpm: number
  energy: number // 1-5 scale
  durationSec: number
  file: string
  art: string
  tags: string[] // e.g., ["warmup", "steady", "interval", "cooldown"]
}

export interface PackArt {
  cover: string
}

export interface PackManifest {
  packId: string
  packVersion: number
  minAppVersion: string
  name: string
  description: string
  totalSeconds: number
  sizeBytes: number
  art: PackArt
  tracks: Track[]
  checksums: Record<string, string> // file path -> SHA-256 hash
}

export interface PackCatalogItem {
  packId: string
  latestVersion: number
  name: string
  sizeBytes: number
  totalSeconds: number
  tags: string[]
  coverUrl: string
  description: string
}

export enum PackInstallState {
  NOT_INSTALLED = 'NOT_INSTALLED',
  QUEUED = 'QUEUED',
  DOWNLOADING = 'DOWNLOADING',
  PAUSED = 'PAUSED',
  VERIFYING = 'VERIFYING',
  INSTALLED = 'INSTALLED',
  FAILED = 'FAILED'
}

export interface PackInstall {
  packId: string
  version: number
  state: PackInstallState
  bytesDownloaded: number
  totalBytes: number
  installedAt?: Date
  path?: string
  error?: string
}

export interface TrackMeta {
  id: string
  packId: string
  title: string
  bpm: number
  energy: number
  durationSec: number
  localPath: string
  tags: string[]
}

export interface PackCatalog {
  packs: PackCatalogItem[]
  lastUpdated: Date
}
