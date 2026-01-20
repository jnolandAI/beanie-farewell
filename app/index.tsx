import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';
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

// Main app icon (elephant from tier 1)
const mainIcon = require('../assets/icons/icon-tier1.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  // Collection store
  const { getItemCount, isHydrated, hasCompletedOnboarding, unlockedAchievements, getStreak, getDailyChallenge, totalXP, collection, checkDailyLoginBonus, pendingLoginBonus, clearPendingLoginBonus, pendingStreakMilestone, clearPendingStreakMilestone, longestStreak } = useCollectionStore();

  // Login bonus toast state
  const [showLoginBonus, setShowLoginBonus] = useState<{ xp: number; streak: number } | null>(null);
  // Streak milestone toast state
  const [showStreakMilestone, setShowStreakMilestone] = useState<StreakMilestone | null>(null);
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
  }, [fadeAnim, slideAnim, buttonPulse, buttonGlow]);

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

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
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
            <Text style={styles.title}>Beanie Farewell</Text>
            <Text style={styles.tagline}>It's been 25 years. Time for the truth.</Text>

            {/* Level & Streak Section */}
            {isHydrated && levelInfo && totalXP > 0 && (
              <View style={styles.levelSection}>
                {/* Level Badge */}
                <View style={[styles.levelBadge, { borderColor: levelInfo.color }]}>
                  <Text style={styles.levelEmoji}>{levelInfo.emoji}</Text>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelNumber}>Lvl {levelInfo.level}</Text>
                    <Text style={[styles.levelTitle, { color: levelInfo.color }]}>{levelInfo.title}</Text>
                  </View>
                </View>
                {/* XP Progress Bar */}
                <View style={styles.xpProgressContainer}>
                  <View style={styles.xpProgressBar}>
                    <View style={[styles.xpProgressFill, { width: `${levelInfo.progress}%`, backgroundColor: levelInfo.color }]} />
                  </View>
                  <Text style={styles.xpProgressText}>{levelInfo.currentXP}/{levelInfo.nextLevelXP} XP</Text>
                </View>
              </View>
            )}

            {/* Streak & Daily Challenge */}
            {isHydrated && (collectionCount > 0 || currentStreak > 0) && (
              <View style={styles.streakSection}>
                {/* Streak Display with Flames */}
                <View style={styles.streakBadge}>
                  <View style={styles.flamesContainer}>
                    {/* More flames for longer streaks */}
                    {currentStreak >= 7 && <Text style={[styles.streakFlame, styles.flameTiny]}>🔥</Text>}
                    {currentStreak >= 5 && <Text style={[styles.streakFlame, styles.flameSmall]}>🔥</Text>}
                    {currentStreak >= 3 && <Text style={[styles.streakFlame, styles.flameMedium]}>🔥</Text>}
                    <Text style={[styles.streakFlame, styles.flameLarge]}>🔥</Text>
                    {currentStreak >= 3 && <Text style={[styles.streakFlame, styles.flameMedium]}>🔥</Text>}
                    {currentStreak >= 5 && <Text style={[styles.streakFlame, styles.flameSmall]}>🔥</Text>}
                    {currentStreak >= 7 && <Text style={[styles.streakFlame, styles.flameTiny]}>🔥</Text>}
                  </View>
                  <View style={styles.streakNumberContainer}>
                    <Text style={[
                      styles.streakCount,
                      currentStreak >= 7 && styles.streakCountHot,
                      currentStreak >= 14 && styles.streakCountOnFire,
                    ]}>{currentStreak}</Text>
                    <Text style={styles.streakLabel}>
                      {currentStreak >= 14 ? '🔥 ON FIRE!' : currentStreak >= 7 ? 'Hot streak!' : 'day streak'}
                    </Text>
                  </View>
                </View>

                {/* Daily Challenge */}
                {dailyChallenge && (
                  <View style={[
                    styles.challengeCard,
                    dailyChallenge.completed && styles.challengeCardCompleted
                  ]}>
                    <Text style={styles.challengeEmoji}>{dailyChallenge.emoji}</Text>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeTitle}>{dailyChallenge.title}</Text>
                      <Text style={styles.challengeDesc}>{dailyChallenge.description}</Text>
                    </View>
                    {dailyChallenge.completed ? (
                      <View style={styles.challengeCheck}>
                        <Text style={styles.challengeCheckText}>✓</Text>
                      </View>
                    ) : (
                      <Text style={styles.challengeXP}>+{dailyChallenge.xpReward} XP</Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Today's Stats Widget */}
            {todaysStats && todaysStats.count > 0 && (
              <View style={styles.todayStatsCard}>
                <Text style={styles.todayStatsTitle}>📊 Today's Activity</Text>
                <View style={styles.todayStatsGrid}>
                  <View style={styles.todayStatItem}>
                    <Text style={styles.todayStatValue}>{todaysStats.count}</Text>
                    <Text style={styles.todayStatLabel}>Scans</Text>
                  </View>
                  <View style={styles.todayStatDivider} />
                  <View style={styles.todayStatItem}>
                    <Text style={styles.todayStatValue}>${todaysStats.totalValue}</Text>
                    <Text style={styles.todayStatLabel}>Found</Text>
                  </View>
                  {todaysStats.bestFind && (
                    <>
                      <View style={styles.todayStatDivider} />
                      <View style={styles.todayStatItem}>
                        <Text style={styles.todayStatEmoji}>⭐</Text>
                        <Text style={styles.todayStatBest} numberOfLines={1}>
                          {todaysStats.bestFind.name}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Tier Distribution Mini Chart */}
            {isHydrated && collection.length >= 3 && (
              <View style={styles.tierChartContainer}>
                <TierDistributionChart collection={collection} compact />
              </View>
            )}

            {/* Personal Records */}
            {isHydrated && (bestFind || longestStreak > 0) && (
              <View style={styles.personalRecordsCard}>
                <Text style={styles.personalRecordsTitle}>🏆 Personal Records</Text>
                <View style={styles.personalRecordsGrid}>
                  {/* Best Find */}
                  {bestFind && (
                    <Pressable
                      style={styles.personalRecordItem}
                      onPress={() => router.push({
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
                      })}
                    >
                      <Text style={styles.personalRecordEmoji}>💎</Text>
                      <View style={styles.personalRecordInfo}>
                        <Text style={styles.personalRecordLabel}>Best Find</Text>
                        <Text style={styles.personalRecordValue} numberOfLines={1}>
                          {bestFind.name}
                        </Text>
                        <Text style={styles.personalRecordSubvalue}>
                          ${bestFind.adjusted_value_high ?? bestFind.estimated_value_high}
                        </Text>
                      </View>
                    </Pressable>
                  )}

                  {/* Longest Streak */}
                  {longestStreak > 0 && (
                    <View style={styles.personalRecordItem}>
                      <Text style={styles.personalRecordEmoji}>🔥</Text>
                      <View style={styles.personalRecordInfo}>
                        <Text style={styles.personalRecordLabel}>Best Streak</Text>
                        <Text style={styles.personalRecordValue}>
                          {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
                        </Text>
                        {currentStreak > 0 && currentStreak < longestStreak && (
                          <Text style={styles.personalRecordSubvalue}>
                            Current: {currentStreak}
                          </Text>
                        )}
                        {currentStreak === longestStreak && currentStreak > 0 && (
                          <Text style={[styles.personalRecordSubvalue, styles.recordActive]}>
                            Active!
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Beanie of the Day */}
            {beanieOfTheDay && (
              <Pressable
                onPress={() => router.push('/collection')}
                style={styles.beanieOfTheDayCard}
              >
                <View style={styles.beanieOfTheDayHeader}>
                  <Text style={styles.beanieOfTheDayLabel}>⭐ {beanieOfTheDay.greeting}</Text>
                </View>
                <View style={styles.beanieOfTheDayContent}>
                  {beanieOfTheDay.beanie.thumbnail ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${beanieOfTheDay.beanie.thumbnail}` }}
                      style={styles.beanieOfTheDayImage}
                    />
                  ) : (
                    <View style={[styles.beanieOfTheDayImage, styles.beanieOfTheDayPlaceholder]}>
                      <Text style={styles.beanieOfTheDayPlaceholderText}>🧸</Text>
                    </View>
                  )}
                  <View style={styles.beanieOfTheDayInfo}>
                    <Text style={styles.beanieOfTheDayName}>{beanieOfTheDay.beanie.name}</Text>
                    <Text style={styles.beanieOfTheDayFact}>{beanieOfTheDay.funFact}</Text>
                  </View>
                </View>
              </Pressable>
            )}

            <Text style={styles.description}>
              Find out what your Beanie Babies are actually worth in 2026. Spoiler: probably not millions. But you never know...
            </Text>

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
                  <Text style={styles.ctaText}>Begin My Farewell</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Search by Name Link */}
            <Pressable
              onPress={() => router.push('/search')}
              style={styles.searchLink}
            >
              <Text style={styles.searchLinkText}>or search by name →</Text>
            </Pressable>

            {/* My Collection Button - only show if collection has items */}
            {collectionCount > 0 && (
              <View style={styles.actionButtonsRow}>
                <Pressable
                  onPress={() => router.push('/collection')}
                  style={[styles.collectionButton, styles.flexButton]}
                >
                  <Text style={styles.collectionButtonText}>
                    📦 Collection ({collectionCount})
                  </Text>
                </Pressable>

                {/* Share Best Find Button */}
                {bestFind && (bestFind.adjusted_value_high ?? bestFind.estimated_value_high) >= 10 && (
                  <Pressable
                    onPress={() => router.push({
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
                        roast: bestFind.roast || '',
                      },
                    })}
                    style={[styles.shareBestButton, styles.flexButton]}
                  >
                    <Text style={styles.shareBestButtonText}>
                      🏆 Share Best
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Achievements Button */}
            <Pressable
              onPress={() => router.push('/achievements')}
              style={styles.achievementsButton}
            >
              <Text style={styles.achievementsButtonText}>
                🏆 Achievements {achievementCount > 0 ? `(${achievementCount})` : ''}
              </Text>
            </Pressable>
          </View>
        </BlurView>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          No dreams were harmed in the making of this app.
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
  content: {
    flex: 1,
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    padding: 32,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 12,
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
