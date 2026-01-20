# Beanie Farewell

## Overview
iOS app using AI photo identification to value Beanie Babies. Core positioning: "permission to let go" - humorous acceptance that most are worthless, with occasional surprise finds.

- **Target**: Millennials (30-45) with boxes of Beanies in storage
- **Monetization**: $4.99 one-time App Store purchase
- **Goal**: Viral shareability through humor and nostalgia

## Tech Stack
| Category | Technology |
|----------|------------|
| Framework | Expo (React Native) + TypeScript |
| Navigation | Expo Router (file-based) |
| AI | Claude API via direct fetch (NOT SDK - doesn't work in RN) |
| UI | expo-blur, expo-linear-gradient, react-native-svg |
| State | Zustand + AsyncStorage persistence |
| Sharing | expo-sharing, expo-media-library, react-native-view-shot |

## File Structure
```
/app
  _layout.tsx      - Root layout, store hydration, onboarding redirect
  index.tsx        - Home (level/XP, streak, daily challenge, tier chart)
  onboarding.tsx   - First-launch name capture
  scan.tsx         - Camera + web mock mode
  search.tsx       - Text-based Beanie search
  followup.tsx     - Follow-up questions for valuable variants
  result.tsx       - Results + all toast notifications
  collection.tsx   - Grid view, sorting, stats card
  achievements.tsx - Achievement grid with categories
/components
  FarewellCertificate.tsx, CollectionCertificate.tsx, CollectionStatsCard.tsx
  TierDistributionChart.tsx, Confetti.tsx, RareFindCelebration.tsx
  *Toast.tsx (8 types: Achievement, Challenge, LevelUp, LoginBonus,
              LuckyScan, Milestone, StreakMilestone, ValueMilestone)
/lib
  claude.ts      - API integration, auto media type detection
  store.ts       - Zustand store (collection, gamification, persistence)
  achievements.ts - 30 achievements across 4 categories
  challenges.ts  - Daily challenges, streaks, XP/levels
  humor.ts       - All copy, verdicts, fun facts
  search.ts      - Text search database
  network.ts     - Network error handling
/assets/icons
  icon-main.png, icon-tier1-5.png (tier2 has variants A-I)
```

## Design System (Memphis Glass)
Light background (#FAFAFA) + frosted glass cards + bold 90s Memphis shapes.

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Magenta | #FF00FF | Primary CTA, tier 5 |
| Deep Pink | #FF1493 | Button gradients |
| Purple | #8B5CF6 | Shapes, app branding |
| Teal | #00CED1 | Accents, tier 3, links |
| Yellow | #FFD700 | Shapes, XP badges |
| Orange | #FF6B35 | Shapes, tier 4 |
| Black | #000000 | Shape outlines (90s key) |

### Tiers
| Tier | Value | Color | Verdicts |
|------|-------|-------|----------|
| 1 | <$10 | Gray | "Not Great, Bob" / "Welp" |
| 2 | $10-50 | Gray | "Coffee Money" / "Meh" |
| 3 | $50-200 | Teal | "Oh?" / "Wait, Really?" |
| 4 | $200-1000 | Orange | "Hold Up" / "Whoa" |
| 5 | $1000+ | Magenta | "NO WAY" / "JACKPOT" |

### Glass Card Pattern
BlurView intensity=40, tint="light", inner bg rgba(255,255,255,0.72), borderRadius 24

## Key Features

### Smart Variant Detection
For valuable Beanies (value_high >= $75), shows follow-up questions:
- Condition (always), Pellet type (PE vs PVC), Tag photos, Color confirmation
- Condition multipliers: Mint+tag 1.0x, Mint no tag 0.5x, Excellent 0.75x, Good 0.5x, Fair 0.25x

### Gamification System
- **Achievements**: 30 total across Collection, Value, Discovery, Dedication categories (5 secret)
- **Daily Challenges**: 18 templates, seeded daily, 10-75 XP rewards
- **Streaks**: Current/longest tracking, milestones at 3/7/14/30/50/100 days
- **XP/Levels**: Level N requires N×100 XP, 8 titles (Beanie Newbie → Beanie God)
- **Lucky Scan**: 10% chance for 2x-5x XP multiplier
- **Login Bonus**: 10-60 XP daily based on streak

### Toast Notifications (result.tsx, index.tsx)
Sequential display with proper chaining - Achievement, Challenge, LevelUp, Milestone, LuckyScan, ValueMilestone, StreakMilestone, LoginBonus

### Collection
- Auto-save scans, 2-column grid, running totals
- Sort by date/value/name, text search filter
- Stats card and tier distribution chart
- Shareable collection certificate

### Certificates
- FarewellCertificate: Single beanie result with photo, verdict, seal
- CollectionCertificate: Collection summary stats
- Both use react-native-view-shot for capture

## API Configuration
```
Endpoint: https://api.anthropic.com/v1/messages
Model: claude-sonnet-4-20250514
Key: EXPO_PUBLIC_ANTHROPIC_API_KEY in .env
Media detection: Auto from base64 magic bytes (JPEG/PNG/WebP/GIF)
```

## Running
```bash
npx expo start          # iOS via Expo Go
npx expo start --web    # Browser (uses mock mode on scan screen)
npx expo start --tunnel # If connection issues
```

## Humor Guidelines
- Mainstream 90s only (dial-up, AIM, burning CDs)
- No obscure references - instant understanding
- Self-deprecating about millennials, not people
- No MLK/political/religious content
- Fun facts: S&P 500 comparisons, time-value, alternative investments

## Architecture Notes
- Store hydration via onRehydrateStorage callback sets isHydrated
- _layout.tsx redirects to /onboarding if !hasCompletedOnboarding
- Tier 2 icons: 9 variants (A-I), selected by name hash for consistency
- pendingThumbnail captured in useState initializer (not useEffect) for reliability
- XP earned tracked per-scan for display badge on result screen
