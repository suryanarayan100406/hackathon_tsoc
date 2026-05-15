# 🏗️ VidyaQuest — No-Code-Change Architecture

## Priority: P0 (Hackathon Judging Criterion)

## Problem Statement Requirement
> "Codebase can't be changed easily" — The platform must allow content updates, configuration changes, and feature extensions **without modifying source code**.

---

## How VidyaQuest Achieves This

### 1. Content Management — Zero Code Changes

| What | How it's managed | Who does it | Code change? |
|------|-----------------|-------------|-------------|
| **Add new course/subject** | Teacher Dashboard → Course Builder | Teacher | ❌ No |
| **Add new module/unit** | Teacher Dashboard → Course Builder | Teacher | ❌ No |
| **Create new quiz** | Teacher Dashboard → Quest Builder form | Teacher | ❌ No |
| **Add questions** | Quest Builder → dynamic question form | Teacher | ❌ No |
| **Edit existing quest** | Teacher Dashboard → Edit Quest | Teacher | ❌ No |
| **Delete quest** | Teacher Dashboard → Delete button | Teacher | ❌ No |
| **Reorder modules** | Teacher Dashboard → Drag to reorder | Teacher | ❌ No |
| **Assign quests to students** | Teacher Dashboard → Assign panel | Teacher | ❌ No |
| **Set deadlines** | Quest Builder → Date picker | Teacher | ❌ No |

### 2. Translations — Zero Code Changes

| What | How | Code change? |
|------|-----|-------------|
| **Add new language** | Create `public/locales/{code}.json` | ❌ No (just add file) |
| **Edit translations** | Edit JSON file | ❌ No |
| **Bilingual questions** | Teacher types both languages in form | ❌ No |

### 3. Theming — Zero Code Changes

| What | How | Code change? |
|------|-----|-------------|
| **Change colors** | Edit CSS variables in `globals.css` | Minimal (CSS only) |
| **Switch themes** | User toggles light/dark | ❌ No |
| **Change fonts** | Update Google Fonts import | Minimal (CSS only) |

### 4. Gamification — Config-Driven

| What | How | Code change? |
|------|-----|-------------|
| **XP rewards** | Set per-quest in Quest Builder | ❌ No |
| **Time limits** | Set per-quest in Quest Builder | ❌ No |
| **Difficulty** | Set per-quest in Quest Builder | ❌ No |
| **Level thresholds** | Config file `src/lib/gamification.ts` | Minimal (config change) |
| **Badge triggers** | Database-stored trigger identifiers | ❌ No (add via DB/admin) |

### 5. Schools & Users — Admin Panel

| What | How | Code change? |
|------|-----|-------------|
| **Add school** | Admin panel or DB seed | ❌ No |
| **Create teacher accounts** | Admin panel | ❌ No |
| **Set school codes** | Admin panel | ❌ No |
| **Manage students** | Teacher panel | ❌ No |

---

## Architecture Principles

### Data-Driven, Not Code-Driven
```
Quest content is stored as JSON in the database.
Game components are generic — they render whatever JSON is passed.

Example:
  <LightningQuiz content={quest.content} />
  
  The same component renders ANY quiz — Math, Science, English.
  New content = new data, not new code.
```

### Modular Component System
```
Each game type is a self-contained component:
  - LightningQuiz.tsx → renders any MCQ quiz from JSON
  - DragDropLab.tsx → renders any drag-and-drop from JSON
  - MatchPairs.tsx → renders any matching game from JSON
  
  To add a new game type:
  1. Create one new component file
  2. Add the type to the QUEST_TYPES config
  3. No changes to existing code
```

### Plugin-Ready Badge System
```
Badges are defined in the database with trigger identifiers.
The badge checker runs trigger logic based on identifier string.

To add a new badge:
  1. Insert row in Badge table (name, icon, trigger)
  2. Add trigger check function (one if-statement)
  3. No changes to UI code — BadgeShelf renders all badges dynamically
```

---

## Teacher CRUD Operations (Full Spec)

### Course Management API

#### `POST /api/teacher/subject`
Create a new subject.
```json
{ "name": "Computer Science", "slug": "computer-science", "icon": "💻", "color": "#9B5DE5" }
```

#### `POST /api/teacher/unit`
Create a new module within a subject.
```json
{ "name": "Python Basics", "subjectId": "...", "grade": 9, "order": 1 }
```

#### `PUT /api/teacher/unit/:id`
Edit existing module.

#### `DELETE /api/teacher/unit/:id`
Delete module and all its quests.

#### `PUT /api/teacher/quest/:id`
Edit existing quest (title, content, difficulty, XP, time limit).

#### `DELETE /api/teacher/quest/:id`
Delete quest.

#### `PATCH /api/teacher/reorder`
Reorder modules or quests.
```json
{ "type": "unit", "items": [{ "id": "...", "order": 1 }, { "id": "...", "order": 2 }] }
```

### Teacher UI for Course Management
```
/teacher/courses page:
┌─────────────────────────────────────────┐
│  📚 My Courses                [+ New]   │
│                                         │
│  ┌─ Mathematics (Grade 8) ──────────┐  │
│  │  Module 1: Number Systems   [⋮]  │  │
│  │    Quest 1.1: Integers     [Edit] │  │
│  │    Quest 1.2: Fractions    [Edit] │  │
│  │    [+ Add Quest]                  │  │
│  │  Module 2: Algebra         [⋮]   │  │
│  │    Quest 2.1: Variables    [Edit] │  │
│  │    [+ Add Quest]                  │  │
│  │  [+ Add Module]                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [⋮] menu: Edit, Reorder, Delete       │
└─────────────────────────────────────────┘
```
