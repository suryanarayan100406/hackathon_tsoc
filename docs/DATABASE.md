# 🗄️ VidyaQuest — Database Schema

## Overview
- **ORM**: Prisma
- **Dev**: SQLite (file-based, zero config)
- **Production**: PostgreSQL (Render free tier)

## Entity Relationship Diagram

```
School 1──N User
User 1──N Account (OAuth providers)
User 1──N Session
User 1──N QuestProgress
User 1──N UserBadge
User 1──N Notification

Subject 1──N Unit
Unit 1──N Quest
Quest 1──N QuestProgress

Badge 1──N UserBadge
```

## Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String? | Display name |
| email | String? | Unique, for auth |
| emailVerified | DateTime? | NextAuth field |
| image | String? | Avatar URL |
| password | String? | bcrypt hash (null for OAuth) |
| role | String | "STUDENT" / "TEACHER" / "ADMIN" |
| grade | Int | 6–12 (default 6) |
| language | String | "en" default |
| schoolId | String? | FK → School |
| xp | Int | Total XP (default 0) |
| level | Int | Current level (default 1) |
| streakDays | Int | Current streak (default 0) |
| lastActive | DateTime | Last activity timestamp |

### School
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String | School name |
| code | String | Unique 6-digit join code |
| district | String | District name |
| state | String | State name |

### Subject
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String | e.g., "Mathematics" |
| slug | String | Unique, URL-friendly |
| icon | String | Emoji icon |
| color | String | Hex color code |
| order | Int | Display order |

### Unit (Module)
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String | e.g., "Number Systems" |
| grade | Int | Target grade level |
| order | Int | Display order within subject |
| subjectId | String | FK → Subject |

### Quest
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| title | String | Quest name |
| type | String | QUIZ / DRAG_DROP / NUMBER_NINJA / STORY / MATCH_PAIRS |
| difficulty | String | EASY / MEDIUM / HARD |
| xpReward | Int | Base XP (default 50) |
| timeLimit | Int | Seconds (default 300) |
| unitId | String | FK → Unit |
| content | String | JSON string with questions/items |
| order | Int | Display order in unit |
| createdBy | String? | Teacher ID if custom quest |

### QuestProgress
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| userId | String | FK → User |
| questId | String | FK → Quest |
| score | Int | Raw score |
| stars | Int | 0–3 |
| xpEarned | Int | Actual XP awarded |
| completedAt | DateTime | When completed |
| syncedAt | DateTime? | When synced (null = offline) |
| **@@unique** | [userId, questId] | One progress per user per quest |

### Badge
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String | Badge name |
| description | String | How to earn |
| icon | String | Emoji |
| trigger | String | Logic identifier (e.g., "FIRST_QUEST") |

### UserBadge
| Field | Type | Notes |
|-------|------|-------|
| userId | String | FK → User |
| badgeId | String | FK → Badge |
| earnedAt | DateTime | When earned |
| **@@id** | [userId, badgeId] | Composite primary key |

### Notification
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| userId | String | FK → User |
| title | String | Notification title |
| message | String | Content |
| read | Boolean | Default false |
| type | String | INFO / NUDGE / BADGE / LEVELUP |
| createdAt | DateTime | Timestamp |

---

## Seed Data Requirements

### Schools (3)
```
Delhi Public School (code: DPS001, Delhi)
Kendriya Vidyalaya (code: KVS002, Mumbai)
Government High School (code: GHS003, Chennai)
```

### Per School
- 1 Teacher account + 10 Student accounts

### Subjects (5)
Mathematics, Science, Technology, English, Environmental Studies

### Content Volume
- 5 subjects × ~4 modules per grade × 3 grades (6, 8, 10) = ~60 units
- 3–5 quests per unit = **200+ quests minimum**
- Each quest has 5–10 questions

### Badges (20)
All 20 badges from GAMIFICATION.md seeded with trigger identifiers.

---

## Migration Commands
```bash
# Create migration
npx prisma migrate dev --name init

# Apply migration (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

## Switching to PostgreSQL (Production)
1. Change `provider` in schema.prisma: `sqlite` → `postgresql`
2. Update `DATABASE_URL` in `.env` to Render PostgreSQL connection string
3. Run `npx prisma migrate deploy`
