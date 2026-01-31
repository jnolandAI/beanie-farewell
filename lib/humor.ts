/**
 * Humor and copy utilities for Bean Bye
 * Expanded humor with variety, fun facts, and absurd comparisons
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ============================================
// LOADING SCREEN - TITLES (Expanded variety)
// ============================================

const LOADING_TITLES = [
  // Absurdly specific processes
  "Consulting ancient texts...",
  "Reading the whole internet real quick...",
  "Asking the Beanie elders...",
  "Cross-referencing with NASA...",
  "Downloading more RAM...",
  "Summoning the spirits of 1997...",
  "Checking the Beanie matrix...",
  "Consulting the oracle...",
  "Hacking the mainframe...",
  "Warming up the flux capacitor...",

  // Dramatic investigation
  "Enhancing... enhancing...",
  "Running forensic analysis...",
  "Dusting for fingerprints...",
  "Interviewing witnesses...",
  "Reviewing the evidence...",
  "Building the case file...",

  // Beanie-themed
  "Counting beans...",
  "Examining pellets...",
  "Reading the tag...",
  "Checking for errors...",
  "Consulting price guides...",
  "Searching auction records...",
  "Analyzing the fluff...",
  "Measuring the stuffing...",

  // Tech parody
  "Initializing bean protocol...",
  "Syncing with the cloud...",
  "Calibrating the algorithm...",
  "Compiling the verdict...",
  "Running AI diagnostics...",

  // Self-aware
  "This is taking a moment...",
  "Still here, still working...",
  "Any second now...",
  "Worth the wait (probably)...",
  "Bear with us...",
  "Almost done (maybe)...",
];

// ============================================
// LOADING SCREEN - BEANIE FACTS
// ============================================

const BEANIE_FACTS = [
  // Production facts
  "Ty Warner never advertised Beanie Babies on TV. The hype was entirely word-of-mouth.",
  "At their peak, Beanie Babies made up 10% of eBay's total sales.",
  "Ty deliberately 'retired' Beanies to create artificial scarcity. Classic.",
  "The first nine Beanie Babies debuted at a Chicago trade show in 1993.",
  "Ty sold over 2 billion dollars worth of Beanie Babies in 1998 alone.",
  "McDonald's gave away 100 million Teenie Beanies in 10 days in 1997.",
  "Beanie Babies were the first internet-driven collectible craze.",
  "Ty employees were forbidden from confirming which Beanies would be retired.",

  // Cultural moments
  "People literally fought in stores during Beanie releases in the late 90s.",
  "A divorcing couple once split their Beanie collection in court, one by one.",
  "Some 90s investment guides seriously suggested Beanies as retirement assets.",
  "Beanie Baby theft was so common that police departments issued warnings.",
  "In 1999, Ty announced Beanies would be discontinued. The internet panicked.",
  "Collectors would call stores at 6am to ask about new shipments.",

  // Value history
  "In 1999, a 1st edition Princess Bear sold for $500,000. It's not worth that now.",
  "The Beanie market crashed almost overnight when Ty overproduced in 1999.",
  "Most Beanies that sold for hundreds in the 90s are worth $3-5 today.",
  "Tag protectors were a $2 billion industry. For plastic sleeves.",
  "Beanie price guides from 1998 make hilarious reading today.",

  // Absurd facts
  "There's a term for Beanie regret: 'Bean Buyer's Remorse.' We made that up. But it should exist.",
  "Some people still have unopened Beanies in storage, waiting for 'the right time.'",
  "Ty Warner once bought the Four Seasons Hotel in New York. With Beanie money.",
  "The rarest error Beanies are worth thousands. The other 99.9% are worth nothing.",
];

// ============================================
// LOADING SCREEN - HUMOROUS SUBTITLES
// ============================================

const LOADING_SUBTITLES = [
  // Self-deprecating millennial humor
  "Remember when these were your retirement plan?",
  "Preparing your financial reality check...",
  "Your childhood investments, under review.",
  "Let's see how that '90s strategy worked out.",
  "Auditing your parents' decision to enable this.",
  "Calculating years of closet real estate wasted.",
  "Reviewing decades of emotional attachment.",

  // Beanie-specific
  "Checking if your tag protector was worth it.",
  "Analyzing those 'investment grade' pellets.",
  "Cross-referencing with disappointed collectors worldwide.",
  "Searching for someone who still cares.",

  // Inflation/economy humor (sprinkled in)
  "Adjusting for 27 years of inflation...",
  "Comparing to the price of eggs these days...",
  "At least Beanies don't have shrinkflation.",
  "Still a better store of value than some currencies.",
  "Calculating what this could buy at 2026 prices...",

  // Pop culture (mainstream only)
  "This is faster than waiting for your eBay auction to end.",
  "Unlike your Beanie investment, this won't take 25 years.",
  "Loading faster than dial-up. You're welcome.",
  "Faster than streaming on hotel WiFi.",
  "Quicker than finding parking at Costco.",

  // Meta/absurd
  "Generating an emotional buffer...",
  "Preparing gentle disappointment...",
  "Calibrating expectations downward...",
  "Finding the silver lining...",
  "Locating closure...",
  "Warming up the copium dispenser...",
  "Preparing the participation trophy...",
];

export function getLoadingText(): { title: string; subtitle: string; fact?: string } {
  // 60% chance to show a Beanie fact instead of a subtitle
  const showFact = Math.random() < 0.6;

  return {
    title: pickRandom(LOADING_TITLES),
    subtitle: showFact ? '' : pickRandom(LOADING_SUBTITLES),
    fact: showFact ? pickRandom(BEANIE_FACTS) : undefined,
  };
}

// ============================================
// FUN FACTS FOR RESULTS SCREEN
// ============================================

// Population comparisons for "X were produced"
const POPULATION_COMPARISONS = [
  { threshold: 100000000, comparisons: [
    "the entire population of Germany",
    "more people than live in Vietnam",
    "roughly the population of the Philippines",
  ]},
  { threshold: 50000000, comparisons: [
    "the population of South Korea",
    "more than the population of Canada",
    "everyone in Spain, with leftovers",
  ]},
  { threshold: 10000000, comparisons: [
    "the population of Sweden",
    "more than live in New York City",
    "everyone in Switzerland, twice",
  ]},
  { threshold: 5000000, comparisons: [
    "the population of Ireland",
    "more people than live in New Zealand",
    "everyone in Los Angeles",
  ]},
  { threshold: 1000000, comparisons: [
    "the population of Austin, Texas",
    "everyone who attended Woodstock, 2.5 times over",
    "a sold-out Super Bowl, 15 times",
  ]},
  { threshold: 500000, comparisons: [
    "the population of Atlanta",
    "a sold-out college football stadium, 5 times",
    "more than live in Miami",
  ]},
  { threshold: 100000, comparisons: [
    "a sold-out NFL stadium",
    "more than the population of Boulder, Colorado",
    "everyone at Coachella, twice",
  ]},
  { threshold: 10000, comparisons: [
    "a small concert venue, every night for a year",
    "more than a minor league baseball season's attendance",
    "a really popular wedding",
  ]},
  { threshold: 1000, comparisons: [
    "a high school auditorium",
    "a really big family reunion",
    "a decent-sized wedding",
  ]},
];

export function getPopulationComparison(count: number): string {
  for (const tier of POPULATION_COMPARISONS) {
    if (count >= tier.threshold) {
      return pickRandom(tier.comparisons);
    }
  }
  return "a really exclusive club";
}

// S&P 500 comparison
export function getSP500Comparison(originalCost: number, currentValue: number, yearsPassed: number = 27): string {
  // Approximate S&P 500 return: ~10% annually, compounded
  // From 1998 to 2025 is about 27 years
  const sp500Multiplier = Math.pow(1.10, yearsPassed);
  const sp500Value = Math.round(originalCost * sp500Multiplier);

  const templates = [
    `If you'd put that $${originalCost} in the S&P 500 instead, you'd have about $${sp500Value} now. Just saying.`,
    `Fun fact: $${originalCost} invested in 1998 would be worth ~$${sp500Value} today. Your Beanie is worth $${currentValue}.`,
    `$${originalCost} → $${sp500Value} (S&P 500) vs $${originalCost} → $${currentValue} (this Beanie). Hindsight, etc.`,
    `That $${originalCost} could've been $${sp500Value} in index funds. Instead, you got vibes and fur.`,
  ];

  return pickRandom(templates);
}

// Value depreciation commentary
export function getDepreciationCommentary(originalValue: number, currentValue: number): string {
  const percentLost = Math.round((1 - currentValue / originalValue) * 100);

  if (percentLost >= 99) {
    return pickRandom([
      "That's a 99%+ decline. Even dot-com stocks didn't do this badly.",
      "You've achieved near-total value destruction. Impressive, in a way.",
      "This has depreciated more than a new car driven off the lot. Way more.",
    ]);
  } else if (percentLost >= 90) {
    return pickRandom([
      "Down 90%+. Your Beanie did worse than most crypto crashes.",
      "Lost 90% of its value. Even Pets.com shareholders feel bad for you.",
      "A 90% loss. At least it still has sentimental value?",
    ]);
  } else if (percentLost >= 50) {
    return pickRandom([
      "Down 50%+. Could be worse. Could be better. Mostly worse.",
      "Lost half its value. That's actually pretty good for a Beanie.",
      "50% depreciation. You've seen worse on your 401k, probably.",
    ]);
  }

  return pickRandom([
    "Actually held some value. Are you sure you didn't photoshop the tag?",
    "Didn't completely tank. That's the spirit!",
    "Beat the average Beanie investment. Congratulations, sort of.",
  ]);
}

// ============================================
// RESULT SCREEN - FUN FACTS GENERATOR
// ============================================

interface FunFact {
  type: 'production' | 'comparison' | 'investment' | 'cultural' | 'absurd' | 'whatelse' | 'nostalgia';
  text: string;
}

// What else could you buy for this price
function getWhatElseComparison(value: number): string {
  if (value < 5) {
    return pickRandom([
      "You could buy a candy bar with this. Maybe two if you find a sale.",
      "Worth approximately one gumball. But the gumball would be gone by now.",
      "This is worth less than the shipping to send it anywhere.",
      "Worth about half a dozen eggs. At 2026 prices, that's something.",
      "This buys you approximately one banana at a fancy grocery store.",
    ]);
  } else if (value < 15) {
    return pickRandom([
      "Worth about a month of ad-free Spotify. Choose your nostalgia wisely.",
      "You could trade this for lunch at a fast food restaurant. The fries would be more satisfying.",
      "Current value: approximately one greeting card with a nice envelope.",
      "Worth roughly what you'd tip a mediocre haircut.",
      "Could buy you a salad. The kind with no protein. At airport prices.",
      "Worth about what a bagel costs at that overpriced place you love.",
    ]);
  } else if (value < 50) {
    return pickRandom([
      "Worth about a tank of gas. In a small car. In a cheap state. In 2019.",
      "You could trade this for a month of streaming. But which one?",
      "Current value: one hardcover book you'll start but never finish.",
      "Worth approximately two tickets to a matinee movie (no popcorn).",
      "About a week of groceries. If you eat like a college student.",
      "Worth one brunch. The kind where you say 'we should do this more often.'",
    ]);
  } else if (value < 200) {
    return pickRandom([
      "Worth a nice dinner for two. Or a mediocre dinner for four.",
      "You could buy a decent pair of running shoes with this. You won't use them either.",
      "Worth about a year of that gym membership you've been meaning to cancel.",
      "Current value: one splurge at a fancy restaurant where you can't pronounce the menu.",
      "About a month of groceries. Real groceries, with fruits and vegetables.",
      "Worth one 'treat yourself' moment that you'll feel guilty about later.",
    ]);
  } else if (value < 1000) {
    return pickRandom([
      "Worth a weekend getaway. Domestic. Budget airline. But still!",
      "You could buy a very nice jacket. Or a mediocre appliance.",
      "Current value: approximately one 'why did I buy this' electronics purchase.",
      "Worth about what you'd lose in Vegas before saying 'just one more.'",
      "Could cover your utilities for a month. Maybe two, if you don't run the AC.",
      "Worth a really nice pair of jeans. The kind that makes you feel things.",
    ]);
  }
  return pickRandom([
    "Worth an actual vacation. With checked bags.",
    "You could put this toward a used car. The Beanie gets better gas mileage.",
    "Current value: enough to make your accountant briefly interested.",
    "This could cover rent. Somewhere. Probably not where you live.",
    "Worth more than most people's monthly student loan payments. Ouch.",
  ]);
}

// Alternative investment comparisons (not just S&P 500)
function getAlternativeInvestmentFact(originalCost: number, currentValue: number): string {
  const templates = [
    `$${originalCost} in Bitcoin in 2013 would be worth millions. But you couldn't cuddle Bitcoin.`,
    `$${originalCost} in Apple stock in 1998 would buy you a nice car now. This buys you closure.`,
    `Gold has gone up 400% since 1998. This Beanie has gone... the other direction.`,
    `Your $${originalCost} kept under a mattress would be worth $${originalCost}. Still better ROI than most Beanies.`,
    `A 1998 Furby sold for $35 then. It's worth $35 now. Furbies: the stable investment.`,
    `Pokemon cards from 1999 are worth thousands. Beanies: less so. Life isn't fair.`,
  ];
  return pickRandom(templates);
}

// 90s nostalgia value comparisons
function get90sNostalgiaFact(avgValue: number): string {
  if (avgValue < 10) {
    return pickRandom([
      "Worth less than a Blockbuster late fee. Remember those?",
      "You could buy this OR one song on iTunes in 2003. Choose wisely.",
      "In 1998 money, this would buy you two slices of mall pizza.",
      "Worth about what your parents spent on Happy Meals to get McDonald's Teenie Beanies.",
      "Current value: approximately one pack of Gushers at 1998 prices.",
    ]);
  } else if (avgValue < 30) {
    return pickRandom([
      "Worth roughly what a CD cost at Sam Goody. RIP Sam Goody.",
      "In 90s money, this would cover a movie ticket AND snacks. Wild.",
      "About what you'd spend at the Scholastic Book Fair. No regrets.",
      "Worth a month of dial-up internet. The memories of that sound: priceless.",
      "Current value: one Limited Too shopping spree. A small one.",
    ]);
  } else if (avgValue < 100) {
    return pickRandom([
      "Worth a Nintendo 64 game at launch. Goldeneye wasn't cheap.",
      "In 1998, this would buy you a Tamagotchi AND backup batteries.",
      "About what your parents spent on that Skip-It that gave you ankle bruises.",
      "Worth roughly what a Discman cost. Remember skipping every time you walked?",
    ]);
  }
  return pickRandom([
    "Actually worth more than the original Tickle Me Elmo retail price.",
    "Worth multiple trips to Toys R Us. Geoffrey would be proud.",
    "In 90s money, this could buy the entire Spice Girls CD collection.",
    "More valuable than your neighbor's entire Pog collection. Probably.",
  ]);
}

export function generateFunFacts(
  beanieName: string,
  estimatedValueLow: number,
  estimatedValueHigh: number,
  productionCount?: number,
  originalRetailPrice: number = 5,
): FunFact[] {
  const facts: FunFact[] = [];
  const avgValue = (estimatedValueLow + estimatedValueHigh) / 2;

  // Randomly select 2-3 fact types to show (for variety)
  const factGenerators = [
    // S&P 500 comparison (classic)
    () => avgValue < 50 ? { type: 'investment' as const, text: getSP500Comparison(originalRetailPrice, avgValue) } : null,

    // What else could you buy
    () => ({ type: 'whatelse' as const, text: getWhatElseComparison(avgValue) }),

    // Alternative investments
    () => avgValue < 100 ? { type: 'investment' as const, text: getAlternativeInvestmentFact(originalRetailPrice, avgValue) } : null,

    // 90s nostalgia comparison
    () => ({ type: 'nostalgia' as const, text: get90sNostalgiaFact(avgValue) }),

    // Production comparison
    () => productionCount ? {
      type: 'production' as const,
      text: `About ${productionCount.toLocaleString()} of these were made—roughly ${getPopulationComparison(productionCount)}.`,
    } : null,

    // Low value absurd facts
    () => estimatedValueHigh < 20 ? {
      type: 'absurd' as const,
      text: pickRandom([
        `At this value, you'd need to sell ${Math.ceil(100 / avgValue)} of these to afford a nice dinner.`,
        `Worth less than a movie ticket. But infinitely more nostalgic.`,
        `Current value: about ${Math.round(avgValue / 5)} fancy coffees.`,
        `If you sold this and invested the proceeds, in 27 years you'd have... slightly more.`,
        `This Beanie has depreciated faster than a rental car on a cross-country road trip.`,
        `Worth roughly what you'd spend on snacks at a gas station.`,
      ]),
    } : null,

    // High value facts
    () => estimatedValueHigh >= 100 ? {
      type: 'investment' as const,
      text: pickRandom([
        `Actually worth something! Your 1997 self is vindicated.`,
        `Not bad! This one beat inflation. Barely.`,
        `Your parents who told you these were a waste of money? Still wrong!`,
        `Worth more than most NFTs from 2021. Let that sink in.`,
      ]),
    } : null,

    // Very high value
    () => estimatedValueHigh >= 1000 ? {
      type: 'absurd' as const,
      text: pickRandom([
        `This is worth more than some people's first car.`,
        `You could buy a LOT of new Beanie Babies with this. But why would you?`,
        `Actual money. Get this authenticated before you sneeze on it.`,
        `Worth more than a semester at community college. Choose education or stuffed animals.`,
      ]),
    } : null,

    // Cultural facts
    () => Math.random() < 0.4 ? {
      type: 'cultural' as const,
      text: pickRandom([
        `In 1999, this probably had a tag protector, a display case, and its own insurance policy.`,
        `Someone definitely listed this on eBay in 1998 for 10x what it's worth today.`,
        `Somewhere, there's a Beanie price guide from 1999 that says this is worth way more.`,
        `Remember when people thought these would fund their retirement?`,
        `The Great Beanie Crash of 1999 is still studied in economics classes. Just kidding. But it should be.`,
        `In the 90s, adults fought children for these in stores. True story.`,
      ]),
    } : null,
  ];

  // Shuffle and pick 2-3 facts
  const shuffledGenerators = factGenerators.sort(() => Math.random() - 0.5);
  for (const generator of shuffledGenerators) {
    if (facts.length >= 3) break;
    const fact = generator();
    if (fact) {
      facts.push(fact);
    }
  }

  return facts;
}

// ============================================
// VERDICT TIERS (Expanded messages)
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
  "Oof",
  "Mmm, No",
  "So...",
];

const TIER_1_MESSAGES = [
  "Time to let go. This one's ready to be loved by someone who doesn't check eBay.",
  "The good news: closure. The bad news: that's about it.",
  "Your 1999 self would be disappointed. Your 2026 self can finally clean that closet.",
  "Worth less than the plastic tub you've been storing it in.",
  "The sentimental value is priceless. The actual value is priced.",
  "At least you didn't put it in a safety deposit box. You didn't... right?",
  "This one's worth about as much as the memory of buying it. Which is free.",
  "Perfect for donating, gifting, or finally admitting defeat.",
  "Couldn't even buy a gallon of gas with this. Thanks, inflation.",
  "Worth less than what a Happy Meal costs now. Let that sink in.",
  "The Beanie market crashed harder than... well, everything else lately.",
  "At least it didn't charge you a subscription fee to exist.",
];

// Tier 2: $10-50
const TIER_2_TITLES = [
  "Lunch Money",
  "Meh",
  "Could Be Worse",
  "Not Nothing",
  "Shrug",
  "Fine, I Guess",
  "Modest Returns",
  "Par for the Course",
];

const TIER_2_MESSAGES = [
  "Worth selling if you enjoy negotiating with Facebook Marketplace strangers.",
  "Enough for a nice lunch. Or a week of sad desk lunches. Your portfolio, your choice.",
  "It's not nothing! Also not a college fund, but not nothing.",
  "You could sell this, or you could keep the nostalgia. Both valid.",
  "Worth about what you paid for it. Inflation says you lost, though.",
  "The S&P 500 did better. But did the S&P 500 have a cute face? Exactly.",
  "Not worthless! That's the kind of optimism we need.",
  "Worth roughly one streaming subscription. Choose your nostalgia wisely.",
  "Could buy you a nice houseplant. That might also die. Circle of life.",
  "About two gallons of gas. Remember when that was cheap?",
  "Worth a month of that app subscription you forgot to cancel.",
];

// Tier 3: $50-200
const TIER_3_TITLES = [
  "Oh?",
  "Wait, Really?",
  "Huh.",
  "Well Then",
  "Okay!",
  "Interesting...",
];

const TIER_3_MESSAGES = [
  "Well well well. Look who held some value.",
  "Like finding a $20 in your old jeans, but better.",
  "Your past self accidentally made a decent call.",
  "This is actually worth your time to sell properly.",
  "Not bad! Your childhood investment strategy had a winner.",
  "Worth more than a tank of gas. That's the 2026 bar.",
];

// Tier 4: $200-1000
const TIER_4_TITLES = [
  "Hold Up",
  "Whoa",
  "Um, Wow",
  "Wait What",
  "Seriously?!",
  "Oh My",
];

const TIER_4_MESSAGES = [
  "This one's actually worth your attention. Maybe move it out of the garage.",
  "Consider getting this authenticated. We're not kidding.",
  "Your 1997 investment strategy is... working?",
  "Worth more than most people's first paycheck. Handle with care.",
  "This isn't a drill. This is actual money.",
  "Your parents who said Beanies were a waste? Show them this.",
];

// Tier 5: $1000+
const TIER_5_TITLES = [
  "NO WAY",
  "JACKPOT",
  "WHAT",
  "HOLD EVERYTHING",
  "!!!",
  "ARE YOU KIDDING",
];

const TIER_5_MESSAGES = [
  "Against all odds. You actually have a valuable one.",
  "Do not clean it. Do not remove tags. Get authentication NOW.",
  "This is worth more than most people expected from their entire collection.",
  "You won the Beanie lottery. Buy a lottery ticket today.",
  "This is the one everyone was hoping they had. And you actually have it.",
  "Stop touching it. Get a professional. This is not a drill.",
];

// Icons for each tier
const TIER_ICONS: Record<VerdictTier, string> = {
  1: "😬",
  2: "🤷",
  3: "👀",
  4: "🚨",
  5: "🎉",
};

export function getVerdictTier(maxValue: number): VerdictTier {
  if (maxValue >= 1000) return 5;
  if (maxValue >= 200) return 4;
  if (maxValue >= 50) return 3;
  if (maxValue >= 15) return 2;  // Raised from 10 so more common Beanies hit Tier 1
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
// CERTIFICATE DISCLAIMERS (Humorous)
// ============================================

export const CERTIFICATE_DISCLAIMERS = [
  "* Not a real appraisal. Not financial advice. Not responsible for crushed dreams.",
  "* This certificate has the same legal authority as a pinky promise.",
  "* Estimated values based on completed eBay sales. Results may vary. Dreams may shatter.",
  "* Not redeemable for cash, credit, or emotional closure.",
  "* Value estimates are for entertainment only. Like the Beanies themselves.",
  "* This document is worth approximately as much as most Beanie Babies.",
  "* Past performance is not indicative of future results. But it's not looking great.",
  "* Generated by AI. Verified by vibes. Approved by absolutely no one.",
  "* May cause mild disappointment. Side effects include closure and acceptance.",
  "* Valid in all 50 states. Also completely meaningless in all 50 states.",
];

export function getCertificateDisclaimer(): string {
  return pickRandom(CERTIFICATE_DISCLAIMERS);
}

// Certificate taglines (replaces "OFFICIAL")
export const CERTIFICATE_TAGLINES = [
  "TOTALLY LEGITIMATE VALUATION",
  "VERY SERIOUS ASSESSMENT",
  "DEFINITELY REAL APPRAISAL",
  "EXTREMELY SCIENTIFIC ESTIMATE",
  "100% AUTHENTIC-LOOKING CERTIFICATE",
  "PROFESSIONAL-ISH EVALUATION",
  "CERTIFIED BEAN COUNTING",
  "AI-POWERED TRUTH BOMB",
  "OFFICIAL REALITY CHECK",
  "PEER-REVIEWED* (*BY BOTS)",
  "JUDGMENT DAY RESULTS",
  "YOUR FINANCIAL RECKONING",
];

export function getCertificateTagline(): string {
  return pickRandom(CERTIFICATE_TAGLINES);
}

// ============================================
// TIER-SPECIFIC PERMISSION TO LET GO
// ============================================

const TIER_1_PERMISSIONS = [
  "You hereby have permission to drop this off at Goodwill along with that sweater your mother-in-law gave you.",
  "This certificate grants you the right to finally clear that shelf space.",
  "You may now use this as a dog toy with a clear conscience.",
  "Permission granted to include this in a garage sale priced at 'make an offer.'",
  "You are officially authorized to regift this to a child who won't check eBay.",
  "This Beanie is cleared for donation to any thrift store within a 50-mile radius.",
  "You have earned the right to stop wondering 'what if' about this one.",
];

const TIER_2_PERMISSIONS = [
  "You may trade this in for a very mediocre brunch.",
  "Permission granted to sell this and treat yourself to a mediocre lunch.",
  "This certificate authorizes one (1) modest dinner in exchange for this Beanie.",
  "You are cleared to convert this into approximately 2-3 gallons of gas. Maybe.",
  "Official permission to list this on Facebook Marketplace and lowball yourself.",
  "You may now exchange this for a month of streaming you'll forget to cancel.",
  "This Beanie is worth exactly one impulse purchase at Target.",
  "Permission granted to convert this into groceries. Not many groceries.",
  "You may trade this for approximately one bouquet of flowers. A small one.",
  "This certificate authorizes you to feel neutral about this transaction.",
];

const TIER_3_PERMISSIONS = [
  "You have permission to feel slightly smug about this one.",
  "This certificate grants you the right to say 'I told you so' to one (1) doubter.",
  "You may now convert this into a nice dinner for one. Or fast food for two.",
  "Permission granted to list this at full price without shame.",
  "You are authorized to spend actual time writing a good eBay description.",
  "This Beanie has earned a spot in your 'actually worth something' pile.",
];

const TIER_4_PERMISSIONS = [
  "You do NOT have permission to let this go. Put it back.",
  "This certificate requires you to at least Google 'Beanie Baby authentication.'",
  "Permission to sell is DENIED until you've checked three more price guides.",
  "You are authorized to carefully move this away from children and pets.",
  "This Beanie has earned a protective case and your respect.",
  "You have permission to brag about this at your next family gathering.",
];

const TIER_5_PERMISSIONS = [
  "DO NOT LET THIS GO. This is not a permission slip. This is a warning.",
  "You are required by law (not really) to get this professionally authenticated.",
  "Permission to sell is contingent on consulting at least two experts.",
  "This certificate demands you stop touching this with your bare hands.",
  "You have permission to finally prove your parents wrong about everything.",
  "This Beanie requires its own insurance policy. We're not joking.",
];

export function getPermissionText(tier: number): string {
  const tierClamped = Math.max(1, Math.min(5, tier));
  switch (tierClamped) {
    case 1: return pickRandom(TIER_1_PERMISSIONS);
    case 2: return pickRandom(TIER_2_PERMISSIONS);
    case 3: return pickRandom(TIER_3_PERMISSIONS);
    case 4: return pickRandom(TIER_4_PERMISSIONS);
    case 5: return pickRandom(TIER_5_PERMISSIONS);
    default: return pickRandom(TIER_1_PERMISSIONS);
  }
}

// ============================================
// BUTTON TEXT
// ============================================

export function getScanAnotherText(): string {
  const options = [
    "Scan Another",
    "Try Another",
    "Next Beanie",
    "Keep Going",
  ];
  return pickRandom(options);
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
  "Well...",
  "Uh oh.",
];

export function getErrorPrefix(): string {
  return pickRandom(ERROR_PREFIXES);
}

// ============================================
// STATIC TEXT
// ============================================

export const WELCOME_TEXT = {
  title: "Bean Bye",
  tagline: "It's time to know the truth.",
  description: "Find out what your Beanie Babies are actually worth in 2026.",
  subdescription: "Spoiler: probably not millions. But you never know...",
};

export const SCAN_TEXT = {
  title: "Show Us Your Beanie",
  subtitle: "Take a photo or choose from your library",
  cameraButton: "Take Photo",
  libraryButton: "Choose Photo",
  tip: "Include the hang tag if visible — it affects value",
};

// ============================================
// COLLECTION TAGLINES
// ============================================

export const COLLECTION_CERTIFICATE_TAGLINES = [
  "Your childhood, appraised.",
  "Proof that hope springs eternal.",
  "A comprehensive audit of your 90s decisions.",
  "The sum total of your Beanie investments.",
  "Everything you saved. Everything it's worth.",
];

export function getCollectionTagline(): string {
  return pickRandom(COLLECTION_CERTIFICATE_TAGLINES);
}

// ============================================
// COLLECTION PERMISSION TEXT (Tier-based on total value)
// ============================================

const COLLECTION_PERMISSIONS_LOW = [
  "You hereby have permission to donate this entire collection to a thrift store. They'll be thrilled. Probably.",
  "This certificate authorizes you to finally reclaim that closet space you've been sacrificing since 1997.",
  "You may now tell your family you've 'liquidated your assets.' Technically true.",
  "Permission granted to host a garage sale. Price everything at 'make an offer' and prepare for disappointment.",
  "This collection is officially cleared for regifting to nieces, nephews, or anyone who wasn't alive in the 90s.",
];

const COLLECTION_PERMISSIONS_MID = [
  "You have permission to feel okay about the choices that led here.",
  "This certificate grants you the right to one (1) 'I told you so' at your next family dinner.",
  "You may now list this collection online with actual photos instead of shame.",
  "Permission granted to spend a Saturday photographing each one for eBay. It might be worth your time.",
  "This collection has officially earned a spot above 'complete waste of space.'",
];

const COLLECTION_PERMISSIONS_HIGH = [
  "You do NOT have permission to let this collection go until you've consulted a professional.",
  "This certificate requires you to immediately purchase a fireproof safe.",
  "Permission to sell is DENIED until you've had at least three independent appraisals.",
  "You are now authorized to casually mention this at parties. People will be impressed. Confused, but impressed.",
  "This collection demands climate-controlled storage and possibly its own insurance policy.",
];

export function getCollectionPermissionText(totalValueHigh: number): string {
  if (totalValueHigh >= 500) {
    return pickRandom(COLLECTION_PERMISSIONS_HIGH);
  } else if (totalValueHigh >= 100) {
    return pickRandom(COLLECTION_PERMISSIONS_MID);
  }
  return pickRandom(COLLECTION_PERMISSIONS_LOW);
}

// ============================================
// FLEX OR FLOP - Viral Shareability Labels
// ============================================

export type FlexFlopStatus = 'mega_flex' | 'flex' | 'mid' | 'flop' | 'mega_flop';

export interface FlexFlopLabel {
  status: FlexFlopStatus;
  label: string;
  emoji: string;
  color: string;
  tagline: string;
}

const FLEX_FLOP_LABELS: Record<FlexFlopStatus, Omit<FlexFlopLabel, 'status'>[]> = {
  mega_flex: [
    { label: 'MEGA FLEX', emoji: '👑', color: '#FFD700', tagline: 'You actually won the Beanie lottery' },
    { label: 'LEGENDARY', emoji: '🏆', color: '#FFD700', tagline: 'Screenshot this. Frame it.' },
    { label: 'UNREAL', emoji: '🤯', color: '#FFD700', tagline: 'Is this real life?' },
  ],
  flex: [
    { label: 'FLEX', emoji: '💪', color: '#FF00FF', tagline: 'Not bad at all' },
    { label: 'W', emoji: '🔥', color: '#FF00FF', tagline: 'Taking this W' },
    { label: 'NICE', emoji: '✨', color: '#FF00FF', tagline: 'Actually worth something' },
  ],
  mid: [
    { label: 'MID', emoji: '😐', color: '#00CED1', tagline: 'Could be worse, could be better' },
    { label: 'MEH', emoji: '🤷', color: '#00CED1', tagline: 'It is what it is' },
    { label: 'OKAY', emoji: '👌', color: '#00CED1', tagline: 'Not great, not terrible' },
  ],
  flop: [
    { label: 'FLOP', emoji: '📉', color: '#666666', tagline: 'The dream is dead' },
    { label: 'L', emoji: '😬', color: '#666666', tagline: 'Taking this L' },
    { label: 'RIP', emoji: '💀', color: '#666666', tagline: 'RIP your investment' },
  ],
  mega_flop: [
    { label: 'MEGA FLOP', emoji: '☠️', color: '#333333', tagline: 'Peak financial regret' },
    { label: 'DISASTER', emoji: '🗑️', color: '#333333', tagline: 'Certified worthless' },
    { label: 'TRAGIC', emoji: '😭', color: '#333333', tagline: 'A cautionary tale' },
  ],
};

export function getFlexFlopStatus(valueHigh: number): FlexFlopStatus {
  if (valueHigh >= 1000) return 'mega_flex';
  if (valueHigh >= 100) return 'flex';
  if (valueHigh >= 25) return 'mid';
  if (valueHigh >= 10) return 'flop';
  return 'mega_flop';
}

export function getFlexFlopLabel(valueHigh: number): FlexFlopLabel {
  const status = getFlexFlopStatus(valueHigh);
  const options = FLEX_FLOP_LABELS[status];
  const selected = pickRandom(options);
  return { status, ...selected };
}

// ============================================
// PORTFOLIO MELTDOWN SUMMARY
// ============================================

export interface PortfolioStats {
  totalItems: number;
  totalValueLow: number;
  totalValueHigh: number;
  avgValueLow: number;
  avgValueHigh: number;
  estimatedOriginalCost: number;  // $5 per Beanie
  tier1Count: number;  // < $10
  tier2Count: number;  // $10-50
  tier3Count: number;  // $50-200
  tier4Count: number;  // $200-1000
  tier5Count: number;  // $1000+
}

// Portfolio verdict based on total value
export function getPortfolioVerdict(stats: PortfolioStats): { title: string; subtitle: string; emoji: string } {
  const { totalValueHigh, totalItems, tier5Count, tier4Count } = stats;
  const avgValue = totalValueHigh / totalItems;

  if (tier5Count > 0) {
    return {
      emoji: '🏆',
      title: 'Jackpot Collection',
      subtitle: `You have ${tier5Count} unicorn${tier5Count > 1 ? 's' : ''}! Guard them with your life.`,
    };
  }
  if (tier4Count > 0) {
    return {
      emoji: '🔥',
      title: 'Actually Worth Something',
      subtitle: `${tier4Count} valuable find${tier4Count > 1 ? 's' : ''}! Your 1997 self would be proud.`,
    };
  }
  if (totalValueHigh >= 500) {
    return {
      emoji: '💰',
      title: 'Not Bad, Honestly',
      subtitle: 'Worth more than a fancy dinner. Or several cheap ones.',
    };
  }
  if (totalValueHigh >= 200) {
    return {
      emoji: '🤷',
      title: 'Could Be Worse',
      subtitle: 'Worth about a nice pair of shoes. That you\'d actually use.',
    };
  }
  if (totalValueHigh >= 50) {
    return {
      emoji: '😬',
      title: 'The Reality Check',
      subtitle: 'Worth roughly one tank of gas. Memories are priceless though!',
    };
  }
  if (avgValue < 5) {
    return {
      emoji: '💀',
      title: 'Portfolio Meltdown',
      subtitle: 'Your collection is worth less than shipping it anywhere.',
    };
  }
  return {
    emoji: '📉',
    title: 'The Great Depreciation',
    subtitle: 'At least they don\'t take up much space. Right?',
  };
}

// Savage roast of the entire collection
const PORTFOLIO_ROASTS_LOW = [
  "Your entire collection is worth less than a single share of most stocks. But hey, stocks can't stare at you with dead eyes.",
  "If you sold everything here, you could almost afford a nice dinner. Almost.",
  "This collection has depreciated faster than a car driven off a cliff. Into another car. That was also depreciating.",
  "The good news: this collection is portable. The bad news: so is its value.",
  "You've spent more on coffee this month than this entire collection is worth.",
  "This portfolio has all the investment potential of a savings account. In a country with hyperinflation.",
  "Your retirement fund called. It's laughing. Not in a good way.",
];

const PORTFOLIO_ROASTS_MID = [
  "Not nothing! Your collection could fund a weekend getaway. A modest one. Maybe camping.",
  "This portfolio says 'I believed in Beanie Babies, but not THAT much.'",
  "Worth enough to sell, but probably not worth the effort of photographing each one for eBay.",
  "Your collection is worth more than most, which is like being the tallest person in a room of hobbits.",
  "Solid middle-class Beanie portfolio. The Honda Civic of collections.",
  "This collection screams 'I had restraint in 1997.' Rare. Valuable. Unlike most of these Beanies.",
];

const PORTFOLIO_ROASTS_HIGH = [
  "Either you have great taste, incredible luck, or you've been hoarding strategically. Respect.",
  "This collection is worth actual money. Did you time travel from 1997 with insider information?",
  "You beat the Beanie market. That's like winning at checkers against a pigeon, but still—a win is a win.",
  "Your collection might actually be a better investment than some crypto portfolios. Low bar, but cleared.",
  "Somewhere, a Ty executive is impressed. And a little confused.",
];

export function getPortfolioRoast(stats: PortfolioStats): string {
  const { totalValueHigh, totalItems } = stats;
  const avgValue = totalValueHigh / totalItems;

  if (totalValueHigh >= 500 || avgValue >= 50) {
    return pickRandom(PORTFOLIO_ROASTS_HIGH);
  }
  if (totalValueHigh >= 100 || avgValue >= 15) {
    return pickRandom(PORTFOLIO_ROASTS_MID);
  }
  return pickRandom(PORTFOLIO_ROASTS_LOW);
}

// What you could have bought instead (total collection value)
export function getWhatYouCouldHaveBought(totalValue: number): string[] {
  const comparisons: string[] = [];

  if (totalValue < 10) {
    comparisons.push(
      '🍕 Half a pizza',
      '☕ Two coffees (small)',
      '🎫 A movie rental',
    );
  } else if (totalValue < 30) {
    comparisons.push(
      '🍕 A large pizza with toppings',
      '📚 A paperback book',
      '🎬 A movie ticket',
    );
  } else if (totalValue < 75) {
    comparisons.push(
      '🎮 A video game (on sale)',
      '👕 A decent t-shirt',
      '🍽️ A nice lunch for two',
    );
  } else if (totalValue < 150) {
    comparisons.push(
      '👟 Budget running shoes',
      '🎧 Wireless earbuds',
      '🍽️ A fancy dinner for one',
    );
  } else if (totalValue < 300) {
    comparisons.push(
      '✈️ A domestic flight (budget)',
      '📱 A phone case (premium)',
      '🍽️ A nice dinner for two',
    );
  } else if (totalValue < 500) {
    comparisons.push(
      '🏨 A weekend hotel stay',
      '👔 A nice jacket',
      '🎉 Concert tickets (decent seats)',
    );
  } else if (totalValue < 1000) {
    comparisons.push(
      '✈️ A round-trip flight',
      '📱 An older model smartphone',
      '🛋️ A piece of furniture',
    );
  } else {
    comparisons.push(
      '✈️ An international flight',
      '💻 A laptop (mid-range)',
      '🏖️ A proper vacation',
    );
  }

  return comparisons;
}

// S&P 500 comparison for entire portfolio
export function getPortfolioSP500Comparison(originalCost: number): { sp500Value: number; difference: string } {
  // Approximate S&P 500 return: ~10% annually from 1998
  const sp500Multiplier = Math.pow(1.10, 27);  // 27 years
  const sp500Value = Math.round(originalCost * sp500Multiplier);

  const messages = [
    `If invested in 1998, that $${originalCost} would be ~$${sp500Value.toLocaleString()} today`,
    `S&P 500 would have turned $${originalCost} into $${sp500Value.toLocaleString()}`,
    `Index funds: $${sp500Value.toLocaleString()}. Beanies: ...this.`,
  ];

  return {
    sp500Value,
    difference: pickRandom(messages),
  };
}

// Tier breakdown commentary
export function getTierBreakdownComment(stats: PortfolioStats): string {
  const { tier1Count, tier2Count, tier3Count, tier4Count, tier5Count, totalItems } = stats;

  const tier1Percent = Math.round((tier1Count / totalItems) * 100);
  const lowTierPercent = Math.round(((tier1Count + tier2Count) / totalItems) * 100);

  if (tier5Count > 0) {
    return `${tier5Count} jackpot${tier5Count > 1 ? 's' : ''} carrying this whole portfolio! 🌟`;
  }
  if (tier4Count > 0) {
    return `${tier4Count} solid performer${tier4Count > 1 ? 's' : ''} saving your collection's dignity.`;
  }
  if (tier3Count > 0) {
    return `${tier3Count} decent find${tier3Count > 1 ? 's' : ''}, ${lowTierPercent}% participation trophies.`;
  }
  if (tier1Percent >= 80) {
    return `${tier1Percent}% of your collection is worth less than a Happy Meal. Classic.`;
  }
  if (tier1Percent >= 50) {
    return `Half your collection is in the "why did I keep this" tier.`;
  }
  return `A mixed bag. Some wins, some... learning experiences.`;
}

// ============================================
// COLLECTION INSIGHTS - Fun personalized stats
// ============================================

export interface CollectionInsight {
  emoji: string;
  title: string;
  description: string;
  type: 'stat' | 'fun' | 'comparison' | 'milestone';
}

interface CollectionData {
  totalItems: number;
  totalValueHigh: number;
  animalTypes: string[];
  colors: string[];
  tiers: number[];
  bestFindName: string;
  bestFindValue: number;
  worstFindName: string;
  worstFindValue: number;
  avgValue: number;
  oldestScanDate: Date | null;
  newestScanDate: Date | null;
}

// Generate personalized insights based on collection
export function generateCollectionInsights(data: CollectionData): CollectionInsight[] {
  const insights: CollectionInsight[] = [];

  // Collection size insights
  if (data.totalItems >= 100) {
    insights.push({
      emoji: '🏛️',
      title: 'Museum Curator',
      description: `${data.totalItems} Beanies. At this point, you're not a collector—you're an archivist.`,
      type: 'milestone',
    });
  } else if (data.totalItems >= 50) {
    insights.push({
      emoji: '📦',
      title: 'Serious Hoarder',
      description: `${data.totalItems} Beanies. That's... a lot of beans.`,
      type: 'milestone',
    });
  } else if (data.totalItems >= 25) {
    insights.push({
      emoji: '🗃️',
      title: 'Dedicated Collector',
      description: `${data.totalItems} Beanies scanned. Your 1997 self would be proud.`,
      type: 'milestone',
    });
  } else if (data.totalItems >= 10) {
    insights.push({
      emoji: '📊',
      title: 'Double Digits',
      description: `${data.totalItems} Beanies and counting!`,
      type: 'milestone',
    });
  }

  // Animal variety insight
  const uniqueAnimals = new Set(data.animalTypes.map(a => a.toLowerCase())).size;
  if (uniqueAnimals >= 10) {
    insights.push({
      emoji: '🦁',
      title: 'Noah\'s Ark',
      description: `${uniqueAnimals} different animals. You've got a whole zoo here.`,
      type: 'stat',
    });
  } else if (uniqueAnimals >= 5) {
    insights.push({
      emoji: '🐾',
      title: 'Animal Diversity',
      description: `${uniqueAnimals} different species. Nice variety!`,
      type: 'stat',
    });
  }

  // Bear obsession check
  const bearCount = data.animalTypes.filter(a => a.toLowerCase().includes('bear')).length;
  if (bearCount >= 5) {
    insights.push({
      emoji: '🐻',
      title: 'Bear Enthusiast',
      description: `${bearCount} bears! You clearly have a type.`,
      type: 'fun',
    });
  }

  // Color insights
  const colorCounts: Record<string, number> = {};
  data.colors.forEach(c => {
    const color = c.toLowerCase();
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });
  const topColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0];
  if (topColor && topColor[1] >= 3) {
    const colorEmojis: Record<string, string> = {
      'red': '❤️', 'blue': '💙', 'purple': '💜', 'pink': '💖',
      'green': '💚', 'yellow': '💛', 'orange': '🧡', 'brown': '🤎',
      'white': '🤍', 'black': '🖤', 'gray': '🩶', 'grey': '🩶',
    };
    insights.push({
      emoji: colorEmojis[topColor[0]] || '🎨',
      title: `${topColor[0].charAt(0).toUpperCase() + topColor[0].slice(1)} Fan`,
      description: `${topColor[1]} ${topColor[0]} Beanies. You've got a favorite color.`,
      type: 'fun',
    });
  }

  // Value insights
  if (data.bestFindValue >= 1000) {
    insights.push({
      emoji: '💎',
      title: 'Unicorn Owner',
      description: `${data.bestFindName} at $${data.bestFindValue}! That's your crown jewel.`,
      type: 'stat',
    });
  } else if (data.bestFindValue >= 200) {
    insights.push({
      emoji: '⭐',
      title: 'Hidden Gem Found',
      description: `${data.bestFindName} at $${data.bestFindValue}. Nice find!`,
      type: 'stat',
    });
  }

  // Worst find (if notably bad)
  if (data.worstFindValue <= 5 && data.totalItems >= 5) {
    insights.push({
      emoji: '😅',
      title: 'Participation Trophy',
      description: `${data.worstFindName} at $${data.worstFindValue}. Bless its heart.`,
      type: 'fun',
    });
  }

  // Average value insight
  if (data.avgValue >= 100) {
    insights.push({
      emoji: '📈',
      title: 'Above Average',
      description: `Your average Beanie is worth $${Math.round(data.avgValue)}. Better than most!`,
      type: 'comparison',
    });
  } else if (data.avgValue <= 10) {
    insights.push({
      emoji: '📉',
      title: 'Quantity Over Quality',
      description: `Average value: $${Math.round(data.avgValue)}. At least they're cute?`,
      type: 'comparison',
    });
  }

  // Time-based insights
  if (data.oldestScanDate && data.newestScanDate) {
    const daysDiff = Math.floor((data.newestScanDate.getTime() - data.oldestScanDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= 30) {
      insights.push({
        emoji: '📅',
        title: 'Long-Term Scanner',
        description: `${daysDiff} days of scanning. You're committed.`,
        type: 'stat',
      });
    }
  }

  // Tier distribution insight
  const tier5Count = data.tiers.filter(t => t === 5).length;
  const tier1Count = data.tiers.filter(t => t === 1).length;
  const tier1Percent = Math.round((tier1Count / data.totalItems) * 100);

  if (tier5Count >= 2) {
    insights.push({
      emoji: '🎰',
      title: 'Jackpot Collection',
      description: `${tier5Count} jackpots! You're basically a Beanie tycoon.`,
      type: 'stat',
    });
  }

  if (tier1Percent >= 80 && data.totalItems >= 5) {
    insights.push({
      emoji: '🗑️',
      title: 'Realistic Expectations',
      description: `${tier1Percent}% are worth under $10. Classic millennial experience.`,
      type: 'fun',
    });
  }

  // Random fun facts
  const funFacts: CollectionInsight[] = [
    {
      emoji: '⏰',
      title: 'Time Investment',
      description: `At $5 each in 1998, you invested ~$${data.totalItems * 5}. Worth it? Debatable.`,
      type: 'comparison',
    },
    {
      emoji: '📏',
      title: 'Stack Height',
      description: `Stacked, your ${data.totalItems} Beanies would be ~${(data.totalItems * 4).toFixed(0)} inches tall.`,
      type: 'fun',
    },
    {
      emoji: '⚖️',
      title: 'Total Weight',
      description: `Your collection weighs roughly ${(data.totalItems * 0.3).toFixed(1)} lbs of hopes and dreams.`,
      type: 'fun',
    },
  ];

  // Add one random fun fact
  insights.push(pickRandom(funFacts));

  // Shuffle and return top 4-5
  return pickRandomN(insights, Math.min(5, insights.length));
}

// ============================================
// BEANIE OF THE DAY - Daily spotlight feature
// ============================================

export interface BeanieOfTheDay {
  index: number;  // Index in collection to highlight
  greeting: string;
  funFact: string;
}

const BEANIE_OF_DAY_GREETINGS = [
  "Today's Spotlight",
  "Daily Feature",
  "Star of the Day",
  "Beanie Highlight",
  "Today's Pick",
  "Featured Friend",
];

const BEANIE_OF_DAY_FACTS = [
  (name: string, value: number) => `${name} has been waiting patiently in your collection. Give it some love!`,
  (name: string, value: number) => `Fun fact: ${name} is worth ${value >= 50 ? 'more than' : 'about as much as'} a lunch out.`,
  (name: string, value: number) => `${name} says hi! It's been thinking about you.`,
  (name: string, value: number) => `Did you forget about ${name}? It hasn't forgotten about you.`,
  (name: string, value: number) => `${name} is feeling photogenic today. Worth $${value}!`,
  (name: string, value: number) => `Your ${name} appreciates the shelf space. $${value} worth of gratitude.`,
  (name: string, value: number) => value >= 100 ? `${name} is one of your MVPs at $${value}!` : `${name} is here for vibes, not value.`,
  (name: string, value: number) => `${name}: still here, still worth $${value}, still watching.`,
];

export function getBeanieOfTheDay(collectionLength: number, beanieName: string, beanieValue: number, date: Date = new Date()): BeanieOfTheDay {
  // Use date to generate consistent daily selection
  const dateString = date.toISOString().split('T')[0];
  const seed = dateString.split('-').reduce((acc, n) => acc + parseInt(n), 0);

  // Select index based on date
  const index = seed % collectionLength;

  // Get greeting and fact
  const greeting = BEANIE_OF_DAY_GREETINGS[seed % BEANIE_OF_DAY_GREETINGS.length];
  const factTemplate = BEANIE_OF_DAY_FACTS[seed % BEANIE_OF_DAY_FACTS.length];
  const funFact = factTemplate(beanieName, beanieValue);

  return { index, greeting, funFact };
}

// ============================================
// SHARING CAPTIONS - For social sharing
// ============================================

export function getShareCaption(beanieName: string, value: number, flexFlop: FlexFlopStatus): string {
  const captions: Record<FlexFlopStatus, string[]> = {
    mega_flex: [
      `My ${beanieName} is worth $${value}?! 💀 I'M RICH`,
      `$${value} BEANIE BABY FLEX 🏆 #BeanieMillionaire`,
      `Mom was right. ${beanieName}: $${value} 👑`,
      `27 years of patience finally paid off! ${beanieName}: $${value}`,
      `Plot twist: ${beanieName} = $${value} 🎰`,
    ],
    flex: [
      `${beanieName}: $${value} 💪 Not bad for a 90s toy!`,
      `Turns out ${beanieName} was the real investment`,
      `My ${beanieName} just paid for dinner`,
      `${beanieName} outperformed my expectations ($${value})`,
      `Against all odds: ${beanieName} = $${value} ✨`,
    ],
    mid: [
      `${beanieName}: $${value} 🤷 Could be worse!`,
      `Solid meh from my ${beanieName} collection`,
      `${beanieName} said: "I'm worth something" ($${value})`,
      `${beanieName}: peak mediocrity at $${value}`,
      `Neither flex nor flop: ${beanieName} = $${value}`,
    ],
    flop: [
      `${beanieName}: $${value} 📉 The dream is dead`,
      `RIP to my ${beanieName} investment strategy`,
      `${beanieName} really said $${value} and nothing else`,
      `Thanks for nothing, ${beanieName} ($${value})`,
      `${beanieName}: a $${value} lesson in humility`,
    ],
    mega_flop: [
      `${beanieName}: $${value} ☠️ EMOTIONAL DAMAGE`,
      `My retirement plan (${beanieName}) is worth $${value}`,
      `$${value}. That's it. That's the tweet. 💀`,
      `${beanieName} chose violence ($${value})`,
      `POV: You discover ${beanieName} is worth $${value}`,
      `Generational wealth this is not. ${beanieName}: $${value}`,
    ],
  };

  return pickRandom(captions[flexFlop]);
}
