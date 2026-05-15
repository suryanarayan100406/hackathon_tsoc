# 💻 VidyaQuest — Frontend Implementation Guide

## For: Frontend Developer & Designer

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- Recharts for analytics charts
- Lucide React for icons

---

## Page-by-Page Specs

### 1. Login Page (`/login`)
**Owner**: Designer + Frontend

**Components**:
- Floating STEM emoji icons (background decoration)
- Glass card with form
- "Continue with Google" button (Google SVG logo)
- Email/Password form with toggle for Sign In / Sign Up
- Role selector (Student/Teacher/Admin) on register
- Grade selector (6–12) for students
- Theme toggle (sun/moon) top-right

**States**: loading, error, success redirect

---

### 2. Student Dashboard / Quest Map (`/dashboard`)
**Owner**: Designer (layout) + Frontend (logic)

**Layout**:
```
┌─ Header ──────────────────────────────┐
│ Avatar | Name | Level | XP Bar | 🔥   │
├─ Subject Tabs (horizontal scroll) ────┤
│ 🏝️ Math | 🌋 Science | 🏰 Tech | ... │
├─ Quest Path (vertical scroll) ────────┤
│ Module 1: [Node]──[Node]──[Node]     │
│ Module 2: [Locked]                    │
├─ Bottom Nav ──────────────────────────┤
│ 🗺️ Map | 🏆 Board | 👤 Profile       │
└───────────────────────────────────────┘
```

**Key interactions**:
- Tap completed node → show score, option to replay
- Tap current node → navigate to `/quest/[id]`
- Tap locked node → show toast "Complete previous quest first"
- Subject tab switch → smooth scroll to that subject's modules
- Pull-to-refresh on mobile

**Data flow**: `GET /api/student/dashboard` → populate subjects/units/quests

---

### 3. Quest Play Screen (`/quest/[id]`)
**Owner**: Frontend (game logic)

Renders the correct game component based on `quest.type`:
- `QUIZ` → `<LightningQuiz />`
- `DRAG_DROP` → `<DragDropLab />`
- `NUMBER_NINJA` → `<NumberNinja />`
- `STORY` → `<StoryQuest />`
- `MATCH_PAIRS` → `<MatchPairs />`

**Common wrapper**:
- Header: quest title, timer bar, progress (Q3/10)
- Footer: hint button (if available), quit button
- On complete: `POST /api/quests/:id/submit` → show ScorePopup → return to map

---

### 4. Student Profile (`/profile`)
**Owner**: Designer + Frontend

**Sections**:
- Avatar + name + level badge
- XP bar (large)
- Streak flame + calendar heatmap (90 days)
- Badge shelf (horizontal scroll)
- Stats cards: Total Quests, Stars Earned, Avg Score, Time Spent
- Subject breakdown bar chart
- Settings: theme toggle, language (future), logout

---

### 5. Leaderboard (`/leaderboard`)
**Owner**: Frontend

- Tab: Class | School
- Rows: rank, avatar, name, weekly XP, badge count
- Top 3: 🥇🥈🥉 with special styling
- Current user pinned at bottom
- "Resets in X days" countdown
- Data: `GET /api/leaderboard?scope=class`

---

### 6. Teacher Dashboard (`/teacher/dashboard`)
**Owner**: Frontend + Backend

- Summary cards: Active/Inactive/At-Risk counts
- Student list with cards (name, XP, last active, status color, nudge button)
- Search/filter by name, grade
- Quick action: "Create Quest" button → `/teacher/courses`

---

### 7. Teacher Analytics (`/teacher/analytics`)
**Owner**: Frontend (charts)

**Charts** (all using Recharts):
1. `<BarChart>`: Avg score per topic
2. `<LineChart>`: Daily active students (30 days)
3. `<AreaChart>`: XP growth per student
4. Concept gap table: most-wrong questions with topic tags

---

### 8. Course Builder (`/teacher/courses`)
**Owner**: Frontend + Backend

- Form with stepper: Basic Info → Add Questions → Assign → Review
- Dynamic question builder (add/remove/reorder)
- Image upload for questions
- Preview mode before publish
- Data: `POST /api/teacher/quest`

---

### 9. Student Deep Dive (`/teacher/students/[id]`)
**Owner**: Frontend

- Full profile view (read-only, teacher perspective)
- Learning history timeline
- Per-subject accuracy chart
- Auto-generated suggestion box
- "Award Badge" and "Send Nudge" buttons

---

## Component Architecture

```
src/components/
├── ui/                    # Reusable design system
│   ├── XPBar.tsx         # Animated XP progress
│   ├── BadgeShelf.tsx    # Horizontal badge scroll
│   ├── ScorePopup.tsx    # +XP celebration overlay
│   ├── StreakFlame.tsx   # Animated streak icon
│   ├── OfflineBanner.tsx # Offline detection banner
│   ├── Confetti.tsx      # Celebration particles
│   ├── TimerBar.tsx      # Quiz countdown
│   └── QuestNode.tsx     # Map path node
├── games/                 # Game type components
│   ├── LightningQuiz.tsx
│   ├── DragDropLab.tsx
│   ├── NumberNinja.tsx
│   ├── StoryQuest.tsx
│   └── MatchPairs.tsx
├── dashboard/             # Student dashboard
│   ├── QuestMap.tsx
│   ├── SubjectTabs.tsx
│   └── ModulePath.tsx
├── teacher/               # Teacher-specific
│   ├── StudentCard.tsx
│   ├── QuestForm.tsx
│   └── AnalyticsCharts.tsx
└── providers/
    ├── ThemeProvider.tsx
    └── SessionProvider.tsx
```

---

## State Management (Zustand)

### `useGameStore`
```typescript
{
  currentXP: number
  currentLevel: number
  streakDays: number
  theme: 'light' | 'dark'
  soundEnabled: boolean
  showConfetti: boolean
  recentXPGain: number
}
```

### `useNotificationStore`
```typescript
{
  notifications: Array<{
    id: string, title: string, message: string,
    type: 'success' | 'error' | 'xp' | 'badge' | 'levelup',
    timestamp: number
  }>
}
```

---

## Mobile-First Guidelines
- All touch targets: min 44×44px
- Bottom nav bar (not top) on mobile
- Quest nodes: 52px mobile, 64px desktop
- Horizontal scroll for subject tabs + badge shelf
- Lazy load images with blur placeholder
- Avoid hover-only interactions (always have tap alternative)
