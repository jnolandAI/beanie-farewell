import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Animated, Easing, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { useCollectionStore } from '../lib/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Memphis Pattern - matching app style
function MemphisPattern() {
  return (
    <Svg style={styles.memphisPattern} viewBox="0 0 390 844">
      <Polygon points="55,30 95,90 15,90" fill="#FFD700" stroke="#000000" strokeWidth="3" />
      <Circle cx="330" cy="150" r="18" fill="#FF6B35" stroke="#000000" strokeWidth="3" />
      <Polygon points="340,380 375,450 305,450" fill="#00CED1" stroke="#000000" strokeWidth="3" />
      <Circle cx="60" cy="620" r="16" fill="#8B5CF6" stroke="#000000" strokeWidth="3" />
      <Polygon points="300,60 330,110 270,110" fill="none" stroke="#000000" strokeWidth="3" />
      <Circle cx="70" cy="200" r="14" fill="none" stroke="#000000" strokeWidth="3" />
      <Path d="M240 35 Q260 10, 280 35 Q300 60, 320 35" stroke="#000000" strokeWidth="4" fill="none" strokeLinecap="round" />
      <Path d="M25 320 Q50 290, 75 320 Q100 350, 125 320" stroke="#00CED1" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M150 90 L165 125 L145 125 L160 160" stroke="#FFD700" strokeWidth="5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx="100" cy="720" r="10" fill="#FF6B35" />
    </Svg>
  );
}

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const { setUserName, completeOnboarding, isHydrated, hasCompletedOnboarding } = useCollectionStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Redirect away if already completed onboarding (with delay to ensure navigation is ready)
  useEffect(() => {
    if (isHydrated && hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        router.replace('/');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, hasCompletedOnboarding]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleContinue = () => {
    if (name.trim()) {
      setUserName(name.trim());
    }
    completeOnboarding();
    router.replace('/');
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      <MemphisPattern />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <BlurView intensity={40} tint="light" style={styles.glassCard}>
          <View style={styles.glassCardInner}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Before we start judging your Beanies...</Text>

            <Text style={styles.label}>What's your first name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="given-name"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            <Text style={styles.hint}>
              This will appear on your official* farewell certificates.
            </Text>

            <Pressable onPress={handleContinue}>
              <LinearGradient
                colors={['#FF00FF', '#FF1493']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaText}>
                  {name.trim() ? "Let's Go!" : "Continue Anonymously"}
                </Text>
              </LinearGradient>
            </Pressable>

            {name.trim() && (
              <Pressable onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip this step</Text>
              </Pressable>
            )}
          </View>
        </BlurView>

        <Text style={styles.disclaimer}>
          *"Official" in the loosest possible sense of the word.
        </Text>
      </Animated.View>
    </KeyboardAvoidingView>
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
    opacity: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    maxWidth: 340,
    width: '100%',
  },
  glassCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    padding: 32,
    paddingHorizontal: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 16,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#1a1a2e',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  ctaButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  skipButton: {
    marginTop: 16,
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
