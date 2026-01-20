import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export interface StreakMilestone {
  days: number;
  title: string;
  message: string;
  emoji: string;
  colors: [string, string];
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 7,
    title: 'WEEK WARRIOR!',
    message: '7 days straight! You\'re on fire!',
    emoji: '🔥',
    colors: ['#FF6B35', '#FF8C00'],
  },
  {
    days: 14,
    title: 'FORTNIGHT FANATIC!',
    message: '2 weeks strong! Unstoppable!',
    emoji: '⚡',
    colors: ['#8B5CF6', '#FF00FF'],
  },
  {
    days: 30,
    title: 'MONTHLY MASTER!',
    message: '30 days! You\'re a legend!',
    emoji: '👑',
    colors: ['#FFD700', '#FFA500'],
  },
  {
    days: 60,
    title: 'BEANIE OBSESSED!',
    message: '60 days! This is your calling!',
    emoji: '🌟',
    colors: ['#FF00FF', '#00CED1'],
  },
  {
    days: 100,
    title: 'CENTURY CLUB!',
    message: '100 DAYS! Absolutely legendary!',
    emoji: '💎',
    colors: ['#00CED1', '#8B5CF6'],
  },
];

interface StreakMilestoneToastProps {
  milestone: StreakMilestone;
  onDismiss: () => void;
}

export function StreakMilestoneToast({ milestone, onDismiss }: StreakMilestoneToastProps) {
  const slideAnim = useRef(new Animated.Value(-180)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const emojiPulse = useRef(new Animated.Value(1)).current;
  const starRotate = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Heavy haptic feedback for milestone
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 150);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
    }

    // Slide in with dramatic bounce
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // Emoji pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(emojiPulse, {
          toValue: 1.3,
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

    // Star rotation
    Animated.loop(
      Animated.timing(starRotate, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto dismiss after 5 seconds (longer for milestone celebration)
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -180,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.7,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, 5000);

    return () => clearTimeout(timer);
  }, [slideAnim, scaleAnim, emojiPulse, starRotate, glowAnim, onDismiss]);

  const spin = starRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          shadowOpacity: glowAnim,
        },
      ]}
    >
      <LinearGradient
        colors={milestone.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative stars */}
        <View style={styles.starsContainer}>
          <Animated.Text style={[styles.decorStar, styles.starLeft, { transform: [{ rotate: spin }] }]}>
            ✨
          </Animated.Text>
          <Animated.Text style={[styles.decorStar, styles.starRight, { transform: [{ rotate: spin }] }]}>
            ⭐
          </Animated.Text>
        </View>

        <View style={styles.content}>
          {/* Big emoji */}
          <Animated.Text style={[styles.emoji, { transform: [{ scale: emojiPulse }] }]}>
            {milestone.emoji}
          </Animated.Text>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{milestone.title}</Text>
            <Text style={styles.message}>{milestone.message}</Text>
          </View>

          {/* Days badge */}
          <View style={styles.daysBadge}>
            <Text style={styles.daysNumber}>{milestone.days}</Text>
            <Text style={styles.daysLabel}>DAYS</Text>
          </View>
        </View>

        {/* Flame decorations for fire milestone */}
        <View style={styles.flameRow}>
          <Text style={styles.miniFlame}>🔥</Text>
          <Text style={styles.miniFlame}>🔥</Text>
          <Text style={styles.miniFlame}>🔥</Text>
          <Text style={styles.miniFlame}>🔥</Text>
          <Text style={styles.miniFlame}>🔥</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 15,
  },
  gradient: {
    padding: 20,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorStar: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.6,
  },
  starLeft: {
    top: 12,
    left: 12,
  },
  starRight: {
    top: 12,
    right: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emoji: {
    fontSize: 48,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 4,
  },
  daysBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  daysNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  daysLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
  flameRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  miniFlame: {
    fontSize: 14,
    opacity: 0.8,
  },
});

export default StreakMilestoneToast;
