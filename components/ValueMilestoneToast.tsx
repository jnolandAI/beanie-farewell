import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Pressable, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export interface ValueMilestone {
  value: number;
  title: string;
  message: string;
  emoji: string;
  colors: [string, string];
}

export const VALUE_MILESTONES: ValueMilestone[] = [
  {
    value: 50,
    title: 'HALF BENJAMIN!',
    message: 'Your collection hit $50!',
    emoji: '💵',
    colors: ['#00CED1', '#00A5A8'],
  },
  {
    value: 100,
    title: 'TRIPLE DIGITS!',
    message: 'Your collection is worth $100+!',
    emoji: '💰',
    colors: ['#8B5CF6', '#6366F1'],
  },
  {
    value: 250,
    title: 'QUARTER GRAND!',
    message: '$250! Not bad for stuffed animals!',
    emoji: '🤑',
    colors: ['#FF6B35', '#FF8C00'],
  },
  {
    value: 500,
    title: 'HALF A GRAND!',
    message: '$500! Your attic is paying off!',
    emoji: '💎',
    colors: ['#FF00FF', '#FF1493'],
  },
  {
    value: 1000,
    title: 'FOUR FIGURES!',
    message: '$1,000! Wait, seriously?!',
    emoji: '🏆',
    colors: ['#FFD700', '#FFA500'],
  },
  {
    value: 2500,
    title: 'MAJOR FIND!',
    message: '$2,500! This is getting real!',
    emoji: '👑',
    colors: ['#FF00FF', '#8B5CF6'],
  },
  {
    value: 5000,
    title: 'JACKPOT!',
    message: '$5,000! Your mom was right!',
    emoji: '🎰',
    colors: ['#FFD700', '#FF00FF'],
  },
  {
    value: 10000,
    title: 'LEGENDARY!',
    message: '$10,000! This is insane!',
    emoji: '🌟',
    colors: ['#FFD700', '#FFA500'],
  },
];

interface ValueMilestoneToastProps {
  milestone: ValueMilestone;
  onDismiss: () => void;
}

export function ValueMilestoneToast({ milestone, onDismiss }: ValueMilestoneToastProps) {
  const slideAnim = useRef(new Animated.Value(-160)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const dollarPulse = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${milestone.emoji} ${milestone.title}\n\n${milestone.message}\n\nMy Beanie Baby collection just hit $${milestone.value.toLocaleString()}! 💰\n\nFind out what yours is worth with Bean Bye! 📦`,
      });
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (milestone.value >= 500) {
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
      }
    }

    // Slide in with bounce
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Dollar pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dollarPulse, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dollarPulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -160,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, milestone.value >= 1000 ? 5000 : 4000);

    return () => clearTimeout(timer);
  }, [slideAnim, scaleAnim, dollarPulse, shimmerAnim, milestone.value, onDismiss]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
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
        },
      ]}
    >
      <LinearGradient
        colors={milestone.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Shimmer overlay */}
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerTranslate }] }
          ]}
        />

        <View style={styles.content}>
          {/* Big emoji */}
          <Animated.Text style={[styles.emoji, { transform: [{ scale: dollarPulse }] }]}>
            {milestone.emoji}
          </Animated.Text>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{milestone.title}</Text>
            <Text style={styles.message}>{milestone.message}</Text>
          </View>

          {/* Value badge */}
          <View style={styles.valueBadge}>
            <Text style={styles.valueAmount}>${milestone.value.toLocaleString()}</Text>
            <Text style={styles.valueLabel}>REACHED</Text>
          </View>

          {/* Share button */}
          <Pressable onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>📤</Text>
          </Pressable>
        </View>

        {/* Money decorations */}
        <View style={styles.moneyRow}>
          <Text style={styles.miniMoney}>💵</Text>
          <Text style={styles.miniMoney}>💰</Text>
          <Text style={styles.miniMoney}>💵</Text>
          <Text style={styles.miniMoney}>💰</Text>
          <Text style={styles.miniMoney}>💵</Text>
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
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 14,
  },
  gradient: {
    padding: 18,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 100,
    transform: [{ skewX: '-20deg' }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emoji: {
    fontSize: 44,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 3,
  },
  valueBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  valueAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  valueLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
    marginTop: 2,
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  shareBtnText: {
    fontSize: 18,
  },
  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
  miniMoney: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default ValueMilestoneToast;
