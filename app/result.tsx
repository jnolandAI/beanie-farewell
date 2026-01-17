import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated, Easing, Platform, Dimensions, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { getVerdict, getScanAnotherText, getShareButtonText, VerdictInfo } from '../lib/humor';
import { FollowUpAnswers, CollectionItem, ConditionLevel, PelletType, ValueBreakdown } from '../types/beanie';
import { FarewellCertificate } from '../components/FarewellCertificate';
import { useCollectionStore, generateId } from '../lib/store';

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

// Tier icons - custom artwork for each value tier
const TIER_ICONS: Record<number, any> = {
  1: require('../assets/icons/icon-tier1.png'),  // sad elephant - < $10
  2: require('../assets/icons/icon-tier2.png'),  // meh frog - $10-50
  3: require('../assets/icons/icon-tier3.png'),  // surprised cat - $50-200
  4: require('../assets/icons/icon-tier4.png'),  // excited dog - $200-1000
  5: require('../assets/icons/icon-tier5.png'),  // jackpot bear - $1000+
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

export default function ResultScreen() {
  const [verdict, setVerdict] = useState<VerdictInfo | null>(null);
  const [scanButtonText] = useState(() => getScanAnotherText());
  const [shareButtonText] = useState(() => getShareButtonText());
  const [isSharing, setIsSharing] = useState(false);
  const [savedToCollection, setSavedToCollection] = useState(false);

  // Collection store
  const { addItem, pendingThumbnail, setPendingThumbnail } = useCollectionStore();

  // Certificate capture ref
  const certificateRef = useRef<View>(null);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(30)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const params = useLocalSearchParams<{
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
  }>();

  // Parse follow-up answers if present
  const followUpAnswers: FollowUpAnswers | null = params.followUpAnswers
    ? JSON.parse(params.followUpAnswers)
    : null;

  // Parse value breakdown if present
  const valueBreakdown: ValueBreakdown | null = params.value_breakdown
    ? JSON.parse(params.value_breakdown)
    : null;

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

  useEffect(() => {
    setVerdict(getVerdict(valueHigh));

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
    Animated.loop(
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
    ).start();
  }, [valueHigh, scaleAnim, fadeAnim, cardSlideAnim, cardFadeAnim, glowAnim]);

  // Auto-save to collection
  useEffect(() => {
    if (!verdict || savedToCollection || isNotBeanie) return;

    const collectionItem: CollectionItem = {
      id: generateId(),
      timestamp: Date.now(),
      thumbnail: pendingThumbnail || '',
      name: params.name || 'Unknown',
      animal_type: params.animal_type || '',
      variant: params.variant || '',
      colors: params.colors ? JSON.parse(params.colors) : [],
      estimated_value_low: baseValueLow,
      estimated_value_high: baseValueHigh,
      adjusted_value_low: valueLow,
      adjusted_value_high: valueHigh,
      condition: followUpAnswers?.condition as ConditionLevel | undefined,
      pellet_type: followUpAnswers?.pellet_type as PelletType | undefined,
      value_notes: params.value_notes || '',
      tier: verdict.tier,
    };

    addItem(collectionItem);
    setPendingThumbnail(null);
    setSavedToCollection(true);
  }, [verdict, savedToCollection, isNotBeanie, params, baseValueLow, baseValueHigh, valueLow, valueHigh, followUpAnswers, pendingThumbnail, addItem, setPendingThumbnail]);

  const handleShare = async () => {
    if (!certificateRef.current || !verdict) return;

    setIsSharing(true);

    try {
      // Capture the certificate as an image
      const uri = await captureRef(certificateRef, {
        format: 'png',
        quality: 1,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Beanie valuation',
        });
      } else {
        // Fallback: save to camera roll
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          // Could show a toast/alert here: "Saved to camera roll!"
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
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
      {/* Background gradient - pure white/light gray with tier-specific subtle hint */}
      <LinearGradient
        colors={tierColors.gradient as [string, string, string]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Memphis pattern overlay */}
      <MemphisPattern tier={currentTier} />

      {/* Hidden certificate for capture */}
      <View style={styles.certificateContainer}>
        <FarewellCertificate
          ref={certificateRef}
          name={params.name || ''}
          variant={hasSpecialVariant ? params.variant || '' : params.animal_type || ''}
          valueLow={valueLow}
          valueHigh={valueHigh}
          verdictTitle={verdict?.title || ''}
          verdictIcon={verdict?.icon || ''}
          tier={verdict?.tier || 1}
          condition={followUpAnswers?.condition ? formatCondition(followUpAnswers.condition) : undefined}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verdict Header with Glass Circle */}
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
          <View style={styles.tierIconWrapper}>
            <Image
              source={TIER_ICONS[currentTier] || TIER_ICONS[1]}
              style={styles.tierIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.verdictTitle, { color: tierColors.accent }]}>
            {verdict?.title || 'Analyzing...'}
          </Text>
        </Animated.View>

        {/* Main Card - Frosted Glass */}
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
                  {/* Beanie Name */}
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
                        ${valueLow}
                      </Text>
                      <Text style={styles.valueDash}>-</Text>
                      <Text style={[styles.valueAmount, { color: tierColors.accent }]}>
                        ${valueHigh}
                      </Text>
                    </View>
                  </View>

                  {/* Verdict Message */}
                  <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>{verdict?.message || ''}</Text>
                  </View>

                  {/* Value Breakdown - Shows what drives high vs low values */}
                  {valueBreakdown && (
                    <View style={styles.breakdownContainer}>
                      <Text style={styles.breakdownTitle}>VALUE BY CONDITION</Text>

                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>No tag:</Text>
                        <Text style={styles.breakdownValue}>{valueBreakdown.no_tag}</Text>
                      </View>

                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>4th/5th gen tag:</Text>
                        <Text style={styles.breakdownValue}>{valueBreakdown.common_tag}</Text>
                      </View>

                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>1st-3rd gen tag:</Text>
                        <Text style={styles.breakdownValue}>{valueBreakdown.early_tag}</Text>
                      </View>

                      {valueBreakdown.mint_premium && (
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownLabel}>Mint premium:</Text>
                          <Text style={[styles.breakdownValue, styles.premiumText]}>{valueBreakdown.mint_premium}</Text>
                        </View>
                      )}

                      {valueBreakdown.key_factors && valueBreakdown.key_factors.length > 0 && (
                        <View style={styles.keyFactorsSection}>
                          <Text style={styles.keyFactorsTitle}>Key factors:</Text>
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
                      <Text style={styles.notesLabel}>About this Beanie</Text>
                      <Text style={styles.notesText}>{params.value_notes}</Text>
                    </View>
                  )}

                  {/* Value Factors Applied */}
                  {followUpAnswers && (
                    <View style={styles.factorsContainer}>
                      <Text style={styles.factorsTitle}>VALUE FACTORS APPLIED</Text>
                      {followUpAnswers.condition && (
                        <Text style={styles.factorItem}>
                          {'\u2022'} Condition: {formatCondition(followUpAnswers.condition)}
                        </Text>
                      )}
                      {followUpAnswers.pellet_type && (
                        <Text style={styles.factorItem}>
                          {'\u2022'} Pellets: {formatPelletType(followUpAnswers.pellet_type)}
                        </Text>
                      )}
                      {followUpAnswers.pellet_type === 'unknown' && (
                        <View style={styles.rangeExplanation}>
                          <Text style={styles.rangeText}>
                            High end assumes rare PVC pellets{'\n'}
                            Low end assumes common PE pellets
                          </Text>
                        </View>
                      )}
                      {followUpAnswers.pellet_type === 'unknown' && (
                        <View style={styles.pelletRangeContainer}>
                          <Text style={styles.pelletRangeTitle}>If pellet type is known:</Text>
                          <Text style={styles.pelletRangeText}>
                            PVC pellets: ${Math.round(baseValueLow * 3)}-$
                            {Math.round(baseValueHigh * 5)}
                          </Text>
                          <Text style={styles.pelletRangeText}>
                            PE pellets: ${baseValueLow}-${baseValueHigh}
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
          {/* Primary button - Magenta gradient */}
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

          {/* Secondary buttons row */}
          <View style={styles.secondaryButtonsRow}>
            {/* Share button (mobile only) */}
            {Platform.OS !== 'web' && (
              <BlurView intensity={40} tint="light" style={[styles.secondaryButtonBlur, styles.flexButton]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.secondaryButtonPressed,
                    isSharing && styles.buttonDisabled,
                  ]}
                  onPress={handleShare}
                  disabled={isSharing}
                >
                  <Text style={styles.secondaryButtonText}>
                    {isSharing ? 'Creating...' : shareButtonText}
                  </Text>
                </Pressable>
              </BlurView>
            )}

            {/* View Collection button */}
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

          {/* Added to collection indicator */}
          {savedToCollection && !isNotBeanie && (
            <Text style={styles.savedIndicator}>Added to collection</Text>
          )}
        </Animated.View>
      </ScrollView>
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
  cardWrapper: {
    marginBottom: 20,
  },
  resultCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  resultCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
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
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
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
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'right',
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
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  factorsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999999',
    letterSpacing: 1,
    marginBottom: 12,
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
  savedIndicator: {
    fontSize: 13,
    color: '#00CED1',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});
