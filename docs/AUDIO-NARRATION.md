# 🔊 VidyaQuest — Audio Narration System

## Priority: P1

## Overview
Many rural students have low reading proficiency. Audio narration allows them to **listen** to questions and instructions, making the platform accessible regardless of reading level.

---

## Implementation: Browser SpeechSynthesis API

**No external service needed. No pre-recorded MP3s. Works offline.**

### Core Function
```typescript
// src/lib/audio.ts

export function speak(text: string, lang: string = 'en-IN') {
  if (!('speechSynthesis' in window)) return

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.9  // Slightly slower for students
  utterance.pitch = 1.0
  utterance.volume = 1.0

  // Try to find a voice for the language
  const voices = window.speechSynthesis.getVoices()
  const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]))
  if (voice) utterance.voice = voice

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  window.speechSynthesis.cancel()
}

export function isSpeaking(): boolean {
  return window.speechSynthesis.speaking
}
```

### Language Codes for Indian Languages
| Language | Code | Android Support |
|----------|------|----------------|
| English (India) | `en-IN` | ✅ Excellent |
| Hindi | `hi-IN` | ✅ Good (Android 8+) |
| Marathi | `mr-IN` | ⚠️ Limited |
| Telugu | `te-IN` | ⚠️ Limited |
| Tamil | `ta-IN` | ⚠️ Limited |

### UI: "Read Aloud" Button
```
Every question screen should have:

┌─────────────────────────────────────┐
│  Q3/10          ⏱️ Timer (12s)     │
│                                     │
│  "What is 7 × 8?"       [🔊 Read] │
│                                     │
│  A. 54   B. 56   C. 48   D. 64    │
└─────────────────────────────────────┘

- 🔊 icon button next to every question
- Tap → reads question aloud
- Tap again → stops
- Auto-read option in settings (reads every question automatically)
```

### Integration Points
| Screen | What's read aloud |
|--------|------------------|
| Quiz question | Question text + options |
| Drag & Drop | Instruction text |
| Story Quest | Full narrative text |
| Match Pairs | Term being flipped |
| Number Ninja | Target number + available numbers |
| Score screen | "You scored X out of Y! You earned Z XP!" |
| Badge earned | "Congratulations! You earned the First Blood badge!" |

### Settings
```
Student Profile → Settings:
  🔊 Audio Narration: [On/Off toggle]
  🔊 Auto-Read Questions: [On/Off toggle]
  🔊 Speech Speed: [Slow / Normal / Fast]
```

### Offline Support
- SpeechSynthesis API works **fully offline** on most Android devices
- TTS voices are pre-installed with the OS
- No internet required for audio narration
- This is a major advantage for rural deployment
