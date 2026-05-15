# 🎮 Game Backend Implementation Guide

## Overview

I've developed a complete backend API system for the gamification engine from `student/game.js`. This implements:

- **Chapter Progress Tracking** - Lessons, quizzes, boss battles
- **XP & Level System** - Award XP and calculate levels
- **Badge System** - Track and award achievements 
- **Daily Challenges** - Track streak bonuses
- **Streak System** - Consecutive day learning tracking
- **Leaderboard** - Global, class, and weekly rankings

---

## Database Schema Updates

### New Models Added to `prisma/schema.prisma`:

#### 1. **Chapter** Model
```prisma
model Chapter {
  id          String
  chapterId   String    // e.g., "m1", "p2" (from game.js CURRICULUM)
  title       String    // e.g., "Number Systems"
  subject     String    // "math" | "physics" | "chemistry" | "biology" | "coding"
  type        String    // "lesson" | "quiz" | "boss"
  xpReward    Int       // XP awarded on completion
  passMark    Int       // Minimum score for passing (default: 70)
  icon        String    // Emoji icon for display
}
```

#### 2. **ChapterProgress** Model
```prisma
model ChapterProgress {
  userId      String    // Student who completed it
  chapterId   String    // FK to Chapter
  status      String    // "locked" | "current" | "done"
  score       Int       // Best score achieved
  attempts    Int       // Number of attempts
  completedAt DateTime  // When they completed it
}
```

#### 3. **DailyChallengeCompletion** Model
```prisma
model DailyChallengeCompletion {
  userId       String
  challengeId  String  // e.g., "dc1", "dc2"
  xpAwarded    Int
  completedDate DateTime
}
```

#### 4. **User Model Updates**
Added fields:
- `badges` - Array of badge IDs (string[])
- `streak` - Current streak count
- `lastLoginDate` - Date of last login (for streak calculation)
- `totalDaysActive` - Total active days
- `levelsCompleted` - Total chapters completed
- `class` - Student's class for filtering

---

## API Endpoints

### 1. **GET /api/student/progress?subject=math**
Fetch all chapter progress for a subject.

**Response:**
```json
{
  "subject": "math",
  "chapters": 10,
  "progress": {
    "m1": {
      "status": "done",
      "score": 85,
      "attempts": 2,
      "completedAt": "2026-05-15T10:30:00Z"
    }
  }
}
```

---

### 2. **POST /api/student/progress**
Mark a chapter as done and award XP.

**Request:**
```json
{
  "subject": "math",
  "chapterId": "m1",  // From CURRICULUM
  "score": 85,        // Quiz score (0-100)
  "timeSpent": 1200,  // Milliseconds spent
  "xpEarned": 50      // XP to award
}
```

**Response:**
```json
{
  "success": true,
  "xpEarned": 50,
  "newXP": 450,      // Total XP after award
  "newLevel": 1,
  "badgesAwarded": ["first_lesson"]
}
```

---

### 3. **POST /api/student/daily-challenge/claim**
Claim today's daily challenge.

**Request:**
```json
{
  "challengeId": "dc1",
  "xpReward": 100
}
```

**Response:**
```json
{
  "success": true,
  "xpAwarded": 100,
  "newXP": 500,
  "badgesAwarded": []
}
```

---

### 4. **GET /api/student/daily-challenge**
Get today's daily challenge status.

**Response:**
```json
{
  "today": "2026-05-15",
  "completedToday": ["dc1", "dc2"],
  "totalCompleted": 2
}
```

---

### 5. **GET /api/student/badges**
Get user's earned badges with all available badges.

**Response:**
```json
{
  "earnedCount": 5,
  "totalBadges": 14,
  "earned": ["first_lesson", "xp_500", "quiz_perfect"],
  "badges": [
    {
      "id": "first_lesson",
      "icon": "🌟",
      "name": "First Step",
      "desc": "Complete your first lesson",
      "earned": true
    }
  ]
}
```

---

### 6. **POST /api/student/badges/check**
Check and award badges based on progress (internal use).

**Request:**
```json
{
  "checkType": "streak"
}
```

**Response:**
```json
{
  "awarded": ["streak_7"],
  "total": 6
}
```

---

### 7. **GET /api/student/streak**
Get user's streak information.

**Response:**
```json
{
  "streak": 7,
  "lastLoginDate": "2026-05-15T08:00:00Z",
  "totalDaysActive": 15
}
```

---

### 8. **POST /api/student/streak/update**
Update streak (call on login).

**Response:**
```json
{
  "streak": 8,
  "totalDaysActive": 16,
  "newBadges": ["streak_7"]
}
```

---

### 9. **GET /api/student/leaderboard/xp?type=global&limit=10**
Get XP leaderboard.

**Query Params:**
- `type` - `global` | `class` | `weekly`
- `limit` - Number of results (default: 10)

**Response:**
```json
{
  "type": "global",
  "leaderboard": [
    {
      "rank": 1,
      "name": "Ravi Kumar",
      "xp": 1250,
      "level": 3,
      "streak": 5,
      "isCurrentUser": false
    }
  ],
  "userRank": 15,
  "userXP": 450,
  "userLevel": 1
}
```

---

## Available Badges

| Badge ID | Icon | Name | Requirement |
|----------|------|------|-------------|
| `first_lesson` | 🌟 | First Step | Complete 1 lesson |
| `streak_3` | 🔥 | On Fire | 3-day streak |
| `streak_7` | 🏆 | 7-Day Learner | 7-day streak |
| `streak_30` | 👑 | Month Master | 30-day streak |
| `quiz_first` | 📝 | Quiz Taker | Pass 1 quiz |
| `quiz_perfect` | 💯 | Quiz Champion | 100% on any quiz |
| `math_5` | 🧮 | Math Warrior | 5 Math levels |
| `science_5` | ⚗️ | Science Master | 5 Science levels |
| `coding_5` | 💻 | Code Ninja | 5 Coding levels |
| `xp_500` | ⚡ | Power Learner | 500 XP |
| `xp_1000` | 🚀 | XP Rocket | 1000 XP |
| `daily_3` | 📅 | Challenger | 3 daily challenges |
| `all_subjects` | 🌈 | Explorer | Start all 5 subjects |
| `boss_1` | 🏅 | Boss Slayer | Pass 1 boss quiz |

---

## Curriculum Structure

5 subjects with 8-10 chapters each:

### **Mathematics** (math)
- m1: Number Systems (lesson)
- m2: Number Systems Quiz (quiz)
- ... up to m10 (boss)

### **Physics** (physics)
- p1-p8 structure similar

### **Chemistry** (chemistry)
- c1-c8 structure similar

### **Biology** (biology)
- b1-b8 structure similar

### **Coding** (coding)
- co1-co8 structure similar

---

## XP & Leveling

**Level Calculation:**
```
level = floor(xp / 500) + 1
```

- Level 1: 0-499 XP
- Level 2: 500-999 XP
- Level 3: 1000+ XP

**XP Rewards:**
- Regular Lesson: 50-70 XP
- Quiz: 100-120 XP
- Boss Quiz: 200 XP

---

## Database Setup

### 1. Apply Schema Changes
```bash
npx prisma migrate dev --name add_gamification_system
```

### 2. Seed Curriculum
```bash
npx prisma db seed
```

This populates:
- All 41 curriculum chapters
- Test users (if needed)
- Initial badge definitions

---

## Integration with Frontend

### From `game.js`, replace Firestore calls with HTTP calls:

**Old:**
```javascript
const snap = await firebase.firestore()
  .collection('users').doc(_uid).get()
```

**New:**
```javascript
const res = await fetch('/api/student/progress?subject=' + subject)
const data = await res.json()
```

### Call when marking chapter done:
```javascript
await fetch('/api/student/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: _subject,
    chapterId: chapterId,
    score: score,
    timeSpent: timeSpent,
    xpEarned: chapter.xpReward
  })
})
```

### Call on app init to update streak:
```javascript
await fetch('/api/student/streak/update', {
  method: 'POST'
})
```

---

## Next Steps

1. **Update game.js** - Replace Firebase calls with new API endpoints
2. **Create lesson/quiz pages** - `/student/lesson.html` and `/student/quiz.html` 
3. **Add sound effects** - XP pop sounds, badge unlock sounds
4. **Implement offline storage** - Cache progress locally, sync with offline-progress API

---

## Error Handling

All endpoints return proper HTTP status codes:
- `200` - Success
- `400` - Bad request (missing fields)
- `401` - Unauthorized (not logged in)
- `404` - Not found (user/chapter/etc doesn't exist)
- `500` - Server error

All responses include error details:
```json
{
  "error": "Subject required"
}
```

---

## Performance Notes

✅ Indexes on:
- `ChapterProgress.userId_chapterId` (unique)
- `DailyChallengeCompletion.userId_challengeId_completedDate` (unique)
- User leaderboard queries optimized with `orderBy([xp, level])`

⚡ Consider caching:
- User badges (changes rarely)
- Leaderboard (can be 5-minute cache)
- Chapter curriculum (static, cache indefinitely)

