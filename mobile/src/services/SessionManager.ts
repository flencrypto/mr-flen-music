/**
 * Session Manager - Coordinates training sessions with music playback
 */

import { audioPlayer } from './AudioPlayer'
import { storageManager } from './StorageManager'
import {
  getWarmupTracks,
  getIntervalTracks,
  getCooldownTracks,
  selectNextTrack
} from '../utils/sessionTracks'
import type { TrackMeta } from '../types/pack'

export enum SessionPhase {
  WARMUP = 'WARMUP',
  INTERVAL = 'INTERVAL',
  COOLDOWN = 'COOLDOWN',
  RECOVERY = 'RECOVERY'
}

export interface SessionConfig {
  useMusic: boolean
  selectedPackIds?: string[] // If empty, use all installed packs
  duckingEnabled: boolean
}

export class SessionManager {
  private config: SessionConfig = {
    useMusic: true,
    duckingEnabled: true
  }

  private currentPhase: SessionPhase | null = null
  private availableTracks: TrackMeta[] = []
  private phaseTracks: TrackMeta[] = []

  constructor () {
    this.loadAvailableTracks()
  }

  /**
   * Configure session settings
   */
  setConfig (config: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current session configuration
   */
  getConfig (): SessionConfig {
    return this.config
  }

  /**
   * Load available tracks from installed packs
   */
  private loadAvailableTracks (): void {
    if (this.config.selectedPackIds != null && this.config.selectedPackIds.length > 0) {
      // Load tracks from selected packs
      this.availableTracks = this.config.selectedPackIds.flatMap(
        packId => storageManager.getPackTracks(packId)
      )
    } else {
      // Load tracks from all installed packs
      const installedPacks = storageManager.getInstalledPacks()
      this.availableTracks = installedPacks.flatMap(
        pack => storageManager.getPackTracks(pack.packId)
      )
    }
  }

  /**
   * Start a session phase
   */
  startPhase (phase: SessionPhase): void {
    this.currentPhase = phase
    this.loadAvailableTracks()

    if (!this.config.useMusic || this.availableTracks.length === 0) {
      return
    }

    // Select appropriate tracks for this phase
    switch (phase) {
      case SessionPhase.WARMUP:
        this.phaseTracks = getWarmupTracks(this.availableTracks)
        break
      case SessionPhase.INTERVAL:
        this.phaseTracks = getIntervalTracks(this.availableTracks)
        break
      case SessionPhase.COOLDOWN:
      case SessionPhase.RECOVERY:
        this.phaseTracks = getCooldownTracks(this.availableTracks)
        break
    }

    // Start playing the first track
    if (this.phaseTracks.length > 0) {
      void this.playNextTrack()
    }
  }

  /**
   * Play the next track in the current phase
   */
  private async playNextTrack (): Promise<void> {
    if (this.phaseTracks.length === 0) {
      return
    }

    const currentPlayback = audioPlayer.getPlaybackInfo()
    const nextTrack = selectNextTrack(this.phaseTracks, currentPlayback.currentTrack?.id)

    if (nextTrack != null) {
      await audioPlayer.playTrack(nextTrack)
    }
  }

  /**
   * Play a coach cue
   */
  async playCoachCue (cueType: 'warmup' | 'walk' | 'jog' | 'run' | 'recover' | 'cooldown' | 'complete'): Promise<void> {
    // In real implementation, map cue type to audio file
    const cueAudioPath = `cues/${cueType}.m4a`
    await audioPlayer.playCoachCue(cueAudioPath, this.config.duckingEnabled)
  }

  /**
   * End the current session
   */
  endSession (): void {
    audioPlayer.stop()
    this.currentPhase = null
    this.phaseTracks = []
  }

  /**
   * Pause session (pauses music)
   */
  pauseSession (): void {
    audioPlayer.pause()
  }

  /**
   * Resume session (resumes music)
   */
  resumeSession (): void {
    audioPlayer.play()
  }

  /**
   * Get current phase
   */
  getCurrentPhase (): SessionPhase | null {
    return this.currentPhase
  }
}

// Singleton instance
export const sessionManager = new SessionManager()
