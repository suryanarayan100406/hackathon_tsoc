# 🎮 Teacher Quest Gamification Guide

## Overview

Teachers can now configure advanced gamification settings when creating quests. Each quest can be customized with rewards, difficulty, pass marks, and quest types to create an engaging learning experience.

---

## Quest Creation Form

### Available Fields

#### **1. 🎮 Quest Type**
Choose the type of learning content:
- **📚 Lesson** - Read-only learning material (50 XP base)
- **📝 Quiz** - Multiple choice questions (100 XP base)
- **🏆 Boss Battle** - Final assessment quiz (200 XP base)

**Impact:**
- Students must complete lessons before attempting quizzes
- Boss battles are only unlocked after previous units are passed
- Boss battles award maximum XP and streak bonuses

#### **2. 🎯 Difficulty**
Set the challenge level:
- **⭐ Easy** - 5-10 minutes, straightforward questions
- **⭐⭐ Medium** - 10-20 minutes, requires thinking
- **⭐⭐⭐ Hard** - 20+ minutes, challenging concepts

**Display:**
- Color-coded badges in student view
- Affects recommended prerequisites

#### **3. ⚡ XP Reward**
Experience points awarded on completion:
- **Lessons:** 50-70 XP (no pass condition)
- **Quizzes:** 100-150 XP (if passed)
- **Boss Battles:** 200+ XP (if passed)

**Calculation:**
```
Total XP = Base Reward × Difficulty Multiplier
- Easy: 1.0x
- Medium: 1.2x
- Hard: 1.5x
```

#### **4. ✅ Pass Mark (%)**
Minimum score needed to:
- Get XP reward
- Unlock next quest
- Count as "complete"

**Common Values:**
- `70%` - Typical pass (default)
- `80%` - Challenging
- `90%` - Mastery level
- `100%` - Perfect score only

#### **5. ⏱️ Time Limit (seconds)**
How long students have to complete:
- **300 sec** (5 min) - Quick quizzes
- **600 sec** (10 min) - Standard
- **1200 sec** (20 min) - Comprehensive
- **3600 sec** (1 hour) - Exams

**Features:**
- Students get speed bonus if they finish early
- Timer restarts on quiz retry
- Shows remaining time during attempt

---

## Creating a Complete Curriculum Unit

### Example: Algebra Basics

**Quest 1 - Lesson (Intro)**
```
Type: LESSON
Difficulty: Easy
XP: 50
Pass Mark: N/A (lessons always complete)
Time: 300 sec
```

**Quest 2 - Quiz (Understanding)**
```
Type: QUIZ  
Difficulty: Easy
XP: 100
Pass Mark: 70%
Time: 600 sec
```

**Quest 3 - Quiz (Practice)**
```
Type: QUIZ
Difficulty: Medium
XP: 120
Pass Mark: 75%
Time: 800 sec
```

**Quest 4 - Boss Battle (Mastery)**
```
Type: BOSS
Difficulty: Hard
XP: 200
Pass Mark: 80%
Time: 1200 sec
```

---

## Best Practices

### ✅ DO:
- **Start Easy** - Begin each unit with easy lessons
- **Progressive Difficulty** - Increase difficulty with each quest
- **Realistic Pass Marks** - 70-80% is standard (not too harsh)
- **Meaningful XP** - Higher XP for harder quests
- **Time Expectations** - Give realistic time limits

### ❌ DON'T:
- Set pass mark too high (100%) - discourages students
- Set pass mark too low (50%) - no real learning check
- Mix difficulties randomly - confuses progression
- Boss battles without prerequisites - frustrating
- Unrealistic time limits - unfair pressure

---

## Viewing Quest Gamification

In the **My Quests** section, each quest shows:
```
📝 Quiz Title
  ⭐⭐ Medium    +120 XP    Pass: 75%
```

**Badges explain:**
- Difficulty level (color-coded)
- XP rewarded
- Pass mark required

---

## Gamification Features Unlocked

### Badge System
Automatically awarded to students:
- **First Blood** 🌟 - Complete first quest
- **On Fire** 🔥 - 3-day streak
- **Math Warrior** 🧮 - Complete 5 math quests
- **Quiz Champion** 💯 - Score 100% on any quiz
- **Boss Slayer** 🏅 - Pass first boss battle

### Leaderboard Tracking
Students compete by:
- **Global XP** - All students
- **Class Ranking** - Within same class
- **Weekly Challenge** - Top performers this week

### Level Progression
```
XP 0-499   → Level 1
XP 500-999 → Level 2
XP 1000+   → Level 3+
```

---

## Editing & Reordering Quests

**To modify a quest:**
1. Navigate to **My Quests**
2. Click on the subject
3. Find the quest and click edit (button functionality coming soon)

**To reorder quests:**
```
Drag and drop in quest list (coming soon)
```

---

## Multilingual Quest Support

Each quest field supports multiple languages:
- **Title** - In English + Hindi
- **Questions** - Can be in any language
- **Explanations** - Support for all languages

Students select their preferred language on dashboard.

---

## Advanced: Custom Rubrics

For boss battles, consider:
```
Excellent (90-100%): +200 XP + Boss Badge
Good (80-89%):       +150 XP + Level Up
Passing (70-79%):    +100 XP + Streak +1
Failing (<70%):      0 XP + Can Retry
```

---

## Troubleshooting

### Issue: Students can't unlock next quest
**Check:**
- Is current quest pass mark set too high?
- Did they actually pass the quiz?
- Is next quest properly linked to unit?

### Issue: XP rewards seem low
**Solution:**
- Increase XP reward in quest settings
- Consider multiplier for difficult quests
- Verify boss battles have high rewards (200+)

### Issue: Students complaining about time limit
**Solution:**
- Increase time limit (go to My Quests, edit)
- Add 2-3 min buffer for each question
- Standard: ~2 min per difficult question

---

## Statistics & Analytics

View quest performance:
- **Completion Rate** - How many students passed
- **Average Score** - Overall performance
- **Average Time** - How long students take
- **Difficulty Rating** - Too hard? Too easy?

(Analytics dashboard coming soon)

---

## Related Documentation
- [Backend Gamification API](BACKEND-GAMIFICATION.md)
- [Student Game Map](../student/game.html)
- [Badge System](DESIGN-SYSTEM.md#badges)
- [XP & Level System](GAMIFICATION.md)
