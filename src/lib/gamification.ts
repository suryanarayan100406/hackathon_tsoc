// XP Level Thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Novice', icon: '🌱' },
  { level: 2, xp: 500, title: 'Explorer', icon: '🧭' },
  { level: 3, xp: 1500, title: 'Scholar', icon: '📚' },
  { level: 4, xp: 3500, title: 'Champion', icon: '🏆' },
  { level: 5, xp: 7000, title: 'Legend', icon: '⭐' },
  { level: 6, xp: 12000, title: 'Grandmaster', icon: '👑' },
]

export function getLevelInfo(xp: number) {
  let current = LEVEL_THRESHOLDS[0]
  let next = LEVEL_THRESHOLDS[1]

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i]
      next = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i]
      break
    }
  }

  const xpInLevel = xp - current.xp
  const xpForNextLevel = next.xp - current.xp
  const progress = xpForNextLevel > 0 ? (xpInLevel / xpForNextLevel) * 100 : 100

  return { current, next, progress, xpInLevel, xpForNextLevel }
}

export function calculateStars(score: number, totalQuestions: number): number {
  const percentage = (score / totalQuestions) * 100
  if (percentage >= 90) return 3
  if (percentage >= 70) return 2
  if (percentage >= 50) return 1
  return 0
}

export function calculateXP(
  baseXP: number,
  stars: number,
  streakMultiplier: number = 1
): number {
  const starBonus = stars * 0.25
  return Math.round(baseXP * (1 + starBonus) * streakMultiplier)
}

// Quest Types
export const QUEST_TYPES = {
  QUIZ: { name: 'Lightning Quiz', icon: '⚡', color: '#FF6B35' },
  DRAG_DROP: { name: 'Drag & Drop Lab', icon: '🧪', color: '#2EC4B6' },
  NUMBER_NINJA: { name: 'Number Ninja', icon: '🥷', color: '#9B5DE5' },
  STORY: { name: 'Story Quest', icon: '📖', color: '#F15BB5' },
  MATCH_PAIRS: { name: 'Match Pairs', icon: '🃏', color: '#00BBF9' },
  BATTLE: { name: 'Battle Mode', icon: '⚔️', color: '#EF476F' },
}

// Subject Themes
export const SUBJECT_THEMES = {
  mathematics: { name: 'Math Island', icon: '🏝️', color: '#FF6B35', bgGradient: 'from-orange-500 to-red-500' },
  science: { name: 'Science Volcano', icon: '🌋', color: '#2EC4B6', bgGradient: 'from-teal-500 to-emerald-500' },
  technology: { name: 'Tech Citadel', icon: '🏰', color: '#9B5DE5', bgGradient: 'from-purple-500 to-indigo-500' },
  english: { name: 'Word Wonderland', icon: '📚', color: '#F15BB5', bgGradient: 'from-pink-500 to-rose-500' },
  environmental_studies: { name: 'Nature\'s Realm', icon: '🌿', color: '#06D6A0', bgGradient: 'from-green-500 to-lime-500' },
}

// Badge Definitions
export const BADGE_DEFINITIONS = [
  { name: 'First Blood', description: 'Complete your first quest', icon: '🎯', trigger: 'FIRST_QUEST' },
  { name: 'On Fire', description: '5-day login streak', icon: '🔥', trigger: 'STREAK_5' },
  { name: 'Math Wizard', description: '100% in 3 Math quests', icon: '🧙', trigger: 'MATH_PERFECT_3' },
  { name: 'Science Nerd', description: 'Complete all Science Unit 1 quests', icon: '🔬', trigger: 'SCIENCE_UNIT1' },
  { name: 'Speed Demon', description: 'Finish quiz in under 60s', icon: '💨', trigger: 'SPEED_60' },
  { name: 'Helpful Hero', description: 'Awarded by teacher', icon: '🦸', trigger: 'TEACHER_AWARD' },
  { name: 'Night Owl', description: 'Study session after 9 PM', icon: '🦉', trigger: 'NIGHT_OWL' },
  { name: 'Perfect Week', description: '7-day streak', icon: '🌟', trigger: 'STREAK_7' },
  { name: 'Battle Champion', description: 'Win 10 Battle Mode duels', icon: '⚔️', trigger: 'BATTLE_10' },
  { name: 'Polyglot', description: 'Use platform in 2+ languages', icon: '🌍', trigger: 'POLYGLOT' },
  { name: 'Quick Learner', description: 'Complete 5 quests in one day', icon: '🚀', trigger: 'DAILY_5' },
  { name: 'Perfectionist', description: 'Get 3 stars on 10 quests', icon: '💎', trigger: 'STARS_10' },
  { name: 'Explorer', description: 'Try all 5 subject areas', icon: '🧭', trigger: 'ALL_SUBJECTS' },
  { name: 'Rising Star', description: 'Reach Level 2', icon: '⭐', trigger: 'LEVEL_2' },
  { name: 'Champion', description: 'Reach Level 4', icon: '🏆', trigger: 'LEVEL_4' },
  { name: 'Marathon Runner', description: '30-day streak', icon: '🏃', trigger: 'STREAK_30' },
  { name: 'Century', description: 'Earn 10000 XP total', icon: '💯', trigger: 'XP_10000' },
  { name: 'Genius', description: 'Score 100% on 5 hard quests', icon: '🧠', trigger: 'HARD_PERFECT_5' },
  { name: 'Social Butterfly', description: 'Join a school', icon: '🦋', trigger: 'JOIN_SCHOOL' },
  { name: 'Comeback Kid', description: 'Return after 7 days away', icon: '💪', trigger: 'COMEBACK' },
]
