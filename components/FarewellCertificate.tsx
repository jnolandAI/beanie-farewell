import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HeartTagIcon } from './icons/HeartTagIcon';

// ============================================
// TYPES
// ============================================

export interface FarewellCertificateProps {
  name: string;
  variant: string;
  valueLow: number;
  valueHigh: number;
  verdictTitle: string;
  verdictIcon: string;
  tier: number;
  condition?: string;
}

// ============================================
// TIER CONFIGURATION
// ============================================

// Bold 90s color palette
const COLORS = {
  primaryPurple: '#8B5CF6',
  accentCoral: '#FF6B6B',
  secondaryTeal: '#06B6D4',
};

// Tier-specific styles with bolder gradients
const TIER_STYLES: Record<number, { gradient: string[]; accent: string; tagline: string }> = {
  1: {
    gradient: ['#F3F4F6', '#E5E7EB'],
    accent: '#9CA3AF',
    tagline: "Permission to let go. Officially granted."
  },
  2: {
    gradient: ['#F3F4F6', '#E5E7EB'],
    accent: '#6B7280',
    tagline: "Not retirement money, but not nothing!"
  },
  3: {
    gradient: ['#ECFEFF', '#CFFAFE'],  // Teal tint
    accent: '#06B6D4',
    tagline: "Look who held some value!"
  },
  4: {
    gradient: ['#FEF3C7', '#FDE68A'],  // Warm yellow/orange
    accent: '#F59E0B',
    tagline: "Maybe don't donate this one..."
  },
  5: {
    gradient: ['#D1FAE5', '#A7F3D0'],  // Green celebration
    accent: '#10B981',
    tagline: "HOLD EVERYTHING. Get this authenticated."
  },
};

// Tier-specific gradient backgrounds (solid-like gradients for static capture)
const TIER_GRADIENTS: Record<number, { colors: string[]; locations: number[] }> = {
  1: {
    colors: [...TIER_STYLES[1].gradient, TIER_STYLES[1].gradient[0]],
    locations: [0, 0.5, 1],
  },
  2: {
    colors: [...TIER_STYLES[2].gradient, TIER_STYLES[2].gradient[0]],
    locations: [0, 0.5, 1],
  },
  3: {
    colors: [...TIER_STYLES[3].gradient, TIER_STYLES[3].gradient[0]],
    locations: [0, 0.5, 1],
  },
  4: {
    colors: [...TIER_STYLES[4].gradient, TIER_STYLES[4].gradient[0]],
    locations: [0, 0.5, 1],
  },
  5: {
    colors: [...TIER_STYLES[5].gradient, TIER_STYLES[5].gradient[0]],
    locations: [0, 0.5, 1],
  },
};

// Tier-specific accent colors - using bolder palette
const TIER_ACCENTS: Record<number, { primary: string; secondary: string; text: string }> = {
  1: { primary: TIER_STYLES[1].accent, secondary: '#D1D5DB', text: '#6B7280' },
  2: { primary: TIER_STYLES[2].accent, secondary: '#9CA3AF', text: '#4B5563' },
  3: { primary: TIER_STYLES[3].accent, secondary: '#22D3EE', text: '#0891B2' },
  4: { primary: TIER_STYLES[4].accent, secondary: '#FBBF24', text: '#D97706' },
  5: { primary: TIER_STYLES[5].accent, secondary: '#34D399', text: '#059669' },
};

// Tier-specific taglines
const TIER_TAGLINES: Record<number, string[]> = {
  1: [
    'Permission to let go. Officially granted.',
    'Closure achieved. Box can now be recycled.',
    'The truth shall set you free (from storage).',
  ],
  2: [
    'Not retirement money, but not nothing!',
    "Worth more than a participation trophy.",
    'At least it paid for this app!',
  ],
  3: [
    'Look who held some value!',
    'Your 1997 self would be proud-ish.',
    'Better than a savings account in 1999.',
  ],
  4: [
    "Maybe don't donate this one...",
    'Time to move this out of the garage.',
    'Your parents were wrong to doubt you.',
  ],
  5: [
    'HOLD EVERYTHING. Get this authenticated.',
    'DO NOT CLEAN IT. DO NOT REMOVE THE TAG.',
    'Against all odds, you won the Beanie lottery.',
  ],
};

// Decorative elements for tier 5 - bolder 90s palette
const CONFETTI_COLORS = ['#10B981', '#34D399', '#8B5CF6', '#F59E0B', '#06B6D4'];

function getRandomTagline(tier: number): string {
  const taglines = TIER_TAGLINES[tier] || TIER_TAGLINES[1];
  return taglines[Math.floor(Math.random() * taglines.length)];
}

// ============================================
// COMPONENT
// ============================================

export const FarewellCertificate = React.forwardRef<View, FarewellCertificateProps>(
  ({ name, variant, valueLow, valueHigh, verdictTitle, verdictIcon, tier, condition }, ref) => {
    const normalizedTier = Math.max(1, Math.min(5, tier)) as 1 | 2 | 3 | 4 | 5;
    const gradient = TIER_GRADIENTS[normalizedTier];
    const accents = TIER_ACCENTS[normalizedTier];
    const tagline = getRandomTagline(normalizedTier);
    const isJackpotTier = normalizedTier === 5;
    const isHighValueTier = normalizedTier >= 4;

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

        {/* Decorative circles for higher tiers */}
        {isHighValueTier && (
          <>
            <View
              style={[
                styles.decorativeCircle,
                styles.decorativeCircleTopRight,
                { backgroundColor: `${accents.primary}15` },
              ]}
            />
            <View
              style={[
                styles.decorativeCircle,
                styles.decorativeCircleBottomLeft,
                { backgroundColor: `${accents.primary}12` },
              ]}
            />
          </>
        )}

        {/* Confetti-like decorations for jackpot tier */}
        {isJackpotTier && (
          <>
            {CONFETTI_COLORS.map((color, index) => (
              <View
                key={`confetti-${index}`}
                style={[
                  styles.confettiDot,
                  {
                    backgroundColor: color,
                    top: 80 + (index * 240),
                    left: index % 2 === 0 ? 40 + (index * 30) : undefined,
                    right: index % 2 === 1 ? 40 + (index * 20) : undefined,
                    transform: [{ rotate: `${index * 45}deg` }],
                  },
                ]}
              />
            ))}
            {CONFETTI_COLORS.map((color, index) => (
              <View
                key={`confetti-right-${index}`}
                style={[
                  styles.confettiDot,
                  styles.confettiDotSmall,
                  {
                    backgroundColor: color,
                    top: 200 + (index * 200),
                    right: index % 2 === 0 ? 60 + (index * 25) : undefined,
                    left: index % 2 === 1 ? 60 + (index * 20) : undefined,
                    transform: [{ rotate: `${-index * 30}deg` }],
                  },
                ]}
              />
            ))}
          </>
        )}

        {/* Certificate border */}
        <View style={[styles.certificateBorder, { borderColor: `${accents.primary}30` }]}>
          {/* Header with branding */}
          <View style={styles.header}>
            <View style={styles.brandingContainer}>
              <HeartTagIcon size={60} color="#FF6B6B" textColor="#FFFFFF" />
            </View>
            <Text style={[styles.appName, { color: COLORS.primaryPurple }]}>Beanie Farewell</Text>
            <Text style={[styles.certificateLabel, { color: accents.primary }]}>OFFICIAL VALUATION CERTIFICATE</Text>
          </View>

          {/* Divider line */}
          <View style={[styles.divider, { backgroundColor: `${accents.primary}25` }]} />

          {/* Verdict section */}
          <View style={styles.verdictSection}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: `${accents.primary}15`,
                  borderColor: `${accents.primary}30`,
                },
              ]}
            >
              <Text style={styles.verdictIcon}>{verdictIcon}</Text>
            </View>
            <Text style={[styles.verdictTitle, { color: accents.primary }]}>{verdictTitle}</Text>
          </View>

          {/* Beanie info */}
          <View style={styles.beanieInfoSection}>
            <Text style={styles.beanieName}>{name}</Text>
            {variant && variant !== 'Standard' && (
              <Text style={[styles.beanieVariant, { color: accents.text }]}>{variant}</Text>
            )}
            {condition && (
              <Text style={styles.conditionText}>Condition: {condition}</Text>
            )}
          </View>

          {/* Value display - prominent */}
          <View
            style={[
              styles.valueCard,
              {
                backgroundColor: `${accents.primary}08`,
                borderColor: `${accents.primary}20`,
              },
            ]}
          >
            <Text style={styles.valueLabel}>ESTIMATED VALUE</Text>
            <View style={styles.valueRow}>
              <Text style={[styles.valueCurrency, { color: accents.primary }]}>$</Text>
              <Text style={[styles.valueAmount, { color: accents.primary }]}>{valueLow}</Text>
              <Text style={[styles.valueDash, { color: accents.secondary }]}> - </Text>
              <Text style={[styles.valueCurrency, { color: accents.primary }]}>$</Text>
              <Text style={[styles.valueAmount, { color: accents.primary }]}>{valueHigh}</Text>
            </View>
          </View>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={[styles.tagline, { color: accents.text }]}>{tagline}</Text>
          </View>

          {/* Footer divider */}
          <View style={[styles.divider, { backgroundColor: `${accents.primary}15` }]} />

          {/* Footer with CTA */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Scan yours at</Text>
            <Text style={[styles.footerUrl, { color: accents.primary }]}>beaniefarewell.com</Text>
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

// Certificate dimensions: 1080x1350 (Instagram portrait)
// Using scaled down values for display (divide by 3)
const CERTIFICATE_WIDTH = 360;
const CERTIFICATE_HEIGHT = 450;

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
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 150,
  },
  decorativeCircleTopRight: {
    width: 200,
    height: 200,
    top: -60,
    right: -60,
  },
  decorativeCircleBottomLeft: {
    width: 180,
    height: 180,
    bottom: -50,
    left: -50,
  },
  confettiDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
    opacity: 0.6,
  },
  confettiDotSmall: {
    width: 8,
    height: 8,
    opacity: 0.5,
  },
  certificateBorder: {
    flex: 1,
    margin: 16,
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brandingContainer: {
    marginBottom: 8,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  certificateLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    width: '80%',
    alignSelf: 'center',
    marginVertical: 12,
  },
  verdictSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  verdictIcon: {
    fontSize: 36,
  },
  verdictTitle: {
    fontSize: 26,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  beanieInfoSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  beanieName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
  },
  beanieVariant: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  conditionText: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 4,
  },
  valueCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B2BEC3',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueCurrency: {
    fontSize: 22,
    fontWeight: '700',
  },
  valueAmount: {
    fontSize: 36,
    fontWeight: '800',
  },
  valueDash: {
    fontSize: 28,
    fontWeight: '300',
  },
  taglineContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 10,
    color: '#B2BEC3',
    fontWeight: '500',
  },
  footerUrl: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default FarewellCertificate;
