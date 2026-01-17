import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { useCollectionStore } from '../lib/store';

// Main app icon
const mainIcon = require('../assets/icons/icon-main.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Memphis Pattern SVG overlay - Bold 90s Trapper Keeper/Jazz Cup style
function MemphisPattern() {
  return (
    <Svg style={styles.memphisPattern} viewBox="0 0 390 844">
      {/* === FILLED SHAPES WITH BLACK OUTLINES (KEY 90s ELEMENT) === */}

      {/* Yellow triangle with black outline - TOP */}
      <Polygon
        points="55,30 95,90 15,90"
        fill="#FFD700"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Orange circle with black outline */}
      <Circle
        cx="330"
        cy="150"
        r="18"
        fill="#FF6B35"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Teal triangle with black outline */}
      <Polygon
        points="340,380 375,450 305,450"
        fill="#00CED1"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Purple circle with black outline - lower */}
      <Circle
        cx="60"
        cy="620"
        r="16"
        fill="#8B5CF6"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* === BLACK OUTLINE ONLY SHAPES === */}

      {/* Black outline triangle */}
      <Polygon
        points="300,60 330,110 270,110"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black outline circle */}
      <Circle
        cx="70"
        cy="200"
        r="14"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black outline square/diamond */}
      <Polygon
        points="330,550 350,570 330,590 310,570"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* === BOLD SQUIGGLES === */}

      {/* Black squiggle - very 90s */}
      <Path
        d="M240 35 Q260 10, 280 35 Q300 60, 320 35"
        stroke="#000000"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Teal squiggle */}
      <Path
        d="M25 320 Q50 290, 75 320 Q100 350, 125 320"
        stroke="#00CED1"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Teal squiggle */}
      <Path
        d="M270 700 Q295 670, 320 700 Q345 730, 370 700"
        stroke="#00CED1"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* === LIGHTNING BOLT === */}
      <Path
        d="M150 90 L165 125 L145 125 L160 160"
        stroke="#FFD700"
        strokeWidth="5"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* === ZIGZAG (Classic 90s) === */}
      <Path
        d="M40 480 L55 455 L70 480 L85 455 L100 480"
        stroke="#8B5CF6"
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* === SMALL ACCENTS === */}

      {/* Orange filled circle - small pop */}
      <Circle cx="100" cy="720" r="10" fill="#FF6B35" />

      {/* Yellow circle with black outline - added for color balance */}
      <Circle
        cx="80"
        cy="420"
        r="12"
        fill="#FFD700"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black dots cluster */}
      <Circle cx="320" cy="250" r="4" fill="#000000" />
      <Circle cx="335" cy="260" r="4" fill="#000000" />
      <Circle cx="310" cy="265" r="4" fill="#000000" />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Collection store
  const { getItemCount, isHydrated } = useCollectionStore();
  const collectionCount = isHydrated ? getItemCount() : 0;

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

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Background gradient - pure white/light gray, NO color tints */}
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Memphis pattern overlay at 40% opacity */}
      <MemphisPattern />

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Main App Icon */}
        <View style={styles.mainIconContainer}>
          <Image source={mainIcon} style={styles.mainIcon} />
        </View>

        {/* Frosted Glass Card */}
        <BlurView intensity={40} tint="light" style={styles.glassCard}>
          <View style={styles.glassCardInner}>
            <Text style={styles.title}>Beanie Farewell</Text>
            <Text style={styles.tagline}>It's been 25 years. Time for the truth.</Text>
            <Text style={styles.description}>
              Find out what your Beanie Babies are actually worth in 2026. Spoiler: probably not millions. But you never know...
            </Text>

            {/* CTA Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Pressable
                onPress={() => router.push('/scan')}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <LinearGradient
                  colors={['#FF00FF', '#FF1493']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaButton}
                >
                  <Text style={styles.ctaText}>Begin My Farewell</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* My Collection Button - only show if collection has items */}
            {collectionCount > 0 && (
              <Pressable
                onPress={() => router.push('/collection')}
                style={styles.collectionButton}
              >
                <Text style={styles.collectionButtonText}>
                  My Collection ({collectionCount})
                </Text>
              </Pressable>
            )}
          </View>
        </BlurView>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          No dreams were harmed in the making of this app.
        </Text>
      </View>
    </View>
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
  mainIconContainer: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  mainIcon: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    maxWidth: 340,
    width: '100%',
  },
  glassCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    padding: 32,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00CED1',
    marginBottom: 16,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
  },
  ctaButton: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 32,
  },
  ctaText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footer: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
  collectionButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(0, 206, 209, 0.3)',
  },
  collectionButtonText: {
    color: '#00CED1',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
