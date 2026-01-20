import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { DailyChallenge } from '../lib/challenges';

interface ChallengeToastProps {
  challenge: DailyChallenge;
  onDismiss: () => void;
}

export function ChallengeToast({ challenge, onDismiss }: ChallengeToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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

    // Auto dismiss after 3.5 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3500);

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
          <View style={styles.inner}>
            {/* Challenge icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>{challenge.emoji}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.unlockLabel}>DAILY CHALLENGE COMPLETE!</Text>
              <Text style={styles.name}>{challenge.title}</Text>
            </View>

            {/* XP Reward */}
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{challenge.xpReward}</Text>
              <Text style={styles.xpLabel}>XP</Text>
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
    top: 120,  // Below achievement toast
    left: 16,
    right: 16,
    zIndex: 999,
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
    borderColor: 'rgba(255, 215, 0, 0.4)',
    gap: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  content: {
    flex: 1,
  },
  unlockLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  xpBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  xpText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  xpLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1a1a2e',
    marginTop: -2,
  },
});
