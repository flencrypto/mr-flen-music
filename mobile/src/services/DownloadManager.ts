/**
 * Download manager for music packs with state machine
 */

import { PackInstallState, type PackInstall } from '../types/pack'

export type DownloadProgressCallback = (packId: string, progress: number, bytesDownloaded: number) => void
export type DownloadStateCallback = (packId: string, state: PackInstallState, error?: string) => void

export class DownloadManager {
  private downloads: Map<string, PackInstall> = new Map()
  private progressCallbacks: DownloadProgressCallback[] = []
  private stateCallbacks: DownloadStateCallback[] = []
  private readonly maxConcurrent = 2

  constructor () {
    // Load saved state from storage if needed
  }

  /**
   * Queue a pack for download
   */
  queueDownload (packId: string, version: number, totalBytes: number): void {
    const existing = this.downloads.get(packId)
    if (existing?.state === PackInstallState.DOWNLOADING || existing?.state === PackInstallState.INSTALLED) {
      return
    }

    const install: PackInstall = {
      packId,
      version,
      state: PackInstallState.QUEUED,
      bytesDownloaded: 0,
      totalBytes
    }

    this.downloads.set(packId, install)
    this.notifyStateChange(packId, PackInstallState.QUEUED)
    this.processQueue()
  }

  /**
   * Pause an active download
   */
  pauseDownload (packId: string): void {
    const download = this.downloads.get(packId)
    if (download?.state === PackInstallState.DOWNLOADING) {
      download.state = PackInstallState.PAUSED
      this.downloads.set(packId, download)
      this.notifyStateChange(packId, PackInstallState.PAUSED)
    }
  }

  /**
   * Resume a paused download
   */
  resumeDownload (packId: string): void {
    const download = this.downloads.get(packId)
    if (download?.state === PackInstallState.PAUSED) {
      download.state = PackInstallState.QUEUED
      this.downloads.set(packId, download)
      this.notifyStateChange(packId, PackInstallState.QUEUED)
      this.processQueue()
    }
  }

  /**
   * Cancel a download and cleanup temp files
   */
  cancelDownload (packId: string): void {
    const download = this.downloads.get(packId)
    if (download != null) {
      // Cleanup temp files here
      this.downloads.delete(packId)
      this.notifyStateChange(packId, PackInstallState.NOT_INSTALLED)
    }
  }

  /**
   * Retry a failed download
   */
  retryDownload (packId: string): void {
    const download = this.downloads.get(packId)
    if (download?.state === PackInstallState.FAILED) {
      download.state = PackInstallState.QUEUED
      download.error = undefined
      this.downloads.set(packId, download)
      this.notifyStateChange(packId, PackInstallState.QUEUED)
      this.processQueue()
    }
  }

  /**
   * Get current state of a pack
   */
  getPackState (packId: string): PackInstall | undefined {
    return this.downloads.get(packId)
  }

  /**
   * Get all active downloads
   */
  getActiveDownloads (): PackInstall[] {
    return Array.from(this.downloads.values()).filter(
      d => d.state === PackInstallState.DOWNLOADING ||
           d.state === PackInstallState.QUEUED ||
           d.state === PackInstallState.PAUSED
    )
  }

  /**
   * Register progress callback
   */
  onProgress (callback: DownloadProgressCallback): void {
    this.progressCallbacks.push(callback)
  }

  /**
   * Register state change callback
   */
  onStateChange (callback: DownloadStateCallback): void {
    this.stateCallbacks.push(callback)
  }

  /**
   * Process download queue
   */
  private processQueue (): void {
    const activeCount = Array.from(this.downloads.values()).filter(
      d => d.state === PackInstallState.DOWNLOADING
    ).length

    if (activeCount >= this.maxConcurrent) {
      return
    }

    const queued = Array.from(this.downloads.values()).find(
      d => d.state === PackInstallState.QUEUED
    )

    if (queued != null) {
      void this.startDownload(queued.packId)
    }
  }

  /**
   * Start downloading a pack
   */
  private async startDownload (packId: string): Promise<void> {
    const download = this.downloads.get(packId)
    if (download == null) return

    download.state = PackInstallState.DOWNLOADING
    this.downloads.set(packId, download)
    this.notifyStateChange(packId, PackInstallState.DOWNLOADING)

    try {
      // Simulate download for now
      await this.simulateDownload(packId, download.totalBytes)

      // Verify integrity
      download.state = PackInstallState.VERIFYING
      this.notifyStateChange(packId, PackInstallState.VERIFYING)
      await this.verifyPackIntegrity(packId)

      // Mark as installed
      download.state = PackInstallState.INSTALLED
      download.installedAt = new Date()
      download.path = `packs/pack_${packId}_${download.version}`
      this.downloads.set(packId, download)
      this.notifyStateChange(packId, PackInstallState.INSTALLED)

      // Process next in queue
      this.processQueue()
    } catch (error) {
      download.state = PackInstallState.FAILED
      download.error = error instanceof Error ? error.message : 'Download failed'
      this.downloads.set(packId, download)
      this.notifyStateChange(packId, PackInstallState.FAILED, download.error)
    }
  }

  /**
   * Simulate download progress (replace with actual HTTP download)
   */
  private async simulateDownload (packId: string, totalBytes: number): Promise<void> {
    const chunkSize = totalBytes / 20
    for (let i = 0; i < 20; i++) {
      const download = this.downloads.get(packId)
      if (download?.state !== PackInstallState.DOWNLOADING) {
        throw new Error('Download cancelled or paused')
      }

      await new Promise(resolve => setTimeout(resolve, 100))
      download.bytesDownloaded += chunkSize
      this.downloads.set(packId, download)
      this.notifyProgress(packId, download.bytesDownloaded / totalBytes, download.bytesDownloaded)
    }
  }

  /**
   * Verify pack integrity with checksums
   */
  private async verifyPackIntegrity (packId: string): Promise<void> {
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 500))
    // In real implementation, compute SHA-256 for each file
    // and compare with manifest checksums
  }

  /**
   * Notify progress callbacks
   */
  private notifyProgress (packId: string, progress: number, bytesDownloaded: number): void {
    this.progressCallbacks.forEach(cb => { cb(packId, progress, bytesDownloaded) })
  }

  /**
   * Notify state change callbacks
   */
  private notifyStateChange (packId: string, state: PackInstallState, error?: string): void {
    this.stateCallbacks.forEach(cb => { cb(packId, state, error) })
  }
}

// Singleton instance
export const downloadManager = new DownloadManager()
