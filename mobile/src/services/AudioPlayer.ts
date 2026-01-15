/**
 * Audio playback manager with coach cue overlay
 */

import type { TrackMeta } from '../types/pack'

export enum PlaybackState {
  STOPPED = 'STOPPED',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED'
}

export interface PlaybackInfo {
  currentTrack: TrackMeta | null
  state: PlaybackState
  position: number // seconds
  duration: number // seconds
  volume: number // 0-1
  isDucking: boolean
}

export type PlaybackStateCallback = (info: PlaybackInfo) => void

export class AudioPlayer {
  private currentTrack: TrackMeta | null = null
  private state: PlaybackState = PlaybackState.STOPPED
  private position: number = 0
  private duration: number = 0
  private volume: number = 1.0
  private isDucking: boolean = false
  private callbacks: PlaybackStateCallback[] = []

  // Ducking settings
  private readonly duckVolume = 0.35
  private readonly duckDuration = 1500 // ms

  constructor () {
    // Initialize audio system
  }

  /**
   * Load and play a track
   */
  async playTrack (track: TrackMeta): Promise<void> {
    this.currentTrack = track
    this.duration = track.durationSec
    this.position = 0
    this.state = PlaybackState.PLAYING

    // In real implementation, load audio from localPath
    // and start playback using react-native-sound or expo-av

    this.notifyListeners()
  }

  /**
   * Resume playback
   */
  play (): void {
    if (this.currentTrack != null) {
      this.state = PlaybackState.PLAYING
      this.notifyListeners()
    }
  }

  /**
   * Pause playback
   */
  pause (): void {
    this.state = PlaybackState.PAUSED
    this.notifyListeners()
  }

  /**
   * Stop playback
   */
  stop (): void {
    this.state = PlaybackState.STOPPED
    this.currentTrack = null
    this.position = 0
    this.notifyListeners()
  }

  /**
   * Skip to next track
   */
  skipToNext (): void {
    // This would be handled by the session manager
    // to select the next appropriate track
    this.notifyListeners()
  }

  /**
   * Seek to position in seconds
   */
  seekTo (seconds: number): void {
    if (this.currentTrack != null) {
      this.position = Math.max(0, Math.min(seconds, this.duration))
      this.notifyListeners()
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume (volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    this.notifyListeners()
  }

  /**
   * Play a coach cue with music ducking
   */
  async playCoachCue (cueAudioPath: string, useDucking: boolean = true): Promise<void> {
    if (useDucking && this.state === PlaybackState.PLAYING) {
      // Duck the music
      this.isDucking = true
      const originalVolume = this.volume
      this.setVolume(this.duckVolume)

      // Play the cue on a separate channel
      // In real implementation, use a second audio player for cues
      await this.simulateCoachCue()

      // Restore volume
      setTimeout(() => {
        this.isDucking = false
        this.setVolume(originalVolume)
      }, this.duckDuration)
    } else {
      // Play cue without ducking
      await this.simulateCoachCue()
    }
  }

  /**
   * Simulate coach cue playback (replace with real audio)
   */
  private async simulateCoachCue (): Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, 1500))
  }

  /**
   * Get current playback info
   */
  getPlaybackInfo (): PlaybackInfo {
    return {
      currentTrack: this.currentTrack,
      state: this.state,
      position: this.position,
      duration: this.duration,
      volume: this.volume,
      isDucking: this.isDucking
    }
  }

  /**
   * Subscribe to playback state changes
   */
  onStateChange (callback: PlaybackStateCallback): void {
    this.callbacks.push(callback)
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners (): void {
    const info = this.getPlaybackInfo()
    this.callbacks.forEach(cb => { cb(info) })
  }

  /**
   * Handle audio interruptions (calls, notifications)
   */
  handleInterruption (type: 'began' | 'ended'): void {
    if (type === 'began') {
      if (this.state === PlaybackState.PLAYING) {
        this.pause()
      }
    } else if (type === 'ended') {
      // Optionally resume playback
      // User preference could control this
    }
  }

  /**
   * Handle bluetooth device changes
   */
  handleBluetoothChange (connected: boolean): void {
    if (!connected && this.state === PlaybackState.PLAYING) {
      this.pause()
    }
  }
}

// Singleton instance
export const audioPlayer = new AudioPlayer()
