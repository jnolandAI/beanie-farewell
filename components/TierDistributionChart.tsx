import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CollectionItem } from '../types/beanie';

interface TierDistributionChartProps {
  collection: CollectionItem[];
  compact?: boolean;  // Smaller version for home screen
}

const TIER_CONFIG = [
  { tier: 1, label: 'Welp', color: '#9CA3AF', emoji: '😢' },
  { tier: 2, label: 'Meh', color: '#6B7280', emoji: '😐' },
  { tier: 3, label: 'Oh?', color: '#00CED1', emoji: '😮' },
  { tier: 4, label: 'Whoa', color: '#FF6B35', emoji: '🤩' },
  { tier: 5, label: '!!!', color: '#FF00FF', emoji: '🤯' },
];

export function TierDistributionChart({ collection, compact = false }: TierDistributionChartProps) {
  // Count items by tier
  const tierCounts = TIER_CONFIG.map(({ tier }) => ({
    tier,
    count: collection.filter(item => item.tier === tier).length,
  }));

  const totalItems = collection.length;
  const maxCount = Math.max(...tierCounts.map(t => t.count), 1);

  if (totalItems === 0) {
    return null;
  }

  // Find the dominant tier
  const dominantTier = tierCounts.reduce((max, curr) =>
    curr.count > max.count ? curr : max, tierCounts[0]);

  if (compact) {
    // Compact horizontal bars for home screen
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>📊 Tier Breakdown</Text>
        </View>
        <View style={styles.compactBars}>
          {TIER_CONFIG.map(({ tier, color, emoji }) => {
            const count = tierCounts.find(t => t.tier === tier)?.count || 0;
            const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;

            return (
              <View key={tier} style={styles.compactBarRow}>
                <Text style={styles.compactEmoji}>{emoji}</Text>
                <View style={styles.compactBarTrack}>
                  <View
                    style={[
                      styles.compactBarFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }
                    ]}
                  />
                </View>
                <Text style={styles.compactCount}>{count}</Text>
              </View>
            );
          })}
        </View>
        {dominantTier.count > 0 && (
          <Text style={styles.compactInsight}>
            Mostly {TIER_CONFIG[dominantTier.tier - 1].emoji} {TIER_CONFIG[dominantTier.tier - 1].label} ({Math.round((dominantTier.count / totalItems) * 100)}%)
          </Text>
        )}
      </View>
    );
  }

  // Full vertical bar chart for collection screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tier Distribution</Text>

      <View style={styles.chartContainer}>
        {TIER_CONFIG.map(({ tier, label, color, emoji }) => {
          const count = tierCounts.find(t => t.tier === tier)?.count || 0;
          const heightPercentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <View key={tier} style={styles.barColumn}>
              <Text style={styles.countLabel}>{count}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercentage}%`,
                      backgroundColor: color,
                    }
                  ]}
                />
              </View>
              <Text style={styles.tierEmoji}>{emoji}</Text>
              <Text style={styles.tierLabel}>{label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>
          {dominantTier.count > 0
            ? `Your collection is mostly ${TIER_CONFIG[dominantTier.tier - 1].label} (${Math.round((dominantTier.count / totalItems) * 100)}%)`
            : 'Start scanning to see your tier breakdown!'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full chart styles
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  countLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  barTrack: {
    width: 32,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
    minHeight: 4,
  },
  tierEmoji: {
    fontSize: 16,
    marginTop: 6,
  },
  tierLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#999',
    marginTop: 2,
  },
  legend: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  legendText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Compact chart styles (for home screen)
  compactContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  compactHeader: {
    marginBottom: 10,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  compactBars: {
    gap: 6,
  },
  compactBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactEmoji: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  compactBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  compactBarFill: {
    height: '100%',
    borderRadius: 6,
    minWidth: 4,
  },
  compactCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 24,
    textAlign: 'right',
  },
  compactInsight: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default TierDistributionChart;
