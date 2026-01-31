import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Pressable, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export interface CollectionMilestone {
  count: number;
  title: string;
  emoji: string;
  message: string;
  color: string;
}

// Milestone definitions
export const COLLECTION_MILESTONES: CollectionMilestone[] = [
  { count: 5, title: 'First Five!', emoji: '5️⃣', message: "You're officially a collector now!", color: '#00CED1' },
  { count: 10, title: 'Double Digits!', emoji: '🔟', message: "Ten Beanies deep. No turning back.", color: '#8B5CF6' },
  { count: 25, title: 'Quarter Century!', emoji: '🏆', message: "25 Beanies! You're committed.", color: '#FF6B35' },
  { count: 50, title: 'Half Hundred!', emoji: '🎪', message: "50 Beanies! That's a real collection.", color: '#FF1493' },
  { count: 100, title: 'Centurion!', emoji: '💯', message: "100 BEANIES! Absolute legend.", color: '#FF00FF' },
];

interface MilestoneToastProps {
  milestone: CollectionMilestone;
  onDismiss: () => void;
}

export function MilestoneToast({ milestone, onDismiss }: MilestoneToastProps) {
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const emojiPulse = useRef(new Animated.Value(1)).current;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${milestone.emoji} ${milestone.title}\n\n${milestone.message}\n\nI just hit ${milestone.count} Beanie Babies in my collection! 🎉\n\nTracking my collection with Bean Bye! 📦`,
      });
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Slide in with bounce
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

    // Pulsing emoji
    Animated.loop(
      Animated.sequence([
        Animated.timing(emojiPulse, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(emojiPulse, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto dismiss after 4 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, 4000);

    return () => clearTimeout(timer);
  }, [slideAnim, scaleAnim, emojiPulse, onDismiss]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[milestone.color, `${milestone.color}DD`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Milestone badge */}
          <View style={styles.badge}>
            <View style={styles.countCircle}>
              <Text style={styles.countText}>{milestone.count}</Text>
            </View>
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Animated.Text style={[styles.emoji, { transform: [{ scale: emojiPulse }] }]}>
                {milestone.emoji}
              </Animated.Text>
              <Text style={styles.title}>{milestone.title}</Text>
            </View>
            <Text style={styles.message}>{milestone.message}</Text>
          </View>

          {/* Share button */}
          <Pressable onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>📤</Text>
          </Pressable>

          {/* Decorative stars */}
          <View style={styles.stars}>
            <Text style={styles.star}>⭐</Text>
            <Text style={[styles.star, styles.starSmall]}>✨</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a2e',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  emoji: {
    fontSize: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  shareBtnText: {
    fontSize: 18,
  },
  stars: {
    position: 'absolute',
    top: -4,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 16,
  },
  starSmall: {
    fontSize: 12,
    marginTop: 8,
  },
});

export default MilestoneToast;
