import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RareFindCelebrationProps {
  tier: 4 | 5;
  onComplete: () => void;
}

// Celebration messages by tier
const TIER_4_MESSAGES = [
  "HOLD UP",
  "WAIT WHAT",
  "OH WOW",
  "SERIOUSLY?!",
  "NO WAY",
];

const TIER_5_MESSAGES = [
  "JACKPOT!!!",
  "HOLY BEANS!",
  "YOU DID IT!",
  "LEGENDARY!",
  "UNREAL!!!",
];

// Star burst particle component
function StarParticle({ delay, x, y, size, color }: { delay: number; x: number; y: number; size: number; color: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -50, duration: 800, useNativeDriver: true }),
      ]),
    ]).start();
  }, [delay, opacity, scale, translateY]);

  return (
    <Animated.Text
      style={[
        styles.particle,
        {
          left: x,
          top: y,
          fontSize: size,
          opacity,
          transform: [{ scale }, { translateY }],
        },
      ]}
    >
      {['⭐', '✨', '💫', '🌟'][Math.floor(Math.random() * 4)]}
    </Animated.Text>
  );
}

export function RareFindCelebration({ tier, onComplete }: RareFindCelebrationProps) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.3)).current;
  const textRotate = useRef(new Animated.Value(-10)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  const messages = tier === 5 ? TIER_5_MESSAGES : TIER_4_MESSAGES;
  const message = messages[Math.floor(Math.random() * messages.length)];
  const gradientColors = tier === 5
    ? ['#FFD700', '#FF00FF', '#FF1493'] as const
    : ['#FF6B35', '#FF4500', '#FF6B35'] as const;

  // Generate random star positions
  const stars = Array.from({ length: tier === 5 ? 20 : 12 }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT * 0.7 + SCREEN_HEIGHT * 0.15,
    delay: Math.random() * 500,
    size: Math.random() * 16 + 16,
    color: ['#FFD700', '#FF00FF', '#00CED1', '#FF6B35'][Math.floor(Math.random() * 4)],
  }));

  useEffect(() => {
    // Heavy haptic feedback for celebration
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Multiple haptics for emphasis
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400);
    }

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(textScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(textRotate, {
        toValue: 0,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.05,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto-dismiss after celebration
    const timer = setTimeout(() => {
      Animated.timing(fadeIn, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onComplete());
    }, tier === 5 ? 2500 : 2000);

    return () => clearTimeout(timer);
  }, [fadeIn, textScale, textRotate, pulseScale, tier, onComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Star particles */}
      {stars.map((star) => (
        <StarParticle
          key={star.id}
          delay={star.delay}
          x={star.x}
          y={star.y}
          size={star.size}
          color={star.color}
        />
      ))}

      {/* Main message */}
      <Animated.View
        style={[
          styles.messageContainer,
          {
            transform: [
              { scale: Animated.multiply(textScale, pulseScale) },
              {
                rotate: textRotate.interpolate({
                  inputRange: [-10, 0],
                  outputRange: ['-10deg', '0deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.tierEmoji}>
          {tier === 5 ? '🎉' : '🚨'}
        </Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.subMessage}>
          {tier === 5 ? 'You found a unicorn!' : 'This is actually valuable!'}
        </Text>
      </Animated.View>

      {/* Decorative corner elements */}
      <View style={styles.cornerTopLeft}>
        <Text style={styles.cornerEmoji}>💎</Text>
      </View>
      <View style={styles.cornerTopRight}>
        <Text style={styles.cornerEmoji}>💰</Text>
      </View>
      <View style={styles.cornerBottomLeft}>
        <Text style={styles.cornerEmoji}>🏆</Text>
      </View>
      <View style={styles.cornerBottomRight}>
        <Text style={styles.cornerEmoji}>✨</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  message: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  subMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 12,
    textAlign: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 60,
    left: 30,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 60,
    right: 30,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 60,
    left: 30,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 60,
    right: 30,
  },
  cornerEmoji: {
    fontSize: 32,
    opacity: 0.8,
  },
});

export default RareFindCelebration;
