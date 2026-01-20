import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { getCertificateTagline, getCertificateDisclaimer, getCollectionPermissionText } from '../lib/humor';

// ============================================
// TYPES
// ============================================

export interface CollectionCertificateProps {
  itemCount: number;
  totalValueLow: number;
  totalValueHigh: number;
  topItems: Array<{ name: string; valueLow: number; valueHigh: number }>;
  userName?: string;  // User's first name for personalization
}

// ============================================
// OFFICIAL SEAL COMPONENT
// ============================================

function OfficialSeal({ color }: { color: string }) {
  return (
    <Svg width="55" height="55" viewBox="0 0 100 100">
      <Path
        d="M50 0 L55 20 L70 5 L65 25 L85 15 L75 35 L95 30 L80 45 L100 50 L80 55 L95 70 L75 65 L85 85 L65 75 L70 95 L55 80 L50 100 L45 80 L30 95 L35 75 L15 85 L25 65 L5 70 L20 55 L0 50 L20 45 L5 30 L25 35 L15 15 L35 25 L30 5 L45 20 Z"
        fill={color}
        opacity={0.15}
      />
      <Circle cx="50" cy="50" r="32" fill="white" stroke={color} strokeWidth="2" />
      <Circle cx="50" cy="50" r="28" fill="none" stroke={color} strokeWidth="1" opacity={0.5} />
      <SvgText x="50" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill={color}>
        CERTIFIED
      </SvgText>
      <SvgText x="50" y="54" textAnchor="middle" fontSize="6" fill={color}>
        COLLECTION
      </SvgText>
      <SvgText x="50" y="64" textAnchor="middle" fontSize="5" fill={color} opacity={0.7}>
        2026
      </SvgText>
    </Svg>
  );
}

// ============================================
// CONFIGURATION
// ============================================

const COLORS = {
  primaryPurple: '#8B5CF6',
  magenta: '#FF00FF',
};

// App main icon
const APP_ICON = require('../assets/icons/icon-main.png');

// Verdict icons based on collection value
const VERDICT_ICONS: Record<string, any> = {
  low: require('../assets/icons/icon-tier1.png'),    // Low value collection
  mid: require('../assets/icons/icon-tier3.png'),    // Mid value collection
  high: require('../assets/icons/icon-tier5.png'),   // High value collection
};

// Verdicts for collections based on total value
function getCollectionVerdict(totalHigh: number): { title: string; icon: any; accent: string } {
  if (totalHigh >= 500) {
    return { title: "IMPRESSIVE", icon: VERDICT_ICONS.high, accent: '#10B981' };
  } else if (totalHigh >= 100) {
    return { title: "NOT BAD", icon: VERDICT_ICONS.mid, accent: '#06B6D4' };
  } else if (totalHigh >= 50) {
    return { title: "MEH", icon: VERDICT_ICONS.low, accent: '#6B7280' };
  }
  return { title: "WELP", icon: VERDICT_ICONS.low, accent: '#9CA3AF' };
}

// ============================================
// COMPONENT
// ============================================

export const CollectionCertificate = React.forwardRef<View, CollectionCertificateProps>(
  ({ itemCount, totalValueLow, totalValueHigh, topItems, userName }, ref) => {
    const certificateLabel = getCertificateTagline();
    const disclaimer = getCertificateDisclaimer();
    const permission = getCollectionPermissionText(totalValueHigh);
    const verdict = getCollectionVerdict(totalValueHigh);

    return (
      <View ref={ref} style={styles.container}>
        {/* Background gradient */}
        <LinearGradient
          colors={['#FAFAFA', '#F0F0F0', '#FAFAFA']}
          locations={[0, 0.5, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.backgroundGradient}
        />

        {/* Certificate border */}
        <View style={[styles.certificateBorder, { borderColor: `${verdict.accent}30` }]}>

          {/* Header: App icon + title */}
          <View style={styles.header}>
            <Image source={APP_ICON} style={styles.appIcon} resizeMode="contain" />
            <Text style={[styles.appName, { color: COLORS.primaryPurple }]}>Beanie Farewell</Text>
            <Text style={[styles.certificateLabel, { color: verdict.accent }]}>{certificateLabel}</Text>
          </View>

          {/* Issued To section - only if userName provided */}
          {userName && (
            <View style={styles.issuedToSection}>
              <Text style={styles.issuedToLabel}>ISSUED TO</Text>
              <Text style={[styles.issuedToName, { color: verdict.accent }]}>{userName}</Text>
            </View>
          )}

          {/* VERDICT SECTION */}
          <View style={[styles.verdictSection, { backgroundColor: `${verdict.accent}10` }]}>
            <Image source={verdict.icon} style={styles.verdictIcon} resizeMode="contain" />
            <View style={styles.verdictText}>
              <Text style={[styles.verdictTitle, { color: verdict.accent }]}>{verdict.title}</Text>
              <Text style={styles.collectionLabel}>COLLECTION</Text>
            </View>
          </View>

          {/* STATS SECTION */}
          <View style={styles.statsSection}>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: verdict.accent }]}>{itemCount}</Text>
              <Text style={styles.statLabel}>{itemCount === 1 ? 'BEANIE' : 'BEANIES'}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: `${verdict.accent}30` }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: verdict.accent }]}>${totalValueLow}-${totalValueHigh}</Text>
              <Text style={styles.statLabel}>TOTAL VALUE</Text>
            </View>
          </View>

          {/* TOP ITEMS */}
          {topItems.length > 0 && (
            <View style={styles.topItemsSection}>
              <Text style={[styles.topItemsTitle, { color: verdict.accent }]}>TOP PERFORMERS</Text>
              {topItems.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.topItemRow}>
                  <Text style={styles.topItemRank}>#{index + 1}</Text>
                  <Text style={styles.topItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.topItemValue, { color: verdict.accent }]}>
                    ${item.valueLow}-${item.valueHigh}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Permission text with seal */}
          <View style={styles.permissionWithSeal}>
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>{permission}</Text>
            </View>
            <View style={styles.sealContainer}>
              <OfficialSeal color={verdict.accent} />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerUrl}>beaniefarewell.com</Text>
            <Text style={styles.disclaimer}>{disclaimer}</Text>
          </View>
        </View>
      </View>
    );
  }
);

CollectionCertificate.displayName = 'CollectionCertificate';

// ============================================
// STYLES
// ============================================

const CERTIFICATE_WIDTH = 320;
const CERTIFICATE_HEIGHT = 440;

const styles = StyleSheet.create({
  container: {
    width: CERTIFICATE_WIDTH,
    height: CERTIFICATE_HEIGHT,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  certificateBorder: {
    flex: 1,
    margin: 10,
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    alignItems: 'center',
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginBottom: 2,
  },
  appName: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  certificateLabel: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Issued To Section
  issuedToSection: {
    alignItems: 'center',
    marginVertical: 2,
  },
  issuedToLabel: {
    fontSize: 6,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  issuedToName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Verdict Section
  verdictSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  verdictIcon: {
    width: 45,
    height: 45,
  },
  verdictText: {
    alignItems: 'flex-start',
  },
  verdictTitle: {
    fontSize: 22,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  collectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
  },

  // Top Items
  topItemsSection: {
    paddingHorizontal: 4,
  },
  topItemsTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  topItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  topItemRank: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    width: 24,
  },
  topItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3436',
    flex: 1,
    marginRight: 8,
  },
  topItemValue: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Permission with Seal
  permissionWithSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  permissionContainer: {
    flex: 1,
  },
  permissionText: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 13,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  sealContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
  },
  footerUrl: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  disclaimer: {
    fontSize: 6,
    color: '#B2BEC3',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default CollectionCertificate;
