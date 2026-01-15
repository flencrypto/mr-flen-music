/**
 * Tests for session track filtering utilities
 */

import {
  getWarmupTracks,
  getIntervalTracks,
  getCooldownTracks,
  filterByEnergy,
  filterByBpm,
  filterByTags,
  filterTracks,
  selectNextTrack,
  shuffleTracks
} from '../sessionTracks'
import type { TrackMeta } from '../../types/pack'

const mockTracks: TrackMeta[] = [
  {
    id: 'track1',
    packId: 'pack1',
    title: 'Easy Start',
    bpm: 110,
    energy: 2,
    durationSec: 240,
    localPath: 'tracks/track1.m4a',
    tags: ['warmup', 'steady']
  },
  {
    id: 'track2',
    packId: 'pack1',
    title: 'Power Run',
    bpm: 140,
    energy: 4,
    durationSec: 300,
    localPath: 'tracks/track2.m4a',
    tags: ['interval', 'high-energy']
  },
  {
    id: 'track3',
    packId: 'pack1',
    title: 'Cool Down',
    bpm: 100,
    energy: 1,
    durationSec: 180,
    localPath: 'tracks/track3.m4a',
    tags: ['cooldown', 'recovery']
  },
  {
    id: 'track4',
    packId: 'pack1',
    title: 'Steady State',
    bpm: 128,
    energy: 3,
    durationSec: 360,
    localPath: 'tracks/track4.m4a',
    tags: ['steady', 'interval']
  }
]

describe('Session Track Filtering', () => {
  describe('getWarmupTracks', () => {
    it('should return tracks with warmup tag or low energy', () => {
      const result = getWarmupTracks(mockTracks)
      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toContain('track1')
      expect(result.map(t => t.id)).toContain('track3')
    })
  })

  describe('getIntervalTracks', () => {
    it('should return tracks with interval tag or high energy', () => {
      const result = getIntervalTracks(mockTracks)
      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toContain('track2')
      expect(result.map(t => t.id)).toContain('track4')
    })
  })

  describe('getCooldownTracks', () => {
    it('should return tracks with cooldown tag or low energy', () => {
      const result = getCooldownTracks(mockTracks)
      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toContain('track1')
      expect(result.map(t => t.id)).toContain('track3')
    })
  })

  describe('filterByEnergy', () => {
    it('should filter tracks by energy range', () => {
      const result = filterByEnergy(mockTracks, 2, 3)
      expect(result).toHaveLength(2)
      expect(result.map(t => t.energy)).toEqual([2, 3])
    })
  })

  describe('filterByBpm', () => {
    it('should filter tracks by BPM range', () => {
      const result = filterByBpm(mockTracks, 120, 150)
      expect(result).toHaveLength(2)
      expect(result.every(t => t.bpm >= 120 && t.bpm <= 150)).toBe(true)
    })
  })

  describe('filterByTags', () => {
    it('should filter tracks by tags', () => {
      const result = filterByTags(mockTracks, ['warmup', 'cooldown'])
      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toContain('track1')
      expect(result.map(t => t.id)).toContain('track3')
    })
  })

  describe('filterTracks', () => {
    it('should filter by energy range', () => {
      const result = filterTracks(mockTracks, { energy: { min: 3, max: 4 } })
      expect(result).toHaveLength(2)
      expect(result.every(t => t.energy >= 3 && t.energy <= 4)).toBe(true)
    })

    it('should filter by BPM range', () => {
      const result = filterTracks(mockTracks, { bpm: { min: 100, max: 120 } })
      expect(result).toHaveLength(2)
    })

    it('should filter by multiple criteria', () => {
      const result = filterTracks(mockTracks, {
        energy: { min: 2 },
        bpm: { min: 120 },
        tags: ['interval']
      })
      expect(result).toHaveLength(2)
    })
  })

  describe('selectNextTrack', () => {
    it('should return first track when no current track', () => {
      const result = selectNextTrack(mockTracks)
      expect(result?.id).toBe('track1')
    })

    it('should return next track in sequence', () => {
      const result = selectNextTrack(mockTracks, 'track1')
      expect(result?.id).toBe('track2')
    })

    it('should loop back to first track at end', () => {
      const result = selectNextTrack(mockTracks, 'track4')
      expect(result?.id).toBe('track1')
    })

    it('should return null for empty track list', () => {
      const result = selectNextTrack([])
      expect(result).toBeNull()
    })
  })

  describe('shuffleTracks', () => {
    it('should return array with same length', () => {
      const result = shuffleTracks(mockTracks)
      expect(result).toHaveLength(mockTracks.length)
    })

    it('should contain all original tracks', () => {
      const result = shuffleTracks(mockTracks)
      const resultIds = result.map(t => t.id).sort()
      const originalIds = mockTracks.map(t => t.id).sort()
      expect(resultIds).toEqual(originalIds)
    })

    it('should not modify original array', () => {
      const original = [...mockTracks]
      shuffleTracks(mockTracks)
      expect(mockTracks).toEqual(original)
    })
  })
})
