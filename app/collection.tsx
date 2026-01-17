import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { useCollectionStore } from '../lib/store';
import { CollectionItem } from '../types/beanie';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

// Tier colors for value display
const TIER_COLORS: Record<number, string> = {
  1: '#666666',
  2: '#666666',
  3: '#00CED1',
  4: '#FF6B35',
  5: '#FF00FF',
};

// Memphis Pattern - unique arrangement for collection screen
function MemphisPattern() {
  return (
    <Svg style={styles.memphisPattern} viewBox="0 0 390 844">
      {/* Teal triangle - top left */}
      <Polygon
        points="40,60 80,120 0,120"
        fill="#00CED1"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Yellow circle - top right */}
      <Circle
        cx="340"
        cy="80"
        r="16"
        fill="#FFD700"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Purple squiggle */}
      <Path
        d="M280 40 Q305 10, 330 40 Q355 70, 380 40"
        stroke="#8B5CF6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Orange circle - mid right */}
      <Circle
        cx="360"
        cy="350"
        r="14"
        fill="#FF6B35"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Black outline diamond */}
      <Polygon
        points="50,450 70,470 50,490 30,470"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Teal squiggle - bottom */}
      <Path
        d="M40 750 Q65 720, 90 750 Q115 780, 140 750"
        stroke="#00CED1"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Yellow lightning bolt */}
      <Path
        d="M330 650 L345 685 L325 685 L340 720"
        stroke="#FFD700"
        strokeWidth="5"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Black dots cluster */}
      <Circle cx="60" cy="280" r="4" fill="#000000" />
      <Circle cx="75" cy="290" r="4" fill="#000000" />
      <Circle cx="50" cy="295" r="4" fill="#000000" />
    </Svg>
  );
}

// Single collection item card
function CollectionItemCard({
  item,
  onDelete,
  index,
}: {
  item: CollectionItem;
  onDelete: (id: string) => void;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  const handleLongPress = () => {
    if (Platform.OS === 'web') {
      if (confirm(`Remove ${item.name} from collection?`)) {
        onDelete(item.id);
      }
    } else {
      Alert.alert(
        'Remove from Collection',
        `Remove ${item.name} from your collection?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => onDelete(item.id),
          },
        ]
      );
    }
  };

  const valueLow = item.adjusted_value_low ?? item.estimated_value_low;
  const valueHigh = item.adjusted_value_high ?? item.estimated_value_high;
  const tierColor = TIER_COLORS[item.tier] || TIER_COLORS[1];

  return (
    <Animated.View
      style={[
        styles.itemCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable onLongPress={handleLongPress} delayLongPress={500}>
        <BlurView intensity={30} tint="light" style={styles.itemCardBlur}>
          <View style={styles.itemCardInner}>
            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
              {item.thumbnail ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${item.thumbnail}` }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                  <Text style={styles.thumbnailPlaceholderText}>?</Text>
                </View>
              )}
            </View>

            {/* Info */}
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.variant && item.variant.toLowerCase() !== 'standard' && (
              <Text style={styles.itemVariant} numberOfLines={1}>
                {item.variant}
              </Text>
            )}
            <Text style={[styles.itemValue, { color: tierColor }]}>
              ${valueLow} - ${valueHigh}
            </Text>
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

// Empty state
function EmptyState() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <Text style={styles.emptyEmoji}>📦</Text>
      <Text style={styles.emptyTitle}>No Beanies Yet</Text>
      <Text style={styles.emptyText}>
        Scan your first Beanie Baby to start building your collection.
      </Text>
    </Animated.View>
  );
}

export default function CollectionScreen() {
  const { collection, removeItem, clearCollection, getTotalValue, isHydrated } =
    useCollectionStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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

  const handleClearAll = () => {
    if (collection.length === 0) return;

    if (Platform.OS === 'web') {
      if (confirm('Clear all items from your collection? This cannot be undone.')) {
        clearCollection();
      }
    } else {
      Alert.alert(
        'Clear Collection',
        'Remove all items from your collection? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: clearCollection,
          },
        ]
      );
    }
  };

  const totalValue = getTotalValue();

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
          locations={[0, 0.5, 1]}
          style={styles.backgroundGradient}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading collection...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Memphis pattern */}
      <MemphisPattern />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <BlurView intensity={40} tint="light" style={styles.headerBlur}>
          <View style={styles.headerInner}>
            {/* Back button */}
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>

            <Text style={styles.headerTitle}>My Collection</Text>

            {collection.length > 0 && (
              <>
                <Text style={styles.totalValue}>
                  ${totalValue.low} - ${totalValue.high}
                </Text>
                <Text style={styles.itemCount}>
                  {collection.length} {collection.length === 1 ? 'item' : 'items'}
                </Text>
              </>
            )}
          </View>
        </BlurView>
      </Animated.View>

      {/* Content */}
      {collection.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {collection.map((item, index) => (
              <CollectionItemCard
                key={item.id}
                item={item}
                onDelete={removeItem}
                index={index}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Footer buttons */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: buttonScale }], flex: 1 }}>
          <Pressable
            onPress={() => router.push('/scan')}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <LinearGradient
              colors={['#FF00FF', '#FF1493']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Scan Another</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {collection.length > 0 && (
          <Pressable onPress={handleClearAll} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Clear All</Text>
          </Pressable>
        )}
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
    opacity: 0.4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#00CED1',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF00FF',
    marginTop: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 120,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: ITEM_WIDTH,
    marginBottom: GRID_GAP,
  },
  itemCardBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemCardInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#F0F0F0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  thumbnailPlaceholderText: {
    fontSize: 32,
    color: '#CCCCCC',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  itemVariant: {
    fontSize: 12,
    color: '#00CED1',
    textAlign: 'center',
    marginTop: 2,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 50,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '600',
  },
});
