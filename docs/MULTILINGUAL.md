# 🌐 VidyaQuest — Multilingual System (i18n)

## Priority: P0 (Required by Problem Statement)

## Overview
The platform must serve students across rural India who may not be comfortable with English. All UI text, game instructions, and quest content must be available in multiple Indian languages.

---

## Supported Languages

| Language | Code | Script | Font | Region |
|----------|------|--------|------|--------|
| English | `en` | Latin | Hind | Pan-India |
| Hindi | `hi` | Devanagari | Baloo 2, Hind | North/Central India |
| Marathi | `mr` | Devanagari | Baloo 2, Hind | Maharashtra |
| Telugu | `te` | Telugu | Noto Sans Telugu | Andhra Pradesh, Telangana |
| Tamil | `ta` | Tamil | Noto Sans Tamil | Tamil Nadu |

---

## Architecture

### UI Translations (Static Strings)

Use JSON locale files — **no code changes needed to add a language**.

```
public/locales/
├── en.json    # English
├── hi.json    # Hindi
├── mr.json    # Marathi
├── te.json    # Telugu
└── ta.json    # Tamil
```

#### Example: `en.json`
```json
{
  "nav": {
    "dashboard": "Quest Map",
    "leaderboard": "Leaderboard",
    "profile": "Profile",
    "settings": "Settings"
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "email": "Email Address",
    "password": "Password",
    "googleLogin": "Continue with Google",
    "startQuest": "Start Your Quest",
    "beginJourney": "Begin Your Journey"
  },
  "game": {
    "question": "Question",
    "timeLeft": "Time Left",
    "streak": "Streak",
    "correct": "Correct!",
    "wrong": "Oops! Try again",
    "hint": "Hint",
    "submit": "Submit",
    "next": "Next",
    "finish": "Finish",
    "score": "Your Score",
    "xpEarned": "XP Earned",
    "stars": "Stars"
  },
  "dashboard": {
    "welcome": "Welcome back",
    "continueQuest": "Continue Quest",
    "locked": "Complete previous quest first",
    "completed": "Completed",
    "currentLevel": "Current Level",
    "nextLevel": "Next Level"
  },
  "teacher": {
    "classOverview": "Class Overview",
    "analytics": "Analytics",
    "createQuest": "Create Quest",
    "sendNudge": "Send Nudge",
    "export": "Export Report",
    "active": "Active",
    "inactive": "Inactive",
    "atRisk": "At Risk"
  },
  "offline": {
    "banner": "You're offline — progress will sync when connected",
    "syncing": "Syncing progress...",
    "synced": "All progress synced!",
    "downloadContent": "Download Content",
    "storageUsed": "Storage Used"
  },
  "badges": {
    "earned": "Badge Earned!",
    "firstBlood": "First Blood",
    "onFire": "On Fire",
    "mathWizard": "Math Wizard"
  }
}
```

#### Example: `hi.json`
```json
{
  "nav": {
    "dashboard": "क्वेस्ट मैप",
    "leaderboard": "लीडरबोर्ड",
    "profile": "प्रोफ़ाइल",
    "settings": "सेटिंग्स"
  },
  "auth": {
    "signIn": "साइन इन करें",
    "signUp": "साइन अप करें",
    "email": "ईमेल पता",
    "password": "पासवर्ड",
    "googleLogin": "Google से जारी रखें",
    "startQuest": "अपनी क्वेस्ट शुरू करें",
    "beginJourney": "अपनी यात्रा शुरू करें"
  },
  "game": {
    "question": "प्रश्न",
    "timeLeft": "शेष समय",
    "streak": "लगातार सही",
    "correct": "सही जवाब! 🎉",
    "wrong": "गलत! फिर कोशिश करें",
    "hint": "संकेत",
    "submit": "जमा करें",
    "next": "अगला",
    "finish": "समाप्त",
    "score": "आपका स्कोर",
    "xpEarned": "XP अर्जित",
    "stars": "सितारे"
  },
  "dashboard": {
    "welcome": "वापस स्वागत है",
    "continueQuest": "क्वेस्ट जारी रखें",
    "locked": "पहले पिछली क्वेस्ट पूरी करें",
    "completed": "पूर्ण",
    "currentLevel": "वर्तमान स्तर",
    "nextLevel": "अगला स्तर"
  },
  "teacher": {
    "classOverview": "कक्षा अवलोकन",
    "analytics": "विश्लेषण",
    "createQuest": "क्वेस्ट बनाएं",
    "sendNudge": "अनुस्मारक भेजें",
    "export": "रिपोर्ट डाउनलोड करें",
    "active": "सक्रिय",
    "inactive": "निष्क्रिय",
    "atRisk": "जोखिम में"
  },
  "offline": {
    "banner": "आप ऑफ़लाइन हैं — कनेक्ट होने पर प्रगति सिंक होगी",
    "syncing": "प्रगति सिंक हो रही है...",
    "synced": "सारी प्रगति सिंक हो गई!",
    "downloadContent": "सामग्री डाउनलोड करें",
    "storageUsed": "उपयोग की गई स्टोरेज"
  },
  "badges": {
    "earned": "बैज मिला! 🎉",
    "firstBlood": "पहली जीत",
    "onFire": "आग पर",
    "mathWizard": "गणित जादूगर"
  }
}
```

---

## Implementation

### Translation Hook
```typescript
// src/lib/i18n.ts
import en from '@/public/locales/en.json'
import hi from '@/public/locales/hi.json'

const locales: Record<string, any> = { en, hi }

export function useTranslation(lang: string = 'en') {
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = locales[lang] || locales['en']
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }
  return { t }
}

// Usage in component:
// const { t } = useTranslation(user.language)
// <button>{t('auth.signIn')}</button>
```

### Language Switcher Component
```
Location: Student Profile → Settings section
UI: Dropdown or radio buttons with language names in their native script
  - English
  - हिन्दी (Hindi)
  - मराठी (Marathi)
  - తెలుగు (Telugu)
  - தமிழ் (Tamil)

On change:
  1. Update user.language in DB (PUT /api/student/profile)
  2. Update Zustand store
  3. Re-render all UI strings
```

### Bilingual Quest Content
Quest `content` JSON supports multiple languages:
```json
{
  "questions": [
    {
      "question": {
        "en": "What is the value of 7 × 8?",
        "hi": "7 × 8 का मान क्या है?"
      },
      "options": {
        "en": ["54", "56", "48", "64"],
        "hi": ["54", "56", "48", "64"]
      },
      "correct": 1,
      "explanation": {
        "en": "7 × 8 = 56",
        "hi": "7 × 8 = 56"
      }
    }
  ]
}
```

### Font Loading
```html
<!-- Already in globals.css -->
<!-- Baloo 2 + Hind: support Latin + Devanagari (Hindi, Marathi) -->
<!-- Add for Telugu + Tamil: -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu&family=Noto+Sans+Tamil&display=swap" rel="stylesheet">
```

---

## No-Code-Change Content Management
- **Adding a new language**: Create new JSON file in `public/locales/` → no code change
- **Editing translations**: Edit JSON file → no code change
- **Bilingual questions**: Teacher enters both languages in Quest Builder form → stored in DB → no code change
