import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  Modal,
  TextInput,
  RefreshControl,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { useCollectionStore } from '../lib/store';
import { CollectionItem } from '../types/beanie';
import { CollectionCertificate } from '../components/CollectionCertificate';
import { CollectionStatsCard } from '../components/CollectionStatsCard';
import {
  getPortfolioVerdict,
  getPortfolioRoast,
  getWhatYouCouldHaveBought,
  getPortfolioSP500Comparison,
  getTierBreakdownComment,
  getVerdictTier,
  PortfolioStats,
  generateCollectionInsights,
  CollectionInsight,
} from '../lib/humor';
import { showExportFailedAlert, showShareFailedAlert } from '../lib/errors';

// Sort options
type SortOption = 'date_desc' | 'date_asc' | 'value_desc' | 'value_asc' | 'name_asc' | 'name_desc';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'date_desc', label: 'Newest First' },
  { key: 'date_asc', label: 'Oldest First' },
  { key: 'value_desc', label: 'Highest Value' },
  { key: 'value_asc', label: 'Lowest Value' },
  { key: 'name_asc', label: 'Name A-Z' },
  { key: 'name_desc', label: 'Name Z-A' },
];

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
  onPress,
  index,
}: {
  item: CollectionItem;
  onDelete: (id: string) => void;
  onPress: (item: CollectionItem) => void;
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
      <Pressable
        onPress={() => onPress(item)}
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      >
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

// Skeleton loading card
function SkeletonCard({ index }: { index: number }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.itemCard, { opacity: pulseAnim }]}>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonThumbnail} />
        <View style={styles.skeletonName} />
        <View style={styles.skeletonValue} />
      </View>
    </Animated.View>
  );
}

// Empty state
function EmptyState({ searchQuery }: { searchQuery?: string }) {
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
      <Text style={styles.emptyEmoji}>{searchQuery ? '🔍' : '📦'}</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Matches' : 'No Beanies Yet'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? `No Beanies match "${searchQuery}"`
          : 'Scan your first Beanie Baby to start building your collection.'}
      </Text>
    </Animated.View>
  );
}

export default function CollectionScreen() {
  const { showShare } = useLocalSearchParams<{ showShare?: string }>();
  const { collection, removeItem, clearCollection, getTotalValue, isHydrated, userName, totalXP, getStreak } =
    useCollectionStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const certificateRef = useRef<View>(null);
  const statsCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Auto-show share modal when navigated with showShare param
  const [hasTriggeredShare, setHasTriggeredShare] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPortfolioSummary, setShowPortfolioSummary] = useState(false);

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

  // Auto-trigger share modal when showShare param is present
  useEffect(() => {
    if (showShare === 'true' && !hasTriggeredShare && collection.length > 0) {
      setHasTriggeredShare(true);
      // Small delay to let the screen render first
      const timer = setTimeout(() => {
        setShowStatsModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showShare, hasTriggeredShare, collection.length]);

  // Filtered and sorted collection
  const filteredCollection = useMemo(() => {
    let result = [...collection];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.animal_type.toLowerCase().includes(query) ||
          item.variant.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date_desc':
          return b.timestamp - a.timestamp;
        case 'date_asc':
          return a.timestamp - b.timestamp;
        case 'value_desc':
          return (b.adjusted_value_high ?? b.estimated_value_high) -
                 (a.adjusted_value_high ?? a.estimated_value_high);
        case 'value_asc':
          return (a.adjusted_value_high ?? a.estimated_value_high) -
                 (b.adjusted_value_high ?? b.estimated_value_high);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [collection, searchQuery, sortOption]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Small delay to show refresh indicator
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  // Export collection as JSON
  const exportCollection = async () => {
    if (collection.length === 0) return;

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: collection.length,
      totalValue: getTotalValue(),
      items: collection.map((item) => ({
        name: item.name,
        animal_type: item.animal_type,
        variant: item.variant,
        colors: item.colors,
        estimated_value_low: item.adjusted_value_low ?? item.estimated_value_low,
        estimated_value_high: item.adjusted_value_high ?? item.estimated_value_high,
        condition: item.condition || 'unknown',
        pellet_type: item.pellet_type || 'unknown',
        scanned_date: new Date(item.timestamp).toISOString(),
        tier: item.tier,
        value_notes: item.value_notes,
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    if (Platform.OS === 'web') {
      // Web: Use browser download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `beanie-collection-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Native: Share the JSON
      try {
        await Share.share({
          message: jsonString,
          title: 'Beanie Collection Export',
        });
      } catch (error) {
        console.error('Export error:', error);
        showExportFailedAlert();
      }
    }

    setShowExportMenu(false);
  };

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

  // Calculate portfolio stats for the summary
  const portfolioStats: PortfolioStats | null = useMemo(() => {
    if (collection.length === 0) return null;

    let tier1Count = 0, tier2Count = 0, tier3Count = 0, tier4Count = 0, tier5Count = 0;

    collection.forEach((item) => {
      const tier = item.tier || getVerdictTier(item.adjusted_value_high ?? item.estimated_value_high);
      switch (tier) {
        case 1: tier1Count++; break;
        case 2: tier2Count++; break;
        case 3: tier3Count++; break;
        case 4: tier4Count++; break;
        case 5: tier5Count++; break;
      }
    });

    return {
      totalItems: collection.length,
      totalValueLow: totalValue.low,
      totalValueHigh: totalValue.high,
      avgValueLow: Math.round(totalValue.low / collection.length),
      avgValueHigh: Math.round(totalValue.high / collection.length),
      estimatedOriginalCost: collection.length * 5, // $5 per Beanie
      tier1Count,
      tier2Count,
      tier3Count,
      tier4Count,
      tier5Count,
    };
  }, [collection, totalValue]);

  // Portfolio summary data (memoized to avoid recalculating on every render)
  const portfolioSummary = useMemo(() => {
    if (!portfolioStats) return null;

    return {
      verdict: getPortfolioVerdict(portfolioStats),
      roast: getPortfolioRoast(portfolioStats),
      whatYouCouldBuy: getWhatYouCouldHaveBought(portfolioStats.totalValueHigh),
      sp500Comparison: getPortfolioSP500Comparison(portfolioStats.estimatedOriginalCost),
      tierBreakdown: getTierBreakdownComment(portfolioStats),
    };
  }, [portfolioStats]);

  // Collection insights (memoized)
  const collectionInsights = useMemo<CollectionInsight[]>(() => {
    if (collection.length < 3) return [];

    // Gather collection data for insights
    const animalTypes = collection.map(item => item.animal_type);
    const colors = collection.flatMap(item => item.colors);
    const tiers = collection.map(item => item.tier || 1);

    // Find best and worst
    const sorted = [...collection].sort((a, b) =>
      (b.adjusted_value_high ?? b.estimated_value_high) - (a.adjusted_value_high ?? a.estimated_value_high)
    );
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    // Get dates
    const timestamps = collection.map(item => item.timestamp).sort((a, b) => a - b);
    const oldestScanDate = timestamps.length > 0 ? new Date(timestamps[0]) : null;
    const newestScanDate = timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1]) : null;

    return generateCollectionInsights({
      totalItems: collection.length,
      totalValueHigh: totalValue.high,
      animalTypes,
      colors,
      tiers,
      bestFindName: best?.name || 'Unknown',
      bestFindValue: best?.adjusted_value_high ?? best?.estimated_value_high ?? 0,
      worstFindName: worst?.name || 'Unknown',
      worstFindValue: worst?.adjusted_value_high ?? worst?.estimated_value_high ?? 0,
      avgValue: totalValue.high / collection.length,
      oldestScanDate,
      newestScanDate,
    });
  }, [collection, totalValue]);

  // Get top items sorted by value for certificate
  const topItems = [...collection]
    .sort((a, b) => (b.adjusted_value_high ?? b.estimated_value_high) - (a.adjusted_value_high ?? a.estimated_value_high))
    .slice(0, 3)
    .map(item => ({
      name: item.name,
      valueLow: item.adjusted_value_low ?? item.estimated_value_low,
      valueHigh: item.adjusted_value_high ?? item.estimated_value_high,
    }));

  // Share collection certificate
  const handleShare = async () => {
    if (!certificateRef.current || collection.length === 0) return;

    setIsSharing(true);

    try {
      // Capture the certificate as an image
      const uri = await captureRef(certificateRef, {
        format: 'png',
        quality: 1,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Beanie collection',
        });
      } else {
        // Fallback: save to camera roll
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          if (Platform.OS !== 'web') {
            Alert.alert('Saved', 'Collection certificate saved to camera roll!');
          }
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showShareFailedAlert();
    } finally {
      setIsSharing(false);
    }
  };

  // Share stats card
  const handleShareStats = async () => {
    if (!statsCardRef.current || collection.length === 0) return;

    setIsSharing(true);

    try {
      const uri = await captureRef(statsCardRef, {
        format: 'png',
        quality: 1,
      });

      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your collection stats',
        });
      } else {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          if (Platform.OS !== 'web') {
            Alert.alert('Saved', 'Stats card saved to camera roll!');
          }
        }
      }
    } catch (error) {
      console.error('Error sharing stats:', error);
      showShareFailedAlert();
    } finally {
      setIsSharing(false);
    }
  };

  // Navigate to result screen with collection item data
  const handleItemPress = (item: CollectionItem) => {
    // Build follow-up answers if condition or pellet_type is set
    const followUpAnswers = (item.condition || item.pellet_type) ? {
      condition: item.condition,
      pellet_type: item.pellet_type,
    } : null;

    router.push({
      pathname: '/result',
      params: {
        name: item.name,
        animal_type: item.animal_type,
        variant: item.variant,
        colors: JSON.stringify(item.colors),
        estimated_value_low: String(item.estimated_value_low),
        estimated_value_high: String(item.estimated_value_high),
        value_notes: item.value_notes,
        confidence: 'High',
        has_visible_hang_tag: 'true',
        followUpAnswers: followUpAnswers ? JSON.stringify(followUpAnswers) : undefined,
        fromCollection: 'true',  // Flag to prevent re-saving
        collectionThumbnail: item.thumbnail || undefined,  // Pass thumbnail for certificate
      },
    });
  };

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

      {/* Stats Card Modal */}
      <Modal
        visible={showStatsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowStatsModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle}>Collection Stats</Text>

            <View style={styles.certificatePreview}>
              <CollectionStatsCard
                ref={statsCardRef}
                collection={collection}
                totalXP={totalXP}
                currentStreak={getStreak()}
                userName={userName || undefined}
              />
            </View>

            <Pressable
              onPress={handleShareStats}
              disabled={isSharing}
              style={styles.modalShareButton}
            >
              <LinearGradient
                colors={['#8B5CF6', '#FF00FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalShareGradient}
              >
                <Text style={styles.modalShareText}>
                  {isSharing ? 'Sharing...' : 'Share Stats'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Certificate Preview Modal */}
      <Modal
        visible={showCertificateModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCertificateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowCertificateModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle}>Collection Certificate</Text>

            <View style={styles.certificatePreview}>
              <CollectionCertificate
                ref={certificateRef}
                itemCount={collection.length}
                totalValueLow={totalValue.low}
                totalValueHigh={totalValue.high}
                topItems={topItems}
                userName={userName || undefined}
              />
            </View>

            <Pressable
              onPress={handleShare}
              disabled={isSharing}
              style={styles.modalShareButton}
            >
              <LinearGradient
                colors={['#FF00FF', '#FF1493']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalShareGradient}
              >
                <Text style={styles.modalShareText}>
                  {isSharing ? 'Sharing...' : 'Share Certificate'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>

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
            {/* Top row: Home + Actions */}
            <View style={styles.headerTopRow}>
              <Pressable onPress={() => router.replace('/')} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Home</Text>
              </Pressable>

              <View style={styles.headerActions}>
                {collection.length > 0 && (
                  <>
                    {/* Stats button */}
                    {Platform.OS !== 'web' && (
                      <Pressable
                        onPress={() => setShowStatsModal(true)}
                        style={styles.statsButton}
                      >
                        <Text style={styles.statsButtonText}>Stats</Text>
                      </Pressable>
                    )}

                    {/* Certificate button */}
                    {Platform.OS !== 'web' && (
                      <Pressable
                        onPress={() => setShowCertificateModal(true)}
                        style={styles.shareButton}
                      >
                        <Text style={styles.shareButtonText}>Certificate</Text>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </View>

            <Text style={styles.headerTitle}>My Collection</Text>

            {collection.length > 0 && (
              <>
                <Text style={styles.totalValue}>
                  ${totalValue.low} - ${totalValue.high}
                </Text>
                <Text style={styles.itemCount}>
                  {collection.length} {collection.length === 1 ? 'item' : 'items'}
                  {searchQuery && ` (showing ${filteredCollection.length})`}
                </Text>

                {/* Search bar */}
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or animal..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <Pressable
                      onPress={() => setSearchQuery('')}
                      style={styles.searchClear}
                    >
                      <Text style={styles.searchClearText}>✕</Text>
                    </Pressable>
                  )}
                </View>

                {/* Sort control */}
                <View style={styles.sortContainer}>
                  <Pressable
                    onPress={() => setShowSortMenu(!showSortMenu)}
                    style={styles.sortButton}
                  >
                    <Text style={styles.sortButtonText}>
                      Sort: {SORT_OPTIONS.find((o) => o.key === sortOption)?.label}
                    </Text>
                    <Text style={styles.sortArrow}>{showSortMenu ? '▲' : '▼'}</Text>
                  </Pressable>

                  {showSortMenu && (
                    <View style={styles.sortMenu}>
                      {SORT_OPTIONS.map((option) => (
                        <Pressable
                          key={option.key}
                          onPress={() => {
                            setSortOption(option.key);
                            setShowSortMenu(false);
                            if (Platform.OS !== 'web') {
                              Haptics.selectionAsync();
                            }
                          }}
                          style={[
                            styles.sortMenuItem,
                            sortOption === option.key && styles.sortMenuItemSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.sortMenuItemText,
                              sortOption === option.key && styles.sortMenuItemTextSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </BlurView>
      </Animated.View>

      {/* Content */}
      {collection.length === 0 ? (
        <EmptyState />
      ) : filteredCollection.length === 0 ? (
        <EmptyState searchQuery={searchQuery} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            Platform.OS !== 'web' ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FF00FF"
                colors={['#FF00FF']}
              />
            ) : undefined
          }
        >
          {/* Portfolio Summary Section - inside ScrollView */}
          {portfolioSummary && collection.length >= 2 && (
            <Animated.View
              style={[
                styles.portfolioSummaryContainer,
                { opacity: fadeAnim },
              ]}
            >
              <Pressable
                onPress={() => {
                  setShowPortfolioSummary(!showPortfolioSummary);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={styles.portfolioSummaryToggle}
              >
                <BlurView intensity={40} tint="light" style={styles.portfolioSummaryBlur}>
                  <View style={styles.portfolioSummaryHeader}>
                    <Text style={styles.portfolioEmoji}>{portfolioSummary.verdict.emoji}</Text>
                    <View style={styles.portfolioTitleSection}>
                      <Text style={styles.portfolioTitle}>{portfolioSummary.verdict.title}</Text>
                      <Text style={styles.portfolioSubtitle}>{portfolioSummary.verdict.subtitle}</Text>
                    </View>
                    <Text style={styles.portfolioExpandIcon}>{showPortfolioSummary ? '▲' : '▼'}</Text>
                  </View>
                </BlurView>
              </Pressable>

              {showPortfolioSummary && (
                <BlurView intensity={40} tint="light" style={styles.portfolioSummaryExpanded}>
                  <View style={styles.portfolioSummaryContent}>
                    {/* The Roast */}
                    <View style={styles.portfolioRoastContainer}>
                      <Text style={styles.portfolioRoastIcon}>🔥</Text>
                      <Text style={styles.portfolioRoastText}>{portfolioSummary.roast}</Text>
                    </View>

                    {/* Tier Breakdown */}
                    <View style={styles.portfolioSection}>
                      <Text style={styles.portfolioSectionTitle}>📊 TIER BREAKDOWN</Text>
                      <View style={styles.tierBarsContainer}>
                        {portfolioStats && [
                          { tier: 5, count: portfolioStats.tier5Count, color: '#FF00FF', label: '$1000+' },
                          { tier: 4, count: portfolioStats.tier4Count, color: '#FF6B35', label: '$200-1K' },
                          { tier: 3, count: portfolioStats.tier3Count, color: '#00CED1', label: '$50-200' },
                          { tier: 2, count: portfolioStats.tier2Count, color: '#666666', label: '$15-50' },
                          { tier: 1, count: portfolioStats.tier1Count, color: '#999999', label: '<$15' },
                        ].map(({ tier, count, color, label }) => (
                          <View key={tier} style={styles.tierBarRow}>
                            <Text style={styles.tierBarLabel}>{label}</Text>
                            <View style={styles.tierBarBackground}>
                              <View
                                style={[
                                  styles.tierBarFill,
                                  {
                                    width: `${Math.max(5, (count / portfolioStats.totalItems) * 100)}%`,
                                    backgroundColor: color,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={styles.tierBarCount}>{count}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.tierBreakdownComment}>{portfolioSummary.tierBreakdown}</Text>
                    </View>

                    {/* What You Could Buy */}
                    <View style={styles.portfolioSection}>
                      <Text style={styles.portfolioSectionTitle}>🛒 WHAT THIS COULD BUY</Text>
                      <View style={styles.whatYouCouldBuyList}>
                        {portfolioSummary.whatYouCouldBuy.map((item, index) => (
                          <Text key={index} style={styles.whatYouCouldBuyItem}>{item}</Text>
                        ))}
                      </View>
                    </View>

                    {/* S&P 500 Comparison */}
                    <View style={styles.portfolioSection}>
                      <Text style={styles.portfolioSectionTitle}>📈 THE ALTERNATE TIMELINE</Text>
                      <Text style={styles.sp500Text}>{portfolioSummary.sp500Comparison.difference}</Text>
                      <Text style={styles.sp500Subtext}>
                        Your Beanies: ${totalValue.low} - ${totalValue.high}
                      </Text>
                    </View>

                    {/* Collection Insights */}
                    {collectionInsights.length > 0 && (
                      <View style={styles.portfolioSection}>
                        <Text style={styles.portfolioSectionTitle}>💡 YOUR COLLECTION INSIGHTS</Text>
                        <View style={styles.insightsGrid}>
                          {collectionInsights.map((insight, index) => (
                            <View key={index} style={styles.insightCard}>
                              <Text style={styles.insightEmoji}>{insight.emoji}</Text>
                              <View style={styles.insightContent}>
                                <Text style={styles.insightTitle}>{insight.title}</Text>
                                <Text style={styles.insightDescription}>{insight.description}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </BlurView>
              )}
            </Animated.View>
          )}

          <View style={styles.grid}>
            {filteredCollection.map((item, index) => (
              <CollectionItemCard
                key={item.id}
                item={item}
                onDelete={removeItem}
                onPress={handleItemPress}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
    marginTop: 8,
  },
  certificatePreview: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalShareButton: {
    width: '100%',
  },
  modalShareGradient: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalShareText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
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
    zIndex: 10,
  },
  headerBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
  },
  backButtonText: {
    fontSize: 16,
    color: '#00CED1',
    fontWeight: '600',
  },
  actionButton: {
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  shareButton: {
  },
  shareButtonText: {
    fontSize: 14,
    color: '#FF00FF',
    fontWeight: '600',
  },
  statsButton: {
  },
  statsButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  // Search styles
  searchContainer: {
    width: '100%',
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1a1a2e',
  },
  searchClear: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  searchClearText: {
    fontSize: 16,
    color: '#999',
  },
  // Sort styles
  sortContainer: {
    width: '100%',
    marginTop: 10,
    position: 'relative',
    zIndex: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    alignSelf: 'center',
    gap: 6,
  },
  sortButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  sortArrow: {
    fontSize: 10,
    color: '#999',
  },
  sortMenu: {
    position: 'absolute',
    top: 40,
    left: '50%',
    marginLeft: -80,
    width: 160,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 100,
  },
  sortMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  sortMenuItemSelected: {
    backgroundColor: 'rgba(255, 0, 255, 0.08)',
  },
  sortMenuItemText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  sortMenuItemTextSelected: {
    color: '#FF00FF',
    fontWeight: '600',
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
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
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
  // Portfolio Summary styles
  portfolioSummaryContainer: {
    marginBottom: 16,
    zIndex: 5,
  },
  portfolioSummaryToggle: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  portfolioSummaryBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  portfolioSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    gap: 12,
  },
  portfolioEmoji: {
    fontSize: 32,
  },
  portfolioTitleSection: {
    flex: 1,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  portfolioSubtitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  portfolioExpandIcon: {
    fontSize: 12,
    color: '#999',
  },
  portfolioSummaryExpanded: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  portfolioSummaryContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    gap: 16,
  },
  portfolioRoastContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 0, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 0, 255, 0.3)',
    gap: 10,
  },
  portfolioRoastIcon: {
    fontSize: 20,
  },
  portfolioRoastText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#FF00FF',
    lineHeight: 20,
    fontWeight: '500',
  },
  portfolioSection: {
    gap: 10,
  },
  portfolioSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00CED1',
    letterSpacing: 1,
  },
  tierBarsContainer: {
    gap: 6,
  },
  tierBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierBarLabel: {
    fontSize: 11,
    color: '#666',
    width: 55,
    textAlign: 'right',
  },
  tierBarBackground: {
    flex: 1,
    height: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tierBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  tierBarCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a2e',
    width: 24,
    textAlign: 'center',
  },
  tierBreakdownComment: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  whatYouCouldBuyList: {
    gap: 6,
  },
  whatYouCouldBuyItem: {
    fontSize: 14,
    color: '#1a1a2e',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sp500Text: {
    fontSize: 14,
    color: '#1a1a2e',
    lineHeight: 20,
    textAlign: 'center',
  },
  sp500Subtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  // Insights styles
  insightsGrid: {
    gap: 10,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  insightEmoji: {
    fontSize: 22,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  // Skeleton loading styles
  skeletonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
  },
  skeletonThumbnail: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
    marginBottom: 10,
  },
  skeletonName: {
    width: '70%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
    marginBottom: 8,
  },
  skeletonValue: {
    width: '50%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E8E8E8',
  },
});
