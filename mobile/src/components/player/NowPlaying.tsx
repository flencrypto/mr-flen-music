/**
 * Now Playing strip - Shows current track and playback controls
 */

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { audioPlayer, PlaybackState, type PlaybackInfo } from '../../services/AudioPlayer'

export function NowPlaying (): React.JSX.Element | null {
  const [playbackInfo, setPlaybackInfo] = useState<PlaybackInfo>(audioPlayer.getPlaybackInfo())

  useEffect(() => {
    audioPlayer.onStateChange((info) => {
      setPlaybackInfo(info)
    })
  }, [])

  if (playbackInfo.currentTrack == null) {
    return null
  }

  const { currentTrack, state, position, duration } = playbackInfo
  const isPlaying = state === PlaybackState.PLAYING

  const handlePlayPause = (): void => {
    if (isPlaying) {
      audioPlayer.pause()
    } else {
      audioPlayer.play()
    }
  }

  const handleSkip = (): void => {
    audioPlayer.skipToNext()
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (position / duration) * 100 : 0

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <View style={styles.trackMeta}>
            <Text style={styles.trackMetaText}>{currentTrack.bpm} BPM</Text>
            <Text style={styles.trackMetaText}>•</Text>
            <Text style={styles.trackMetaText}>Energy {currentTrack.energy}/5</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
            <Text style={styles.controlIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleSkip}>
            <Text style={styles.controlIcon}>⏭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1c1c1e',
    borderTopWidth: 1,
    borderTopColor: '#38383a'
  },
  progressBar: {
    height: 3,
    backgroundColor: '#38383a'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'space-between'
  },
  trackInfo: {
    flex: 1,
    marginRight: 12
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  trackMetaText: {
    fontSize: 12,
    color: '#8e8e93',
    marginRight: 6
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  timeText: {
    fontSize: 12,
    color: '#8e8e93',
    minWidth: 40,
    textAlign: 'right'
  },
  controlButton: {
    padding: 4
  },
  controlIcon: {
    fontSize: 20,
    color: '#fff'
  }
})
