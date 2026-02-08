import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated, Easing, Platform, Dimensions, Image, Modal, Share } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { getVerdict, getScanAnotherText, getShareButtonText, VerdictInfo, generateFunFacts, getFlexFlopLabel, FlexFlopLabel, getShareCaption, getFlexFlopStatus } from '../lib/humor';
import { Confetti } from '../components/Confetti';
import { FollowUpAnswers, CollectionItem, ConditionLevel, PelletType, ValueBreakdown, DetectedAssumptions } from '../types/beanie';
import { FarewellCertificate } from '../components/FarewellCertificate';
import { AchievementToast } from '../components/AchievementToast';
import { ChallengeToast } from '../components/ChallengeToast';
import { LevelUpToast } from '../components/LevelUpToast';
import { MilestoneToast, CollectionMilestone } from '../components/MilestoneToast';
import { RareFindCelebration } from '../components/RareFindCelebration';
import { LuckyScanToast } from '../components/LuckyScanToast';
import { ValueMilestoneToast, ValueMilestone } from '../components/ValueMilestoneToast';
import { useCollectionStore, generateId } from '../lib/store';
import { Achievement } from '../lib/achievements';
import { DailyChallenge } from '../lib/challenges';
import { safeParseURLParam, showShareFailedAlert } from '../lib/errors';
import { ANIMAL_EMOJIS } from '../lib/search';

// Error boundary to catch crashes and show the error instead of crashing
class ResultErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: `${error.message}\n\n${error.stack || ''}` };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ResultScreen crash:', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      // Extract just the error message (first line) for easy reading
      const errorMsg = this.state.error.split('\n')[0] || 'Unknown error';
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FAFAFA' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#FF0000' }}>Something went wrong</Text>
          <View style={{ backgroundColor: '#FFF3F3', padding: 16, borderRadius: 12, marginBottom: 12, width: '100%' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#CC0000' }}>{errorMsg}</Text>
          </View>
          <ScrollView style={{ maxHeight: 300, width: '100%' }}>
            <Text style={{ fontSize: 11, color: '#666', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>{this.state.error}</Text>
          </ScrollView>
          <Pressable onPress={() => router.replace('/')} style={{ marginTop: 16, padding: 16, backgroundColor: '#FF00FF', borderRadius: 12 }}>
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Go Home</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Memphis Design System Colors - Bold 90s palette
const MEMPHIS_COLORS = {
  magenta: '#FF00FF',
  purple: '#8B5CF6',
  teal: '#00CED1',
  yellow: '#FFD700',
  orange: '#FF6B35',
  black: '#000000',
  deepPink: '#FF1493',
};

// Tier-specific accent colors - Memphis palette
const TIER_COLORS: Record<number, { accent: string; bg: string; glow: string; gradient: string[] }> = {
  1: { accent: '#666666', bg: '#F8F9FA', glow: 'rgba(102, 102, 102, 0.2)', gradient: ['#FFFFFF', '#FAFAFA', '#FFFFFF'] },
  2: { accent: '#666666', bg: '#F8F9FA', glow: 'rgba(102, 102, 102, 0.2)', gradient: ['#FFFFFF', '#FAFAFA', '#FFFFFF'] },
  3: { accent: '#00CED1', bg: '#E8FAF8', glow: 'rgba(0, 206, 209, 0.3)', gradient: ['#FFFFFF', '#F5FFFF', '#FFFFFF'] },
  4: { accent: '#FF6B35', bg: '#FFF8E8', glow: 'rgba(255, 107, 53, 0.35)', gradient: ['#FFFFFF', '#FFFAF5', '#FFFFFF'] },
  5: { accent: '#FF00FF', bg: '#FFF0FF', glow: 'rgba(255, 0, 255, 0.4)', gradient: ['#FFFFFF', '#FFF8FF', '#FFFFFF'] },
};

// Tier 2 icon variants - randomly select for variety
const TIER_2_ICONS = [
  require('../assets/icons/icon-tier2A.png'),
  require('../assets/icons/icon-tier2B.png'),
  require('../assets/icons/icon-tier2C.png'),
  require('../assets/icons/icon-tier2D.png'),
  require('../assets/icons/icon-tier2E.png'),
  require('../assets/icons/icon-tier2F.png'),
  require('../assets/icons/icon-tier2G.png'),
  require('../assets/icons/icon-tier2H.png'),
  require('../assets/icons/icon-tier2I.png'),
];

// Get a consistent tier 2 icon based on beanie name (same beanie = same icon)
const getTier2Icon = (beanieName: string) => {
  const hash = beanieName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TIER_2_ICONS[hash % TIER_2_ICONS.length];
};

// Tier icons - custom artwork for each value tier
const TIER_ICONS: Record<number, any> = {
  1: require('../assets/icons/icon-tier1.png'),  // sad elephant - < $10
  2: TIER_2_ICONS[0],  // default - will be overridden for tier 2
  3: require('../assets/icons/icon-tier3.png'),  // surprised cat - $50-200
  4: require('../assets/icons/icon-tier4.png'),  // excited dog - $200-1000
  5: require('../assets/icons/icon-tier5.png'),  // jackpot bear - $1000+
};

// Rarity percentages - how rare each tier is in the wild
const TIER_RARITY: Record<number, { percent: string; label: string }> = {
  1: { percent: '60%', label: 'Most Common' },
  2: { percent: '30%', label: 'Common' },
  3: { percent: '8%', label: 'Uncommon' },
  4: { percent: '1.8%', label: 'Rare' },
  5: { percent: '0.2%', label: 'Ultra Rare' },
};

// Memphis Pattern SVG overlay - Different arrangement from index.tsx
function MemphisPattern({ tier }: { tier: number }) {
  const opacity = tier === 5 ? 0.6 : 0.5;

  return (
    <Svg style={[styles.memphisPattern, { opacity }]} viewBox="0 0 390 844">
      {/* === FILLED SHAPES WITH BLACK OUTLINES === */}

      {/* Teal triangle with black outline - TOP RIGHT */}
      <Polygon
        points="340,50 375,110 305,110"
        fill={MEMPHIS_COLORS.teal}
        stroke={MEMPHIS_COLORS.black}
        strokeWidth="3"
      />

      {/* Purple circle with black outline - TOP LEFT */}
      <Circle
        cx="50"
        cy="130"
        r="16"
        fill={MEMPHIS_COLORS.purple}
        stroke={MEMPHIS_COLORS.black}
        strokeWidth="3"
      />

      {/* Yellow triangle with black outline - LEFT SIDE */}
      <Polygon
        points="30,350 70,410 -10,410"
        fill={MEMPHIS_COLORS.yellow}
        stroke={MEMPHIS_COLORS.black}
        strokeWidth="3"
      />

      {/* Orange circle with black outline - BOTTOM RIGHT */}
      <Circle
        cx="350"
        cy="650"
        r="20"
        fill={MEMPHIS_COLORS.orange}
        stroke={MEMPHIS_COLORS.black}
        strokeWidth="3"
      />

      {/* Magenta circle for tier 5 celebration */}
      {tier === 5 && (
        <Circle
          cx="320"
          cy="280"
          r="14"
          fill={MEMPHIS_COLORS.magenta}
          stroke={MEMPHIS_COLORS.black}
          strokeWidth="3"
        />
      )}

      {/* === BLACK OUTLINE ONLY SHAPES === */}

      {/* Black outline triangle - BOTTOM LEFT */}
      <Polygon
        points="60,720 95,775 25,775"
        fill="none"
        stroke={MEMPHIS_COLORS.black}
        strokeWidth="3"
      />

      {/* Black outline circle - MID RIGHT */}
      <Circle
        cx="365"
        cy="400"
        r="12"
        fill="none"
        stroke={MEMPHIS_COLORS.black}
        strokeWidth="3"
      />

      {/* Black outline diamond - TOP CENTER */}
      <Polygon
        points="200,80 220,100 200,120 180,100"
        fill="none"
        stroke={MEMPHIS_COLORS.black}
        strokeWidth="3"
      />

      {/* === BOLD SQUIGGLES === */}

      {/* Black squiggle - TOP */}
      <Path
        d="M100 50 Q120 25, 140 50 Q160 75, 180 50"
        stroke={MEMPHIS_COLORS.black}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Teal squiggle - RIGHT SIDE */}
      <Path
        d="M360 200 Q385 175, 380 230 Q375 285, 400 260"
        stroke={MEMPHIS_COLORS.teal}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Purple squiggle - BOTTOM */}
      <Path
        d="M150 780 Q175 755, 200 780 Q225 805, 250 780"
        stroke={MEMPHIS_COLORS.purple}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* === LIGHTNING BOLT === */}
      <Path
        d="M300 180 L315 215 L295 215 L310 250"
        stroke={MEMPHIS_COLORS.yellow}
        strokeWidth="5"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* === ZIGZAG === */}
      <Path
        d="M40 550 L55 525 L70 550 L85 525 L100 550"
        stroke={MEMPHIS_COLORS.orange}
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* === SMALL ACCENTS === */}

      {/* Yellow filled circle - small pop */}
      <Circle cx="340" cy="750" r="10" fill={MEMPHIS_COLORS.yellow} />

      {/* Teal circle with black outline */}
      <Circle
        cx="55"
        cy="480"
        r="10"
        fill={MEMPHIS_COLORS.teal}
        stroke={MEMPHIS_COLORS.black}
        strokeWidth="2"
      />

      {/* Black dots cluster - TOP */}
      <Circle cx="260" cy="35" r="4" fill={MEMPHIS_COLORS.black} />
      <Circle cx="275" cy="45" r="4" fill={MEMPHIS_COLORS.black} />
      <Circle cx="250" cy="50" r="4" fill={MEMPHIS_COLORS.black} />

      {/* Extra shapes for tier 5 celebration */}
      {tier === 5 && (
        <>
          <Circle cx="180" cy="200" r="8" fill={MEMPHIS_COLORS.magenta} />
          <Circle cx="100" cy="600" r="12" fill={MEMPHIS_COLORS.yellow} stroke={MEMPHIS_COLORS.black} strokeWidth="2" />
          <Path
            d="M280 600 Q300 575, 320 600 Q340 625, 360 600"
            stroke={MEMPHIS_COLORS.magenta}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}

// Helper functions to format follow-up answer display
function formatCondition(condition: string): string {
  const labels: Record<string, string> = {
    'mint_with_tag': 'Mint with original tag',
    'mint_no_tag': 'Mint condition, no tag',
    'excellent': 'Excellent',
    'good': 'Good',
    'fair': 'Fair',
  };
  return labels[condition] || condition;
}

function formatPelletType(pellet: string): string {
  const labels: Record<string, string> = {
    'pvc': 'PVC (rare, higher value)',
    'pe': 'PE (common)',
    'unknown': 'Unknown (showing full range)',
  };
  return labels[pellet] || pellet;
}

// Adjust values based on condition
function getConditionMultiplier(condition: string): number {
  switch (condition) {
    case 'mint_with_tag':
      return 1.0;
    case 'mint_no_tag':
      return 0.5;
    case 'excellent':
      return 0.75;
    case 'good':
      return 0.5;
    case 'fair':
      return 0.25;
    default:
      return 1.0;
  }
}

// Adjust values based on pellet type
function getPelletMultiplier(pelletType: string): { low: number; high: number } {
  switch (pelletType) {
    case 'pvc':
      return { low: 3, high: 5 };
    case 'pe':
      return { low: 1, high: 1 };
    case 'unknown':
      return { low: 1, high: 5 };
    default:
      return { low: 1, high: 1 };
  }
}

export default function ResultScreenWrapper() {
  return (
    <ResultErrorBoundary>
      <ResultScreenInner />
    </ResultErrorBoundary>
  );
}

function ResultScreenInner() {
  const [verdict, setVerdict] = useState<VerdictInfo | null>(null);
  const [flexFlopLabel, setFlexFlopLabel] = useState<FlexFlopLabel | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scanButtonText] = useState(() => getScanAnotherText());
  const [shareButtonText] = useState(() => getShareButtonText());
  const [isSharing, setIsSharing] = useState(false);
  const [savedToCollection, setSavedToCollection] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Collection store
  const { addItem, pendingThumbnail, setPendingThumbnail, userName, pendingAchievementNotifications, clearPendingAchievements, pendingChallengeReward, clearPendingChallengeReward, pendingLevelUp, clearPendingLevelUp, pendingMilestone, clearPendingMilestone, pendingLuckyBonus, clearPendingLuckyBonus, pendingValueMilestone, clearPendingValueMilestone, pendingResultParams, setPendingResultParams } = useCollectionStore();

  // Achievement toast state
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Challenge toast state
  const [currentChallenge, setCurrentChallenge] = useState<DailyChallenge | null>(null);

  // Level up toast state
  const [showLevelUp, setShowLevelUp] = useState<{ level: number; title: string; emoji: string; color: string } | null>(null);

  // Milestone toast state
  const [showMilestone, setShowMilestone] = useState<CollectionMilestone | null>(null);

  // Share caption state
  const [shareCaption, setShareCaption] = useState<string | null>(null);

  // Animated value counter
  const [displayValueLow, setDisplayValueLow] = useState(0);
  const [displayValueHigh, setDisplayValueHigh] = useState(0);
  const valueCounterAnim = useRef(new Animated.Value(0)).current;

  // Rare find celebration overlay
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);

  // Lucky scan bonus toast
  const [showLuckyBonus, setShowLuckyBonus] = useState<{ xp: number; multiplier: number } | null>(null);

  // Value milestone toast
  const [showValueMilestone, setShowValueMilestone] = useState<ValueMilestone | null>(null);

  // Track total XP earned this session (for summary display)
  const [xpEarnedThisScan, setXpEarnedThisScan] = useState(0);

  // Read params from store (bypasses expo-router URL parsing which crashes on Hermes)
  // Use getState() directly to avoid any hook timing issues
  const [params] = useState(() => {
    const stored = useCollectionStore.getState().pendingResultParams || {};
    return stored as {
      name: string;
      animal_type: string;
      variant: string;
      colors: string;
      estimated_value_low: string;
      estimated_value_high: string;
      value_notes: string;
      confidence: string;
      has_visible_hang_tag: string;
      followUpAnswers?: string;
      followUpPhotos?: string;
      value_breakdown?: string;
      detected_assumptions?: string;
      fromCollection?: string;
      collectionThumbnail?: string;
      roast?: string;
    };
  });

  // Clear pending params after reading (in useEffect, not during render)
  useEffect(() => {
    if (useCollectionStore.getState().pendingResultParams) {
      setPendingResultParams(null);
    }
  }, []);

  // Capture the image for the certificate - try multiple approaches for reliability
  // 1. First try: capture synchronously on initial render (or from collection thumbnail)
  const [certificateImage, setCertificateImage] = useState<string | null>(() => {
    // If coming from collection, use the passed thumbnail
    if (params.collectionThumbnail) return params.collectionThumbnail;

    // Otherwise try pendingThumbnail from store
    const store = useCollectionStore.getState();
    return store.pendingThumbnail || null;
  });

  // 2. Fallback: if initial capture missed it, watch for updates
  // Also check the store directly as a backup (handles race conditions)
  useEffect(() => {
    if (certificateImage) return; // Already have an image

    // Check for collection thumbnail first
    if (params.collectionThumbnail) {
      setCertificateImage(params.collectionThumbnail);
      return;
    }

    // Then check pendingThumbnail from hook
    if (pendingThumbnail) {
      setCertificateImage(pendingThumbnail);
      return;
    }

    // Last resort: check store directly (handles timing issues)
    const storeThumb = useCollectionStore.getState().pendingThumbnail;
    if (storeThumb) {
      setCertificateImage(storeThumb);
    }
  }, [certificateImage, pendingThumbnail, params.collectionThumbnail]);

  // 3. Additional fallback: retry after a short delay if still missing
  useEffect(() => {
    if (certificateImage) return;

    const timeoutId = setTimeout(() => {
      const storeThumb = useCollectionStore.getState().pendingThumbnail;
      if (storeThumb && !certificateImage) {
        setCertificateImage(storeThumb);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [certificateImage]);

  // Certificate capture ref
  const certificateRef = useRef<View>(null);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(30)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const tierIconBounce = useRef(new Animated.Value(0)).current;
  const tierIconRotate = useRef(new Animated.Value(0)).current;

  // Ref to track glow animation loop for cleanup
  const glowAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // Parse follow-up answers if present (with safe parsing to prevent crashes)
  const followUpAnswers = safeParseURLParam<FollowUpAnswers | null>(params.followUpAnswers, null);

  // Parse value breakdown if present
  const valueBreakdown = safeParseURLParam<ValueBreakdown | null>(params.value_breakdown, null);

  // Parse detected assumptions if present
  const detectedAssumptions = safeParseURLParam<DetectedAssumptions | null>(params.detected_assumptions, null);

  // Base values from initial identification
  const baseValueLow = parseInt(params.estimated_value_low || '0', 10);
  const baseValueHigh = parseInt(params.estimated_value_high || '0', 10);

  // Calculate adjusted values based on follow-up answers
  let adjustedValueLow = baseValueLow;
  let adjustedValueHigh = baseValueHigh;

  if (followUpAnswers) {
    if (followUpAnswers.condition) {
      const conditionMult = getConditionMultiplier(followUpAnswers.condition);
      adjustedValueLow = Math.round(adjustedValueLow * conditionMult);
      adjustedValueHigh = Math.round(adjustedValueHigh * conditionMult);
    }

    if (followUpAnswers.pellet_type) {
      const pelletMult = getPelletMultiplier(followUpAnswers.pellet_type);
      adjustedValueLow = Math.round(adjustedValueLow * pelletMult.low);
      adjustedValueHigh = Math.round(adjustedValueHigh * pelletMult.high);
    }
  }

  const valueLow = adjustedValueLow;
  const valueHigh = adjustedValueHigh;
  const isNotBeanie = params.name?.toLowerCase() === 'not a beanie baby';
  const hasSpecialVariant = params.variant && params.variant.toLowerCase() !== 'standard';

  // Generate fun facts based on value
  const funFacts = generateFunFacts(
    params.name || '',
    valueLow,
    valueHigh
  );

  useEffect(() => {
    setVerdict(getVerdict(valueHigh));
    setFlexFlopLabel(getFlexFlopLabel(valueHigh));

    // Generate share caption
    if (!isNotBeanie && params.name) {
      const flexFlopStatus = getFlexFlopStatus(valueHigh);
      setShareCaption(getShareCaption(params.name, valueHigh, flexFlopStatus));
    }

    // Show confetti for Tier 4+ (high value finds)
    const tier = valueHigh >= 1000 ? 5 : valueHigh >= 200 ? 4 : valueHigh >= 50 ? 3 : valueHigh >= 15 ? 2 : 1;
    if (tier >= 4) {
      setTimeout(() => setShowConfetti(true), 500);
    }

    // Show celebration overlay for Tier 4+ (only once, not from collection view)
    const fromCollection = params.fromCollection === 'true';
    if (tier >= 4 && !celebrationShown && !fromCollection && !isNotBeanie) {
      setShowCelebration(true);
      setCelebrationShown(true);
    }

    // Haptic feedback on tier reveal
    if (Platform.OS !== 'web') {
      setTimeout(() => {
        if (tier >= 5) {
          // Heavy impact for jackpot
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (tier >= 4) {
          // Medium impact for high value
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          // Light impact for regular reveals
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }, 200);
    }

    // Reveal animation sequence
    Animated.sequence([
      Animated.delay(100),
      // Icon/verdict appears with scale
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Tier icon bounces for dramatic effect
      Animated.sequence([
        Animated.spring(tierIconBounce, {
          toValue: 1,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
        // Quick wiggle for excitement on high tiers
        tier >= 4 ? Animated.sequence([
          Animated.timing(tierIconRotate, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(tierIconRotate, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(tierIconRotate, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]) : Animated.timing(tierIconRotate, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      // Card slides up
      Animated.parallel([
        Animated.timing(cardSlideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Glow pulse animation for high-value tiers
    glowAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimRef.current.start();

    // Animated value counter - count up effect
    valueCounterAnim.setValue(0);
    const listenerId = valueCounterAnim.addListener(({ value }) => {
      setDisplayValueLow(Math.round(valueLow * value));
      setDisplayValueHigh(Math.round(valueHigh * value));
    });

    // Delay value reveal until card slides in
    setTimeout(() => {
      Animated.timing(valueCounterAnim, {
        toValue: 1,
        duration: tier >= 4 ? 1500 : 800,  // Longer count for high values
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,  // Required for listeners
      }).start();
    }, 600);

    return () => {
      glowAnimRef.current?.stop();
      valueCounterAnim.removeListener(listenerId);
    };
  }, [valueHigh, valueLow, scaleAnim, fadeAnim, cardSlideAnim, cardFadeAnim, glowAnim, tierIconBounce, tierIconRotate, valueCounterAnim]);

  // Check if viewing from collection
  const isFromCollection = params.fromCollection === 'true';

  // Auto-save to collection (skip if viewing from collection)
  // Only clear pendingThumbnail after certificateImage is captured
  useEffect(() => {
    if (!verdict || savedToCollection || isNotBeanie || isFromCollection) return;

    // Get the thumbnail - use certificateImage if captured, otherwise try pendingThumbnail
    const thumbnailToSave = certificateImage || pendingThumbnail || '';

    const collectionItem: CollectionItem = {
      id: generateId(),
      timestamp: Date.now(),
      thumbnail: thumbnailToSave,
      name: params.name || 'Unknown',
      animal_type: params.animal_type || '',
      variant: params.variant || '',
      colors: safeParseURLParam<string[]>(params.colors, []),
      estimated_value_low: baseValueLow,
      estimated_value_high: baseValueHigh,
      adjusted_value_low: valueLow,
      adjusted_value_high: valueHigh,
      condition: followUpAnswers?.condition as ConditionLevel | undefined,
      pellet_type: followUpAnswers?.pellet_type as PelletType | undefined,
      value_notes: params.value_notes || '',
      tier: verdict.tier,
      roast: params.roast || undefined,
    };

    addItem(collectionItem);

    // Haptic feedback on save
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Only clear pendingThumbnail if certificateImage has already captured it
    // This prevents race conditions where the certificate loses the image
    if (certificateImage) {
      setPendingThumbnail(null);
    }
    setSavedToCollection(true);
  }, [verdict, savedToCollection, isNotBeanie, isFromCollection, params, baseValueLow, baseValueHigh, valueLow, valueHigh, followUpAnswers, pendingThumbnail, certificateImage, addItem, setPendingThumbnail]);

  // Cleanup: clear pendingThumbnail once certificateImage is captured (fallback cleanup)
  useEffect(() => {
    if (certificateImage && pendingThumbnail) {
      setPendingThumbnail(null);
    }
  }, [certificateImage, pendingThumbnail, setPendingThumbnail]);

  // Track XP earned from this scan (challenge + lucky bonus)
  useEffect(() => {
    if (pendingChallengeReward && xpEarnedThisScan === 0) {
      setXpEarnedThisScan(prev => prev + pendingChallengeReward.xpReward);
    }
  }, [pendingChallengeReward, xpEarnedThisScan]);

  useEffect(() => {
    if (pendingLuckyBonus && !showLuckyBonus) {
      setXpEarnedThisScan(prev => prev + pendingLuckyBonus.xp);
    }
  }, [pendingLuckyBonus, showLuckyBonus]);

  // Show achievement toast when new achievements are unlocked
  useEffect(() => {
    if (pendingAchievementNotifications && pendingAchievementNotifications.length > 0 && !currentAchievement) {
      // Show the first pending achievement
      setCurrentAchievement(pendingAchievementNotifications[0]);
    }
  }, [pendingAchievementNotifications, currentAchievement]);

  // Handle achievement toast dismiss
  const handleAchievementDismiss = () => {
    setCurrentAchievement(null);
    // Clear all pending achievements after showing first one
    // (could queue them, but for simplicity just clear)
    clearPendingAchievements();
  };

  // Show challenge toast when daily challenge is completed
  useEffect(() => {
    if (pendingChallengeReward && !currentChallenge && !currentAchievement) {
      // Delay slightly so it doesn't overlap with achievement toast
      const timer = setTimeout(() => {
        setCurrentChallenge(pendingChallengeReward);
      }, currentAchievement ? 2000 : 500);
      return () => clearTimeout(timer);
    }
  }, [pendingChallengeReward, currentChallenge, currentAchievement]);

  // Handle challenge toast dismiss
  const handleChallengeDismiss = () => {
    setCurrentChallenge(null);
    clearPendingChallengeReward();
  };

  // Show level up toast when user levels up
  useEffect(() => {
    if (pendingLevelUp && !showLevelUp && !currentAchievement && !currentChallenge) {
      // Delay slightly so it doesn't overlap with other toasts
      const timer = setTimeout(() => {
        setShowLevelUp(pendingLevelUp);
      }, currentAchievement || currentChallenge ? 2500 : 1000);
      return () => clearTimeout(timer);
    }
  }, [pendingLevelUp, showLevelUp, currentAchievement, currentChallenge]);

  // Handle level up toast dismiss
  const handleLevelUpDismiss = () => {
    setShowLevelUp(null);
    clearPendingLevelUp();
  };

  // Show milestone toast when collection milestone is reached
  useEffect(() => {
    if (pendingMilestone && !showMilestone && !currentAchievement && !currentChallenge && !showLevelUp) {
      // Delay slightly so it doesn't overlap with other toasts
      const timer = setTimeout(() => {
        setShowMilestone(pendingMilestone);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pendingMilestone, showMilestone, currentAchievement, currentChallenge, showLevelUp]);

  // Handle milestone toast dismiss
  const handleMilestoneDismiss = () => {
    setShowMilestone(null);
    clearPendingMilestone();
  };

  // Show lucky bonus toast when bonus is pending
  useEffect(() => {
    if (pendingLuckyBonus && !showLuckyBonus && !currentAchievement && !currentChallenge && !showLevelUp && !showMilestone) {
      // Delay slightly so it doesn't overlap with other toasts
      const timer = setTimeout(() => {
        setShowLuckyBonus(pendingLuckyBonus);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pendingLuckyBonus, showLuckyBonus, currentAchievement, currentChallenge, showLevelUp, showMilestone]);

  // Handle lucky bonus toast dismiss
  const handleLuckyBonusDismiss = () => {
    setShowLuckyBonus(null);
    clearPendingLuckyBonus();
  };

  // Show value milestone toast when milestone is pending
  useEffect(() => {
    if (pendingValueMilestone && !showValueMilestone && !currentAchievement && !currentChallenge && !showLevelUp && !showMilestone && !showLuckyBonus) {
      // Delay so it doesn't overlap with other toasts
      const timer = setTimeout(() => {
        setShowValueMilestone(pendingValueMilestone);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [pendingValueMilestone, showValueMilestone, currentAchievement, currentChallenge, showLevelUp, showMilestone, showLuckyBonus]);

  // Handle value milestone toast dismiss
  const handleValueMilestoneDismiss = () => {
    setShowValueMilestone(null);
    clearPendingValueMilestone();
  };

  const handleShare = async () => {
    if (!certificateRef.current || !verdict) return;

    // Haptic feedback on share
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsSharing(true);

    try {
      // Capture the certificate as an image
      const uri = await captureRef(certificateRef, {
        format: 'png',
        quality: 1,
      });

      if (Platform.OS === 'web') {
        // Web: use expo-sharing (no caption support)
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share your Beanie valuation',
          });
        }
      } else {
        // Native: use RN Share API for image + caption text
        await Share.share({
          message: shareCaption || '',
          url: uri,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showShareFailedAlert();
    } finally {
      setIsSharing(false);
    }
  };

  const tierColors = verdict ? TIER_COLORS[verdict.tier] : TIER_COLORS[1];
  const isHighValueTier = verdict && verdict.tier >= 4;
  const isJackpotTier = verdict && verdict.tier === 5;
  const currentTier = verdict?.tier || 1;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={tierColors.gradient as [string, string, string]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Memphis pattern overlay */}
      <MemphisPattern tier={currentTier} />

      {/* Home Button */}
      <Pressable style={styles.homeButton} onPress={() => router.replace('/')}>
        <Text style={styles.homeButtonText}>← Home</Text>
      </Pressable>

      {/* Achievement Toast */}
      {currentAchievement && (
        <AchievementToast
          achievement={currentAchievement}
          onDismiss={handleAchievementDismiss}
        />
      )}

      {/* Challenge Toast */}
      {currentChallenge && !currentAchievement && (
        <ChallengeToast
          challenge={currentChallenge}
          onDismiss={handleChallengeDismiss}
        />
      )}

      {/* Level Up Toast */}
      {showLevelUp && !currentAchievement && !currentChallenge && (
        <LevelUpToast
          level={showLevelUp.level}
          title={showLevelUp.title}
          emoji={showLevelUp.emoji}
          color={showLevelUp.color}
          onDismiss={handleLevelUpDismiss}
        />
      )}

      {/* Milestone Toast */}
      {showMilestone && !currentAchievement && !currentChallenge && !showLevelUp && (
        <MilestoneToast
          milestone={showMilestone}
          onDismiss={handleMilestoneDismiss}
        />
      )}

      {/* Rare Find Celebration Overlay */}
      {showCelebration && verdict && (verdict.tier === 4 || verdict.tier === 5) && (
        <RareFindCelebration
          tier={verdict.tier as 4 | 5}
          onComplete={() => setShowCelebration(false)}
        />
      )}

      {/* Lucky Scan Bonus Toast */}
      {showLuckyBonus && !currentAchievement && !currentChallenge && !showLevelUp && !showMilestone && (
        <LuckyScanToast
          xp={showLuckyBonus.xp}
          multiplier={showLuckyBonus.multiplier}
          onDismiss={handleLuckyBonusDismiss}
        />
      )}

      {/* Value Milestone Toast */}
      {showValueMilestone && !currentAchievement && !currentChallenge && !showLevelUp && !showMilestone && !showLuckyBonus && (
        <ValueMilestoneToast
          milestone={showValueMilestone}
          onDismiss={handleValueMilestoneDismiss}
        />
      )}

      {/* Confetti for high-value discoveries */}
      {showConfetti && <Confetti count={60} />}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verdict Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Tier Icon */}
          <Animated.View style={[
            styles.tierIconWrapper,
            {
              transform: [
                {
                  scale: tierIconBounce.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
                {
                  rotate: tierIconRotate.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: ['-10deg', '0deg', '10deg'],
                  }),
                },
              ],
            },
          ]}>
            <Image
              source={currentTier === 2 ? getTier2Icon(params.name || '') : (TIER_ICONS[currentTier] || TIER_ICONS[1])}
              style={styles.tierIcon}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={[styles.verdictTitle, { color: tierColors.accent }]}>
            {verdict?.title || 'Analyzing...'}
          </Text>

          {/* Flex/Flop Badge */}
          {flexFlopLabel && !isNotBeanie && (
            <View style={[styles.flexFlopBadge, { backgroundColor: flexFlopLabel.color }]}>
              <Text style={styles.flexFlopEmoji}>{flexFlopLabel.emoji}</Text>
              <Text style={styles.flexFlopLabel}>{flexFlopLabel.label}</Text>
            </View>
          )}

          {/* Rarity Indicator */}
          {!isNotBeanie && (
            <View style={[styles.rarityBadge, { borderColor: `${tierColors.accent}40` }]}>
              <Text style={styles.rarityPercent}>{TIER_RARITY[currentTier].percent}</Text>
              <Text style={styles.rarityLabel}>{TIER_RARITY[currentTier].label}</Text>
            </View>
          )}
        </Animated.View>

        {/* Main Card */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: cardFadeAnim,
              transform: [{ translateY: cardSlideAnim }],
            },
          ]}
        >
          <BlurView intensity={40} tint="light" style={styles.resultCard}>
            <View style={styles.resultCardInner}>
              {isNotBeanie ? (
                <>
                  <Text style={styles.cardTitle}>Not a Beanie Baby</Text>
                  <Text style={styles.cardMessage}>
                    This doesn't appear to be a Ty Beanie Baby. Try again with a real one!
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>{params.name}</Text>
                  <Text style={styles.cardSubtitle}>
                    {hasSpecialVariant ? params.variant : params.animal_type}
                  </Text>

                  {/* Value Display */}
                  <View
                    style={[
                      styles.valueContainer,
                      {
                        backgroundColor: tierColors.bg,
                        borderColor: `${tierColors.accent}30`,
                      },
                    ]}
                  >
                    {isJackpotTier && (
                      <Animated.View
                        style={[
                          styles.valueGlow,
                          {
                            opacity: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 0.6],
                            }),
                            backgroundColor: tierColors.accent,
                          },
                        ]}
                      />
                    )}
                    <Text style={styles.valueLabel}>ESTIMATED VALUE</Text>
                    <View style={styles.valueRow}>
                      <Text style={[styles.valueAmount, { color: tierColors.accent }]}>
                        ${displayValueLow}
                      </Text>
                      <Text style={styles.valueDash}>-</Text>
                      <Text style={[styles.valueAmount, { color: tierColors.accent }]}>
                        ${displayValueHigh}
                      </Text>
                    </View>
                  </View>

                  {/* THE ROAST */}
                  {params.roast && (
                    <View style={[styles.roastContainer, { borderColor: `${tierColors.accent}40` }]}>
                      <Text style={styles.roastIcon}>🔥</Text>
                      <Text style={[styles.roastText, { color: tierColors.accent }]}>
                        {params.roast}
                      </Text>
                    </View>
                  )}

                  {/* What We Detected */}
                  {detectedAssumptions && (
                    <View style={styles.assumptionsContainer}>
                      <Text style={styles.assumptionsTitle}>👁️ WHAT WE SAW</Text>
                      <View style={styles.assumptionsInline}>
                        <View style={styles.assumptionChip}>
                          <Text style={styles.chipIcon}>🏷️</Text>
                          <Text style={styles.chipText}>{detectedAssumptions.tag_status}</Text>
                        </View>
                        <View style={styles.assumptionChip}>
                          <Text style={styles.chipIcon}>📅</Text>
                          <Text style={styles.chipText}>{detectedAssumptions.tag_generation}</Text>
                        </View>
                        <View style={styles.assumptionChip}>
                          <Text style={styles.chipIcon}>✨</Text>
                          <Text style={styles.chipText}>{detectedAssumptions.condition_estimate}</Text>
                        </View>
                      </View>
                      {detectedAssumptions.condition_notes && (
                        <Text style={styles.conditionNotes}>{detectedAssumptions.condition_notes}</Text>
                      )}
                      {detectedAssumptions.special_features && detectedAssumptions.special_features.length > 0 && (
                        <View style={styles.specialFeaturesInline}>
                          {detectedAssumptions.special_features.map((feature, index) => (
                            <Text key={index} style={styles.specialFeatureChip}>🔍 {feature}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {/* Verdict Message */}
                  <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>{verdict?.message || ''}</Text>
                  </View>

                  {/* Fun Facts */}
                  {funFacts.length > 0 && (
                    <View style={styles.funFactsContainer}>
                      <Text style={styles.funFactsTitle}>📜 THE FINE PRINT</Text>
                      {funFacts.slice(0, 2).map((fact, index) => (
                        <Text key={index} style={styles.funFactText}>
                          {fact.text}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Value Breakdown */}
                  {valueBreakdown && (
                    <View style={styles.breakdownContainer}>
                      <Text style={styles.breakdownTitle}>📊 VALUE BY CONDITION</Text>
                      <View style={styles.breakdownGrid}>
                        <View style={styles.breakdownItem}>
                          <Text style={styles.breakdownEmoji}>❌</Text>
                          <Text style={styles.breakdownItemLabel}>No tag</Text>
                          <Text style={styles.breakdownItemValue}>{valueBreakdown.no_tag}</Text>
                        </View>
                        <View style={styles.breakdownItem}>
                          <Text style={styles.breakdownEmoji}>🏷️</Text>
                          <Text style={styles.breakdownItemLabel}>Common tag</Text>
                          <Text style={styles.breakdownItemValue}>{valueBreakdown.common_tag}</Text>
                        </View>
                        <View style={styles.breakdownItem}>
                          <Text style={styles.breakdownEmoji}>⭐</Text>
                          <Text style={styles.breakdownItemLabel}>Early tag</Text>
                          <Text style={styles.breakdownItemValue}>{valueBreakdown.early_tag}</Text>
                        </View>
                        {valueBreakdown.mint_premium && (
                          <View style={styles.breakdownItem}>
                            <Text style={styles.breakdownEmoji}>💎</Text>
                            <Text style={styles.breakdownItemLabel}>Mint bonus</Text>
                            <Text style={[styles.breakdownItemValue, styles.premiumText]}>{valueBreakdown.mint_premium}</Text>
                          </View>
                        )}
                      </View>
                      {valueBreakdown.key_factors && valueBreakdown.key_factors.length > 0 && (
                        <View style={styles.keyFactorsSection}>
                          <Text style={styles.keyFactorsTitle}>💡 Key factors:</Text>
                          {valueBreakdown.key_factors.map((factor, index) => (
                            <Text key={index} style={styles.keyFactorItem}>• {factor}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {/* Value Notes */}
                  {params.value_notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>ℹ️ About this Beanie</Text>
                      <Text style={styles.notesText}>{params.value_notes}</Text>
                    </View>
                  )}

                  {/* Value Factors Applied */}
                  {followUpAnswers && (
                    <View style={styles.factorsContainer}>
                      <Text style={styles.factorsTitle}>✅ FACTORS APPLIED</Text>
                      <View style={styles.factorsGrid}>
                        {followUpAnswers.condition && (
                          <View style={styles.factorChip}>
                            <Text style={styles.factorChipIcon}>✨</Text>
                            <Text style={styles.factorChipText}>{formatCondition(followUpAnswers.condition)}</Text>
                          </View>
                        )}
                        {followUpAnswers.pellet_type && (
                          <View style={styles.factorChip}>
                            <Text style={styles.factorChipIcon}>🫘</Text>
                            <Text style={styles.factorChipText}>{formatPelletType(followUpAnswers.pellet_type)}</Text>
                          </View>
                        )}
                      </View>
                      {followUpAnswers.pellet_type === 'unknown' && (
                        <View style={styles.rangeExplanation}>
                          <Text style={styles.rangeText}>
                            📈 High: assumes rare PVC pellets{'\n'}
                            📉 Low: assumes common PE pellets
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Details Row */}
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Confidence</Text>
                      <Text style={styles.detailValue}>{params.confidence}</Text>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Tag Visible</Text>
                      <Text style={styles.detailValue}>
                        {params.has_visible_hang_tag === 'true' ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </BlurView>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: cardFadeAnim,
              transform: [{ translateY: cardSlideAnim }],
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/scan')}
          >
            <LinearGradient
              colors={[MEMPHIS_COLORS.magenta, MEMPHIS_COLORS.deepPink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>{scanButtonText}</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.secondaryButtonsRow}>
            {Platform.OS !== 'web' && !isNotBeanie && (
              <BlurView intensity={40} tint="light" style={[styles.secondaryButtonBlur, styles.flexButton]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.secondaryButtonPressed,
                  ]}
                  onPress={() => setShowCertificateModal(true)}
                >
                  <Text style={styles.secondaryButtonText}>View Certificate</Text>
                </Pressable>
              </BlurView>
            )}

            <BlurView intensity={40} tint="light" style={[styles.secondaryButtonBlur, styles.flexButton]}>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                ]}
                onPress={() => router.push('/collection')}
              >
                <Text style={styles.secondaryButtonText}>My Collection</Text>
              </Pressable>
            </BlurView>
          </View>

          {savedToCollection && !isNotBeanie && !isFromCollection && (
            <View style={styles.savedRow}>
              <Text style={styles.savedIndicator}>Added to collection</Text>
              {xpEarnedThisScan > 0 && (
                <View style={styles.xpEarnedBadge}>
                  <Text style={styles.xpEarnedText}>+{xpEarnedThisScan} XP</Text>
                </View>
              )}
            </View>
          )}
          {isFromCollection && (
            <Text style={styles.savedIndicator}>Viewing from collection</Text>
          )}
        </Animated.View>
      </ScrollView>

      {/* Certificate Preview Modal */}
      <Modal
        visible={showCertificateModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCertificateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.certificatePreview}>
              <FarewellCertificate
                ref={certificateRef}
                name={params.name || ''}
                variant={hasSpecialVariant ? params.variant || '' : params.animal_type || ''}
                valueLow={valueLow}
                valueHigh={valueHigh}
                verdictTitle={verdict?.title || ''}
                tier={verdict?.tier || 1}
                beanieImage={certificateImage || undefined}
                animalEmoji={!certificateImage && params.animal_type ? (ANIMAL_EMOJIS[params.animal_type] || '🧸') : undefined}
                userName={userName || undefined}
                roast={params.roast || undefined}
              />
            </View>

            {shareCaption && (
              <View style={styles.shareCaptionContainer}>
                <Text style={styles.shareCaptionLabel}>📋 Copy for socials:</Text>
                <Text style={styles.shareCaptionText}>{shareCaption}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalShareButton,
                  pressed && styles.buttonPressed,
                  isSharing && styles.buttonDisabled,
                ]}
                onPress={handleShare}
                disabled={isSharing}
              >
                <LinearGradient
                  colors={[MEMPHIS_COLORS.magenta, MEMPHIS_COLORS.deepPink]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalShareButtonGradient}
                >
                  <Text style={styles.modalShareButtonText}>
                    {isSharing ? 'Sharing...' : 'Share Certificate'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowCertificateModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  memphisPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  homeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  certificateContainer: {
    position: 'absolute',
    left: -9999,  // Off-screen
    top: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tierIconWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierIcon: {
    width: 100,
    height: 100,
  },
  verdictTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  flexFlopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  flexFlopEmoji: {
    fontSize: 18,
  },
  flexFlopLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginTop: 10,
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
  },
  rarityPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  rarityLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  cardWrapper: {
    marginBottom: 20,
  },
  resultCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  resultCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    padding: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 16,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  cardMessage: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  valueContainer: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  // Roast styles
  roastContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 12,
  },
  roastIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  roastText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  valueGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 16,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999999',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueAmount: {
    fontSize: 40,
    fontWeight: '800',
  },
  valueDash: {
    fontSize: 28,
    color: '#999999',
    fontWeight: '300',
  },
  messageContainer: {
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  messageText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  funFactsContainer: {
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.15)',
  },
  funFactsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 1.2,
    marginBottom: 10,
    textAlign: 'center',
  },
  funFactText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  assumptionsContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  assumptionsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 1.2,
    marginBottom: 12,
    textAlign: 'center',
  },
  assumptionsInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  assumptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  chipIcon: {
    fontSize: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  conditionNotes: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
    textAlign: 'center',
  },
  specialFeaturesInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  specialFeatureChip: {
    fontSize: 11,
    color: '#666666',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  breakdownContainer: {
    backgroundColor: 'rgba(0, 206, 209, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 209, 0.2)',
  },
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00CED1',
    letterSpacing: 1.2,
    marginBottom: 12,
    textAlign: 'center',
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  breakdownItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  breakdownEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  breakdownItemLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  breakdownItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  premiumText: {
    color: '#00CED1',
  },
  keyFactorsSection: {
    marginTop: 14,
    paddingTop: 10,
  },
  keyFactorsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  keyFactorItem: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    marginLeft: 4,
  },
  notesContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(248, 249, 250, 0.6)',
    borderRadius: 12,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  factorsContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  factorsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 1.2,
    marginBottom: 12,
    textAlign: 'center',
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  factorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  factorChipIcon: {
    fontSize: 14,
  },
  factorChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  factorItem: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 4,
  },
  rangeExplanation: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  rangeText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pelletRangeContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  pelletRangeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 8,
  },
  pelletRangeText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailItem: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  detailDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: MEMPHIS_COLORS.magenta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButtonBlur: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 50,
  },
  secondaryButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  secondaryButtonText: {
    color: '#1a1a2e',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexButton: {
    flex: 1,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  savedIndicator: {
    fontSize: 13,
    color: '#00CED1',
    fontWeight: '500',
  },
  xpEarnedBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  xpEarnedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DAA520',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  certificatePreview: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  modalShareButton: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  modalShareButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalShareButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  modalCloseButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },

  // Share Caption
  shareCaptionContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  shareCaptionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
  },
  shareCaptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a2e',
    lineHeight: 20,
  },
});
