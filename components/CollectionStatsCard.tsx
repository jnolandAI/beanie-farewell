import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { CollectionItem } from '../types/beanie';
import { calculateLevel } from '../lib/challenges';
import { getFlexFlopLabel } from '../lib/humor';

// App icon
const APP_ICON = require('../assets/icons/icon-main.png');

// Tier 2 icon variants
const TIER_2_ICONS = [
  require('../assets/icons/icon-tier2A.png'),
  require('../assets/icons/icon-tier2B.png'),
  require('../assets/icons/icon-tier2C.png'),
  require('../assets/icons/icon-tier2D.png'),
  require('../assets/icons/icon-tier2E.png'),
  require('../assets/icons/icon-tier2F.png'),
  require('../assets/icons/icon-tier2G.png'),
  require('../assets/icons/icon-tier2H.png'),
  require('../assets/icons/icon-tier2I.png'),
];

// Get a consistent tier 2 icon based on beanie name
const getTier2Icon = (beanieName: string) => {
  const hash = beanieName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TIER_2_ICONS[hash % TIER_2_ICONS.length];
};

// Tier icons for best find
const TIER_ICONS: Record<number, any> = {
  1: require('../assets/icons/icon-tier1.png'),
  2: TIER_2_ICONS[0],  // default - overridden dynamically
  3: require('../assets/icons/icon-tier3.png'),
  4: require('../assets/icons/icon-tier4.png'),
  5: require('../assets/icons/icon-tier5.png'),
};

interface CollectionStatsCardProps {
  collection: CollectionItem[];
  totalXP: number;
  currentStreak: number;
  userName?: string;
}

// Fun collector ranks based on collection size
function getCollectorRank(count: number): { rank: string; percentile: string } {
  if (count >= 100) return { rank: 'Beanie Baron', percentile: 'Top 1%' };
  if (count >= 50) return { rank: 'Beanie Mogul', percentile: 'Top 5%' };
  if (count >= 25) return { rank: 'Beanie Enthusiast', percentile: 'Top 15%' };
  if (count >= 10) return { rank: 'Beanie Collector', percentile: 'Top 30%' };
  if (count >= 5) return { rank: 'Beanie Hobbyist', percentile: 'Top 50%' };
  return { rank: 'Beanie Beginner', percentile: 'Getting Started' };
}

// Official Seal Component
function OfficialSeal({ color }: { color: string }) {
  return (
    <Svg width="50" height="50" viewBox="0 0 100 100">
      <Path
        d="M50 0 L55 20 L70 5 L65 25 L85 15 L75 35 L95 30 L80 45 L100 50 L80 55 L95 70 L75 65 L85 85 L65 75 L70 95 L55 80 L50 100 L45 80 L30 95 L35 75 L15 85 L25 65 L5 70 L20 55 L0 50 L20 45 L5 30 L25 35 L15 15 L35 25 L30 5 L45 20 Z"
        fill={color}
        opacity={0.15}
      />
      <Circle cx="50" cy="50" r="28" fill="white" stroke={color} strokeWidth="2" />
      <SvgText x="50" y="46" textAnchor="middle" fontSize="7" fontWeight="bold" fill={color}>
        CERTIFIED
      </SvgText>
      <SvgText x="50" y="58" textAnchor="middle" fontSize="6" fill={color}>
        COLLECTOR
      </SvgText>
    </Svg>
  );
}

export const CollectionStatsCard = React.forwardRef<View, CollectionStatsCardProps>(
  ({ collection, totalXP, currentStreak, userName }, ref) => {
    // Calculate stats
    const levelInfo = calculateLevel(totalXP);
    const totalValueLow = collection.reduce((sum, item) => sum + (item.adjusted_value_low ?? item.estimated_value_low), 0);
    const totalValueHigh = collection.reduce((sum, item) => sum + (item.adjusted_value_high ?? item.estimated_value_high), 0);

    // Best find
    const bestFind = collection.length > 0
      ? collection.reduce((best, item) => {
          const itemValue = item.adjusted_value_high ?? item.estimated_value_high;
          const bestValue = best.adjusted_value_high ?? best.estimated_value_high;
          return itemValue > bestValue ? item : best;
        }, collection[0])
      : null;

    const bestFindValue = bestFind
      ? (bestFind.adjusted_value_high ?? bestFind.estimated_value_high)
      : 0;
    const bestFindFlexFlop = bestFind ? getFlexFlopLabel(bestFindValue) : null;

    // Tier distribution
    const tierCounts = [0, 0, 0, 0, 0];
    collection.forEach(item => {
      const tier = item.tier || 1;
      tierCounts[tier - 1]++;
    });

    // Collector rank
    const { rank, percentile } = getCollectorRank(collection.length);

    return (
      <View ref={ref} style={styles.container}>
        <LinearGradient
          colors={['#F8F4FF', '#FFF8F0', '#F0FDFC']}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />

        <View style={styles.cardBorder}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={APP_ICON} style={styles.appIcon} resizeMode="contain" />
            <View style={styles.headerText}>
              <Text style={styles.appName}>Beanie Farewell</Text>
              <Text style={styles.cardLabel}>Collection Stats</Text>
            </View>
            <OfficialSeal color={levelInfo.color} />
          </View>

          {/* User Info */}
          {userName && (
            <View style={styles.userSection}>
              <Text style={styles.userName}>{userName}'s Collection</Text>
            </View>
          )}

          {/* Level Badge */}
          <View style={[styles.levelBadge, { borderColor: levelInfo.color }]}>
            <Text style={styles.levelEmoji}>{levelInfo.emoji}</Text>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelNumber, { color: levelInfo.color }]}>Level {levelInfo.level}</Text>
              <Text style={styles.levelTitle}>{levelInfo.title}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpAmount}>{totalXP}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>📦</Text>
              <Text style={styles.statValue}>{collection.length}</Text>
              <Text style={styles.statLabel}>Beanies</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>💰</Text>
              <Text style={styles.statValue}>${totalValueHigh}</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          {/* Best Find */}
          {bestFind && (
            <View style={styles.bestFindSection}>
              <Text style={styles.sectionTitle}>BEST FIND</Text>
              <View style={styles.bestFindCard}>
                <Image source={(bestFind.tier || 1) === 2 ? getTier2Icon(bestFind.name) : TIER_ICONS[bestFind.tier || 1]} style={styles.bestFindIcon} resizeMode="contain" />
                <View style={styles.bestFindInfo}>
                  <Text style={styles.bestFindName}>{bestFind.name}</Text>
                  <Text style={styles.bestFindValue}>${bestFindValue}</Text>
                </View>
                {bestFindFlexFlop && (
                  <View style={[styles.flexFlopBadge, { backgroundColor: bestFindFlexFlop.color }]}>
                    <Text style={styles.flexFlopText}>{bestFindFlexFlop.label}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Tier Distribution */}
          <View style={styles.tierSection}>
            <Text style={styles.sectionTitle}>TIER BREAKDOWN</Text>
            <View style={styles.tierBars}>
              {tierCounts.map((count, index) => {
                const tierColors = ['#9CA3AF', '#6B7280', '#00CED1', '#FF6B35', '#FF00FF'];
                const maxCount = Math.max(...tierCounts, 1);
                const width = (count / maxCount) * 100;
                return (
                  <View key={index} style={styles.tierRow}>
                    <Text style={styles.tierLabel}>T{index + 1}</Text>
                    <View style={styles.tierBarContainer}>
                      <View style={[styles.tierBar, { width: `${width}%`, backgroundColor: tierColors[index] }]} />
                    </View>
                    <Text style={styles.tierCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Collector Rank */}
          <View style={styles.rankSection}>
            <Text style={styles.rankTitle}>{rank}</Text>
            <Text style={styles.rankPercentile}>{percentile} of Collectors</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerUrl}>beaniefarewell.com</Text>
            <Text style={styles.footerDate}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
    );
  }
);

CollectionStatsCard.displayName = 'CollectionStatsCard';

const CARD_WIDTH = 360;
const CARD_HEIGHT = 520;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardBorder: {
    flex: 1,
    margin: 10,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  headerText: {
    flex: 1,
  },
  appName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#8B5CF6',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
  },

  // User Section
  userSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },

  // Level Badge
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 10,
    marginBottom: 12,
  },
  levelEmoji: {
    fontSize: 24,
  },
  levelInfo: {
    flex: 1,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  levelTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  xpBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  xpAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  xpLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingVertical: 10,
    borderRadius: 10,
  },
  statEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#666',
  },

  // Best Find
  bestFindSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 6,
  },
  bestFindCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  bestFindIcon: {
    width: 36,
    height: 36,
  },
  bestFindInfo: {
    flex: 1,
  },
  bestFindName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  bestFindValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  flexFlopBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  flexFlopText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Tier Distribution
  tierSection: {
    marginBottom: 12,
  },
  tierBars: {
    gap: 4,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    width: 20,
  },
  tierBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tierBar: {
    height: '100%',
    borderRadius: 5,
  },
  tierCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    width: 20,
    textAlign: 'right',
  },

  // Rank Section
  rankSection: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  rankTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  rankPercentile: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerUrl: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  footerDate: {
    fontSize: 8,
    color: '#999',
  },
});

export default CollectionStatsCard;
