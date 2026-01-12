/**
 * Humor and copy utilities for Beanie Farewell
 * Streamlined 90s nostalgia - mainstream references only
 */

// ============================================
// LOADING SCREEN TEXT
// ============================================

const LOADING_TITLES = [
  "Consulting the experts...",
  "Asking Jeeves...",
  "Waiting for dial-up...",
  "Checking eBay archives...",
  "Loading...",
  "One moment...",
];

const LOADING_SUBTITLES = [
  "Still faster than burning a CD",
  "Don't pick up the phone, Mom",
  "You've got mail... almost",
  "Buffering at 56k",
  "This won't take long",
];

export function getRandomLoadingTitle(): string {
  return LOADING_TITLES[Math.floor(Math.random() * LOADING_TITLES.length)];
}

export function getRandomLoadingSubtitle(): string {
  return LOADING_SUBTITLES[Math.floor(Math.random() * LOADING_SUBTITLES.length)];
}

export function getLoadingText(): { title: string; subtitle: string } {
  return {
    title: getRandomLoadingTitle(),
    subtitle: getRandomLoadingSubtitle(),
  };
}

// ============================================
// VERDICT TIERS
// ============================================

export type VerdictTier = 1 | 2 | 3 | 4 | 5;

export interface VerdictInfo {
  tier: VerdictTier;
  icon: string;
  title: string;
  message: string;
}

// Tier 1: < $10
const TIER_1_TITLES = [
  "Not Great, Bob",
  "Welp",
  "Yeah... About That",
];

const TIER_1_MESSAGES = [
  "Time to let go. This one's ready to be loved by someone who doesn't care about eBay.",
  "The good news: closure. The bad news: that's about it.",
  "Your 1999 self would be disappointed. Your 2025 self can finally clean that closet.",
];

// Tier 2: $10-50
const TIER_2_TITLES = [
  "Coffee Money",
  "Meh",
  "Could Be Worse",
];

const TIER_2_MESSAGES = [
  "Worth selling if you enjoy negotiating with Facebook Marketplace strangers.",
  "Enough for a fancy latte. Or four regular ones.",
  "It's not nothing! Also not a college fund, but not nothing.",
];

// Tier 3: $50-200
const TIER_3_TITLES = [
  "Oh?",
  "Wait, Really?",
  "Huh.",
];

const TIER_3_MESSAGES = [
  "Well well well. Look who held some value.",
  "Like finding a $20 in your old jeans. Nice.",
  "Your past self accidentally made a decent call.",
];

// Tier 4: $200-1000
const TIER_4_TITLES = [
  "Hold Up",
  "Whoa",
  "Um, Wow",
];

const TIER_4_MESSAGES = [
  "This one's actually worth your attention. Maybe move it out of the garage.",
  "Consider getting this authenticated. Seriously.",
  "Your 1997 investment strategy is... working?",
];

// Tier 5: $1000+
const TIER_5_TITLES = [
  "NO WAY",
  "JACKPOT",
  "WHAT",
];

const TIER_5_MESSAGES = [
  "Against all odds. You actually have a valuable one.",
  "Do not clean it. Do not remove tags. Get authentication NOW.",
  "Like finding out your Pokemon cards weren't ruined after all.",
];

// Icons for each tier (structured for future custom graphics)
const TIER_ICONS: Record<VerdictTier, string> = {
  1: "😬",
  2: "🤷",
  3: "👀",
  4: "🚨",
  5: "🎉",
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getVerdictTier(maxValue: number): VerdictTier {
  if (maxValue >= 1000) return 5;
  if (maxValue >= 200) return 4;
  if (maxValue >= 50) return 3;
  if (maxValue >= 10) return 2;
  return 1;
}

export function getVerdict(maxValue: number): VerdictInfo {
  const tier = getVerdictTier(maxValue);
  const icon = TIER_ICONS[tier];

  let titles: string[];
  let messages: string[];

  switch (tier) {
    case 1:
      titles = TIER_1_TITLES;
      messages = TIER_1_MESSAGES;
      break;
    case 2:
      titles = TIER_2_TITLES;
      messages = TIER_2_MESSAGES;
      break;
    case 3:
      titles = TIER_3_TITLES;
      messages = TIER_3_MESSAGES;
      break;
    case 4:
      titles = TIER_4_TITLES;
      messages = TIER_4_MESSAGES;
      break;
    case 5:
      titles = TIER_5_TITLES;
      messages = TIER_5_MESSAGES;
      break;
  }

  return {
    tier,
    icon,
    title: pickRandom(titles),
    message: pickRandom(messages),
  };
}

// ============================================
// BUTTON TEXT
// ============================================

export function getScanAnotherText(): string {
  return "Scan Another";
}

export function getShareButtonText(): string {
  return "Share Result";
}

// ============================================
// ERROR MESSAGES
// ============================================

const ERROR_PREFIXES = [
  "Oops!",
  "Hmm...",
  "That didn't work.",
];

export function getErrorPrefix(): string {
  return pickRandom(ERROR_PREFIXES);
}

// ============================================
// STATIC TEXT
// ============================================

export const WELCOME_TEXT = {
  title: "Beanie Farewell",
  tagline: "It's time to know the truth.",
  description: "Find out what your Beanie Babies are actually worth in 2025.",
  subdescription: "Spoiler: probably not millions. But you never know...",
};

export const SCAN_TEXT = {
  title: "Show Us Your Beanie",
  subtitle: "Take a photo or choose from your library",
  cameraButton: "Take Photo",
  libraryButton: "Choose Photo",
  tip: "Include the hang tag if visible — it affects value",
};
