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
- **Image Handling**: expo-image-picker with `allowsEditing: true` (auto-detects JPEG/PNG/WebP)
- **UI Effects**: expo-blur (glassmorphism), expo-linear-gradient, react-native-svg (Memphis patterns & icons)
- **Sharing**: expo-sharing, expo-media-library, react-native-view-shot (certificate capture)
- **State Management**: Zustand with AsyncStorage persistence (collection tracking)
- **Web Support**: react-dom, react-native-web, @expo/metro-runtime (for browser dev/testing)

## File Structure
```
/app
  _layout.tsx     - Root layout with store initialization
  index.tsx       - Welcome screen (Memphis glass UI)
  scan.tsx        - Camera/photo picker screen + web mock mode
  followup.tsx    - Follow-up questions for valuable variants
  result.tsx      - Results display with auto-save to collection
  collection.tsx  - Collection grid view with running totals
/components
  FarewellCertificate.tsx  - Shareable certificate component
  /icons
    HeartTagIcon.tsx   - TY-style heart tag SVG icon
    PeanutIcon.tsx     - Elephant icon (unused, legacy)
    TeddyBearIcon.tsx  - Teddy bear icon (unused, legacy)
/lib
  claude.ts       - Claude API integration with Smart Variant Detection
  store.ts        - Zustand store with AsyncStorage persistence
  database.ts     - Beanie database lookup (legacy, not primary)
  humor.ts        - All copy, verdicts, and randomized text
/data
  beanies.json    - Database of 30 Beanie Babies with values
/types
  beanie.ts       - TypeScript interfaces (includes CollectionItem)
```

## What's Built & Validated
✅ Expo app scaffolded and running on iPhone via Expo Go
✅ Navigation flow: Welcome → Scan → (Follow-up) → Result → Collection
✅ Claude API integration with auto media type detection
✅ Image picker configured (JPEG/PNG both work)
✅ Beanie identification working
✅ Rare variant detection working (Royal Blue Peanut test passed)
✅ Value estimates from Claude (based on 2024-2025 eBay sold listings)
✅ **Smart Variant Detection** - follow-up questions for high-value Beanies
✅ **Memphis Glass UI** - Apple liquid glass + bold 90s Memphis design
✅ **TY Heart Logo** - Custom SVG heart with "ty" text
✅ **Shareable Farewell Certificate** - Capture and share results as image
✅ **Collection Tracking** - Auto-save scans, grid view, running totals, persistence
✅ **Web Support** - Browser testing with mock data mode
✅ Verdict tiers with randomized messages
✅ Streamlined 90s nostalgia humor

## Design System (Memphis Glass)

### Design Philosophy
Combines Apple's liquid glass aesthetic with bold 90s Memphis design accents. Think "Saved by the Bell" meets modern iOS - clean frosted glass cards with confident, saturated geometric shapes.

### Background
```typescript
// Pure white/light gray - clean canvas for shapes to pop
colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
backgroundColor: '#FAFAFA'
```

### Memphis Color Palette (Bold 90s)
| Color | Hex | Usage |
|-------|-----|-------|
| Hot Magenta | `#FF00FF` | Primary CTA buttons, accents |
| Deep Pink | `#FF1493` | Button gradients, accents |
| Electric Purple | `#8B5CF6` | Shapes, zigzags |
| Teal/Cyan | `#00CED1` | Shapes, text accents, selections |
| Bright Yellow | `#FFD700` | Shapes, lightning bolts |
| Bright Orange | `#FF6B35` | Shapes, tier 4 accent |
| Black | `#000000` | Shape outlines (essential for 90s authenticity) |

### Memphis Pattern
Each screen has a unique arrangement of scattered geometric shapes at 50% opacity:
- **Filled shapes with black outlines** - triangles, circles (key 90s element)
- **Black outline-only shapes** - triangles, circles, diamonds
- **Bold squiggles** - 4-5px stroke width
- **Lightning bolts, zigzags** - classic 90s patterns
- **Small accent shapes** - dots, clusters

### Glass Cards (Frosted Glass)
```typescript
<BlurView intensity={40} tint="light" style={styles.glassCard}>
  <View style={styles.glassCardInner}>
    {/* Content */}
  </View>
</BlurView>

glassCardInner: {
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  padding: 24,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.6)',
  borderRadius: 24,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 32,
}
```

### Buttons
**Primary (CTA):**
```typescript
// Magenta gradient, pill shape
<LinearGradient colors={['#FF00FF', '#FF1493']} style={styles.primaryButton}>

primaryButton: {
  paddingVertical: 18,
  paddingHorizontal: 48,
  borderRadius: 50,  // Pill shape
  shadowColor: '#FF00FF',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.4,
  shadowRadius: 16,
}
```

**Secondary:**
```typescript
// Frosted glass style
secondaryButton: {
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderWidth: 2,
  borderColor: 'rgba(0, 0, 0, 0.1)',
  borderRadius: 50,
}
```

### Typography
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Title | 32-34px | 700 | `#1a1a2e` |
| Tagline | 18px | 700 | `#00CED1` (teal) |
| Body | 15-17px | 400 | `#666666` |
| Muted | 13-14px | 400 | `#999999` |
| Value numbers | 36-40px | 800 | Tier-specific |

### Tier Accent Colors
| Tier | Value Range | Accent Color | Special Treatment |
|------|-------------|--------------|-------------------|
| 1-2 | < $50 | Gray `#666666` | Standard |
| 3 | $50-200 | Teal `#00CED1` | Teal highlights |
| 4 | $200-1000 | Orange `#FF6B35` | Orange glow |
| 5 | $1000+ | Magenta `#FF00FF` | 60% pattern opacity, glow animation |

## TY Heart Logo
The welcome screen features a TY-style heart logo:
```typescript
// SVG heart with gradient fill and "ty" text
<Svg width={90} height={90} viewBox="0 0 100 100">
  <Defs>
    <SvgLinearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <Stop offset="0%" stopColor="#ff4757" />
      <Stop offset="100%" stopColor="#ff3344" />
    </SvgLinearGradient>
  </Defs>
  <Path d="M50 88 C20 65 5 45 5 30..." fill="url(#heartGrad)" />
  <SvgText x="50" y="58" fill="white" fontSize="28" fontWeight="900">ty</SvgText>
</Svg>
```

## Smart Variant Detection (Key Feature)

For potentially valuable Beanies (estimated_value_high >= $75), the app shows follow-up questions to get accurate valuations.

### Trigger Conditions
- `estimated_value_high >= $75` OR
- Known high-variance Beanie (Princess, Peanut, Valentino, Peace, etc.)

### Follow-Up Question Types
| Type | Method | When Used |
|------|--------|-----------|
| `condition` | User selects | Always for valuable items |
| `pellet_type` | User feels/reports | PE vs PVC matters (Princess, Valentino) |
| `tush_tag_photo` | Second photo | Country of origin matters (Indonesia = rare) |
| `hang_tag_photo` | Second photo | Tag generation/errors matter |
| `color_confirmation` | Second photo | Color variants (Peanut, Inky) |
| `original_packaging` | User confirms | Sealed items |

### Condition Multipliers
| Condition | Multiplier |
|-----------|------------|
| Mint with tag | 1.0x (full value) |
| Mint no tag | 0.5x |
| Excellent | 0.75x |
| Good | 0.5x |
| Fair | 0.25x |

### "Not Sure" Handling
When user selects "Not sure" for pellet type, show value range with explanation:
- "High end assumes rare PVC pellets"
- "Low end assumes common PE pellets"

## Farewell Certificate (Shareable)

Users can share their results as a styled image certificate.

### Implementation
- `react-native-view-shot` captures the certificate component
- `expo-sharing` opens native share sheet
- `expo-media-library` saves to camera roll as fallback
- Certificate renders off-screen, captured as PNG

### Certificate Content
- TY heart logo branding
- Verdict icon and title
- Beanie name and variant
- Value range (large, tier-colored)
- Tier-appropriate tagline
- Condition info (if from follow-up)

## Collection Tracking

Users can build a collection of scanned Beanies with persistent storage and running value totals.

### Features
- **Auto-save**: Every successful scan automatically saves to collection
- **Grid view**: 2-column photo grid with thumbnails
- **Running totals**: Header shows total collection value range
- **Delete items**: Long-press to remove from collection
- **Persistence**: Collection survives app restarts via AsyncStorage
- **Navigation**: "My Collection" button on welcome (when items exist) and result screens

### Data Model (CollectionItem)
```typescript
interface CollectionItem {
  id: string;                    // Unique ID (timestamp + random)
  timestamp: number;             // When scanned
  thumbnail: string;             // Base64 image
  name: string;
  animal_type: string;
  variant: string;
  colors: string[];
  estimated_value_low: number;
  estimated_value_high: number;
  adjusted_value_low?: number;   // After condition multipliers
  adjusted_value_high?: number;
  condition?: ConditionLevel;
  pellet_type?: PelletType;
  value_notes: string;
  tier: number;                  // 1-5
}
```

### Store Implementation (/lib/store.ts)
```typescript
// Zustand store with AsyncStorage persistence
const useCollectionStore = create(
  persist(
    (set, get) => ({
      collection: [],
      pendingThumbnail: null,  // Temp storage during scan flow

      addItem: (item) => set(state => ({
        collection: [item, ...state.collection]
      })),
      removeItem: (id) => set(state => ({
        collection: state.collection.filter(i => i.id !== id)
      })),
      clearCollection: () => set({ collection: [] }),
      getTotalValue: () => collection.reduce(...),
    }),
    {
      name: 'beanie-collection',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ collection: state.collection }),
    }
  )
);
```

### Flow
1. User scans Beanie → `scan.tsx` saves thumbnail to `pendingThumbnail`
2. Result screen displays → auto-save effect runs
3. Creates `CollectionItem` with all data + thumbnail
4. Adds to collection, clears `pendingThumbnail`
5. Shows "Added to collection" indicator
6. User can tap "My Collection" to view grid

### Edge Cases Handled
- "Not a Beanie Baby" results are NOT saved
- Duplicate prevention via `savedToCollection` state
- Empty collection shows friendly empty state
- Loading state while AsyncStorage hydrates
- Platform-specific delete confirmations (Alert vs confirm)

## Key Technical Decisions

### Claude API Setup (/lib/claude.ts)
- Uses direct `fetch()` to `https://api.anthropic.com/v1/messages`
- Headers: `x-api-key`, `anthropic-version: 2023-06-01`, `content-type: application/json`
- Model: `claude-sonnet-4-20250514`
- API key from: `process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY`
- **Auto-detects media type** from base64 magic bytes (JPEG, PNG, WebP, GIF)
- Returns `needs_follow_up` flag and `follow_up_questions` array for valuable items

### Media Type Detection
```typescript
function detectMediaType(base64: string): string {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('UklGR')) return 'image/webp';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  return 'image/jpeg'; // fallback
}
```

### Image Picker Setup
```javascript
ImagePicker.launchCameraAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 0.7,
  base64: true,
})
```

## Verdict Tiers
| Tier | Value Range | Verdicts |
|------|-------------|----------|
| 1 | < $10 | "Not Great, Bob" / "Welp" / "Yeah..." |
| 2 | $10-50 | "Coffee Money" / "Meh" / "Could Be Worse" |
| 3 | $50-200 | "Oh?" / "Wait, Really?" / "Huh." |
| 4 | $200-1000 | "Hold Up" / "Whoa" / "Um, Wow" |
| 5 | $1000+ | "NO WAY" / "JACKPOT" / "WHAT" |

## Web Development Mode

### Setup
Web support installed for faster UI iteration:
```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

### Running in Browser
```bash
npx expo start --web
# Or: npx expo start, then press 'w'
```

### Web Mock Mode (scan.tsx)
On web, camera is replaced with a dropdown of test scenarios:
- **Teddy the Bear** - Common, low value ($3-8), no follow-up
- **Princess Diana Bear** - Rare variant potential, triggers follow-up flow
- **Royal Blue Peanut** - Very rare ($3,000-5,000), triggers follow-up
- **Not a Beanie Baby** - Tests error case

Mock mode simulates 1.5s API delay for realistic feel.

## Humor Guidelines (/lib/humor.ts)
- **Mainstream 90s only** - Dial-up, Jeeves, burning CDs, "Don't pick up the phone Mom"
- **No obscure references** - If you have to explain it, cut it
- **Punchy and clear** - Short sentences, instant understanding
- **Self-deprecating about millennials** - Mock the Beanie investment, not people
- **Culturally sensitive** - No MLK references, no gendered/religious/political content

## Running the App

### iOS (Expo Go)
```bash
cd C:\Projects\beanie-farewell
npx expo start
```
Scan QR code with Expo Go on iPhone. If connection fails, try `npx expo start --tunnel`.

### Web (Browser)
```bash
npx expo start --web
```
Use mock mode dropdown on Scan screen to test full flow without camera.

## Environment Variables
`.env` file must contain:
```
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

## Dependencies
```json
{
  "expo-blur": "glassmorphism effects",
  "expo-linear-gradient": "gradient backgrounds and buttons",
  "react-native-svg": "Memphis patterns and icons",
  "expo-sharing": "native share sheet",
  "expo-media-library": "save to camera roll",
  "react-native-view-shot": "capture views as images",
  "zustand": "state management",
  "@react-native-async-storage/async-storage": "persistent storage",
  "react-dom": "web support",
  "react-native-web": "web support",
  "@expo/metro-runtime": "web support"
}
```

## Future Features (Not Yet Built)
- App Store deployment (icons, splash screens, metadata)
- Additional follow-up photo analysis (tush tag OCR for country detection)
