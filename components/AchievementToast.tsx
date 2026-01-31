import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Platform,
  Share,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Achievement, ACHIEVEMENT_CATEGORIES } from '../lib/achievements';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  onShare?: () => void;
}

export function AchievementToast({ achievement, onDismiss, onShare }: AchievementToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const categoryInfo = ACHIEVEMENT_CATEGORIES[achievement.category];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🏆 Achievement Unlocked: ${achievement.name}!\n\n${achievement.emoji} ${achievement.description}\n\nTracking my Beanie Baby collection with Bean Bye! 📦`,
      });
      if (onShare) onShare();
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    // Haptic feedback on show
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Animate in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 150,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
      }),
    ]).start();

    // Auto dismiss after 4 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [slideAnim, opacityAnim, scaleAnim]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable onPress={handleDismiss}>
        <BlurView intensity={60} tint="light" style={styles.blur}>
          <View style={[styles.inner, { borderColor: `${categoryInfo.color}40` }]}>
            {/* Achievement icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${categoryInfo.color}20` }]}>
              <Text style={styles.emoji}>{achievement.emoji}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.unlockLabel}>ACHIEVEMENT UNLOCKED!</Text>
              <Text style={styles.name}>{achievement.name}</Text>
              <Text style={styles.description}>{achievement.description}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable onPress={handleShare} style={styles.shareBtn}>
                <Text style={styles.shareBtnText}>📤</Text>
              </Pressable>
              <View style={[styles.checkmark, { backgroundColor: categoryInfo.color }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  blur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  unlockLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 206, 209, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 209, 0.3)',
  },
  shareBtnText: {
    fontSize: 16,
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
});
