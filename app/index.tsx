import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, Dimensions, Image, ScrollView, Share, Modal } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { useCollectionStore } from '../lib/store';
import { calculateLevel } from '../lib/challenges';
import { getBeanieOfTheDay } from '../lib/humor';
import { LoginBonusToast } from '../components/LoginBonusToast';
import { TierDistributionChart } from '../components/TierDistributionChart';
import { StreakMilestoneToast, StreakMilestone } from '../components/StreakMilestoneToast';
import { CollectionCertificate } from '../components/CollectionCertificate';
import { FarewellCertificate } from '../components/FarewellCertificate';

// Main app icon (elephant from tier 1)
const mainIcon = require('../assets/icons/icon-tier1.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Carousel card dimensions
const CARD_WIDTH = 130;
const CARD_MARGIN = 10;
const CARD_TOTAL_WIDTH = CARD_WIDTH + CARD_MARGIN * 2;

// Memphis Pattern SVG overlay - Bold 90s Trapper Keeper/Jazz Cup style
function MemphisPattern() {
  return (
    <Svg style={styles.memphisPattern} viewBox="0 0 390 844">
      {/* === FILLED SHAPES WITH BLACK OUTLINES (KEY 90s ELEMENT) === */}

      {/* Yellow triangle with black outline - TOP */}
      <Polygon
        points="55,30 95,90 15,90"
        fill="#FFD700"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Orange circle with black outline */}
      <Circle
        cx="330"
        cy="150"
        r="18"
        fill="#FF6B35"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Teal triangle with black outline */}
      <Polygon
        points="340,380 375,450 305,450"
        fill="#00CED1"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Purple circle with black outline - lower */}
      <Circle
        cx="60"
        cy="620"
        r="16"
        fill="#8B5CF6"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* === BLACK OUTLINE ONLY SHAPES === */}

      {/* Black outline triangle */}
      <Polygon
        points="300,60 330,110 270,110"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black outline circle */}
      <Circle
        cx="70"
        cy="200"
        r="14"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black outline square/diamond */}
      <Polygon
        points="330,550 350,570 330,590 310,570"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* === BOLD SQUIGGLES === */}

      {/* Black squiggle - very 90s */}
      <Path
        d="M240 35 Q260 10, 280 35 Q300 60, 320 35"
        stroke="#000000"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Teal squiggle */}
      <Path
        d="M25 320 Q50 290, 75 320 Q100 350, 125 320"
        stroke="#00CED1"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Teal squiggle */}
      <Path
        d="M270 700 Q295 670, 320 700 Q345 730, 370 700"
        stroke="#00CED1"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* === LIGHTNING BOLT === */}
      <Path
        d="M150 90 L165 125 L145 125 L160 160"
        stroke="#FFD700"
        strokeWidth="5"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* === ZIGZAG (Classic 90s) === */}
      <Path
        d="M40 480 L55 455 L70 480 L85 455 L100 480"
        stroke="#8B5CF6"
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* === SMALL ACCENTS === */}

      {/* Orange filled circle - small pop */}
      <Circle cx="100" cy="720" r="10" fill="#FF6B35" />

      {/* Yellow circle with black outline - added for color balance */}
      <Circle
        cx="80"
        cy="420"
        r="12"
        fill="#FFD700"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black dots cluster */}
      <Circle cx="320" cy="250" r="4" fill="#000000" />
      <Circle cx="335" cy="260" r="4" fill="#000000" />
      <Circle cx="310" cy="265" r="4" fill="#000000" />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonGlow = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  // Carousel scroll position for 3D effect
  const carouselScrollX = useRef(new Animated.Value(0)).current;

  // Shimmer animation for cards
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Collection store
  const { getItemCount, isHydrated, hasCompletedOnboarding, unlockedAchievements, getStreak, getDailyChallenge, totalXP, collection, checkDailyLoginBonus, pendingLoginBonus, clearPendingLoginBonus, pendingStreakMilestone, clearPendingStreakMilestone, longestStreak, userName } = useCollectionStore();

  // Login bonus toast state
  const [showLoginBonus, setShowLoginBonus] = useState<{ xp: number; streak: number } | null>(null);
  // Streak milestone toast state
  const [showStreakMilestone, setShowStreakMilestone] = useState<StreakMilestone | null>(null);
  // Share preview modal state
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [selectedShareTemplate, setSelectedShareTemplate] = useState(0);
  const collectionCount = isHydrated ? getItemCount() : 0;
  const achievementCount = unlockedAchievements?.length || 0;
  const currentStreak = isHydrated ? getStreak() : 0;
  const dailyChallenge = isHydrated ? getDailyChallenge() : null;
  const levelInfo = isHydrated ? calculateLevel(totalXP) : null;

  // Best find in collection
  const bestFind = isHydrated && collection.length > 0
    ? collection.reduce((best, item) => {
        const itemValue = item.adjusted_value_high ?? item.estimated_value_high;
        const bestValue = best.adjusted_value_high ?? best.estimated_value_high;
        return itemValue > bestValue ? item : best;
      }, collection[0])
    : null;

  // Total collection value (high and low)
  const totalValueHigh = isHydrated && collection.length > 0
    ? collection.reduce((sum, item) => sum + (item.adjusted_value_high ?? item.estimated_value_high), 0)
    : 0;
  const totalValueLow = isHydrated && collection.length > 0
    ? collection.reduce((sum, item) => sum + (item.adjusted_value_low ?? item.estimated_value_low), 0)
    : 0;

  // Top items for collection certificate (sorted by value, top 3)
  const topItems = isHydrated && collection.length > 0
    ? [...collection]
        .sort((a, b) => {
          const aVal = a.adjusted_value_high ?? a.estimated_value_high;
          const bVal = b.adjusted_value_high ?? b.estimated_value_high;
          return bVal - aVal;
        })
        .slice(0, 3)
        .map(item => ({
          name: item.name,
          valueLow: item.adjusted_value_low ?? item.estimated_value_low,
          valueHigh: item.adjusted_value_high ?? item.estimated_value_high,
        }))
    : [];

  // Get tier for best find
  const getBestFindTier = () => {
    if (!bestFind) return 1;
    const value = bestFind.adjusted_value_high ?? bestFind.estimated_value_high;
    if (value >= 1000) return 5;
    if (value >= 200) return 4;
    if (value >= 50) return 3;
    if (value >= 10) return 2;
    return 1;
  };

  // Share templates
  const shareTemplates = [
    {
      id: 'collection',
      label: 'Collection',
      emoji: '📦',
      message: `📦 My Beanie Baby Collection\n\n${collectionCount} Beanies scanned\n💰 Total value: $${totalValueHigh.toLocaleString()}\n\nFind out what yours are worth with Bean Bye! 🧸`,
    },
    ...(bestFind ? [{
      id: 'bestfind',
      label: 'Best Find',
      emoji: '💎',
      message: `💎 Look what I found!\n\n${bestFind.name} - worth $${(bestFind.adjusted_value_high ?? bestFind.estimated_value_high).toLocaleString()}!\n\nScanning my Beanie Baby collection with Bean Bye! 🧸`,
    }] : []),
  ];

  // Today's stats
  const todaysStats = isHydrated && collection.length > 0 ? (() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysScans = collection.filter(item => {
      const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
      return itemDate === today;
    });
    const todaysValue = todaysScans.reduce((sum, item) =>
      sum + (item.adjusted_value_high ?? item.estimated_value_high), 0);
    const bestToday = todaysScans.length > 0
      ? todaysScans.reduce((best, item) => {
          const itemValue = item.adjusted_value_high ?? item.estimated_value_high;
          const bestValue = best.adjusted_value_high ?? best.estimated_value_high;
          return itemValue > bestValue ? item : best;
        }, todaysScans[0])
      : null;
    return {
      count: todaysScans.length,
      totalValue: todaysValue,
      bestFind: bestToday,
    };
  })() : null;

  // Beanie of the Day
  const beanieOfTheDay = isHydrated && collection.length > 0 ? (() => {
    // First get the index from date
    const dateString = new Date().toISOString().split('T')[0];
    const seed = dateString.split('-').reduce((acc, n) => acc + parseInt(n), 0);
    const index = seed % collection.length;
    const featured = collection[index];
    if (!featured) return null;

    // Now get the greeting and fact using the actual featured beanie
    const botd = getBeanieOfTheDay(
      collection.length,
      featured.name,
      featured.adjusted_value_high ?? featured.estimated_value_high ?? 0
    );

    return {
      ...botd,
      beanie: featured,
    };
  })() : null;

  // Redirect to onboarding if not completed (with delay to ensure navigation is ready)
  useEffect(() => {
    if (isHydrated && !hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        router.replace('/onboarding');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, hasCompletedOnboarding]);

  // Check daily login bonus when store hydrates
  useEffect(() => {
    if (isHydrated && hasCompletedOnboarding) {
      checkDailyLoginBonus();
    }
  }, [isHydrated, hasCompletedOnboarding, checkDailyLoginBonus]);

  // Show login bonus toast when bonus is pending
  useEffect(() => {
    if (pendingLoginBonus && !showLoginBonus) {
      // Small delay for smooth UX
      const timer = setTimeout(() => {
        setShowLoginBonus(pendingLoginBonus);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pendingLoginBonus, showLoginBonus]);

  // Handle login bonus toast dismiss
  const handleLoginBonusDismiss = () => {
    setShowLoginBonus(null);
    clearPendingLoginBonus();
  };

  // Show streak milestone toast when milestone is pending
  useEffect(() => {
    if (pendingStreakMilestone && !showStreakMilestone && !showLoginBonus) {
      // Delay slightly to not overlap with login bonus
      const timer = setTimeout(() => {
        setShowStreakMilestone(pendingStreakMilestone);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pendingStreakMilestone, showStreakMilestone, showLoginBonus]);

  // Handle streak milestone toast dismiss
  const handleStreakMilestoneDismiss = () => {
    setShowStreakMilestone(null);
    clearPendingStreakMilestone();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Start button pulse animation (subtle attention-grabbing effect)
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.03,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonGlow, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonGlow, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start subtle border shimmer animation for carousel cards
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, buttonPulse, buttonGlow, shimmerAnim]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Background gradient - pure white/light gray, NO color tints */}
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Memphis pattern overlay at 40% opacity */}
      <MemphisPattern />

      {/* Login Bonus Toast */}
      {showLoginBonus && (
        <LoginBonusToast
          xp={showLoginBonus.xp}
          streak={showLoginBonus.streak}
          onDismiss={handleLoginBonusDismiss}
        />
      )}

      {/* Streak Milestone Toast */}
      {showStreakMilestone && (
        <StreakMilestoneToast
          milestone={showStreakMilestone}
          onDismiss={handleStreakMilestoneDismiss}
        />
      )}

      {/* Share Preview Modal */}
      <Modal
        visible={showSharePreview}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSharePreview(false)}
      >
        <Pressable
          style={styles.shareModalOverlay}
          onPress={() => setShowSharePreview(false)}
        >
          <Pressable style={styles.shareModalContent} onPress={e => e.stopPropagation()}>
            <BlurView intensity={80} tint="light" style={styles.shareModalBlur}>
              <View style={styles.shareModalInner}>
                {/* Header */}
                <View style={styles.shareModalHeader}>
                  <Text style={styles.shareModalTitle}>Share Your Progress</Text>
                  <Pressable onPress={() => setShowSharePreview(false)} style={styles.shareModalClose}>
                    <Text style={styles.shareModalCloseText}>✕</Text>
                  </Pressable>
                </View>

                {/* Template selector */}
                <View style={styles.shareTemplateSelector}>
                  {shareTemplates.map((template, index) => (
                    <Pressable
                      key={template.id}
                      onPress={() => setSelectedShareTemplate(index)}
                      style={[
                        styles.shareTemplateTab,
                        selectedShareTemplate === index && styles.shareTemplateTabActive,
                      ]}
                    >
                      <Text style={styles.shareTemplateEmoji}>{template.emoji}</Text>
                      <Text style={[
                        styles.shareTemplateLabel,
                        selectedShareTemplate === index && styles.shareTemplateLabelActive,
                      ]}>{template.label}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* Certificate Preview */}
                <View style={styles.certificatePreviewContainer}>
                  <View style={styles.certificatePreviewScaler}>
                    {selectedShareTemplate === 0 && (
                      <CollectionCertificate
                        itemCount={collectionCount}
                        totalValueLow={totalValueLow}
                        totalValueHigh={totalValueHigh}
                        topItems={topItems}
                        userName={userName || undefined}
                      />
                    )}
                    {selectedShareTemplate === 1 && bestFind && (
                      <FarewellCertificate
                        name={bestFind.name}
                        variant={bestFind.variant || 'Standard'}
                        valueLow={bestFind.adjusted_value_low ?? bestFind.estimated_value_low}
                        valueHigh={bestFind.adjusted_value_high ?? bestFind.estimated_value_high}
                        verdictTitle={(bestFind.adjusted_value_high ?? bestFind.estimated_value_high) >= 200 ? "NICE!" : (bestFind.adjusted_value_high ?? bestFind.estimated_value_high) >= 50 ? "NOT BAD" : "MEH"}
                        tier={getBestFindTier()}
                        beanieImage={bestFind.thumbnail}
                        userName={userName || undefined}
                      />
                    )}
                  </View>
                </View>

                {/* Share button */}
                <Pressable
                  onPress={async () => {
                    try {
                      await Share.share({
                        message: shareTemplates[selectedShareTemplate]?.message || '',
                      });
                      setShowSharePreview(false);
                    } catch (error) {
                      // Silently fail
                    }
                  }}
                >
                  <LinearGradient
                    colors={['#00CED1', '#00A5A8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.shareModalButton}
                  >
                    <Text style={styles.shareModalButtonText}>📤 Share Now</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </BlurView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Main content - wrapped in ScrollView for longer content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View
          style={[
            styles.contentInner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
        {/* Main App Icon */}
        <View style={styles.mainIconContainer}>
          <Image source={mainIcon} style={styles.mainIcon} />
        </View>

        {/* Frosted Glass Card */}
        <BlurView intensity={40} tint="light" style={styles.glassCard}>
          <View style={styles.glassCardInner}>
            <Text style={styles.title}>Bean Bye</Text>
            <Text style={styles.tagline}>It's been 25 years. Time for the truth.</Text>

            {/* Description for new users */}
            {collectionCount === 0 && (
              <Text style={styles.description}>
                Find out what your Beanie Babies are actually worth in 2026. Spoiler: probably not millions. But you never know...
              </Text>
            )}
          </View>
        </BlurView>

        {/* 3D Carousel info cards - outside glass card */}
        {isHydrated && collectionCount > 0 && (() => {
              // Build cards array dynamically
              const cards: Array<{ key: string; content: React.ReactNode; onPress?: () => void }> = [];

              if (levelInfo && totalXP > 0) {
                cards.push({
                  key: 'level',
                  onPress: () => router.push('/achievements'),
                  content: (
                    <>
                      <Text style={styles.infoCardTitle}>{levelInfo.emoji} Level</Text>
                      <Text style={styles.infoCardValue}>{levelInfo.level}</Text>
                      <Text style={styles.infoCardSubvalue} numberOfLines={1}>{levelInfo.title}</Text>
                    </>
                  ),
                });
              }

              if (todaysStats && todaysStats.count > 0) {
                cards.push({
                  key: 'today',
                  onPress: () => router.push('/collection'),
                  content: (
                    <>
                      <Text style={styles.infoCardTitle}>📊 Today</Text>
                      <Text style={styles.infoCardValue}>{todaysStats.count}</Text>
                      <Text style={styles.infoCardSubvalue} numberOfLines={1}>${todaysStats.totalValue} found</Text>
                    </>
                  ),
                });
              }

              cards.push({
                key: 'collection',
                onPress: () => router.push('/collection'),
                content: (
                  <>
                    <Text style={styles.infoCardTitle}>📦 Collection</Text>
                    <Text style={styles.infoCardValue}>{collectionCount}</Text>
                    <Text style={styles.infoCardSubvalue}>Beanies</Text>
                  </>
                ),
              });

              if (bestFind) {
                cards.push({
                  key: 'bestFind',
                  onPress: () => router.push({
                    pathname: '/result',
                    params: {
                      name: bestFind.name,
                      animal_type: bestFind.animal_type,
                      variant: bestFind.variant,
                      colors: JSON.stringify(bestFind.colors),
                      estimated_value_low: String(bestFind.estimated_value_low),
                      estimated_value_high: String(bestFind.estimated_value_high),
                      value_notes: bestFind.value_notes,
                      confidence: 'High',
                      has_visible_hang_tag: 'true',
                      fromCollection: 'true',
                      collectionThumbnail: bestFind.thumbnail,
                    },
                  }),
                  content: (
                    <>
                      <Text style={styles.infoCardTitle}>💎 Best Find</Text>
                      <Text style={styles.infoCardValue} numberOfLines={1}>{bestFind.name}</Text>
                      <Text style={styles.infoCardSubvalue} numberOfLines={1}>${bestFind.adjusted_value_high ?? bestFind.estimated_value_high}</Text>
                    </>
                  ),
                });
              }

              if (currentStreak > 0) {
                cards.push({
                  key: 'streak',
                  onPress: () => router.push('/achievements'),
                  content: (
                    <>
                      <Text style={styles.infoCardTitle}>🔥 Streak</Text>
                      <Text style={styles.infoCardValue}>{currentStreak}</Text>
                      <Text style={styles.infoCardSubvalue}>{currentStreak === 1 ? 'day' : 'days'}</Text>
                    </>
                  ),
                });
              }

              if (achievementCount > 0) {
                cards.push({
                  key: 'achievements',
                  onPress: () => router.push('/achievements'),
                  content: (
                    <>
                      <Text style={styles.infoCardTitle}>🏆 Unlocked</Text>
                      <Text style={styles.infoCardValue}>{achievementCount}</Text>
                      <Text style={styles.infoCardSubvalue}>achievements</Text>
                    </>
                  ),
                });
              }

              const centerOffset = (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN;
              // Calculate initial scroll to center (scroll to middle card)
              const middleIndex = Math.floor(cards.length / 2);
              const initialScrollX = middleIndex * CARD_TOTAL_WIDTH;

              return (
                <View style={styles.carouselContainer}>
                  <Animated.ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_TOTAL_WIDTH}
                    decelerationRate="fast"
                    contentContainerStyle={[
                      styles.infoCardsContainer,
                      { paddingHorizontal: centerOffset },
                    ]}
                    contentOffset={{ x: initialScrollX, y: 0 }}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: carouselScrollX } } }],
                      { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                  >
                    {cards.map((card, index) => {
                      const inputRange = [
                        (index - 2) * CARD_TOTAL_WIDTH,
                        (index - 1) * CARD_TOTAL_WIDTH,
                        index * CARD_TOTAL_WIDTH,
                        (index + 1) * CARD_TOTAL_WIDTH,
                        (index + 2) * CARD_TOTAL_WIDTH,
                      ];

                      const scale = carouselScrollX.interpolate({
                        inputRange,
                        outputRange: [0.8, 0.9, 1.05, 0.9, 0.8],
                        extrapolate: 'clamp',
                      });

                      const opacity = carouselScrollX.interpolate({
                        inputRange,
                        outputRange: [0.5, 0.7, 1, 0.7, 0.5],
                        extrapolate: 'clamp',
                      });

                      const translateY = carouselScrollX.interpolate({
                        inputRange,
                        outputRange: [10, 5, -5, 5, 10],
                        extrapolate: 'clamp',
                      });

                      // Border shimmer opacity - more visible
                      const borderOpacity = shimmerAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.2, 1, 0.2],
                      });

                      const CardWrapper = card.onPress ? Pressable : View;

                      return (
                        <Animated.View
                          key={card.key}
                          style={[
                            styles.carouselCardWrapper,
                            {
                              transform: [{ scale }, { translateY }],
                              opacity,
                            },
                          ]}
                        >
                          {/* Subtle border glow */}
                          <Animated.View
                            style={[
                              styles.cardBorderGlow,
                              { opacity: borderOpacity },
                            ]}
                            pointerEvents="none"
                          />
                          <CardWrapper
                            style={styles.infoCard}
                            {...(card.onPress && { onPress: card.onPress })}
                          >
                            {card.content}
                          </CardWrapper>
                        </Animated.View>
                      );
                    })}
                  </Animated.ScrollView>
                </View>
              );
            })()}
      </Animated.View>
      </ScrollView>

      {/* Fixed CTA Section at bottom - always visible */}
      <View style={styles.fixedCtaSection}>
        {/* CTA Button with Pulse Animation */}
        <Animated.View style={[
          styles.ctaButtonWrapper,
          {
            transform: [
              { scale: Animated.multiply(buttonScale, buttonPulse) }
            ],
          }
        ]}>
          {/* Glow effect behind button */}
          <Animated.View style={[
            styles.ctaButtonGlow,
            {
              opacity: buttonGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
              transform: [{
                scale: buttonGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.15],
                }),
              }],
            }
          ]} />
          <Pressable
            onPress={() => router.push('/scan')}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <LinearGradient
              colors={['#FF00FF', '#FF1493']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>{collectionCount > 0 ? 'Continue My Farewell' : 'Begin My Farewell'}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Secondary actions row */}
        <View style={styles.secondaryActions}>
          <Pressable
            onPress={() => router.push('/search')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>🔍 Search</Text>
          </Pressable>

          {collectionCount > 0 && (
            <Pressable
              onPress={() => router.push('/collection')}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>📦 Collection</Text>
            </Pressable>
          )}

          {collectionCount > 0 && (
            <Pressable
              onPress={() => setShowSharePreview(true)}
              style={styles.shareButton}
            >
              <Text style={styles.shareButtonText}>📤 Share</Text>
            </Pressable>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footerTextCompact}>
          No Beanies were harmed in the making of this app.
        </Text>
      </View>
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
    opacity: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: 20,
  },
  contentInner: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  mainIconContainer: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  mainIcon: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    maxWidth: 340,
    width: '100%',
  },
  glassCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    padding: 32,
    paddingHorizontal: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderTopColor: 'rgba(255, 255, 255, 0.85)',
    borderLeftColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00CED1',
    marginBottom: 16,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
  },
  ctaButtonWrapper: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#FF00FF',
  },
  ctaButton: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  searchLink: {
    marginTop: 12,
    paddingVertical: 8,
  },
  searchLinkText: {
    color: '#00CED1',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
  // 3D Carousel styles
  carouselContainer: {
    marginTop: 16,
    marginBottom: 16,
    height: 175,
  },
  infoCardsContainer: {
    alignItems: 'center',
  },
  carouselCardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    padding: 12,
    paddingVertical: 18,
    width: CARD_WIDTH,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftColor: 'rgba(255, 255, 255, 0.9)',
    // Liquid glass shadow effect
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoCardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  infoCardSubvalue: {
    fontSize: 11,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  cardBorderGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: 'rgba(255, 255, 255, 0.9)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  // Fixed CTA section at bottom
  fixedCtaSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555',
  },
  shareButton: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 206, 209, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 206, 209, 0.5)',
    shadowColor: '#00CED1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00A5A5',
  },
  footerTextCompact: {
    fontSize: 11,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 12,
  },
  // Share Modal styles
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  shareModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  shareModalBlur: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  shareModalInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  shareModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareModalCloseText: {
    fontSize: 16,
    color: '#666',
  },
  shareTemplateSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  shareTemplateTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    gap: 4,
  },
  shareTemplateTabActive: {
    backgroundColor: 'rgba(0, 206, 209, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 206, 209, 0.4)',
  },
  shareTemplateEmoji: {
    fontSize: 20,
  },
  shareTemplateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  shareTemplateLabelActive: {
    color: '#00A5A5',
  },
  certificatePreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  certificatePreviewScaler: {
    transform: [{ scale: 0.85 }],
    marginVertical: -20,
  },
  shareModalButton: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#00CED1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  shareModalButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  flexButton: {
    flex: 1,
  },
  collectionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(0, 206, 209, 0.3)',
  },
  collectionButtonText: {
    color: '#00CED1',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  shareBestButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  shareBestButtonText: {
    color: '#DAA520',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementsButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  achievementsButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Level styles
  levelSection: {
    width: '100%',
    marginBottom: 12,
    gap: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 10,
  },
  levelEmoji: {
    fontSize: 28,
  },
  levelInfo: {
    alignItems: 'flex-start',
  },
  levelNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  xpProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  xpProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpProgressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    minWidth: 60,
    textAlign: 'right',
  },

  // Streak & Challenge styles
  streakSection: {
    width: '100%',
    marginBottom: 16,
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  flamesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 4,
  },
  streakFlame: {
    marginHorizontal: -2,
  },
  flameTiny: {
    fontSize: 12,
    opacity: 0.6,
  },
  flameSmall: {
    fontSize: 16,
    opacity: 0.8,
  },
  flameMedium: {
    fontSize: 20,
    opacity: 0.9,
  },
  flameLarge: {
    fontSize: 28,
  },
  streakNumberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakCount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF6B35',
  },
  streakCountHot: {
    color: '#FF4500',
  },
  streakCountOnFire: {
    color: '#FF0000',
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  challengeCardCompleted: {
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderColor: 'rgba(0, 206, 209, 0.3)',
  },
  challengeEmoji: {
    fontSize: 24,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  challengeDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  challengeXP: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD700',
  },
  challengeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00CED1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeCheckText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },

  // Today's Stats Widget styles
  todayStatsCard: {
    width: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  todayStatsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  todayStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayStatItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  todayStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  todayStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  todayStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  todayStatEmoji: {
    fontSize: 18,
  },
  todayStatBest: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
    marginTop: 2,
    maxWidth: 70,
  },

  // Beanie of the Day styles
  beanieOfTheDayCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  beanieOfTheDayHeader: {
    marginBottom: 10,
  },
  beanieOfTheDayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  beanieOfTheDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  beanieOfTheDayImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  beanieOfTheDayPlaceholder: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beanieOfTheDayPlaceholderText: {
    fontSize: 24,
  },
  beanieOfTheDayInfo: {
    flex: 1,
  },
  beanieOfTheDayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  beanieOfTheDayFact: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },

  // Tier Chart styles
  tierChartContainer: {
    width: '100%',
    marginBottom: 16,
  },

  // Personal Records styles
  personalRecordsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  personalRecordsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DAA520',
    marginBottom: 12,
    textAlign: 'center',
  },
  personalRecordsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  personalRecordItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  personalRecordEmoji: {
    fontSize: 24,
  },
  personalRecordInfo: {
    flex: 1,
  },
  personalRecordLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  personalRecordValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 2,
  },
  personalRecordSubvalue: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    marginTop: 1,
  },
  recordActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});
