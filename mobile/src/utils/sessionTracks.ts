/**
 * Session soundtrack utilities for selecting appropriate tracks
 */

import type { TrackMeta } from '../types/pack'

export interface SessionTrackFilter {
  energy?: { min?: number, max?: number }
  bpm?: { min?: number, max?: number }
  tags?: string[]
}

/**
 * Filter tracks for warmup phase (low energy, steady tempo)
 */
export function getWarmupTracks (tracks: TrackMeta[]): TrackMeta[] {
  return tracks.filter(
    track =>
      track.tags.includes('warmup') ||
      track.energy <= 2
  )
}

/**
 * Filter tracks for interval phase (high energy, faster tempo)
 */
export function getIntervalTracks (tracks: TrackMeta[]): TrackMeta[] {
  return tracks.filter(
    track =>
      track.tags.includes('interval') ||
      track.energy >= 3
  )
}

/**
 * Filter tracks for cooldown phase (low energy, relaxed tempo)
 */
export function getCooldownTracks (tracks: TrackMeta[]): TrackMeta[] {
  return tracks.filter(
    track =>
      track.tags.includes('cooldown') ||
      track.energy <= 2
  )
}

/**
 * Filter tracks by energy level (1-5 scale)
 */
export function filterByEnergy (tracks: TrackMeta[], min: number, max: number): TrackMeta[] {
  return tracks.filter(track => track.energy >= min && track.energy <= max)
}

/**
 * Filter tracks by BPM range
 */
export function filterByBpm (tracks: TrackMeta[], min: number, max: number): TrackMeta[] {
  return tracks.filter(track => track.bpm >= min && track.bpm <= max)
}

/**
 * Filter tracks by tags
 */
export function filterByTags (tracks: TrackMeta[], tags: string[]): TrackMeta[] {
  return tracks.filter(track =>
    tags.some(tag => track.tags.includes(tag))
  )
}

/**
 * General purpose track filter with multiple criteria
 */
export function filterTracks (tracks: TrackMeta[], filter: SessionTrackFilter): TrackMeta[] {
  let filtered = tracks

  if (filter.energy != null) {
    if (filter.energy.min != null) {
      filtered = filtered.filter(t => t.energy >= filter.energy!.min!)
    }
    if (filter.energy.max != null) {
      filtered = filtered.filter(t => t.energy <= filter.energy!.max!)
    }
  }

  if (filter.bpm != null) {
    if (filter.bpm.min != null) {
      filtered = filtered.filter(t => t.bpm >= filter.bpm!.min!)
    }
    if (filter.bpm.max != null) {
      filtered = filtered.filter(t => t.bpm <= filter.bpm!.max!)
    }
  }

  if (filter.tags != null && filter.tags.length > 0) {
    filtered = filterByTags(filtered, filter.tags)
  }

  return filtered
}

/**
 * Select next track from a list (simple sequential selection)
 */
export function selectNextTrack (
  tracks: TrackMeta[],
  currentTrackId?: string
): TrackMeta | null {
  if (tracks.length === 0) return null

  if (currentTrackId == null) {
    return tracks[0]
  }

  const currentIndex = tracks.findIndex(t => t.id === currentTrackId)
  if (currentIndex === -1 || currentIndex === tracks.length - 1) {
    return tracks[0] // Loop back to start
  }

  return tracks[currentIndex + 1]
}

/**
 * Shuffle tracks array (Fisher-Yates algorithm)
 */
export function shuffleTracks (tracks: TrackMeta[]): TrackMeta[] {
  const shuffled = [...tracks]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
