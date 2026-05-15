# 🎓 VidyaQuest — Level Up Your Learning

> A gamified STEM learning platform for students in Grades 6–12, built for the TSOC Hackathon.

![Status](https://img.shields.io/badge/status-in%20development-orange)
![Stack](https://img.shields.io/badge/stack-Next.js%2014%20%2B%20TypeScript-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/suryanarayan100406/hackathon_tsoc.git
cd hackathon_tsoc

# Install dependencies
npm install

# Set up database (SQLite for local dev)
npx prisma migrate dev --name init
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + Framer Motion |
| **State** | Zustand (persisted) |
| **Database** | SQLite (dev) → PostgreSQL (prod) via Prisma ORM |
| **Auth** | NextAuth.js v5 (Google OAuth + Email/Password) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Offline** | Service Workers + IndexedDB (Dexie.js) |
| **Deployment** | Vercel (frontend) + Render (backend/DB) + Netlify (CDN) |

---

## 👥 Team Roles & Responsibilities

| Role | Focus Area | Key Docs |
|------|-----------|----------|
| 🎨 **Designer** | UI/UX, component design, animations, theme | [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md), [FRONTEND.md](docs/FRONTEND.md) |
| 💻 **Frontend Dev** | Pages, components, state, game mechanics | [FRONTEND.md](docs/FRONTEND.md), [FEATURES.md](docs/FEATURES.md) |
| ⚙️ **Backend Dev** | API routes, database, auth, sync | [BACKEND.md](docs/BACKEND.md), [API.md](docs/API.md), [DATABASE.md](docs/DATABASE.md) |

---

## 📁 Project Structure

```
vidyaquest/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (225+ quests)
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Login & Register
│   │   ├── (student)/
│   │   │   ├── dashboard/     # Quest Map (main student view)
│   │   │   ├── quest/[id]/    # Game play screen
│   │   │   ├── profile/       # Student profile + stats
│   │   │   └── leaderboard/   # Class leaderboard
│   │   ├── (teacher)/
│   │   │   ├── dashboard/     # Teacher overview
│   │   │   ├── analytics/     # Charts & reports
│   │   │   ├── courses/       # Course/Quest builder
│   │   │   └── students/[id]/ # Student deep dive
│   │   └── api/               # All API routes
│   ├── components/
│   │   ├── ui/                # Design system components
│   │   ├── games/             # Game type components (5 types)
│   │   ├── dashboard/         # Dashboard-specific components
│   │   └── teacher/           # Teacher panel components
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── store.ts           # Zustand stores
│   │   ├── gamification.ts    # XP, levels, badges engine
│   │   └── offline/           # IndexedDB + sync logic
│   └── public/
│       ├── manifest.json      # PWA manifest
│       └── sw.js              # Service worker
├── docs/                      # 📚 All documentation
│   ├── FEATURES.md
│   ├── DESIGN-SYSTEM.md
│   ├── FRONTEND.md
│   ├── BACKEND.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── OFFLINE-SYNC.md
│   └── GAMIFICATION.md
└── package.json
```

---

## 🎯 Priority Matrix (6-Hour Hackathon)

| Priority | Feature | Owner | Time |
|----------|---------|-------|------|
| 🔴 **P0** | Auth (Google + Email) | Backend | 30 min |
| 🔴 **P0** | Quest Map UI | Designer + Frontend | 1.5 hr |
| 🔴 **P0** | Lightning Quiz Game | Frontend | 1 hr |
| 🔴 **P0** | XP + Leveling + Badges | Backend + Frontend | 1 hr |
| 🔴 **P0** | Database + Seed Data | Backend | 1 hr |
| 🟡 **P1** | Teacher Dashboard | Frontend + Backend | 1.5 hr |
| 🟡 **P1** | Offline Sync (PWA) | Backend + Frontend | 1 hr |
| 🟡 **P1** | Leaderboard | Frontend + Backend | 30 min |
| 🟡 **P1** | 4 More Game Types | Frontend | 1.5 hr |
| 🟡 **P1** | Course Builder (Teacher) | Frontend + Backend | 1 hr |
| 🟢 **P2** | Analytics Charts | Frontend | 45 min |
| 🟢 **P2** | PDF/CSV Export | Backend | 30 min |
| 🟢 **P2** | Audio Narration (TTS) | Frontend | 30 min |
| ⚪ **V2** | Battle Mode (Socket.IO) | Deferred |
| ⚪ **V2** | Full i18n (5 languages) | Deferred |

---

## 🔗 Links

- **Live URL**: [tsoc.suryaxnarayan.in](https://tsoc.suryaxnarayan.in) (after deployment)
- **Vercel**: Staging at vidyaquest.vercel.app
- **GitHub**: [hackathon_tsoc](https://github.com/suryanarayan100406/hackathon_tsoc)

---

## 📄 Documentation Index

| Document | Description |
|----------|-------------|
| [FEATURES.md](docs/FEATURES.md) | Complete feature specifications |
| [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Colors, typography, components, themes |
| [FRONTEND.md](docs/FRONTEND.md) | Page-by-page frontend implementation guide |
| [BACKEND.md](docs/BACKEND.md) | API, auth, database implementation guide |
| [API.md](docs/API.md) | All API endpoints with request/response formats |
| [DATABASE.md](docs/DATABASE.md) | Prisma schema, models, relationships |
| [OFFLINE-SYNC.md](docs/OFFLINE-SYNC.md) | Service worker, IndexedDB, sync strategy |
| [GAMIFICATION.md](docs/GAMIFICATION.md) | XP, levels, badges, leaderboard specs |
