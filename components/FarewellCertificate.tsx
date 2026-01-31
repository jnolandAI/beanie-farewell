import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Text as SvgText, G } from 'react-native-svg';
import { getCertificateTagline, getCertificateDisclaimer, getPermissionText, getFlexFlopLabel, FlexFlopLabel } from '../lib/humor';

// ============================================
// TYPES
// ============================================

export interface FarewellCertificateProps {
  name: string;
  variant: string;
  valueLow: number;
  valueHigh: number;
  verdictTitle: string;
  tier: number;
  beanieImage?: string;  // Base64 image of the scanned Beanie
  userName?: string;  // User's first name for personalization
  roast?: string;  // Funny roast of this Beanie
}

// ============================================
// OFFICIAL SEAL COMPONENT
// ============================================

function OfficialSeal({ color }: { color: string }) {
  return (
    <Svg width="60" height="60" viewBox="0 0 100 100">
      {/* Outer starburst */}
      <Path
        d="M50 0 L55 20 L70 5 L65 25 L85 15 L75 35 L95 30 L80 45 L100 50 L80 55 L95 70 L75 65 L85 85 L65 75 L70 95 L55 80 L50 100 L45 80 L30 95 L35 75 L15 85 L25 65 L5 70 L20 55 L0 50 L20 45 L5 30 L25 35 L15 15 L35 25 L30 5 L45 20 Z"
        fill={color}
        opacity={0.15}
      />
      {/* Inner circle */}
      <Circle cx="50" cy="50" r="32" fill="white" stroke={color} strokeWidth="2" />
      <Circle cx="50" cy="50" r="28" fill="none" stroke={color} strokeWidth="1" opacity={0.5} />
      {/* Center text */}
      <SvgText x="50" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill={color}>
        CERTIFIED
      </SvgText>
      <SvgText x="50" y="54" textAnchor="middle" fontSize="6" fill={color}>
        FAREWELL
      </SvgText>
      <SvgText x="50" y="64" textAnchor="middle" fontSize="5" fill={color} opacity={0.7}>
        2026
      </SvgText>
    </Svg>
  );
}

// ============================================
// TIER CONFIGURATION
// ============================================

const COLORS = {
  primaryPurple: '#8B5CF6',
};

// Tier 2 icon variants - randomly select for variety
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

// Get a consistent tier 2 icon based on beanie name (same beanie = same icon)
const getTier2Icon = (beanieName: string) => {
  const hash = beanieName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TIER_2_ICONS[hash % TIER_2_ICONS.length];
};

// Tier icons matching the results page
const TIER_ICONS: Record<number, any> = {
  1: require('../assets/icons/icon-tier1.png'),
  2: TIER_2_ICONS[0],  // default - will be overridden dynamically
  3: require('../assets/icons/icon-tier3.png'),
  4: require('../assets/icons/icon-tier4.png'),
  5: require('../assets/icons/icon-tier5.png'),
};

// App main icon
const APP_ICON = require('../assets/icons/icon-main.png');

// Tier-specific styles
const TIER_STYLES: Record<number, { gradient: string[]; accent: string }> = {
  1: { gradient: ['#F3F4F6', '#E5E7EB'], accent: '#9CA3AF' },
  2: { gradient: ['#F3F4F6', '#E5E7EB'], accent: '#6B7280' },
  3: { gradient: ['#ECFEFF', '#CFFAFE'], accent: '#06B6D4' },
  4: { gradient: ['#FEF3C7', '#FDE68A'], accent: '#F59E0B' },
  5: { gradient: ['#D1FAE5', '#A7F3D0'], accent: '#10B981' },
};

const TIER_GRADIENTS: Record<number, { colors: string[]; locations: number[] }> = {
  1: { colors: [...TIER_STYLES[1].gradient, TIER_STYLES[1].gradient[0]], locations: [0, 0.5, 1] },
  2: { colors: [...TIER_STYLES[2].gradient, TIER_STYLES[2].gradient[0]], locations: [0, 0.5, 1] },
  3: { colors: [...TIER_STYLES[3].gradient, TIER_STYLES[3].gradient[0]], locations: [0, 0.5, 1] },
  4: { colors: [...TIER_STYLES[4].gradient, TIER_STYLES[4].gradient[0]], locations: [0, 0.5, 1] },
  5: { colors: [...TIER_STYLES[5].gradient, TIER_STYLES[5].gradient[0]], locations: [0, 0.5, 1] },
};

const TIER_ACCENTS: Record<number, { primary: string; text: string }> = {
  1: { primary: TIER_STYLES[1].accent, text: '#6B7280' },
  2: { primary: TIER_STYLES[2].accent, text: '#4B5563' },
  3: { primary: TIER_STYLES[3].accent, text: '#0891B2' },
  4: { primary: TIER_STYLES[4].accent, text: '#D97706' },
  5: { primary: TIER_STYLES[5].accent, text: '#059669' },
};

// ============================================
// COMPONENT
// ============================================

export const FarewellCertificate = React.forwardRef<View, FarewellCertificateProps>(
  ({ name, variant, valueLow, valueHigh, verdictTitle, tier, beanieImage, userName, roast }, ref) => {
    const normalizedTier = Math.max(1, Math.min(5, tier)) as 1 | 2 | 3 | 4 | 5;
    const gradient = TIER_GRADIENTS[normalizedTier];
    const accents = TIER_ACCENTS[normalizedTier];
    const certificateLabel = getCertificateTagline();
    const disclaimer = getCertificateDisclaimer();
    const permission = getPermissionText(normalizedTier);
    const tierIcon = normalizedTier === 2 ? getTier2Icon(name) : TIER_ICONS[normalizedTier];
    const flexFlopLabel = getFlexFlopLabel(valueHigh);

    return (
      <View ref={ref} style={styles.container}>
        {/* Background gradient */}
        <LinearGradient
          colors={gradient.colors as [string, string, string]}
          locations={gradient.locations as [number, number, number]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.backgroundGradient}
        />

        {/* Certificate border */}
        <View style={[styles.certificateBorder, { borderColor: `${accents.primary}30` }]}>

          {/* Header: App icon + title */}
          <View style={styles.header}>
            <Image source={APP_ICON} style={styles.appIcon} resizeMode="contain" />
            <Text style={[styles.appName, { color: COLORS.primaryPurple }]}>Bean Bye</Text>
            <Text style={[styles.certificateLabel, { color: accents.primary }]}>{certificateLabel}</Text>
          </View>

          {/* Issued To section - only if userName provided */}
          {userName && (
            <View style={styles.issuedToSection}>
              <Text style={styles.issuedToLabel}>ISSUED TO</Text>
              <Text style={[styles.issuedToName, { color: accents.primary }]}>{userName}</Text>
            </View>
          )}

          {/* VERDICT SECTION - The judgment */}
          <View style={[styles.verdictSection, { backgroundColor: `${accents.primary}10` }]}>
            <Image source={tierIcon} style={styles.tierIcon} resizeMode="contain" />
            <View style={styles.verdictContent}>
              <Text style={[styles.verdictTitle, { color: accents.primary }]}>{verdictTitle}</Text>
              {/* Flex/Flop Badge */}
              <View style={[styles.flexFlopBadge, { backgroundColor: flexFlopLabel.color }]}>
                <Text style={styles.flexFlopEmoji}>{flexFlopLabel.emoji}</Text>
                <Text style={styles.flexFlopLabel}>{flexFlopLabel.label}</Text>
              </View>
            </View>
          </View>

          {/* BEANIE SECTION - What was scanned */}
          <View style={styles.beanieSection}>
            {beanieImage && (
              <View style={styles.beanieImageContainer}>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${beanieImage}` }}
                  style={styles.beanieImage}
                  resizeMode="cover"
                />
              </View>
            )}
            <View style={styles.beanieInfo}>
              <Text style={styles.beanieName}>{name}</Text>
              <Text style={[styles.beanieVariant, { color: accents.text }]}>{variant}</Text>
              <View style={[styles.valueChip, { backgroundColor: `${accents.primary}15` }]}>
                <Text style={[styles.valueText, { color: accents.primary }]}>${valueLow} - ${valueHigh}</Text>
              </View>
            </View>
          </View>

          {/* THE ROAST - Savage but funny commentary */}
          {roast && (
            <View style={[styles.roastContainer, { borderColor: `${accents.primary}40` }]}>
              <Text style={styles.roastIcon}>🔥</Text>
              <Text style={[styles.roastText, { color: accents.text }]} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.8}>
                {roast}
              </Text>
            </View>
          )}

          {/* Permission text with seal */}
          <View style={styles.permissionWithSeal}>
            <View style={styles.permissionContainer}>
              <Text style={[styles.permissionText, { color: accents.text }]}>{permission}</Text>
            </View>
            <View style={styles.sealContainer}>
              <OfficialSeal color={accents.primary} />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerUrl}>beanbye.com</Text>
            <Text style={styles.disclaimer}>{disclaimer}</Text>
          </View>
        </View>
      </View>
    );
  }
);

FarewellCertificate.displayName = 'FarewellCertificate';

// ============================================
// STYLES
// ============================================

const CERTIFICATE_WIDTH = 360;
const CERTIFICATE_HEIGHT = 500;  // Taller to fit roast text

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
    marginVertical: 4,
  },
  issuedToLabel: {
    fontSize: 6,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  issuedToName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Verdict Section
  verdictSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tierIcon: {
    width: 50,
    height: 50,
  },
  verdictContent: {
    alignItems: 'flex-start',
    gap: 4,
  },
  verdictTitle: {
    fontSize: 24,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  flexFlopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 3,
  },
  flexFlopEmoji: {
    fontSize: 10,
  },
  flexFlopLabel: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Beanie Section
  beanieSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  beanieImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  beanieImage: {
    width: '100%',
    height: '100%',
  },
  beanieInfo: {
    flex: 1,
  },
  beanieName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  beanieVariant: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  valueChip: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '800',
  },

  // Roast Section
  roastContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  roastIcon: {
    fontSize: 12,
  },
  roastText: {
    flex: 1,
    fontSize: 9,
    fontStyle: 'italic',
    lineHeight: 13,
  },

  // Permission with Seal
  permissionWithSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

export default FarewellCertificate;
