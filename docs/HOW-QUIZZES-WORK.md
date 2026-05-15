# 🎮 How MCQs & Games Work - Complete Architecture

## 📊 Overall Flow

```
Student clicks Quest on Game Map
    ↓
Quiz/Lesson UI loads with chapter content
    ↓
Student answers MCQs or completes lesson
    ↓
Submit → Calculate score & XP
    ↓
POST to /api/student/progress
    ↓
Backend updates progress, awards badges
    ↓
Student sees results + XP popup
    ↓
Progress syncs to dashboard
```

---

## 🎯 Quest Types & How They Work

### **1. LESSON (📚)**
- **What it is**: Reading material, video, or interactive content
- **Student interaction**: Read/watch content, click "Complete"
- **Scoring**: Automatic pass when "Complete" clicked
- **XP**: Gets full reward (no skill check)
- **Pass mark**: Always passes (100%)

**Example:**
```
Title: "Algebra Basics"
Type: LESSON
Content: HTML/video/PDF
XP: 50
→ Student clicks "Mark as Complete"
→ Gets 50 XP automatically
```

---

### **2. QUIZ (📝)**
- **What it is**: MCQ (Multiple Choice Questions)
- **Student interaction**: Answer questions with timer
- **Scoring**: % correct = Student score
- **XP**: Only if score ≥ pass mark
- **Pass mark**: 70% (configurable)

**Question Structure:**
```javascript
{
  id: "m2q1",
  q: "What is √2?",
  options: ["Rational", "Irrational", "Integer", "Natural"],
  answer: 1,              // Index of correct option
  explanation: "√2 cannot be expressed as p/q..."
}
```

**Quiz Engine (`js/quiz.js`) handles:**
- Load questions for chapter
- Display one at a time
- Timer countdown
- Save answers
- Calculate score
- Show explanation after submission

---

### **3. BOSS (🏆)**
- **What it is**: Final chapter assessment (harder quiz)
- **Unlocked when**: Previous quizzes passed with ≥ 70%
- **Scoring**: % correct = Student score
- **XP**: 200+ (higher reward)
- **Pass mark**: 80% (higher requirement)

**Special features:**
- Can only attempt after prerequisites
- Failure doesn't block progression (can retry)
- Passing gives major XP + special badge

---

## 🏗️ Current Architecture

### **Frontend (What Exists)**

✅ `js/quiz.js` - Quiz engine with:
- QUESTION_BANK (all MCQ questions)
- QuizEngine object with scoring logic
- Timer management
- Answer tracking

✅ `js/game.js` - Game map with:
- Chapter/level progression
- Lock/unlock logic
- gameMap.goToContent() function

✅ `student/game.html` - Map UI

### **Backend (Newly Built)**

✅ `/api/student/progress` - Track completion  
✅ `/api/student/progress` (POST) - Award XP & badges  
✅ `/api/student/badges` - Track achievements  
✅ `/api/student/streak` - Track learning streaks  

---

## 🔌 What Needs to Be Built

### **1. Quiz UI Page** (Frontend)
Need: `/src/app/quests/[id]/page.tsx`

```typescript
// Student clicks quiz → loads QuizPage

"use client"
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function QuizPage() {
  const [quiz, setQuiz] = useState(null)      // Questions
  const [answers, setAnswers] = useState([])  // User answers
  const [score, setScore] = useState(null)    // Final score
  const [submitted, setSubmitted] = useState(false)
  
  // 1. Fetch quest content from backend
  // 2. Initialize QuizEngine
  // 3. Display question UI
  // 4. On submit: calculate score
  // 5. POST to /api/student/progress
  // 6. Show results + XP
}
```

**What it does:**
- Fetches quest content from database
- Renders MCQ questions
- Handles user answers
- Timer countdown
- Score calculation
- Calls progress API to award XP
- Shows results page

---

### **2. Lesson UI Page** (Frontend)
Need: `/src/app/quests/lessons/[id]/page.tsx`

```typescript
// Similar to quiz but:
// - Show content (video/PDF/HTML)
// - Big "Mark as Complete" button
// - No scoring, just track completion
// - Auto-award full XP
```

---

### **3. Quiz Content API** (Backend)
Need: `/api/quests/[id]`

```typescript
// GET /api/quests/m2
// Returns:
{
  id: "m2",
  title: "Number Systems Quiz",
  type: "QUIZ",
  xpReward: 100,
  passMark: 70,
  timeLimit: 600,
  questions: [
    { id: "m2q1", q: "...", options: [...], answer: 1, explanation: "..." },
    // ... more questions
  ]
}
```

---

### **4. Result Submission API** (Backend - Already built ✅)
```typescript
POST /api/student/progress
{
  subject: "math",
  chapterId: "m2",
  score: 85,
  timeSpent: 300,
  xpEarned: 100
}
```

Returns:
```json
{
  "success": true,
  "xpEarned": 100,
  "newXP": 450,
  "newLevel": 1,
  "badgesAwarded": ["first_lesson", "quiz_first"]
}
```

---

## 🎮 Complete Quiz Flow (Step-by-Step)

### **Step 1: Student Selects Quest**
```
Game Map (game.html)
↓
Student clicks "Quiz: Number Systems" (m2)
↓
GameMap.goToContent('m2', 'QUIZ')
→ Redirects to: /quests/m2?subject=math&type=quiz
```

### **Step 2: Quiz UI Loads**
```typescript
// QuizPage.tsx runs:

// Fetch quest details
GET /api/quests/m2
→ Returns: { title, questions: [...], timeLimit, ... }

// Initialize quiz
QuizEngine.init('m2', 'math', userId, 'en')

// Display question 1
┌──────────────────────────────┐
│ Question 1 of 5       ⏱ 9:45│
├──────────────────────────────┤
│ What is √2?                  │
│                              │
│ ○ Rational          ✓        │
│ ○ Irrational                 │
│ ○ Integer                    │
│ ○ Natural                    │
│                              │
│  [Previous] [Next] [Submit]  │
└──────────────────────────────┘
```

### **Step 3: Student Answers Questions**
```
Questions are displayed one-by-one
User selects options
[Next] moves to next question
User can go back and edit answers
```

### **Step 4: Submit Quiz**
```typescript
// Calculate score:
const correctCount = answers.filter((ans, i) => 
  ans === questions[i].answer
).length

const score = (correctCount / questions.length) * 100
// e.g., 4 out of 5 = 80%

// Determine pass/fail:
const passed = score >= passMark  // 80% >= 70% = TRUE
const xpAwarded = passed ? xpReward : 0  // 100 XP or 0
```

### **Step 5: Update Backend**
```typescript
// POST to progress API
await fetch('/api/student/progress', {
  method: 'POST',
  body: JSON.stringify({
    subject: 'math',
    chapterId: 'm2',
    score: 80,         // 80%
    timeSpent: 420,    // 7 minutes
    xpEarned: 100      // Only if passed
  })
})

// Backend returns:
{
  newXP: 450,
  newLevel: 1,
  badgesAwarded: ['quiz_first', 'xp_500']
}
```

### **Step 6: Show Results**
```
╔════════════════════════════════════════╗
║         📊 Quiz Results                ║
╠════════════════════════════════════════╣
║ Your Score: 80%  ✅ PASSED            ║
║                                        ║
║ Questions Correct: 4 / 5               ║
║ Time Taken: 7 minutes                  ║
║                                        ║
║ ⚡ +100 XP Earned!                    ║
║ 🌟 New Badge: Quiz Taker!             ║
║                                        ║
║ Current Level: 1                       ║
║ Total XP: 450 / 500 (next level)       ║
╠════════════════════════════════════════╣
║ [☀️ Explanation]  [Continue →]        ║
╚════════════════════════════════════════╝
```

### **Step 7: Show Explanations (Optional)**
```
For each question:
┌──────────────────────────────┐
│ Q1: What is √2?              │
│                              │
│ Your answer: ○ Rational      │
│ Correct answer: ✓ Irrational │
│                              │
│ 📝 Explanation:              │
│ √2 cannot be expressed as    │
│ p/q (fraction), so it is     │
│ irrational number.           │
│                              │
│ [← Back]  [Next →]           │
└──────────────────────────────┘
```

### **Step 8: Return to Game Map**
```
Progress updated in database
Student sees updated progress on game map
Next quest is unlocked (if passed)
Badges appear on profile
```

---

## 💾 Database Schema (Quiz Content)

```sql
-- Quests table
CREATE TABLE Quest {
  id: "m2"
  title: "Number Systems Quiz"
  type: "QUIZ"
  subject: "math"
  xpReward: 100
  passMark: 70
  timeLimit: 600
  
  -- Content stored as JSON:
  content: {
    "questions": [
      {
        "id": "m2q1",
        "q": "What is √2?",
        "options": ["Rational", "Irrational", "Integer", "Natural"],
        "answer": 1,
        "explanation": "√2 cannot be expressed as p/q..."
      },
      // ... more questions
    ]
  }
}

-- Student progress
CREATE TABLE ChapterProgress {
  userId: "user123"
  chapterId: "m2"
  status: "done"
  score: 80          // 80%
  attempts: 1
  completedAt: now
}
```

---

## 🎨 Game Types Summary Table

| Aspect | LESSON | QUIZ | BOSS |
|--------|--------|------|------|
| **Icon** | 📚 | 📝 | 🏆 |
| **Unlocked** | Always | After lesson | After quiz ≥70% |
| **Content** | Read/Watch | Answer MCQs | Answer MCQs |
| **Scoring** | N/A | Score % | Score % |
| **XP** | Full (50) | If passed (100) | If passed (200) |
| **Pass Mark** | Always | 70% | 80% |
| **Can Retry** | Yes | Multiple | Multiple |
| **Result** | Complete | Pass/Fail | Unlock boss badge |

---

## 🔧 Implementation Checklist

### Phase 1: Quiz UI
- [ ] Create `/src/app/quests/[id]/page.tsx`
- [ ] Import QuizEngine from `js/quiz.js`
- [ ] Display question UI with options
- [ ] Handle timer countdown
- [ ] Submit logic: calculate score
- [ ] Call progress API on submit
- [ ] Show results page
- [ ] Show explanations modal

### Phase 2: Lesson UI
- [ ] Create `/src/app/quests/lessons/[id]/page.tsx`
- [ ] Display lesson content (from Content API)
- [ ] "Mark as Complete" button
- [ ] Auto POST to progress API with score=100
- [ ] Show completion message

### Phase 3: Quiz Content API
- [ ] Create `/api/quests/[id]` endpoint
- [ ] Fetch from Quest table
- [ ] Parse JSON content
- [ ] Return questions in proper format

### Phase 4: Games/Interactive Elements
- [ ] Drag & Drop game
- [ ] Match Pairs game
- [ ] Fill-in-the-blank
- [ ] Word Scramble
- [ ] etc.

---

## 🎯 Example: Complete Math Unit

Student clicks Math → Game Map shows:

```
Level Map:  Mathematics

○ Lesson: Number Systems        [Click] → Shows content
│
├─ Quiz: Number Systems Quiz     [Click] → MCQ (5 questions, 10 min)
│
├─ Lesson: Algebra Basics        [Locked - complete quiz first]
│
├─ Quiz: Algebra Quiz            [Locked]
│
└─ 🏆 Boss: Math Mastery        [Locked]
```

**Student path:**
1. ✅ Read Lesson 1
2. ✅ Pass Quiz 1 (80%)
3. ✅ Unlock Lesson 2
4. ✅ Read Lesson 2
5. ✅ Pass Quiz 2 (75%)
6. ✅ Unlock Boss Battle
7. ✅ Pass Boss (85%)
8. 🎉 **Master Badge** awarded!

---

## 🚀 When Will It Be Done?

**Current Status:**
- ✅ Backend APIs: Done
- ✅ Game map UI: Done
- ✅ Quiz engine logic: Done (js/quiz.js)
- ⏳ Quiz display UI: **Need to build**
- ⏳ Lesson UI: **Need to build**
- ⏳ Quiz content API: **Easy to add**
- ⏳ Game templates (drag, match, etc.): **Future**

**Time to implement Phase 1-3: 2-3 hours**

---

## Example Code: Quiz UI Component

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function QuizPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(600)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()
  const chapterId = searchParams.get('chapter')
  const subject = searchParams.get('subject') || 'math'

  // Fetch quest questions
  useEffect(() => {
    fetch(`/api/quests/${chapterId}`)
      .then(r => r.json())
      .then(d => {
        setQuestions(d.questions)
        setAnswers(new Array(d.questions.length).fill(-1))
        setTimeLeft(d.timeLimit || 600)
        setLoading(false)
      })
  }, [chapterId])

  // Timer countdown
  useEffect(() => {
    if (submitted || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1)
      if (timeLeft <= 1) handleSubmit()
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, submitted])

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentIndex] = optionIndex
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    // Calculate score
    let correct = 0
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++
    })
    const finalScore = Math.round((correct / questions.length) * 100)
    setScore(finalScore)
    setSubmitted(true)

    // Update backend
    const xpEarned = finalScore >= 70 ? 100 : 0
    await fetch('/api/student/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        chapterId,
        score: finalScore,
        timeSpent: 600 - timeLeft,
        xpEarned
      })
    })
  }

  if (loading) return <div>Loading quiz...</div>
  if (submitted) {
    return (
      <div>
        <h1>Results: {score}%</h1>
        {score >= 70 ? <p>✅ PASSED! +100 XP</p> : <p>Try again</p>}
      </div>
    )
  }

  const q = questions[currentIndex]

  return (
    <div>
      <div>
        Question {currentIndex + 1} of {questions.length} | Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>

      <h2>{q.q}</h2>

      {q.options.map((opt, i) => (
        <label key={i}>
          <input
            type="radio"
            checked={answers[currentIndex] === i}
            onChange={() => handleSelectAnswer(i)}
          />
          {opt}
        </label>
      ))}

      <button
        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
        disabled={currentIndex === 0}
      >
        Previous
      </button>

      <button
        onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
        disabled={currentIndex === questions.length - 1}
      >
        Next
      </button>

      <button onClick={handleSubmit}>Submit Quiz</button>
    </div>
  )
}
```

---

## 📚 Related Files

- [Backend Gamification API](BACKEND-GAMIFICATION.md) - Progress tracking
- [Teacher Gamification](TEACHER-GAMIFICATION.md) - Quest creation
- [Offline Sync](OFFLINE-SYNC.md) - Quiz caching
- `js/quiz.js` - Core quiz engine
- `js/game.js` - Level progression
