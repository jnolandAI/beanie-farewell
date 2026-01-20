import { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { useCollectionStore } from '../lib/store';
import {
  getAllAchievements,
  getAchievementProgress,
  ACHIEVEMENT_CATEGORIES,
  Achievement,
} from '../lib/achievements';

// Memphis Pattern
function MemphisPattern() {
  return (
    <Svg style={styles.memphisPattern} viewBox="0 0 390 844">
      {/* Gold star - top center */}
      <Path
        d="M195 30 L200 50 L220 50 L205 62 L210 82 L195 70 L180 82 L185 62 L170 50 L190 50 Z"
        fill="#FFD700"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* Purple circle - top left */}
      <Circle
        cx="50"
        cy="100"
        r="16"
        fill="#8B5CF6"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Teal triangle - top right */}
      <Polygon
        points="340,60 370,110 310,110"
        fill="#00CED1"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Orange circle - bottom left */}
      <Circle
        cx="45"
        cy="700"
        r="14"
        fill="#FF6B35"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Magenta squiggle */}
      <Path
        d="M300 720 Q325 690, 350 720 Q375 750, 400 720"
        stroke="#FF00FF"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Black dots */}
      <Circle cx="60" cy="400" r="4" fill="#000000" />
      <Circle cx="75" cy="410" r="4" fill="#000000" />
      <Circle cx="50" cy="415" r="4" fill="#000000" />

      {/* Gold zigzag */}
      <Path
        d="M340 400 L355 375 L370 400 L385 375"
        stroke="#FFD700"
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Achievement card component
function AchievementCard({
  achievement,
  isUnlocked,
  index,
}: {
  achievement: Achievement;
  isUnlocked: boolean;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  const categoryInfo = ACHIEVEMENT_CATEGORIES[achievement.category];

  return (
    <Animated.View
      style={[
        styles.achievementCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <BlurView intensity={30} tint="light" style={styles.achievementBlur}>
        <View
          style={[
            styles.achievementInner,
            !isUnlocked && styles.achievementLocked,
          ]}
        >
          <View
            style={[
              styles.achievementEmoji,
              { backgroundColor: isUnlocked ? `${categoryInfo.color}20` : '#E8E8E8' },
            ]}
          >
            <Text style={[styles.emojiText, !isUnlocked && styles.emojiLocked]}>
              {isUnlocked ? achievement.emoji : '🔒'}
            </Text>
          </View>
          <View style={styles.achievementInfo}>
            <Text
              style={[
                styles.achievementName,
                !isUnlocked && styles.achievementNameLocked,
              ]}
            >
              {achievement.name}
            </Text>
            <Text
              style={[
                styles.achievementDesc,
                !isUnlocked && styles.achievementDescLocked,
              ]}
            >
              {achievement.description}
            </Text>
          </View>
          {isUnlocked && (
            <View style={[styles.checkmark, { backgroundColor: categoryInfo.color }]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
}

export default function AchievementsScreen() {
  const { collection, unlockedAchievements, checkAndUnlockAchievements } = useCollectionStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Check for any new achievements on mount
  useEffect(() => {
    checkAndUnlockAchievements();
  }, [checkAndUnlockAchievements]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const allAchievements = useMemo(
    () => getAllAchievements(unlockedAchievements),
    [unlockedAchievements]
  );

  const progress = useMemo(
    () => getAchievementProgress(collection, unlockedAchievements),
    [collection, unlockedAchievements]
  );

  // Group achievements by category
  const achievementsByCategory = useMemo(() => {
    const grouped: Record<string, Achievement[]> = {};
    allAchievements.forEach((achievement) => {
      if (!grouped[achievement.category]) {
        grouped[achievement.category] = [];
      }
      grouped[achievement.category].push(achievement);
    });
    return grouped;
  }, [allAchievements]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      <MemphisPattern />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <BlurView intensity={40} tint="light" style={styles.headerBlur}>
          <View style={styles.headerInner}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>

            <Text style={styles.headerTitle}>🏆 Achievements</Text>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress.unlocked} / {progress.total} ({progress.percentage}%)
              </Text>
            </View>
          </View>
        </BlurView>
      </Animated.View>

      {/* Achievements list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(achievementsByCategory).map(([category, achievements]) => {
          const categoryInfo = ACHIEVEMENT_CATEGORIES[category as keyof typeof ACHIEVEMENT_CATEGORIES];
          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
                <Text style={[styles.categoryTitle, { color: categoryInfo.color }]}>
                  {categoryInfo.name}
                </Text>
              </View>

              {achievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={unlockedAchievements.includes(achievement.id)}
                  index={index}
                />
              ))}
            </View>
          );
        })}

        {/* Empty state hint */}
        {progress.unlocked === 0 && (
          <View style={styles.emptyHint}>
            <Text style={styles.emptyHintEmoji}>💡</Text>
            <Text style={styles.emptyHintText}>
              Scan your first Beanie Baby to start unlocking achievements!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Scan button */}
      <Animated.View
        style={[styles.footer, { opacity: fadeAnim }]}
      >
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push('/scan');
          }}
        >
          <LinearGradient
            colors={['#FF00FF', '#FF1493']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanButton}
          >
            <Text style={styles.scanButtonText}>Scan to Unlock More</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
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
    opacity: 0.4,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    marginBottom: 8,
    zIndex: 10,
  },
  headerBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#00CED1',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  achievementCard: {
    marginBottom: 8,
  },
  achievementBlur: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  achievementInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    gap: 12,
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementEmoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  emojiLocked: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  achievementNameLocked: {
    color: '#999',
  },
  achievementDesc: {
    fontSize: 13,
    color: '#666',
  },
  achievementDescLocked: {
    color: '#AAA',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyHint: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyHintEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyHintText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
  },
  scanButton: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
});
