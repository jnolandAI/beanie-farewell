import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { identifyBeanieFromImage } from '../lib/claude';
import { getLoadingText, SCAN_TEXT, getErrorPrefix } from '../lib/humor';
import { useCollectionStore } from '../lib/store';
import { compressImageForThumbnail } from '../lib/imageUtils';
import { isNetworkError, getOfflineErrorMessage } from '../lib/network';

// Web mock mode test scenarios
const WEB_TEST_SCENARIOS = [
  {
    label: 'Teddy the Bear (common, low value)',
    mockData: {
      name: 'Teddy',
      animal_type: 'Bear',
      variant: 'Standard',
      colors: ['Brown'],
      estimated_value_low: 3,
      estimated_value_high: 8,
      value_notes: 'Very common Beanie Baby. Millions were produced.',
      confidence: 'high',
      has_visible_hang_tag: true,
      needs_follow_up: false,
    },
  },
  {
    label: 'Princess Diana Bear (rare)',
    mockData: {
      name: 'Princess',
      animal_type: 'Bear',
      variant: 'Princess Diana Memorial',
      colors: ['Purple'],
      estimated_value_low: 25,
      estimated_value_high: 75,
      value_notes: 'First edition Princess bears with PVC pellets can be worth more. Most are worth $25-75.',
      confidence: 'high',
      has_visible_hang_tag: true,
      needs_follow_up: true,
      follow_up_questions: [
        {
          type: 'pellet_type',
          question: 'Squeeze the bear gently - what do the pellets feel like?',
          reason: 'PVC pellets (hard beans) are much rarer and more valuable than PE (soft foam).',
          options: ['PVC (tiny hard beans)', 'PE (soft foam balls)', 'Not sure'],
          valueImpact: 'Could increase value 5-10x',
        },
        {
          type: 'tush_tag_photo',
          question: 'Take a photo of the tush tag',
          reason: 'Bears made in Indonesia are significantly more valuable.',
          photoPrompt: 'Flip the bear over and photograph the small tag sewn into the body.',
          valueImpact: 'Indonesia origin could add 2-5x value',
        },
        {
          type: 'condition',
          question: 'What condition is it in?',
          reason: 'Condition significantly affects value for collectibles.',
          options: ['Mint with tag', 'Mint, no tag', 'Excellent', 'Good', 'Fair'],
          valueImpact: 'Mint condition commands highest prices',
        },
      ],
      potential_value_if_rare: {
        low: 200,
        high: 500,
        conditions: 'PVC pellets + Made in Indonesia + Mint with original tag',
      },
    },
  },
  {
    label: 'Royal Blue Peanut (very rare variant)',
    mockData: {
      name: 'Peanut',
      animal_type: 'Elephant',
      variant: 'Royal Blue',
      colors: ['Royal Blue'],
      estimated_value_low: 3000,
      estimated_value_high: 5000,
      value_notes: 'The Royal Blue Peanut is one of the rarest Beanie Babies. Only about 2,000 were made before switching to light blue.',
      confidence: 'medium',
      has_visible_hang_tag: true,
      needs_follow_up: true,
      follow_up_questions: [
        {
          type: 'color_confirmation',
          question: 'How would you describe the blue color?',
          reason: 'The Royal Blue variant is a deep, dark blue - not light or baby blue.',
          options: ['Deep royal/dark blue', 'Light/baby blue', 'Teal/turquoise', 'Not sure'],
          valueImpact: 'Light blue Peanuts are worth $5-15, Royal Blue worth $3000+',
        },
        {
          type: 'condition',
          question: 'What condition is it in?',
          reason: 'Condition significantly affects value for rare collectibles.',
          options: ['Mint with tag', 'Mint, no tag', 'Excellent', 'Good', 'Fair'],
          valueImpact: 'Mint condition commands highest prices',
        },
      ],
      potential_value_if_rare: {
        low: 3000,
        high: 5000,
        conditions: 'Confirmed Royal Blue color + Mint condition with original hang tag',
      },
    },
  },
  {
    label: 'Not a Beanie Baby (random object)',
    mockData: {
      name: 'Not a Beanie Baby',
      animal_type: 'Unknown',
      variant: 'N/A',
      colors: [],
      estimated_value_low: 0,
      estimated_value_high: 0,
      value_notes: 'This does not appear to be a Beanie Baby.',
      confidence: 'high',
      has_visible_hang_tag: false,
      needs_follow_up: false,
    },
  },
];

const isWeb = Platform.OS === 'web';

// Memphis Pattern SVG - Different arrangement from welcome screen
function MemphisPattern() {
  return (
    <Svg style={styles.memphisPattern} viewBox="0 0 390 844">
      {/* === FILLED SHAPES WITH BLACK OUTLINES === */}

      {/* Magenta circle with black outline - TOP LEFT */}
      <Circle
        cx="45"
        cy="80"
        r="20"
        fill="#FF00FF"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Yellow triangle with black outline - TOP RIGHT */}
      <Polygon
        points="320,50 360,110 280,110"
        fill="#FFD700"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Teal circle with black outline - LEFT MIDDLE */}
      <Circle
        cx="35"
        cy="350"
        r="15"
        fill="#00CED1"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Orange triangle with black outline - RIGHT */}
      <Polygon
        points="355,280 385,330 325,330"
        fill="#FF6B35"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Purple circle with black outline - BOTTOM RIGHT */}
      <Circle
        cx="340"
        cy="620"
        r="18"
        fill="#8B5CF6"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* === BLACK OUTLINE ONLY SHAPES === */}

      {/* Black outline circle - TOP */}
      <Circle
        cx="180"
        cy="45"
        r="12"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black outline triangle - MIDDLE */}
      <Polygon
        points="60,520 90,570 30,570"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black outline diamond - BOTTOM */}
      <Polygon
        points="100,750 120,770 100,790 80,770"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* === BOLD SQUIGGLES === */}

      {/* Black squiggle - TOP */}
      <Path
        d="M100 120 Q125 90, 150 120 Q175 150, 200 120"
        stroke="#000000"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Teal squiggle - RIGHT SIDE */}
      <Path
        d="M310 450 Q335 420, 360 450 Q385 480, 370 510"
        stroke="#00CED1"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Magenta squiggle - BOTTOM LEFT */}
      <Path
        d="M30 680 Q55 650, 80 680 Q105 710, 130 680"
        stroke="#FF00FF"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* === ZIGZAG (Classic 90s) === */}
      <Path
        d="M270 720 L285 695 L300 720 L315 695 L330 720"
        stroke="#FFD700"
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* === LIGHTNING BOLT === */}
      <Path
        d="M350 170 L365 205 L345 205 L360 240"
        stroke="#8B5CF6"
        strokeWidth="5"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* === SMALL ACCENTS === */}

      {/* Yellow filled circle - small pop */}
      <Circle cx="55" cy="450" r="10" fill="#FFD700" />

      {/* Teal small circle */}
      <Circle cx="320" cy="50" r="8" fill="#00CED1" />

      {/* Black dots cluster - different position */}
      <Circle cx="45" cy="260" r="4" fill="#000000" />
      <Circle cx="60" cy="270" r="4" fill="#000000" />
      <Circle cx="35" cy="275" r="4" fill="#000000" />
    </Svg>
  );
}

export default function ScanScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(() => getLoadingText());
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  // Refs to track running animations for cleanup
  const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const dotAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    if (loading) {
      // Gentle pulse animation
      pulseAnimRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimRef.current.start();

      // Dot animation
      dotAnimRef.current = Animated.loop(
        Animated.timing(dotAnim, {
          toValue: 3,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      );
      dotAnimRef.current.start();

      // Rotate loading text every 3 seconds for humor
      const textInterval = setInterval(() => {
        setLoadingText(getLoadingText());
      }, 3000);

      // Proper cleanup - stop animations and reset values
      return () => {
        pulseAnimRef.current?.stop();
        dotAnimRef.current?.stop();
        pulseAnim.setValue(1);
        dotAnim.setValue(0);
        clearInterval(textInterval);
      };
    }
  }, [loading, pulseAnim, dotAnim]);

  const { setPendingThumbnail } = useCollectionStore();

  const processImage = async (base64: string) => {
    setLoading(true);
    setError(null);
    setLoadingText(getLoadingText());

    // Haptic feedback on scan start
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const identification = await identifyBeanieFromImage(base64);

      // Compress thumbnail for storage efficiency
      const compressedThumbnail = await compressImageForThumbnail(base64);
      setPendingThumbnail(compressedThumbnail);

      // Success haptic
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (identification.needs_follow_up && identification.follow_up_questions?.length) {
        // Route to follow-up screen
        router.push({
          pathname: '/followup',
          params: {
            name: identification.name,
            animal_type: identification.animal_type,
            variant: identification.variant,
            colors: JSON.stringify(identification.colors),
            estimated_value_low: String(identification.estimated_value_low),
            estimated_value_high: String(identification.estimated_value_high),
            value_notes: identification.value_notes,
            confidence: identification.confidence,
            has_visible_hang_tag: String(identification.has_visible_hang_tag),
            follow_up_questions: JSON.stringify(identification.follow_up_questions),
            potential_value_if_rare: JSON.stringify(identification.potential_value_if_rare || null),
            roast: identification.roast || undefined,
          },
        });
      } else {
        // Route directly to result (existing flow)
        router.push({
          pathname: '/result',
          params: {
            name: identification.name,
            animal_type: identification.animal_type,
            variant: identification.variant,
            colors: JSON.stringify(identification.colors),
            estimated_value_low: String(identification.estimated_value_low),
            estimated_value_high: String(identification.estimated_value_high),
            value_notes: identification.value_notes,
            confidence: identification.confidence,
            has_visible_hang_tag: String(identification.has_visible_hang_tag),
            value_breakdown: identification.value_breakdown ? JSON.stringify(identification.value_breakdown) : undefined,
            detected_assumptions: identification.detected_assumptions ? JSON.stringify(identification.detected_assumptions) : undefined,
            roast: identification.roast || undefined,
          },
        });
      }
    } catch (err) {
      // Error haptic
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      // Check if it's a network error
      if (isNetworkError(err)) {
        setError(getOfflineErrorMessage());
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`${getErrorPrefix()} ${errorMsg}`);
      }
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    // Light haptic on button press
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      setError(`${getErrorPrefix()} Camera permission is required`);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await processImage(result.assets[0].base64);
    }
  };

  const chooseFromLibrary = async () => {
    // Light haptic on button press
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setError(`${getErrorPrefix()} Photo library permission is required`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await processImage(result.assets[0].base64);
    }
  };

  // Web mock mode: test with predefined scenarios
  const testWithMockData = async () => {
    setLoading(true);
    setError(null);
    setLoadingText(getLoadingText());

    // Simulate API delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockData = WEB_TEST_SCENARIOS[selectedScenario].mockData;

    // Set empty thumbnail for web mock mode (no image to save)
    setPendingThumbnail('');

    if (mockData.needs_follow_up && mockData.follow_up_questions?.length) {
      // Route to follow-up screen
      router.push({
        pathname: '/followup',
        params: {
          name: mockData.name,
          animal_type: mockData.animal_type,
          variant: mockData.variant,
          colors: JSON.stringify(mockData.colors),
          estimated_value_low: String(mockData.estimated_value_low),
          estimated_value_high: String(mockData.estimated_value_high),
          value_notes: mockData.value_notes,
          confidence: mockData.confidence,
          has_visible_hang_tag: String(mockData.has_visible_hang_tag),
          follow_up_questions: JSON.stringify(mockData.follow_up_questions),
          potential_value_if_rare: JSON.stringify(mockData.potential_value_if_rare || null),
        },
      });
    } else {
      // Route directly to result (existing flow)
      router.push({
        pathname: '/result',
        params: {
          name: mockData.name,
          animal_type: mockData.animal_type,
          variant: mockData.variant,
          colors: JSON.stringify(mockData.colors),
          estimated_value_low: String(mockData.estimated_value_low),
          estimated_value_high: String(mockData.estimated_value_high),
          value_notes: mockData.value_notes,
          confidence: mockData.confidence,
          has_visible_hang_tag: String(mockData.has_visible_hang_tag),
        },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Background gradient - pure white/light gray */}
        <LinearGradient
          colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />

        {/* Memphis pattern overlay */}
        <MemphisPattern />

        <View style={styles.loadingContainer}>
          {/* Glass card for loading content */}
          <BlurView intensity={40} tint="light" style={styles.loadingGlassCard}>
            <View style={styles.loadingGlassContent}>
              <Animated.View
                style={[
                  styles.loadingIconContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <LinearGradient
                  colors={['#FF00FF', '#FF1493']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.loadingIconGradient}
                >
                  <Text style={styles.loadingEmoji}>🔍</Text>
                </LinearGradient>
              </Animated.View>

              <Text style={styles.loadingTitle}>{loadingText.title}</Text>
              {loadingText.fact ? (
                <View style={styles.factContainer}>
                  <Text style={styles.factLabel}>DID YOU KNOW?</Text>
                  <Text style={styles.factText}>{loadingText.fact}</Text>
                </View>
              ) : (
                <Text style={styles.loadingSubtitle}>{loadingText.subtitle}</Text>
              )}

              <View style={styles.dotsContainer}>
                {[0, 1, 2].map((i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        opacity: dotAnim.interpolate({
                          inputRange: [i, i + 0.5, i + 1, 3],
                          outputRange: [0.3, 1, 0.3, 0.3],
                          extrapolate: 'clamp',
                        }),
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </BlurView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background gradient - pure white/light gray */}
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Memphis pattern overlay */}
      <MemphisPattern />

      <Animated.View
        style={[
          styles.innerContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Pressable style={styles.backButton} onPress={() => router.replace('/')}>
          <Text style={styles.backButtonText}>← Home</Text>
        </Pressable>

        <View style={styles.content}>
          {/* Header with glass icon container */}
          <View style={styles.headerSection}>
            <View style={styles.headerIconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerIconGradient}
              >
                <Text style={styles.headerEmoji}>📸</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>{SCAN_TEXT.title}</Text>
            <Text style={styles.subtitle}>{SCAN_TEXT.subtitle}</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <BlurView intensity={40} tint="light" style={styles.blurView}>
                <View style={styles.errorContent}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </BlurView>
            </View>
          )}

          {isWeb ? (
            /* Web Mock Mode UI */
            <BlurView intensity={40} tint="light" style={styles.glassCard}>
              <View style={styles.glassCardInner}>
                <View style={styles.webMockContainer}>
                  <Text style={styles.webMockLabel}>Test Scenario</Text>

                  {/* Custom Dropdown with glass effect */}
                  <Pressable
                    style={styles.dropdown}
                    onPress={() => setShowDropdown(!showDropdown)}
                  >
                    <Text style={styles.dropdownText} numberOfLines={1}>
                      {WEB_TEST_SCENARIOS[selectedScenario].label}
                    </Text>
                    <Text style={styles.dropdownArrow}>{showDropdown ? '▲' : '▼'}</Text>
                  </Pressable>

                  {showDropdown && (
                    <View style={styles.dropdownMenu}>
                      {WEB_TEST_SCENARIOS.map((scenario, index) => (
                        <Pressable
                          key={index}
                          style={[
                            styles.dropdownItem,
                            index === selectedScenario && styles.dropdownItemSelected,
                          ]}
                          onPress={() => {
                            setSelectedScenario(index);
                            setShowDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              index === selectedScenario && styles.dropdownItemTextSelected,
                            ]}
                          >
                            {scenario.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Primary button with magenta gradient */}
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                  ]}
                  onPress={testWithMockData}
                >
                  <LinearGradient
                    colors={['#FF00FF', '#FF1493']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryButtonGradient}
                  >
                    <Text style={styles.primaryButtonIcon}>🧪</Text>
                    <Text style={styles.primaryButtonText}>Test This</Text>
                  </LinearGradient>
                </Pressable>

                <View style={styles.webMockNote}>
                  <Text style={styles.webMockNoteText}>
                    Web Mock Mode: Testing without camera
                  </Text>
                </View>

                {/* Search by Name option for web too */}
                <Pressable
                  style={({ pressed }) => [
                    styles.tertiaryButton,
                    pressed && styles.tertiaryButtonPressed,
                  ]}
                  onPress={() => router.push('/search')}
                >
                  <Text style={styles.tertiaryButtonIcon}>🔍</Text>
                  <Text style={styles.tertiaryButtonText}>Search by Name</Text>
                </Pressable>
              </View>
            </BlurView>
          ) : (
            /* Native Camera/Library Buttons */
            <BlurView intensity={40} tint="light" style={styles.glassCard}>
              <View style={styles.glassCardInner}>
                {/* Primary camera button with magenta gradient */}
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                  ]}
                  onPress={takePhoto}
                >
                  <LinearGradient
                    colors={['#FF00FF', '#FF1493']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryButtonGradient}
                  >
                    <Text style={styles.primaryButtonIcon}>📷</Text>
                    <Text style={styles.primaryButtonText}>{SCAN_TEXT.cameraButton}</Text>
                  </LinearGradient>
                </Pressable>

                {/* Secondary library button with frosted glass */}
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.secondaryButtonPressed,
                  ]}
                  onPress={chooseFromLibrary}
                >
                  <Text style={styles.secondaryButtonIcon}>🖼️</Text>
                  <Text style={styles.secondaryButtonText}>{SCAN_TEXT.libraryButton}</Text>
                </Pressable>

                {/* Tertiary search button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.tertiaryButton,
                    pressed && styles.tertiaryButtonPressed,
                  ]}
                  onPress={() => router.push('/search')}
                >
                  <Text style={styles.tertiaryButtonIcon}>🔍</Text>
                  <Text style={styles.tertiaryButtonText}>Search by Name</Text>
                </Pressable>
              </View>
            </BlurView>
          )}

          {/* Tip card with glass effect */}
          <BlurView intensity={40} tint="light" style={styles.tipCard}>
            <View style={styles.tipCardContent}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                {isWeb ? 'Select a test scenario above to preview the results screen.' : SCAN_TEXT.tip}
              </Text>
            </View>
          </BlurView>
        </View>
      </Animated.View>
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
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#FF00FF',
    fontSize: 17,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIconContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  headerIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  headerEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#00CED1',
    fontWeight: '600',
    textAlign: 'center',
  },
  blurView: {
    overflow: 'hidden',
  },
  // Glass Card
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    maxWidth: 380,
    width: '100%',
    alignSelf: 'center',
  },
  glassCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    padding: 24,
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
    gap: 12,
  },
  // Primary Button (Magenta Gradient)
  primaryButton: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.3,
  },
  primaryButtonIcon: {
    fontSize: 22,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  // Secondary Button (Frosted Glass)
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButtonPressed: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    transform: [{ scale: 0.97 }],
  },
  secondaryButtonIcon: {
    fontSize: 22,
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 17,
    fontWeight: '600',
  },
  // Tertiary Button (Text link style)
  tertiaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tertiaryButtonPressed: {
    opacity: 0.6,
  },
  tertiaryButtonIcon: {
    fontSize: 18,
  },
  tertiaryButtonText: {
    color: '#00CED1',
    fontSize: 15,
    fontWeight: '600',
  },
  // Tip Card
  tipCard: {
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: 380,
    width: '100%',
    alignSelf: 'center',
  },
  tipCardContent: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingGlassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 320,
  },
  loadingGlassContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    padding: 32,
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
  loadingIconContainer: {
    marginBottom: 24,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 40,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  factContainer: {
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 209, 0.2)',
  },
  factLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00CED1',
    letterSpacing: 1.2,
    marginBottom: 6,
    textAlign: 'center',
  },
  factText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 28,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF00FF',
  },
  // Error container with glass effect
  errorContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  errorContent: {
    padding: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 16,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
  // Web Mock Mode Styles
  webMockContainer: {
    marginBottom: 8,
  },
  webMockLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00CED1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a2e',
    flex: 1,
    marginRight: 8,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#999999',
  },
  dropdownMenu: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1a1a2e',
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#FF00FF',
  },
  webMockNote: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  webMockNoteText: {
    fontSize: 13,
    color: '#00CED1',
    fontWeight: '500',
  },
});
