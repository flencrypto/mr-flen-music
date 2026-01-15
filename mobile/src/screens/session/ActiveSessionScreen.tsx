/**
 * Active Session Screen - Shows running workout with music
 */

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import { sessionManager, SessionPhase } from '../../services/SessionManager'
import { audioPlayer, PlaybackState, type PlaybackInfo } from '../../services/AudioPlayer'
import type { TrainingSession, TrainingSegment } from '../../data/training/trainingPlan'
import { NowPlaying } from '../../components/player/NowPlaying'

interface Props {
  session: TrainingSession
  onComplete: () => void
  onExit: () => void
}

export function ActiveSessionScreen ({ session, onComplete, onExit }: Props): React.JSX.Element {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [playbackInfo, setPlaybackInfo] = useState<PlaybackInfo>(audioPlayer.getPlaybackInfo())

  const currentSegment = session.segments[currentSegmentIndex]
  const segmentProgress = currentSegment != null ? elapsedSeconds / currentSegment.durationSeconds : 0

  useEffect(() => {
    // Start the session
    startSession()

    // Subscribe to playback changes
    audioPlayer.onStateChange((info) => {
      setPlaybackInfo(info)
    })

    return () => {
      sessionManager.endSession()
    }
  }, [])

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setElapsedSeconds(prev => {
        const newElapsed = prev + 1

        // Check if current segment is complete
        if (currentSegment != null && newElapsed >= currentSegment.durationSeconds) {
          if (currentSegmentIndex < session.segments.length - 1) {
            // Move to next segment
            const nextIndex = currentSegmentIndex + 1
            setCurrentSegmentIndex(nextIndex)
            transitionToSegment(session.segments[nextIndex])
            return 0
          } else {
            // Session complete
            handleSessionComplete()
            return prev
          }
        }

        return newElapsed
      })
    }, 1000)

    return () => { clearInterval(interval) }
  }, [isPaused, currentSegmentIndex, currentSegment])

  const startSession = (): void => {
    if (currentSegment != null) {
      const phase = getPhaseFromSegmentType(currentSegment.type)
      sessionManager.startPhase(phase)

      if (currentSegment.coachCue != null) {
        void sessionManager.playCoachCue(currentSegment.coachCue as any)
      }
    }
  }

  const transitionToSegment = (segment: TrainingSegment): void => {
    const phase = getPhaseFromSegmentType(segment.type)
    sessionManager.startPhase(phase)

    if (segment.coachCue != null) {
      void sessionManager.playCoachCue(segment.coachCue as any)
    }
  }

  const getPhaseFromSegmentType = (type: TrainingSegment['type']): SessionPhase => {
    switch (type) {
      case 'warmup':
        return SessionPhase.WARMUP
      case 'walk':
      case 'jog':
      case 'run':
        return SessionPhase.INTERVAL
      case 'recover':
        return SessionPhase.RECOVERY
      case 'cooldown':
        return SessionPhase.COOLDOWN
      default:
        return SessionPhase.INTERVAL
    }
  }

  const handlePause = (): void => {
    setIsPaused(true)
    sessionManager.pauseSession()
  }

  const handleResume = (): void => {
    setIsPaused(false)
    sessionManager.resumeSession()
  }

  const handleSessionComplete = (): void => {
    void sessionManager.playCoachCue('complete')
    setTimeout(() => {
      sessionManager.endSession()
      onComplete()
    }, 3000)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSegmentColor = (type: TrainingSegment['type']): string => {
    switch (type) {
      case 'warmup': return '#4caf50'
      case 'walk': return '#8bc34a'
      case 'jog': return '#ff9800'
      case 'run': return '#f44336'
      case 'recover': return '#03a9f4'
      case 'cooldown': return '#00bcd4'
      default: return '#9e9e9e'
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sessionName}>{session.name}</Text>
        <TouchableOpacity onPress={onExit}>
          <Text style={styles.exitButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segmentInfo}>
        <View style={[styles.segmentBadge, { backgroundColor: getSegmentColor(currentSegment?.type ?? 'warmup') }]}>
          <Text style={styles.segmentType}>{currentSegment?.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.segmentDescription}>{currentSegment?.description}</Text>
      </View>

      <View style={styles.timer}>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
        <Text style={styles.timerSubtext}>
          of {formatTime(currentSegment?.durationSeconds ?? 0)}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${segmentProgress * 100}%` }]} />
      </View>

      <View style={styles.segmentsList}>
        <Text style={styles.segmentsTitle}>Segments</Text>
        {session.segments.map((segment, index) => (
          <View
            key={segment.id}
            style={[
              styles.segmentRow,
              index === currentSegmentIndex && styles.segmentRowActive
            ]}
          >
            <View style={[styles.segmentDot, { backgroundColor: getSegmentColor(segment.type) }]} />
            <Text style={[
              styles.segmentRowText,
              index === currentSegmentIndex && styles.segmentRowTextActive
            ]}>
              {segment.description}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        {!isPaused ? (
          <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
            <Text style={styles.controlButtonText}>⏸ Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.controlButton} onPress={handleResume}>
            <Text style={styles.controlButtonText}>▶️ Resume</Text>
          </TouchableOpacity>
        )}
      </View>

      {playbackInfo.currentTrack != null && <NowPlaying />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  exitButton: {
    fontSize: 24,
    color: '#fff',
    padding: 8
  },
  segmentInfo: {
    padding: 20,
    alignItems: 'center'
  },
  segmentBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12
  },
  segmentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  segmentDescription: {
    fontSize: 18,
    color: '#ddd',
    textAlign: 'center'
  },
  timer: {
    alignItems: 'center',
    marginVertical: 30
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff'
  },
  timerSubtext: {
    fontSize: 18,
    color: '#999',
    marginTop: 8
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#333',
    marginHorizontal: 20,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4
  },
  segmentsList: {
    flex: 1,
    padding: 20
  },
  segmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  segmentRowActive: {
    opacity: 1
  },
  segmentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12
  },
  segmentRowText: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  segmentRowTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  controls: {
    padding: 20
  },
  controlButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
})
