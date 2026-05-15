# 🎮 VidyaQuest — Gamification Engine

## XP System

### Earning XP
| Action | Base XP | Notes |
|--------|---------|-------|
| Complete quest (1 star) | 30 | 50%+ score |
| Complete quest (2 stars) | 50 | 70%+ score |
| Complete quest (3 stars) | 75 | 90%+ score |
| Streak bonus (daily) | 10 × streak_days | Cap at 100 |
| First quest of the day | 20 | Daily bonus |
| Speed bonus (<60s finish) | 15 | Quiz only |

### XP Calculation Formula
```
finalXP = baseXP × (1 + starBonus) × streakMultiplier

starBonus = stars × 0.25
streakMultiplier:
  - 3 correct streak = 1.5x
  - 5 correct streak = 2.0x
  - 7+ correct streak = 2.5x
```

### Level Thresholds
| Level | Title | XP Required | Icon |
|-------|-------|-------------|------|
| 1 | Novice | 0 | 🌱 |
| 2 | Explorer | 500 | 🧭 |
| 3 | Scholar | 1,500 | 📚 |
| 4 | Champion | 3,500 | 🏆 |
| 5 | Legend | 7,000 | ⭐ |
| 6 | Grandmaster | 12,000 | 👑 |

**Level-up event**: Full-screen confetti animation + "Level Up!" popup

---

## Badge System (20 Badges)

| # | Badge | Description | Trigger Logic | Icon |
|---|-------|-------------|---------------|------|
| 1 | First Blood | Complete first quest | `quest_count >= 1` | 🎯 |
| 2 | On Fire | 5-day login streak | `streak_days >= 5` | 🔥 |
| 3 | Math Wizard | 100% in 3 Math quests | `math_perfect_count >= 3` | 🧙 |
| 4 | Science Nerd | Complete all Science Unit 1 | `science_unit1_complete == true` | 🔬 |
| 5 | Speed Demon | Finish quiz in under 60s | `quiz_time < 60` | 💨 |
| 6 | Helpful Hero | Teacher manually awards | `teacher_award == true` | 🦸 |
| 7 | Night Owl | Study after 9 PM | `session_hour >= 21` | 🦉 |
| 8 | Perfect Week | 7-day streak | `streak_days >= 7` | 🌟 |
| 9 | Battle Champion | Win 10 duels | `battle_wins >= 10` | ⚔️ |
| 10 | Polyglot | Use 2+ languages | `languages_used >= 2` | 🌍 |
| 11 | Quick Learner | 5 quests in one day | `daily_quests >= 5` | 🚀 |
| 12 | Perfectionist | 3 stars on 10 quests | `three_star_count >= 10` | 💎 |
| 13 | Explorer | Try all 5 subjects | `subjects_tried >= 5` | 🧭 |
| 14 | Rising Star | Reach Level 2 | `level >= 2` | ⭐ |
| 15 | Champion | Reach Level 4 | `level >= 4` | 🏆 |
| 16 | Marathon Runner | 30-day streak | `streak_days >= 30` | 🏃 |
| 17 | Century | Earn 10,000 XP | `total_xp >= 10000` | 💯 |
| 18 | Genius | 100% on 5 hard quests | `hard_perfect >= 5` | 🧠 |
| 19 | Social Butterfly | Join a school | `school_id != null` | 🦋 |
| 20 | Comeback Kid | Return after 7 days away | `days_since_last >= 7` | 💪 |

### Badge Check Flow
```
After each quest submission:
  1. Fetch user stats (XP, streak, quest count, etc.)
  2. Run badge trigger checks against all un-earned badges
  3. If triggered → insert UserBadge + show celebration
  4. Celebration: badge icon animates in + confetti + "+Badge!" toast
```

---

## Leaderboard

### Scope
- **Class**: Students in same school + grade
- **School**: All students in same school
- **Global**: All students (future)

### Weekly Reset
- Resets every **Sunday at midnight IST** (UTC+5:30)
- Stores `weeklyXP` separate from `totalXP`
- Leaderboard ranks by `weeklyXP`
- Previous week's top 3 get bonus badge consideration

### UI
- Shows top 10 with rank, avatar, name, weekly XP, badge count
- Current user always pinned at bottom if not in top 10
- Top 3: 🥇 🥈 🥉 medal icons
- Animated rank changes (arrow up/down)

---

## Streak System

### Rules
- One quest completion per day = streak maintained
- Streak resets at midnight IST if no activity
- **Streak Freeze**: Purchasable item for 100 XP, prevents reset for 1 day
- Max 2 streak freezes at a time

### UI: Calendar Heatmap
- GitHub-style contribution grid on profile page
- Colors: no activity (gray), 1 quest (light green), 3+ quests (dark green), 5+ (gold)
- Shows last 90 days

---

## Star Rating

| Score % | Stars | Visual |
|---------|-------|--------|
| < 50% | 0 | ☆☆☆ |
| 50–69% | 1 | ★☆☆ |
| 70–89% | 2 | ★★☆ |
| 90–100% | 3 | ★★★ |
