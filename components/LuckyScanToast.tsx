import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface LuckyScanToastProps {
  xp: number;
  multiplier: number;
  onDismiss: () => void;
}

export function LuckyScanToast({ xp, multiplier, onDismiss }: LuckyScanToastProps) {
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const starRotate = useRef(new Animated.Value(0)).current;
  const xpPulse = useRef(new Animated.Value(1)).current;

  // Color based on multiplier
  const getColors = (): [string, string] => {
    if (multiplier >= 5) return ['#FFD700', '#FFA500'];  // Gold
    if (multiplier >= 4) return ['#FF00FF', '#FF1493'];  // Magenta
    if (multiplier >= 3) return ['#8B5CF6', '#6366F1'];  // Purple
    return ['#00CED1', '#00A5A8'];  // Teal
  };

  const getMessage = () => {
    if (multiplier >= 5) return 'LEGENDARY LUCK!';
    if (multiplier >= 4) return 'SUPER LUCKY!';
    if (multiplier >= 3) return 'LUCKY SCAN!';
    return 'BONUS!';
  };

  useEffect(() => {
    // Heavy haptic for lucky bonus
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (multiplier >= 4) {
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
      }
    }

    // Slide in with bounce
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotating star animation
    Animated.loop(
      Animated.timing(starRotate, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // XP pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(xpPulse, {
          toValue: 1.15,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(xpPulse, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto dismiss
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
    }, multiplier >= 4 ? 4000 : 3000);

    return () => clearTimeout(timer);
  }, [slideAnim, scaleAnim, starRotate, xpPulse, multiplier, onDismiss]);

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
        },
      ]}
    >
      <LinearGradient
        colors={getColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Spinning star */}
          <Animated.Text style={[styles.starIcon, { transform: [{ rotate: spin }] }]}>
            {multiplier >= 5 ? '🌟' : multiplier >= 4 ? '⭐' : '✨'}
          </Animated.Text>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{getMessage()}</Text>
            <Text style={styles.multiplierText}>{multiplier}x XP Multiplier!</Text>
          </View>

          {/* XP badge */}
          <Animated.View style={[styles.xpBadge, { transform: [{ scale: xpPulse }] }]}>
            <Text style={styles.xpAmount}>+{xp}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </Animated.View>
        </View>

        {/* Sparkle decorations */}
        <View style={styles.sparkles}>
          <Text style={styles.sparkle}>✨</Text>
          <Text style={[styles.sparkle, styles.sparkleOffset]}>💫</Text>
          <Text style={styles.sparkle}>⭐</Text>
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
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  starIcon: {
    fontSize: 40,
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
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  multiplierText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  xpAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sparkles: {
    position: 'absolute',
    top: 8,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  sparkle: {
    fontSize: 12,
    opacity: 0.8,
  },
  sparkleOffset: {
    marginTop: 4,
  },
});

export default LuckyScanToast;
