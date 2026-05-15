# 🎮 MCQ & Boss Battle Integration Guide

## ✅ Status: Everything Is Ready!

Your frontend (quiz UI), backend APIs, and database are all connected. Here's what's working:

### **1. Frontend Pages Ready**
- ✅ `/src/app/quests/[id]/page.tsx` - Quiz display component with 3 game modes:
  - **QuizEngine** - MCQ questions with timer, scoring, explanations
  - **MatchPairsEngine** - Match cards game
  - Victory screen with XP rewards and badges

### **2. Backend APIs Ready**
- ✅ `GET /api/quests/[id]` - Fetch quest content and questions
- ✅ `POST /api/quests/[id]/submit` - Submit answers, calculate score, award XP
- ✅ `POST /api/student/progress` - Track chapter completion
- ✅ `GET /api/student/progress?subject=math` - Get progress for a subject

### **3. Database Schema Ready**
- ✅ `Quest` table - Stores questions, XP rewards, pass marks, time limits
- ✅ `QuestProgress` - Tracks student scores, stars, XP earned per quest
- ✅ `User` - Tracks XP, level, badges, streak
- ✅ `Badge` - 14 achievement badges with unlock conditions

---

## 🔄 Data Flow: How It All Works

```
┌─────────────────────────────────────┐
│  Student Dashboard / Game Map      │
│  (/src/app/dashboard/page.tsx)      │
└──────────┬──────────────────────────┘
           │ Click "Start Quiz"
           │
           ▼
┌─────────────────────────────────────┐
│  GET /api/quests/{questId}          │
│  Fetch: title, questions, timeLimit │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Quiz Page Loads                    │
│  (/src/app/quests/[id]/page.tsx)    │
│                                     │
│  ✅ Display questions              │
│  ✅ Handle answer selection         │
│  ✅ Timer countdown                 │
│  ✅ Calculate score on submit       │
└──────────┬──────────────────────────┘
           │ Student submits answers
           │
           ▼
┌─────────────────────────────────────┐
│  POST /api/quests/{id}/submit       │
│                                     │
│  Input: {                           │
│    score: 4,          (correct ans) │
│    totalQuestions: 5                │
│    timeSpent: 120     (seconds)     │
│  }                                  │
│                                     │
│  ➜ Calculate score: 80%            │
│  ➜ Check if passed (70% mark)      │
│  ➜ Award XP if passed              │
│  ➜ Check badge unlocks             │
│  ➜ Update user level               │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Return Result:                     │
│  {                                  │
│    success: true,                   │
│    score: 80,        (percentage)   │
│    stars: 2,         (1-3 stars)    │
│    xpEarned: 100,                   │
│    leveledUp: false,                │
│    badges: [...]                    │
│  }                                  │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Victory Screen                     │
│                                     │
│  ✅ Show score: 80%                │
│  ✅ Show stars: ⭐⭐             │
│  ✅ Show XP earned: +100            │
│  ✅ Show new badges                 │
│  ✅ "Back to Dashboard" button      │
└──────────────────────────────────────┘
```

---

## 📋 Question Format in Database

When a teacher creates a quiz, questions are stored as JSON:

```json
{
  "questions": [
    {
      "id": "m2q1",
      "question": "What is √2?",
      "options": [
        "Rational",
        "Irrational",
        "Integer",
        "Natural"
      ],
      "correct": 1,
      "explanation": "√2 cannot be expressed as p/q..."
    },
    {
      "id": "m2q2",
      "question": "Which is NOT real?",
      "options": ["π", "√(-1)", "0.333", "100"],
      "correct": 1,
      "explanation": "√(-1) = i, imaginary number..."
    }
  ]
}
```

---

## 🎯 Three Quest Types

### **1. LESSON (📚)**
Frontend implementation:
```javascript
// Teacher creates LESSON
POST /api/teacher/quests {
  type: "LESSON",
  title: "Algebra Basics",
  xpReward: 50,
  content: { ... } // lesson text/video
}

// Student completes
→ Auto-pass with 50 XP
→ Progress marks as "done"
```

### **2. QUIZ (📝)**
Frontend implementation:
```javascript
// GET /api/quests/m2
// Returns 5 questions with timer: 10 mins

// Student answers all 5 questions
// onSubmit():
//   score = 4/5 = 80%
//   passed? (80% >= 70% pass mark) = YES
//   xpEarned = 100 (because passed)

// POST /api/quests/m2/submit { score: 4, total: 5 }
// Backend awards 100 XP + checks badges
```

### **3. BOSS (🏆)**
Frontend implementation:
```javascript
// GET /api/quests/m10_boss
// Returns 10 questions with timer: 20 mins
// Only unlocked after passing all unit quizzes

// Student answers 8/10 = 80%
// Boss requires 80% to pass
// Awards 200 XP + special badge
```

---

## 🚀 Quick Start: Testing MCQs

### **Step 1: Check Database**
```sql
-- Verify some quests exist
SELECT id, title, type, xpReward, passMark FROM Quest LIMIT 5;

-- Check a quest's content
SELECT id, content FROM Quest WHERE id = 'm2' LIMIT 1;
```

### **Step 2: Test Fetch API**
```bash
# Get quiz questions
curl http://localhost:3000/api/quests/m2

# Should return:
{
  "quest": {
    "id": "m2",
    "title": "Number Systems",
    "type": "QUIZ",
    "xpReward": 100,
    "passMark": 70,
    "timeLimit": 600,
    "content": {
      "questions": [...]
    }
  }
}
```

### **Step 3: Test Submit API**
```bash
# Submit quiz result
curl -X POST http://localhost:3000/api/quests/m2/submit \
  -H "Content-Type: application/json" \
  -d '{"score": 4, "totalQuestions": 5, "timeSpent": 120}'

# Should return:
{
  "success": true,
  "score": 80,
  "stars": 2,
  "xpEarned": 100,
  "leveledUp": false,
  "badges": []
}
```

---

## 🎨 Frontend Quiz Component Flow

Your existing `QuizEngine` component in `/src/app/quests/[id]/page.tsx`:

```typescript
function QuizEngine({ quest, onComplete }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  
  const questions = quest.content.questions  // ← From API
  const q = questions[index]                  // ← Current question
  
  // User clicks answer
  const check = () => {
    if (selected === q.correct) {
      setScore(s => s + 1)
    }
  }
  
  // User clicks "Next" on last question
  const next = () => {
    if (index === questions.length - 1) {
      onComplete(score)  // ← Triggers submit
    }
  }
  
  // Parent component handles submit:
  const handleComplete = async (score) => {
    const res = await fetch(`/api/quests/${params.id}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        score,
        totalQuestions: questions.length,
        timeSpent: 600 - timeLeft
      })
    })
    const result = await res.json()
    // Show victory screen with result
  }
}
```

---

## 🔗 Data Model: How Questions Connect

### **Teacher Creates Quest with Questions**
```
Teacher Dashboard
  ↓
[✏️ Add Quest]
  ↓
Form: Title, Type (QUIZ/LESSON/BOSS), XP, PassMark
  ↓
[+ Add Question] → Modal opens
  ↓
Question Form:
  - Question text: "What is √2?"
  - Option A: "Rational"
  - Option B: "Irrational" ← Mark as correct
  - Option C: "Integer"
  - Option D: "Natural"
  - Explanation: "√2 is irrational..."
  ↓
[Save Question]
  ↓
Repeat for 5-10 questions
  ↓
[Create Quest] 
  → Questions saved in Quest.content JSON
  → POST /api/teacher/quests
```

### **Student Takes Quiz**
```
Game Map
  ↓
[Click Quiz: Number Systems]
  ↓
GET /api/quests/m2
  ← Returns Quest with all questions
  ↓
QuizEngine renders:
  Q1/5: "What is √2?"
  ○ Rational
  ○ Irrational ← Can select
  ○ Integer
  ○ Natural
  ↓
Student selects answers for all 5
  ↓
[Submit Quiz]
  ↓
Score = 4/5 = 80%
Pass = 80% >= 70%? YES
  ↓
POST /api/quests/m2/submit { score: 4, total: 5 }
  ↓
Backend: Award 100 XP
Update User.xp, User.level
Check badges: "First Quiz!" earned
  ↓
Return: { xpEarned: 100, badges: ["First Quiz!"] }
  ↓
Victory Screen: "🎉 80%! +100 XP!"
```

---

## 🛠 Troubleshooting

### **Issue: "Quest not found" error**
**Cause**: Questions not seeded to database
**Fix**: 
```bash
npx prisma migrate dev
npx prisma db seed
```

### **Issue: Questions not displaying**
**Cause**: Content JSON format mismatch
**Check**: 
```javascript
// API should return questions in format:
{
  id: string,
  question: string,
  options: string[],
  correct: number (0-3),
  explanation: string
}
```

### **Issue: XP not awarded**
**Cause**: Score below pass mark
**Fix**: Student needs to get 70% or higher
```javascript
// In submit handler:
const passed = score >= passMark  // need >= 70
const xpEarned = passed ? quest.xpReward : 0
```

### **Issue: Badge not locked/unlocked**
**Cause**: Check badge trigger conditions
**See**: `/src/lib/gamification.ts` BADGE_DEFINITIONS array

---

## 🎮 ALL THREE GAME TYPES WORKING

✅ **LESSON** - Student clicks "Complete" → Auto-pass → Full XP
```
POST /api/quests/lesson1/submit { score: 1, total: 1 }
```

✅ **QUIZ** - Student answers MCQs → Scored → XP if passed
```
POST /api/quests/m2/submit { score: 4, total: 5 }
// 80% >= 70% pass mark → 100 XP
```

✅ **BOSS** - Student answers harder MCQs → High score required
```
POST /api/quests/m10_boss/submit { score: 8, total: 10 }
// 80% >= 80% boss pass mark → 200 XP + special badge
```

✅ **MATCH PAIRS** - Student matches question-answer pairs
```
// Already implemented in MatchPairsEngine component
// Auto-calculates when all pairs matched
```

---

## 📝 To Enable MCQs & Boss Battles Now:

1. **Seed the database** with test quests:
   ```bash
   npx prisma db seed
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

3. **Test as teacher**:
   - Go to `/teacher`
   - Create a quest with type = "QUIZ"
   - Add 5 MCQ questions
   - Save

4. **Test as student**:
   - Go to `/dashboard`
   - Click on the subject
   - Click "Start Quiz"
   - Answer all questions
   - Submit
   - See score, XP, badges

---

## 🎯 What's Next

All core mechanics are ready to ship:
- ✅ Quiz engine with timer
- ✅ MCQ question rendering
- ✅ Score calculation with pass marks
- ✅ XP rewards
- ✅ Badge unlocking
- ✅ Level progression
- ✅ Leaderboards

**Optional enhancements** (can add later):
- Speed bonus for fast completion
- Difficulty scaling (Easy/Medium/Hard questions)
- Hint system
- Daily challenge quizzes
- Multiplayer challenges
