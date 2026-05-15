# 🔌 VidyaQuest — API Reference

## Base URL
- **Local**: `http://localhost:3000/api`
- **Production**: `https://tsoc.suryaxnarayan.in/api`

## Authentication
All protected routes require JWT token in httpOnly cookie (set automatically by NextAuth).

---

## Auth Routes

### `POST /api/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "securepass123",
  "role": "STUDENT",
  "grade": 8
}
```

**Response (201):**
```json
{
  "user": {
    "id": "clx123...",
    "name": "Ravi Kumar",
    "email": "ravi@example.com",
    "role": "STUDENT"
  }
}
```

**Errors:** `400` missing fields, `409` user exists, `500` server error

### `POST /api/auth/[...nextauth]`
Handled by NextAuth. Supports:
- `GET /api/auth/session` — Get current session
- `POST /api/auth/signin/google` — Google OAuth
- `POST /api/auth/signin/credentials` — Email/password
- `POST /api/auth/signout` — Sign out

---

## Student Routes

### `GET /api/student/dashboard`
Get quest map data, XP, badges for current student.

**Response:**
```json
{
  "user": { "id": "...", "name": "Ravi", "xp": 1250, "level": 2, "streakDays": 5 },
  "subjects": [
    {
      "id": "...", "name": "Mathematics", "slug": "mathematics", "icon": "🏝️", "color": "#FF6B35",
      "units": [
        {
          "id": "...", "name": "Number Systems", "grade": 8, "order": 1,
          "quests": [
            {
              "id": "...", "title": "Integer Operations", "type": "QUIZ",
              "difficulty": "EASY", "xpReward": 50,
              "progress": { "score": 8, "stars": 2, "xpEarned": 50 }
            }
          ]
        }
      ]
    }
  ],
  "badges": [
    { "id": "...", "name": "First Blood", "icon": "🎯", "earnedAt": "2026-05-10T..." }
  ]
}
```

### `GET /api/student/profile`
Full student profile with streak history.

**Response:**
```json
{
  "user": { "id": "...", "name": "Ravi", "xp": 1250, "level": 2, "streakDays": 5, "grade": 8 },
  "stats": {
    "totalQuests": 45,
    "totalStars": 98,
    "avgScore": 78,
    "timeSpent": 3600,
    "subjectBreakdown": { "mathematics": 20, "science": 15, "technology": 10 }
  },
  "streakHistory": [
    { "date": "2026-05-10", "count": 3 },
    { "date": "2026-05-11", "count": 5 }
  ],
  "badges": [...]
}
```

---

## Quest Routes

### `GET /api/quests/:id`
Get full quest content (questions, options, etc.) — cacheable for offline.

**Response:**
```json
{
  "id": "...",
  "title": "Integer Operations",
  "type": "QUIZ",
  "difficulty": "EASY",
  "xpReward": 50,
  "timeLimit": 300,
  "content": {
    "questions": [
      {
        "id": "q1",
        "question": "What is -5 + 3?",
        "options": ["-8", "-2", "2", "8"],
        "correct": 1,
        "explanation": "-5 + 3 = -2"
      }
    ]
  }
}
```

### `POST /api/quests/:id/submit`
Submit quest score, award XP, check badges.

**Request:**
```json
{
  "score": 8,
  "totalQuestions": 10,
  "timeSpent": 145,
  "answers": [1, 0, 2, 1, 3, 0, 2, 1, 0, 3]
}
```

**Response:**
```json
{
  "stars": 2,
  "xpEarned": 50,
  "newXPTotal": 1300,
  "levelUp": false,
  "newBadges": [],
  "streakUpdate": { "days": 6, "isNewStreak": true }
}
```

---

## Leaderboard Routes

### `GET /api/leaderboard?scope=class&grade=8`
**Response:**
```json
{
  "leaderboard": [
    { "rank": 1, "userId": "...", "name": "Priya S.", "avatar": "...", "weeklyXP": 450, "badges": 5 },
    { "rank": 2, "userId": "...", "name": "Ravi K.", "avatar": "...", "weeklyXP": 380, "badges": 3 }
  ],
  "currentUser": { "rank": 7, "weeklyXP": 180 },
  "resetsAt": "2026-05-18T18:30:00Z"
}
```

---

## Teacher Routes

### `GET /api/teacher/class`
**Auth:** TEACHER role required

**Response:**
```json
{
  "students": [
    {
      "id": "...", "name": "Ravi K.", "grade": 8,
      "xp": 1250, "level": 2, "lastActive": "2026-05-15T...",
      "weeklyXP": 180, "completionPercent": 65,
      "status": "active"
    }
  ],
  "summary": { "total": 32, "active": 24, "inactive": 5, "atRisk": 3 }
}
```

### `GET /api/teacher/analytics`
Charts data for class performance.

**Response:**
```json
{
  "topicScores": [
    { "topic": "Integers", "avgScore": 78 },
    { "topic": "Fractions", "avgScore": 52 }
  ],
  "engagement": [
    { "date": "2026-05-01", "activeStudents": 28 },
    { "date": "2026-05-02", "activeStudents": 25 }
  ],
  "commonErrors": [
    { "question": "What is 3/4 + 1/2?", "wrongPercent": 65, "topic": "Fractions" }
  ]
}
```

### `POST /api/teacher/quest`
Create custom quest.

**Request:**
```json
{
  "title": "Algebra Test Week 5",
  "type": "QUIZ",
  "difficulty": "MEDIUM",
  "xpReward": 75,
  "timeLimit": 600,
  "unitId": "...",
  "content": {
    "questions": [
      {
        "question": "Solve: 2x + 5 = 15",
        "options": ["3", "5", "7", "10"],
        "correct": 1,
        "explanation": "2x = 10, x = 5"
      }
    ]
  },
  "assignTo": "class",
  "deadline": "2026-05-20T23:59:59Z"
}
```

### `POST /api/teacher/nudge/:studentId`
Send in-app notification.

**Request:**
```json
{ "message": "Hey Ravi, you're doing great! Try the Fractions module today 🎯" }
```

### `GET /api/teacher/student/:id`
Individual student deep dive (same as student profile but accessible to teacher).

### `GET /api/teacher/export?format=csv`
Download class data as CSV or PDF.

---

## Sync Routes

### `POST /api/sync/offline-progress`
Batch sync offline completions.

**Request:**
```json
{
  "completions": [
    { "questId": "...", "score": 7, "totalQuestions": 10, "timeSpent": 120, "completedAt": "2026-05-14T..." },
    { "questId": "...", "score": 9, "totalQuestions": 10, "timeSpent": 95, "completedAt": "2026-05-14T..." }
  ]
}
```

**Response:**
```json
{
  "synced": 2,
  "totalXPAwarded": 125,
  "newBadges": ["Speed Demon"],
  "newLevel": null
}
```
