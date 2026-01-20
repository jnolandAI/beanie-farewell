import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface LevelUpToastProps {
  level: number;
  title: string;
  emoji: string;
  color: string;
  onDismiss: () => void;
}

export function LevelUpToast({ level, title, emoji, color, onDismiss }: LevelUpToastProps) {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Haptic feedback on level up
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Animate in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 12,
        stiffness: 120,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 8,
        stiffness: 150,
      }),
    ]).start();

    // Pulsing animation for emoji
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto dismiss after 4 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, [slideAnim, opacityAnim, scaleAnim, pulseAnim]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
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
        <BlurView intensity={70} tint="light" style={styles.blur}>
          <View style={[styles.inner, { borderColor: color }]}>
            {/* Level up icon with pulse */}
            <Animated.View style={[styles.emojiContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.emoji}>{emoji}</Text>
            </Animated.View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.levelUpLabel}>LEVEL UP!</Text>
              <Text style={[styles.levelNumber, { color }]}>Level {level}</Text>
              <Text style={styles.title}>{title}</Text>
            </View>

            {/* Celebration sparks */}
            <View style={styles.sparkContainer}>
              <Text style={styles.spark}>✨</Text>
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
    zIndex: 1001,
  },
  blur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 3,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  emojiContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  levelUpLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginTop: 1,
  },
  sparkContainer: {
    position: 'absolute',
    top: 8,
    right: 12,
  },
  spark: {
    fontSize: 20,
  },
});
