import { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  Platform,
  Share,
  Modal,
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
import { AchievementCertificate } from '../components/AchievementCertificate';

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
  const { collection, unlockedAchievements, checkAndUnlockAchievements, userName } = useCollectionStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [showSharePreview, setShowSharePreview] = useState(false);

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

  // Get recent unlocked achievements for the certificate
  const recentAchievements = useMemo(() => {
    return allAchievements
      .filter(a => unlockedAchievements.includes(a.id))
      .slice(0, 4)
      .map(a => ({ name: a.name, emoji: a.emoji }));
  }, [allAchievements, unlockedAchievements]);

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
              <ScrollView
                style={styles.shareModalScroll}
                contentContainerStyle={styles.shareModalScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Header */}
                <View style={styles.shareModalHeader}>
                  <Text style={styles.shareModalTitle}>Share Achievements</Text>
                  <Pressable onPress={() => setShowSharePreview(false)} style={styles.shareModalClose}>
                    <Text style={styles.shareModalCloseText}>✕</Text>
                  </Pressable>
                </View>

                {/* Certificate Preview */}
                <View style={styles.certificatePreviewContainer}>
                  <View style={styles.certificatePreviewScaler}>
                    <AchievementCertificate
                      unlockedCount={progress.unlocked}
                      totalCount={progress.total}
                      percentage={progress.percentage}
                      recentAchievements={recentAchievements}
                      userName={userName || undefined}
                    />
                  </View>
                </View>

                {/* Share button */}
                <Pressable
                  onPress={async () => {
                    try {
                      await Share.share({
                        message: `🏆 My Bean Bye Achievements\n\n${progress.unlocked} / ${progress.total} unlocked (${progress.percentage}%)!\n\nTracking my Beanie Baby collection with Bean Bye! 📦`,
                      });
                      setShowSharePreview(false);
                    } catch (error) {
                      // Silently fail
                    }
                  }}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.shareModalButton}
                  >
                    <Text style={styles.shareModalButtonText}>📤 Share Now</Text>
                  </LinearGradient>
                </Pressable>
              </ScrollView>
            </BlurView>
          </Pressable>
        </Pressable>
      </Modal>

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
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {progress.unlocked} / {progress.total} ({progress.percentage}%)
                </Text>
                <Pressable
                  onPress={() => setShowSharePreview(true)}
                  style={styles.shareBtn}
                >
                  <Text style={styles.shareBtnText}>📤 Share</Text>
                </Pressable>
              </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  shareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 206, 209, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 209, 0.3)',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00A5A5',
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
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.85)',
    gap: 12,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
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
  shareModalScroll: {
    maxHeight: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  shareModalScrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    transform: [{ scale: 0.75 }],
    marginVertical: -30,
  },
  shareModalButton: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  shareModalButtonText: {
    color: '#1a1a2e',
    fontSize: 17,
    fontWeight: '600',
  },
});
