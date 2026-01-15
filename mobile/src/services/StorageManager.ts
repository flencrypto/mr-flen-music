/**
 * Storage manager for pack and track data
 */

import type { PackInstall, TrackMeta } from '../types/pack'
import { PackInstallState } from '../types/pack'

export interface StorageInfo {
  usedBytes: number
  maxBytes: number
  packs: Array<{
    packId: string
    sizeBytes: number
    installedAt: Date
    isFavourite: boolean
  }>
}

export class StorageManager {
  private readonly maxStorageBytes = 1024 * 1024 * 1024 // 1GB default
  private installedPacks: Map<string, PackInstall> = new Map()
  private trackMeta: Map<string, TrackMeta> = new Map()
  private favouritePacks: Set<string> = new Set()
  private autoCleanupEnabled = false

  constructor () {
    // Load from persistent storage if needed
  }

  /**
   * Get current storage usage info
   */
  getStorageInfo (): StorageInfo {
    const packs = Array.from(this.installedPacks.values())
      .filter(p => p.state === PackInstallState.INSTALLED)
      .map(p => ({
        packId: p.packId,
        sizeBytes: p.totalBytes,
        installedAt: p.installedAt ?? new Date(),
        isFavourite: this.favouritePacks.has(p.packId)
      }))

    const usedBytes = packs.reduce((sum, p) => sum + p.sizeBytes, 0)

    return {
      usedBytes,
      maxBytes: this.maxStorageBytes,
      packs
    }
  }

  /**
   * Check if there's enough space for a download
   */
  hasSpaceFor (sizeBytes: number): boolean {
    const info = this.getStorageInfo()
    return (info.usedBytes + sizeBytes) <= info.maxBytes
  }

  /**
   * Check if storage is at warning threshold (80%)
   */
  isStorageWarning (): boolean {
    const info = this.getStorageInfo()
    return info.usedBytes >= (info.maxBytes * 0.8)
  }

  /**
   * Add an installed pack to storage tracking
   */
  addInstalledPack (pack: PackInstall): void {
    if (pack.state === PackInstallState.INSTALLED) {
      this.installedPacks.set(pack.packId, pack)
    }
  }

  /**
   * Remove a pack from storage
   */
  removePack (packId: string): void {
    this.installedPacks.delete(packId)
    // Also remove associated track metadata
    const tracksToRemove = Array.from(this.trackMeta.values())
      .filter(t => t.packId === packId)
      .map(t => t.id)
    for (const id of tracksToRemove) {
      this.trackMeta.delete(id)
    }
  }

  /**
   * Mark a pack as favourite (protected from auto-cleanup)
   */
  setPackFavourite (packId: string, isFavourite: boolean): void {
    if (isFavourite) {
      this.favouritePacks.add(packId)
    } else {
      this.favouritePacks.delete(packId)
    }
  }

  /**
   * Check if a pack is favourite
   */
  isPackFavourite (packId: string): boolean {
    return this.favouritePacks.has(packId)
  }

  /**
   * Enable or disable auto-cleanup
   */
  setAutoCleanup (enabled: boolean): void {
    this.autoCleanupEnabled = enabled
  }

  /**
   * Run auto-cleanup to free space
   * Removes least recently used non-favourite packs
   */
  autoCleanup (targetFreeBytes: number): string[] {
    if (!this.autoCleanupEnabled) {
      return []
    }

    const info = this.getStorageInfo()
    const needToFree = (info.usedBytes + targetFreeBytes) - info.maxBytes

    if (needToFree <= 0) {
      return []
    }

    // Sort packs by installation date (oldest first), exclude favourites
    const removablePacks = info.packs
      .filter(p => !p.isFavourite)
      .sort((a, b) => a.installedAt.getTime() - b.installedAt.getTime())

    const removed: string[] = []
    let freedBytes = 0

    for (const pack of removablePacks) {
      if (freedBytes >= needToFree) break
      this.removePack(pack.packId)
      freedBytes += pack.sizeBytes
      removed.push(pack.packId)
    }

    return removed
  }

  /**
   * Add track metadata for quick lookup
   */
  addTrackMeta (track: TrackMeta): void {
    this.trackMeta.set(track.id, track)
  }

  /**
   * Get track metadata by ID
   */
  getTrackMeta (trackId: string): TrackMeta | undefined {
    return this.trackMeta.get(trackId)
  }

  /**
   * Get all tracks for a pack
   */
  getPackTracks (packId: string): TrackMeta[] {
    return Array.from(this.trackMeta.values())
      .filter(t => t.packId === packId)
  }

  /**
   * Get all installed packs
   */
  getInstalledPacks (): PackInstall[] {
    return Array.from(this.installedPacks.values())
      .filter(p => p.state === PackInstallState.INSTALLED)
  }
}

// Singleton instance
export const storageManager = new StorageManager()
