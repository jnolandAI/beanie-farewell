import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { searchBeanies, ANIMAL_EMOJIS, SearchResult } from '../lib/search';
import { identifyBeanieByName } from '../lib/claude';
import { getLoadingText, getErrorPrefix } from '../lib/humor';
import { useCollectionStore } from '../lib/store';

// Memphis Pattern SVG - Search screen variant
function MemphisPattern() {
  return (
    <Svg style={styles.memphisPattern} viewBox="0 0 390 844">
      {/* Magenta circle with black outline - TOP LEFT */}
      <Circle
        cx="50"
        cy="90"
        r="18"
        fill="#FF00FF"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Yellow triangle with black outline - TOP RIGHT */}
      <Polygon
        points="330,40 365,95 295,95"
        fill="#FFD700"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Teal circle with black outline - BOTTOM LEFT */}
      <Circle
        cx="40"
        cy="680"
        r="15"
        fill="#00CED1"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Purple circle with black outline - BOTTOM RIGHT */}
      <Circle
        cx="350"
        cy="720"
        r="16"
        fill="#8B5CF6"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black outline triangle */}
      <Polygon
        points="60,400 90,450 30,450"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black squiggle */}
      <Path
        d="M280 150 Q305 120, 330 150 Q355 180, 380 150"
        stroke="#000000"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Teal squiggle */}
      <Path
        d="M20 550 Q45 520, 70 550 Q95 580, 120 550"
        stroke="#00CED1"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Orange small circle */}
      <Circle cx="340" cy="500" r="10" fill="#FF6B35" />

      {/* Black dots */}
      <Circle cx="50" cy="300" r="4" fill="#000000" />
      <Circle cx="65" cy="310" r="4" fill="#000000" />
      <Circle cx="40" cy="315" r="4" fill="#000000" />
    </Svg>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(() => getLoadingText());
  const [selectedBeanie, setSelectedBeanie] = useState<SearchResult | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  const { setPendingThumbnail } = useCollectionStore();

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
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Loading animation
  useEffect(() => {
    if (loading) {
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

      Animated.loop(
        Animated.timing(dotAnim, {
          toValue: 3,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();

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

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        const searchResults = searchBeanies(query);
        setResults(searchResults);
      } else {
        setResults([]);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectBeanie = useCallback(async (beanie: SearchResult) => {
    setSelectedBeanie(beanie);
    setLoading(true);
    setError(null);
    setLoadingText(getLoadingText());

    try {
      const identification = await identifyBeanieByName(beanie.name, beanie.animal_type);

      // No thumbnail for text search
      setPendingThumbnail('');

      if (identification.needs_follow_up && identification.follow_up_questions?.length) {
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
          },
        });
      } else {
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
          },
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`${getErrorPrefix()} ${errorMsg}`);
      setLoading(false);
      setSelectedBeanie(null);
    }
  }, [setPendingThumbnail]);

  const renderSearchResult = useCallback(({ item }: { item: SearchResult }) => {
    const emoji = ANIMAL_EMOJIS[item.animal_type] || '🧸';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.resultItem,
          pressed && styles.resultItemPressed,
        ]}
        onPress={() => handleSelectBeanie(item)}
      >
        <Text style={styles.resultEmoji}>{emoji}</Text>
        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.resultDetail} numberOfLines={1}>
            {item.animal_type} • {item.description.slice(0, 40)}...
          </Text>
        </View>
        <Text style={styles.resultArrow}>→</Text>
      </Pressable>
    );
  }, [handleSelectBeanie]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
        <MemphisPattern />

        <View style={styles.loadingContainer}>
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
              <Text style={styles.loadingSubtitle}>
                Looking up {selectedBeanie?.name}...
              </Text>

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
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.headerIconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerIconGradient}
              >
                <Text style={styles.headerEmoji}>🔍</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>Search by Name</Text>
            <Text style={styles.subtitle}>Type a name or describe it</Text>
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

          {/* Search Input Card */}
          <BlurView intensity={40} tint="light" style={styles.glassCard}>
            <View style={styles.glassCardInner}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type a name or animal..."
                  placeholderTextColor="#999"
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <Pressable
                    style={styles.clearButton}
                    onPress={() => setQuery('')}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </Pressable>
                )}
              </View>

              {/* Results List */}
              {results.length > 0 ? (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.name}
                  renderItem={renderSearchResult}
                  style={styles.resultsList}
                  showsVerticalScrollIndicator={false}
                />
              ) : query.length > 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🤔</Text>
                  <Text style={styles.emptyText}>
                    No matches found for "{query}"
                  </Text>
                  <Text style={styles.emptyHint}>
                    Try a different name or animal type
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>💡</Text>
                  <Text style={styles.emptyText}>
                    Try searching for:
                  </Text>
                  <Text style={styles.emptyHint}>
                    "Princess" • "frog" • "purple bear"
                  </Text>
                </View>
              )}
            </View>
          </BlurView>
        </View>
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
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIconContainer: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  headerIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  headerEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#00CED1',
    fontWeight: '600',
    textAlign: 'center',
  },
  blurView: {
    overflow: 'hidden',
  },
  glassCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 24,
  },
  glassCardInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a2e',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  resultItemPressed: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    transform: [{ scale: 0.98 }],
  },
  resultEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  resultDetail: {
    fontSize: 13,
    color: '#666',
  },
  resultArrow: {
    fontSize: 18,
    color: '#FF00FF',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
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
  errorContainer: {
    marginBottom: 16,
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
});
