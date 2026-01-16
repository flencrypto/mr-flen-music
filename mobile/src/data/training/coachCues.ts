/**
 * Coach cue audio files metadata - bundled with app
 */

export interface CoachCue {
  id: string
  type: 'warmup' | 'walk' | 'jog' | 'run' | 'recover' | 'cooldown' | 'complete'
  description: string
  audioFile: string // Local bundled path
  durationSeconds: number
}

/**
 * Predefined coach cues (audio bundled with app)
 */
export const coachCues: CoachCue[] = [
  {
    id: 'warmup',
    type: 'warmup',
    description: 'Time to warm up with a brisk walk',
    audioFile: 'assets/audio/cues/warmup.m4a',
    durationSeconds: 3
  },
  {
    id: 'walk',
    type: 'walk',
    description: 'Slow down to a walk and catch your breath',
    audioFile: 'assets/audio/cues/walk.m4a',
    durationSeconds: 2.5
  },
  {
    id: 'jog',
    type: 'jog',
    description: 'Time to jog - keep a steady pace',
    audioFile: 'assets/audio/cues/jog.m4a',
    durationSeconds: 2.5
  },
  {
    id: 'run',
    type: 'run',
    description: 'Start your run - find your rhythm',
    audioFile: 'assets/audio/cues/run.m4a',
    durationSeconds: 2.5
  },
  {
    id: 'recover',
    type: 'recover',
    description: 'Recovery time - walk it off',
    audioFile: 'assets/audio/cues/recover.m4a',
    durationSeconds: 2
  },
  {
    id: 'cooldown',
    type: 'cooldown',
    description: 'Great work! Time to cool down',
    audioFile: 'assets/audio/cues/cooldown.m4a',
    durationSeconds: 3
  },
  {
    id: 'complete',
    type: 'complete',
    description: 'Session complete - amazing job!',
    audioFile: 'assets/audio/cues/complete.m4a',
    durationSeconds: 4
  }
]

/**
 * Get coach cue by type
 */
export function getCoachCue (type: CoachCue['type']): CoachCue | undefined {
  return coachCues.find(cue => cue.type === type)
}

/**
 * Get all available cue types
 */
export function getAvailableCueTypes (): Array<CoachCue['type']> {
  return coachCues.map(cue => cue.type)
}
