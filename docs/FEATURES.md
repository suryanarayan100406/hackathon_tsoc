# 📋 VidyaQuest — Feature Specifications

## 1. Auth System

### Roles
| Role | Permissions |
|------|------------|
| **STUDENT** | Play games, earn XP, view progress, leaderboard |
| **TEACHER** | Create courses/quests, view class analytics, send nudges |
| **ADMIN** | Manage schools, create teacher accounts, school-wide data |

### Auth Flows
- **Google OAuth**: Click → Google consent → profile returned → JWT issued → redirect to dashboard
- **Email/Password**: Register (name, email, password, role, grade) → bcrypt hash → auto sign-in
- **Session**: JWT in httpOnly cookie, contains userId/role/grade/xp/level, 30-day expiry

### First Login (Students)
1. Select grade (6–12)
2. Enter school code (optional)
3. Choose avatar
4. Brief Quest Map tutorial

---

## 2. Quest Map (Student Dashboard)

The **heart of the app** — a visual gamified world map showing learning progress.

### Data Hierarchy
```
Subject → Module → Topic → Quest (game)
```

### Node States
| State | Visual | Interaction |
|-------|--------|------------|
| Completed | Green circle, 1–3 stars | Tap to replay |
| Current | Orange pulsing glow, "Play" button | Tap to start |
| Locked | Gray, padlock icon, dimmed | Shows "Complete previous" |

### Subject Islands
| Subject | Island Name | Color | Icon |
|---------|------------|-------|------|
| Mathematics | Math Island | `#FF6B35` | 🏝️ |
| Science | Science Volcano | `#2EC4B6` | 🌋 |
| Technology | Tech Citadel | `#9B5DE5` | 🏰 |
| English | Word Wonderland | `#F15BB5` | 📚 |
| EVS | Nature's Realm | `#06D6A0` | 🌿 |

### Unlocking Logic
- Quests unlock sequentially within a module
- Module unlocks when previous module ≥60% complete
- Stars: 1 (50%+), 2 (70%+), 3 (90%+)

---

## 3. Game Types (5 Playable)

### 3A. ⚡ Lightning Quiz
- 10 MCQ questions, 15s per question
- Timer: Green (>10s) → Yellow (5–10s) → Red (<5s)
- Streak: 3 correct = 1.5x XP, 5 = 2x XP
- Wrong answer shows explanation + illustration

### 3B. 🧪 Drag & Drop Lab
- Label/arrange components by dragging to slots
- Snap-to-slot animation, wrong placement bounces back
- Use cases: cell labeling, circuit building, process ordering

### 3C. 🥷 Number Ninja
- Tap numbers + operators to reach target number
- Multiple valid solutions accepted
- Scales by grade (arithmetic → algebra → exponents)
- Hints cost -10 XP

### 3D. 📖 Story Quest
- Narrative problem with 3–5 decision points
- Indian characters (Priya, Ravi, Ananya)
- Wrong choices → hint scene with visual explanation

### 3E. 🃏 Match Pairs
- Flip cards to match term ↔ definition (6–8 pairs)
- 3D card flip animation
- Timer-based scoring

---

## 4. Gamification Engine
See [GAMIFICATION.md](GAMIFICATION.md) for full specs.
- **XP**: Earn from quests, streaks, perfect scores
- **6 Levels**: Novice → Explorer → Scholar → Champion → Legend → Grandmaster
- **20 Badges**: Auto-triggered achievements
- **Leaderboard**: Class-scoped, weekly reset Sunday midnight IST
- **Streak**: Calendar heatmap, streak freeze (100 XP)

---

## 5. Teacher Dashboard

### 5A. Class Overview
- Student cards: name, last active, XP, completion %
- Status: 🟢 Active (2d), 🟡 Inactive (2–5d), 🔴 At Risk (5+d)
- One-click "Send Nudge" notification

### 5B. Analytics (Recharts)
1. Bar chart: Average score per topic
2. Line chart: Engagement over 30 days
3. Heatmap: Most-wrong questions (concept gaps)
4. Pie chart: Quest type distribution
5. Per-student XP growth

### 5C. Course/Quest Builder
- Form: title, subject, grade, module, game type, difficulty, XP, time limit
- Add questions with options, correct answer, explanation, images
- Assign to whole class or individual students + deadline

### 5D. Student Deep Dive
- Learning history timeline
- Time per subject, accuracy per topic
- Auto-generated intervention suggestions

### 5E. Export
- PDF report (class summary with charts)
- CSV export (raw data)

---

## 6. Offline-First Architecture
See [OFFLINE-SYNC.md](OFFLINE-SYNC.md) for full specs.
- Service Worker: cache-first static, network-first API
- IndexedDB (Dexie.js): quests, progress, user state
- Background sync on reconnect
- Download manager in settings
- Sticky offline banner

---

## 7. Curriculum Structure

### Mathematics (Grades 6–12)
Number Systems → Algebra → Geometry → Statistics → Trigonometry → Calculus

### Science (Grades 6–12)
Living World → Matter → Force & Motion → Energy → Chemistry → Biology → Physics

### Technology (Grades 6–12)
Digital Basics → Coding → Web Dev → Data & AI

### English (Grades 6–12)
Grammar → Vocabulary → Comprehension

### EVS (Grades 6–10)
Ecosystems → Resources → Pollution

**Each topic → 3–5 quests** (40% Quiz, 25% Drag&Drop, 15% Number Ninja, 10% Story, 10% Match Pairs)
