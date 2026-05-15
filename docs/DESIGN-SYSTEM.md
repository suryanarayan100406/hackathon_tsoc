# 🎨 VidyaQuest — Design System

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#FF6B35` | CTAs, active states, XP bars, branding |
| `--primary-light` | `#FF8F66` | Hover states, highlights |
| `--primary-dark` | `#E05A2B` | Pressed states, gradients |
| `--secondary` | `#2EC4B6` | Science theme, info, links |
| `--secondary-light` | `#5DD4C8` | Hover |
| `--secondary-dark` | `#24A094` | Pressed |
| `--accent` | `#FFE066` | Rewards, stars, XP popups |
| `--accent-dark` | `#F5D033` | Gradients |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#06D6A0` | Correct answers, completed quests |
| `--error` | `#EF476F` | Wrong answers, validation errors |
| `--warning` | `#FFD166` | Timer warnings, inactive status |
| `--info` | `#118AB2` | Tooltips, info banners |

### Theme Colors

#### Light Theme
| Token | Value |
|-------|-------|
| `--bg-primary` | `#F8F9FA` |
| `--bg-secondary` | `#FFFFFF` |
| `--bg-tertiary` | `#F0F1F3` |
| `--text-primary` | `#1A1A2E` |
| `--text-secondary` | `#4A4A6A` |
| `--text-muted` | `#8A8AA3` |
| `--border-color` | `#E2E4E9` |

#### Dark Theme
| Token | Value |
|-------|-------|
| `--bg-primary` | `#0D1B2A` |
| `--bg-secondary` | `#1B2838` |
| `--bg-tertiary` | `#253346` |
| `--text-primary` | `#F0F0F5` |
| `--text-secondary` | `#B0B0C8` |
| `--text-muted` | `#6A6A8A` |
| `--border-color` | `#2A3A50` |

---

## Typography

| Usage | Font | Weight | Fallback |
|-------|------|--------|----------|
| Headings | Baloo 2 | 700, 800 | cursive |
| Body | Hind | 400, 500, 600 | sans-serif |
| Code | JetBrains Mono | 400, 500 | monospace |

All fonts support Devanagari script (Hindi/Marathi).

### Scale
| Element | Size | Weight |
|---------|------|--------|
| h1 | 2.5rem / 40px | 800 |
| h2 | 2rem / 32px | 700 |
| h3 | 1.5rem / 24px | 700 |
| h4 | 1.25rem / 20px | 600 |
| body | 1rem / 16px | 400 |
| small | 0.875rem / 14px | 400 |
| caption | 0.75rem / 12px | 400 |

---

## Component Library

### `<QuestCard />`
- Island node on quest map path
- States: completed (green + stars), current (orange glow), locked (gray + padlock)
- Size: 52px mobile, 64px desktop
- Shows star rating below (1–3 filled stars)

### `<XPBar />`
- Animated progress bar (Framer Motion width transition)
- Shows: level icon, level name, XP progress, next level target
- Gradient fill: `--primary` → `--accent`
- Sizes: sm (h-2), md (h-3), lg (h-4)

### `<BadgeShelf />`
- Horizontal scroll of earned badge circles
- Spring animation on mount (scale 0→1, rotate -180→0)
- Tooltip on hover: badge name + description
- Overflow counter (+N remaining)

### `<LeaderboardRow />`
- Rank number, avatar, name, XP, badge count
- Top 3 get gold/silver/bronze medal icons
- Current user's row always pinned at bottom with highlight

### `<StreakFlame />`
- Animated fire emoji (scale + rotate loop)
- Intensity increases with streak length
- Shows "X Days streak" text

### `<OfflineBanner />`
- Sticky top banner, yellow gradient
- Shows when navigator.onLine === false
- Animated entry/exit (height + opacity)
- Text: "You're offline — progress will sync when connected"

### `<TimerBar />`
- Horizontal bar, decreases over time
- Color transitions: green → yellow → red
- Used in quiz games

### `<ScorePopup />`
- Full-screen overlay, "+XP" text with gradient
- Spring animation (scale 0→1.2→1)
- Pulse effect on XP number
- Auto-dismiss after 2s

### `<Confetti />`
- 60 colored particles falling from top
- Colors from palette: primary, secondary, accent, success, error, purple, blue
- Triggered on: level-up, 3-star completion, badge earned
- Duration: 3 seconds

---

## Animations

| Name | CSS/Framer | Duration | Usage |
|------|-----------|----------|-------|
| `float` | `translateY(0→-10→0)` | 3s infinite | Floating decorative icons |
| `pulse-glow` | `box-shadow pulse` | 2s infinite | Current quest node |
| `shimmer` | `background-position sweep` | 2s infinite | Loading skeletons |
| `slide-up` | `translateY(20→0) + opacity` | 0.5s | Page enter animations |
| `xp-pop` | `scale(0→1.3→1) + translateY` | 1.5s | XP gain notification |
| `streak-flame` | `scaleY(1→1.15→1)` | 0.8s infinite | Streak fire icon |
| `confetti-fall` | `translateY(-100vh→100vh) + rotate` | 2–4s | Celebration |

---

## Spacing & Layout

- Border radius: 12px (cards), 16px (modals), 50% (avatars/badges)
- Padding: 16px (mobile), 24px (desktop) for cards
- Gap: 12px (tight), 16px (default), 24px (loose)
- Max content width: 1200px
- Mobile breakpoint: 768px
- Touch targets: minimum 44×44px

---

## Glassmorphism Style
```css
.glass-card {
  background: rgba(255, 255, 255, 0.8);  /* light */
  /* OR rgba(27, 40, 56, 0.8); dark */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
```

---

## Background
- Dot grid pattern: `radial-gradient(circle, border-color 1px, transparent 1px)` size 24×24px
- Opacity: 30%
- Used on login page and empty states
