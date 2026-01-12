# Beanie Farewell - Project Context

## Overview
**Beanie Farewell** is a mobile iOS app that uses photo-based AI identification to tell users what their Beanie Babies are worth. The core positioning is "permission to let go" - humorous acceptance that most Beanies are worthless, with the occasional surprise find.

**Target**: Millennials (30-45) with boxes of Beanie Babies in storage
**Monetization**: $4.99 one-time purchase (App Store)
**Goal**: Viral shareability through humor and nostalgia

## Tech Stack
- **Framework**: Expo (React Native) with TypeScript
- **Navigation**: Expo Router (file-based routing)
- **AI**: Anthropic Claude API (direct HTTP fetch, NOT the SDK - SDK doesn't work in React Native)
- **Image Handling**: expo-image-picker with `allowsEditing: true` to force JPEG conversion (iPhone defaults to HEIC which Claude API rejects)

## Project Location
```
C:\Users\johnr\OneDrive\NOLAND FAMILY\JOHN\CAREER\05_Beanie-farewell\beanie-farewell\
```

## File Structure
```
/app
  _layout.tsx    - Root layout with light theme
  index.tsx      - Welcome screen
  scan.tsx       - Camera/photo picker screen
  result.tsx     - Results display screen
/lib
  claude.ts      - Claude API integration (direct fetch)
  database.ts    - Beanie database lookup
  humor.ts       - All copy, verdicts, and randomized text
/data
  beanies.json   - Database of 30 Beanie Babies with values
/types
  beanie.ts      - TypeScript interfaces
```

## What's Built & Validated
✅ Expo app scaffolded and running on iPhone via Expo Go
✅ Navigation flow: Welcome → Scan → Result
✅ Claude API integration working (uses direct fetch, not SDK)
✅ Image picker configured to output JPEG (required for Claude API)
✅ Beanie identification working
✅ Rare variant detection working (Royal Blue Peanut test passed)
✅ Value estimates coming directly from Claude (not database lookup)
✅ Light/modern UI theme implemented
✅ Verdict tiers with randomized messages
✅ Streamlined 90s nostalgia humor

## Key Technical Decisions

### Claude API Setup (/lib/claude.ts)
- Uses direct `fetch()` to `https://api.anthropic.com/v1/messages`
- Headers: `x-api-key`, `anthropic-version: 2023-06-01`, `content-type: application/json`
- Model: `claude-sonnet-4-20250514`
- API key from: `process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY`
- Image sent as base64 with `media_type: "image/jpeg"`

### Image Picker Fix
iPhone takes HEIC photos by default. Claude API rejects HEIC. Fix:
```javascript
ImagePicker.launchCameraAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,  // Forces re-encoding to JPEG
  quality: 0.7,
  base64: true,
})
```

### Claude Prompt for Identification
The prompt explicitly instructs Claude to:
- Identify the Beanie Baby name
- Detect specific variants (especially Royal Blue Peanut)
- Return value estimates based on 2024-2025 eBay sold listings
- Return JSON with: name, animal_type, variant, colors, estimated_value_low, estimated_value_high, value_notes, confidence, has_visible_hang_tag

## Verdict Tiers
| Tier | Value Range | Verdicts |
|------|-------------|----------|
| 1 | < $10 | "Not Great, Bob" / "Welp" / "Yeah... About That" |
| 2 | $10-50 | "Coffee Money" / "Meh" / "Could Be Worse" |
| 3 | $50-200 | "Oh?" / "Wait, Really?" / "Huh." |
| 4 | $200-1000 | "Hold Up" / "Whoa" / "Um, Wow" |
| 5 | $1000+ | "NO WAY" / "JACKPOT" / "WHAT" |

## Design System (Light Theme)

### Colors
| Element | Hex |
|---------|-----|
| Background | `#F8F9FA` |
| Card | `#FFFFFF` |
| Primary (Coral) | `#FF6B6B` |
| Primary Dark | `#E85555` |
| Secondary (Teal) | `#4ECDC4` |
| Text | `#2D3436` |
| Text Secondary | `#636E72` |
| Text Muted | `#B2BEC3` |
| Border | `#E9ECEF` |

### Tier Accent Colors
| Tier | Accent | Background |
|------|--------|------------|
| 1-2 | Gray `#95A5A6` | `#F8F9FA` |
| 3 | Teal `#4ECDC4` | `#E8FAF8` |
| 4 | Orange `#F39C12` | `#FFF8E8` |
| 5 | Green `#00B894` | `#E8FFF4` |

### Typography
- Titles: 28-36px, weight 700
- Body: 15-17px, weight 400-600
- Labels: 11-13px, uppercase, letter-spacing

### UI Principles
- Clean, modern, friendly (Headspace/Duolingo vibe)
- White cards with subtle shadows
- Coral primary buttons with shadow
- Subtle animations (fade, slide, scale)
- Good spacing and visual hierarchy

## Humor Guidelines (/lib/humor.ts)
- **Mainstream 90s only** - Dial-up, Jeeves, burning CDs, "Don't pick up the phone Mom"
- **No obscure references** - If you have to explain it, cut it
- **Punchy and clear** - Short sentences, instant understanding
- **Self-deprecating about millennials** - Mock the Beanie investment, not people
- **Culturally sensitive** - No MLK references, no gendered/religious/political content

## Running the App
```bash
cd C:\Users\johnr\OneDrive\NOLAND FAMILY\JOHN\CAREER\05_Beanie-farewell\beanie-farewell
npx expo start
```
Then scan QR code with Expo Go on iPhone. If connection fails, try `npx expo start --tunnel`.

## Environment Variables
`.env` file must contain:
```
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

## Future Features (Not Yet Built)
- Shareable "Farewell Certificate" image
- Collection tracking (scan multiple, see total)
- Share functionality
- App Store deployment
