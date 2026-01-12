import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { identifyBeanieFromImage } from '../lib/claude';
import { getLoadingText, SCAN_TEXT, getErrorPrefix } from '../lib/humor';

// Design system colors
const COLORS = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  primary: '#FF6B6B',
  primaryDark: '#E85555',
  secondary: '#4ECDC4',
  text: '#2D3436',
  textSecondary: '#636E72',
  textMuted: '#B2BEC3',
  border: '#E9ECEF',
  error: '#FF6B6B',
  errorBg: '#FFF5F5',
};

export default function ScanScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(() => getLoadingText());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (loading) {
      // Gentle pulse animation
      Animated.loop(
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
      ).start();

      // Dot animation
      Animated.loop(
        Animated.timing(dotAnim, {
          toValue: 3,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();

      // Rotate loading messages
      const interval = setInterval(() => {
        setLoadingText(getLoadingText());
      }, 3000);

      return () => {
        clearInterval(interval);
        pulseAnim.setValue(1);
        dotAnim.setValue(0);
      };
    }
  }, [loading, pulseAnim, dotAnim]);

  const processImage = async (base64: string) => {
    setLoading(true);
    setError(null);
    setLoadingText(getLoadingText());

    try {
      const identification = await identifyBeanieFromImage(base64);
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
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`${getErrorPrefix()} ${errorMsg}`);
      setLoading(false);
    }
  };

  const takePhoto = async () => {
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingIcon,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.loadingEmoji}>🔍</Text>
          </Animated.View>

          <Text style={styles.loadingTitle}>{loadingText.title}</Text>
          <Text style={styles.loadingSubtitle}>{loadingText.subtitle}</Text>

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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.innerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.headerEmoji}>📸</Text>
            <Text style={styles.title}>{SCAN_TEXT.title}</Text>
            <Text style={styles.subtitle}>{SCAN_TEXT.subtitle}</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={takePhoto}
            >
              <Text style={styles.buttonIcon}>📷</Text>
              <Text style={styles.buttonText}>{SCAN_TEXT.cameraButton}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.buttonSecondary,
                pressed && styles.buttonSecondaryPressed,
              ]}
              onPress={chooseFromLibrary}
            >
              <Text style={styles.buttonSecondaryIcon}>🖼️</Text>
              <Text style={styles.buttonSecondaryText}>{SCAN_TEXT.libraryButton}</Text>
            </Pressable>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{SCAN_TEXT.tip}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.primary,
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
    marginBottom: 40,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  buttonIcon: {
    fontSize: 22,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonSecondaryPressed: {
    backgroundColor: COLORS.background,
    transform: [{ scale: 0.98 }],
  },
  buttonSecondaryIcon: {
    fontSize: 22,
  },
  buttonSecondaryText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  tipCard: {
    marginTop: 32,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIcon: {
    marginBottom: 24,
  },
  loadingEmoji: {
    fontSize: 64,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  errorContainer: {
    backgroundColor: COLORS.errorBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    fontSize: 15,
  },
});
