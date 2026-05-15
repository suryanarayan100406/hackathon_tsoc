# ⚙️ VidyaQuest — Backend Implementation Guide

## For: Backend Developer

## Tech Stack
- Next.js 14 API Routes (App Router)
- Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- NextAuth.js v5 (Google OAuth + Credentials)
- bcryptjs for password hashing

---

## Setup

### 1. Environment Variables (`.env`)
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (get from console.cloud.google.com)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Google OAuth Setup
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env`

### 3. Database Setup
```bash
npx prisma migrate dev --name init   # Create tables
npx prisma db seed                    # Seed sample data
npx prisma studio                     # Open GUI
```

---

## API Route Implementation

### File Structure
```
src/app/api/
├── auth/
│   ├── [...nextauth]/route.ts   # NextAuth handler
│   └── register/route.ts        # Email registration
├── student/
│   ├── dashboard/route.ts       # Quest map data
│   └── profile/route.ts         # Full profile
├── quests/
│   ├── [id]/route.ts            # Get quest content
│   └── [id]/submit/route.ts     # Submit score
├── leaderboard/route.ts         # Rankings
├── teacher/
│   ├── class/route.ts           # Class overview
│   ├── analytics/route.ts       # Charts data
│   ├── quest/route.ts           # Create quest
│   ├── nudge/[studentId]/route.ts
│   ├── student/[id]/route.ts    # Deep dive
│   └── export/route.ts          # CSV/PDF
└── sync/
    └── offline-progress/route.ts # Batch sync
```

---

## Key Implementation Details

### Auth Flow
```typescript
// src/lib/auth.ts — already scaffolded
// Key: JWT callback adds role, grade, xp, level to token
// Session callback exposes these to client
```

### Quest Submission Logic
```
1. Receive: { score, totalQuestions, timeSpent, answers }
2. Calculate stars (50%→1, 70%→2, 90%→3)
3. Calculate XP = baseXP × (1 + stars×0.25) × streakMultiplier
4. Upsert QuestProgress (keep best score)
5. Update User.xp += xpEarned
6. Check level threshold → update User.level
7. Run badge checks (see below)
8. Update streak (if first quest today)
9. Return: { stars, xpEarned, newXPTotal, levelUp, newBadges }
```

### Badge Check System
```typescript
// After each quest submission, check all un-earned badges:
async function checkBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { badges: true, progress: true }
  })

  const earnedTriggers = user.badges.map(b => b.badge.trigger)
  const newBadges = []

  // Check each badge trigger
  if (!earnedTriggers.includes('FIRST_QUEST') && user.progress.length >= 1) {
    newBadges.push('FIRST_QUEST')
  }
  if (!earnedTriggers.includes('STREAK_5') && user.streakDays >= 5) {
    newBadges.push('STREAK_5')
  }
  // ... check all 20 badges

  // Insert new badges
  for (const trigger of newBadges) {
    const badge = await prisma.badge.findFirst({ where: { trigger } })
    if (badge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id }
      })
    }
  }

  return newBadges
}
```

### Streak Logic
```typescript
async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const now = new Date()
  const lastActive = new Date(user.lastActive)

  const daysDiff = Math.floor(
    (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  )

  let newStreak = user.streakDays
  if (daysDiff === 0) {
    // Same day, no change
  } else if (daysDiff === 1) {
    newStreak += 1  // Consecutive day
  } else {
    newStreak = 1  // Streak broken, restart
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streakDays: newStreak, lastActive: now }
  })

  return newStreak
}
```

### Leaderboard Query
```typescript
// Weekly leaderboard — filter by completions this week
const startOfWeek = getStartOfWeek() // Sunday midnight IST

const leaderboard = await prisma.user.findMany({
  where: {
    role: 'STUDENT',
    grade: grade, // scope to class
    schoolId: schoolId,
  },
  select: {
    id: true, name: true, image: true,
    xp: true, badges: { select: { badgeId: true } },
    progress: {
      where: { completedAt: { gte: startOfWeek } },
      select: { xpEarned: true }
    }
  },
  orderBy: { xp: 'desc' },
  take: 50,
})

// Calculate weeklyXP from progress
```

### Teacher Analytics Queries
```typescript
// Average score per topic
const topicScores = await prisma.questProgress.groupBy({
  by: ['questId'],
  _avg: { score: true },
  where: {
    quest: { unit: { subject: { slug: subjectSlug } } },
    user: { schoolId: teacherSchoolId, grade: grade }
  }
})

// Daily active students (last 30 days)
const engagement = await prisma.questProgress.groupBy({
  by: ['completedAt'], // need to extract date
  _count: { userId: true },
  where: {
    completedAt: { gte: thirtyDaysAgo },
    user: { schoolId: teacherSchoolId }
  }
})
```

---

## Security Checklist
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] JWT secret is random and secure
- [ ] API routes check `session.user.role` before allowing access
- [ ] Teacher routes: verify teacher's schoolId matches requested students
- [ ] Rate limit auth endpoints (future)
- [ ] Validate all input (zod validation recommended)
- [ ] Sanitize quest content (prevent XSS in user-created quests)

---

## Deployment (Render)

### render.yaml
```yaml
services:
  - type: web
    name: vidyaquest
    env: node
    buildCommand: npm install && npx prisma migrate deploy && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: vidyaquest-db
          property: connectionString
      - key: NEXTAUTH_SECRET
        generateValue: true
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false

databases:
  - name: vidyaquest-db
    plan: free
```

### Steps
1. Push to GitHub
2. Connect repo to Render
3. Set env vars in Render dashboard
4. Deploy → auto-runs migrations
5. Update `NEXTAUTH_URL` to production URL
6. Update Google OAuth redirect URI to production URL
