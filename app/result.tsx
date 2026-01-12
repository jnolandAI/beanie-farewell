import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getVerdict, getScanAnotherText, getShareButtonText, VerdictInfo } from '../lib/humor';

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
};

// Tier-specific accent colors
const TIER_COLORS: Record<number, { accent: string; bg: string }> = {
  1: { accent: '#95A5A6', bg: '#F8F9FA' },     // Gray - meh
  2: { accent: '#636E72', bg: '#F8F9FA' },     // Darker gray
  3: { accent: '#4ECDC4', bg: '#E8FAF8' },     // Teal - nice!
  4: { accent: '#F39C12', bg: '#FFF8E8' },     // Orange - whoa
  5: { accent: '#00B894', bg: '#E8FFF4' },     // Green - jackpot
};

export default function ResultScreen() {
  const [verdict, setVerdict] = useState<VerdictInfo | null>(null);
  const [scanButtonText] = useState(() => getScanAnotherText());
  const [shareButtonText] = useState(() => getShareButtonText());

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(30)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;

  const params = useLocalSearchParams<{
    name: string;
    animal_type: string;
    variant: string;
    colors: string;
    estimated_value_low: string;
    estimated_value_high: string;
    value_notes: string;
    confidence: string;
    has_visible_hang_tag: string;
  }>();

  const valueLow = parseInt(params.estimated_value_low || '0', 10);
  const valueHigh = parseInt(params.estimated_value_high || '0', 10);
  const isNotBeanie = params.name?.toLowerCase() === 'not a beanie baby';
  const hasSpecialVariant = params.variant && params.variant !== 'Standard';

  useEffect(() => {
    setVerdict(getVerdict(valueHigh));

    // Reveal animation sequence
    Animated.sequence([
      Animated.delay(100),
      // Icon/verdict appears with scale
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Card slides up
      Animated.parallel([
        Animated.timing(cardSlideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [valueHigh, scaleAnim, fadeAnim, cardSlideAnim, cardFadeAnim]);

  const tierColors = verdict ? TIER_COLORS[verdict.tier] : TIER_COLORS[1];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verdict Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.verdictIcon}>{verdict?.icon || '?'}</Text>
          <Text style={[styles.verdictTitle, { color: tierColors.accent }]}>
            {verdict?.title || 'Analyzing...'}
          </Text>
        </Animated.View>

        {/* Main Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardFadeAnim,
              transform: [{ translateY: cardSlideAnim }],
            },
          ]}
        >
          {isNotBeanie ? (
            <>
              <Text style={styles.cardTitle}>Not a Beanie Baby</Text>
              <Text style={styles.cardMessage}>
                This doesn't appear to be a Ty Beanie Baby. Try again with a real one!
              </Text>
            </>
          ) : (
            <>
              {/* Beanie Name */}
              <Text style={styles.cardTitle}>{params.name}</Text>
              <Text style={styles.cardSubtitle}>
                {hasSpecialVariant ? params.variant : params.animal_type}
              </Text>

              {/* Value Display */}
              <View style={[styles.valueContainer, { backgroundColor: tierColors.bg }]}>
                <Text style={styles.valueLabel}>ESTIMATED VALUE</Text>
                <View style={styles.valueRow}>
                  <Text style={[styles.valueAmount, { color: tierColors.accent }]}>
                    ${valueLow}
                  </Text>
                  <Text style={styles.valueDash}>–</Text>
                  <Text style={[styles.valueAmount, { color: tierColors.accent }]}>
                    ${valueHigh}
                  </Text>
                </View>
              </View>

              {/* Verdict Message */}
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>{verdict?.message || ''}</Text>
              </View>

              {/* Value Notes */}
              {params.value_notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Why this value?</Text>
                  <Text style={styles.notesText}>{params.value_notes}</Text>
                </View>
              )}

              {/* Details */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Confidence</Text>
                  <Text style={styles.detailValue}>{params.confidence}</Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Tag Visible</Text>
                  <Text style={styles.detailValue}>
                    {params.has_visible_hang_tag === 'true' ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: cardFadeAnim,
              transform: [{ translateY: cardSlideAnim }],
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.buttonText}>{scanButtonText}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.buttonSecondary,
              pressed && styles.buttonSecondaryPressed,
            ]}
            onPress={() => {
              // TODO: Implement share
              console.log('Share pressed');
            }}
          >
            <Text style={styles.buttonSecondaryText}>{shareButtonText}</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  verdictIcon: {
    fontSize: 72,
    marginBottom: 12,
  },
  verdictTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  cardMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  valueContainer: {
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueAmount: {
    fontSize: 36,
    fontWeight: '800',
  },
  valueDash: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  messageContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
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
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonSecondaryPressed: {
    backgroundColor: COLORS.background,
    transform: [{ scale: 0.98 }],
  },
  buttonSecondaryText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
});
