import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface LoginBonusToastProps {
  xp: number;
  streak: number;
  onDismiss: () => void;
}

export function LoginBonusToast({ xp, streak, onDismiss }: LoginBonusToastProps) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const xpPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Slide in animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // XP pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(xpPulse, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(xpPulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -120,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, 3000);

    return () => clearTimeout(timer);
  }, [slideAnim, scaleAnim, xpPulse, onDismiss]);

  // Messages based on streak
  const getMessage = () => {
    if (streak >= 7) return "You're on fire!";
    if (streak >= 3) return "Keep it up!";
    return "Welcome back!";
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
        },
      ]}
    >
      <LinearGradient
        colors={['#00CED1', '#00A5A8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Sun icon */}
          <Text style={styles.icon}>
            {streak >= 7 ? '🌟' : streak >= 3 ? '☀️' : '👋'}
          </Text>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Daily Login Bonus!</Text>
            <Text style={styles.message}>{getMessage()}</Text>
          </View>

          {/* XP badge */}
          <Animated.View style={[styles.xpBadge, { transform: [{ scale: xpPulse }] }]}>
            <Text style={styles.xpAmount}>+{xp}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </Animated.View>
        </View>

        {/* Streak indicator */}
        {streak > 1 && (
          <View style={styles.streakIndicator}>
            <Text style={styles.streakText}>
              {streak} day login streak!
            </Text>
          </View>
        )}
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    padding: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  xpBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  xpAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});

export default LoginBonusToast;
