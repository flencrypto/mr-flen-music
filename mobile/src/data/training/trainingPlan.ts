/**
 * Training plan data - bundled with app for offline use
 */

export type CoachCueType = 'warmup' | 'walk' | 'jog' | 'run' | 'recover' | 'cooldown' | 'complete'

export interface TrainingSegment {
  id: string
  type: 'warmup' | 'walk' | 'jog' | 'run' | 'recover' | 'cooldown'
  durationSeconds: number
  description: string
  coachCue?: CoachCueType
}

export interface TrainingSession {
  id: string
  week: number
  day: number
  name: string
  totalDurationSeconds: number
  segments: TrainingSegment[]
  description: string
}

export interface TrainingPlan {
  id: string
  name: string
  description: string
  weeks: number
  sessionsPerWeek: number
  sessions: TrainingSession[]
}

/**
 * Couch to 5K style training plan (8 weeks)
 */
export const couchTo5kPlan: TrainingPlan = {
  id: 'couch_to_5k',
  name: 'Couch to 5K',
  description: 'Build from zero to running 5K in 8 weeks',
  weeks: 8,
  sessionsPerWeek: 3,
  sessions: [
    // Week 1, Day 1
    {
      id: 'w1d1',
      week: 1,
      day: 1,
      name: 'Week 1, Day 1',
      totalDurationSeconds: 1260, // 21 minutes
      description: 'Your first session! Start easy with walk/jog intervals.',
      segments: [
        {
          id: 'w1d1_warmup',
          type: 'warmup',
          durationSeconds: 300,
          description: 'Brisk 5-minute warmup walk',
          coachCue: 'warmup'
        },
        {
          id: 'w1d1_jog1',
          type: 'jog',
          durationSeconds: 60,
          description: 'Jog for 1 minute',
          coachCue: 'jog'
        },
        {
          id: 'w1d1_walk1',
          type: 'walk',
          durationSeconds: 90,
          description: 'Walk for 90 seconds',
          coachCue: 'walk'
        },
        {
          id: 'w1d1_jog2',
          type: 'jog',
          durationSeconds: 60,
          description: 'Jog for 1 minute',
          coachCue: 'jog'
        },
        {
          id: 'w1d1_walk2',
          type: 'walk',
          durationSeconds: 90,
          description: 'Walk for 90 seconds',
          coachCue: 'walk'
        },
        {
          id: 'w1d1_jog3',
          type: 'jog',
          durationSeconds: 60,
          description: 'Jog for 1 minute',
          coachCue: 'jog'
        },
        {
          id: 'w1d1_walk3',
          type: 'walk',
          durationSeconds: 90,
          description: 'Walk for 90 seconds',
          coachCue: 'walk'
        },
        {
          id: 'w1d1_jog4',
          type: 'jog',
          durationSeconds: 60,
          description: 'Jog for 1 minute',
          coachCue: 'jog'
        },
        {
          id: 'w1d1_walk4',
          type: 'walk',
          durationSeconds: 90,
          description: 'Walk for 90 seconds',
          coachCue: 'walk'
        },
        {
          id: 'w1d1_cooldown',
          type: 'cooldown',
          durationSeconds: 300,
          description: '5-minute cooldown walk',
          coachCue: 'cooldown'
        }
      ]
    },
    // Week 4, Day 1 (more advanced)
    {
      id: 'w4d1',
      week: 4,
      day: 1,
      name: 'Week 4, Day 1',
      totalDurationSeconds: 1560, // 26 minutes
      description: 'Longer intervals - you\'re building stamina!',
      segments: [
        {
          id: 'w4d1_warmup',
          type: 'warmup',
          durationSeconds: 300,
          description: 'Brisk 5-minute warmup walk',
          coachCue: 'warmup'
        },
        {
          id: 'w4d1_jog1',
          type: 'jog',
          durationSeconds: 180,
          description: 'Jog for 3 minutes',
          coachCue: 'jog'
        },
        {
          id: 'w4d1_walk1',
          type: 'walk',
          durationSeconds: 90,
          description: 'Walk for 90 seconds',
          coachCue: 'walk'
        },
        {
          id: 'w4d1_jog2',
          type: 'jog',
          durationSeconds: 300,
          description: 'Jog for 5 minutes',
          coachCue: 'jog'
        },
        {
          id: 'w4d1_walk2',
          type: 'walk',
          durationSeconds: 150,
          description: 'Walk for 2.5 minutes',
          coachCue: 'walk'
        },
        {
          id: 'w4d1_jog3',
          type: 'jog',
          durationSeconds: 180,
          description: 'Jog for 3 minutes',
          coachCue: 'jog'
        },
        {
          id: 'w4d1_walk3',
          type: 'walk',
          durationSeconds: 90,
          description: 'Walk for 90 seconds',
          coachCue: 'walk'
        },
        {
          id: 'w4d1_jog4',
          type: 'jog',
          durationSeconds: 300,
          description: 'Jog for 5 minutes',
          coachCue: 'jog'
        },
        {
          id: 'w4d1_cooldown',
          type: 'cooldown',
          durationSeconds: 300,
          description: '5-minute cooldown walk',
          coachCue: 'cooldown'
        }
      ]
    },
    // Week 8, Day 3 (Final session)
    {
      id: 'w8d3',
      week: 8,
      day: 3,
      name: 'Week 8, Day 3 - Graduation!',
      totalDurationSeconds: 2100, // 35 minutes
      description: 'Your graduation run - 30 minutes straight!',
      segments: [
        {
          id: 'w8d3_warmup',
          type: 'warmup',
          durationSeconds: 300,
          description: 'Brisk 5-minute warmup walk',
          coachCue: 'warmup'
        },
        {
          id: 'w8d3_run',
          type: 'run',
          durationSeconds: 1800,
          description: 'Run for 30 minutes - you got this!',
          coachCue: 'run'
        },
        {
          id: 'w8d3_cooldown',
          type: 'cooldown',
          durationSeconds: 300,
          description: '5-minute cooldown walk - Congratulations!',
          coachCue: 'cooldown'
        }
      ]
    }
  ]
}

/**
 * Get all sessions for a specific week
 */
export function getWeekSessions (plan: TrainingPlan, week: number): TrainingSession[] {
  return plan.sessions.filter(s => s.week === week)
}

/**
 * Get a specific session
 */
export function getSession (plan: TrainingPlan, week: number, day: number): TrainingSession | undefined {
  return plan.sessions.find(s => s.week === week && s.day === day)
}

/**
 * Calculate total plan duration in seconds
 */
export function getTotalPlanDuration (plan: TrainingPlan): number {
  return plan.sessions.reduce((total, session) => total + session.totalDurationSeconds, 0)
}
