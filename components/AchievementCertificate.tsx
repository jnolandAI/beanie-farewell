import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { getCertificateTagline, getCertificateDisclaimer } from '../lib/humor';

// ============================================
// TYPES
// ============================================

export interface AchievementCertificateProps {
  unlockedCount: number;
  totalCount: number;
  percentage: number;
  recentAchievements: Array<{ name: string; emoji: string }>;
  userName?: string;
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
        ACHIEVER
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
  gold: '#FFD700',
};

// App main icon
const APP_ICON = require('../assets/icons/icon-main.png');

// Trophy icon
const TROPHY_ICON = require('../assets/icons/icon-tier5.png');

// Get achievement verdict based on percentage
function getAchievementVerdict(percentage: number): { title: string; accent: string } {
  if (percentage >= 80) {
    return { title: "LEGEND", accent: '#FFD700' };
  } else if (percentage >= 50) {
    return { title: "DEDICATED", accent: '#FF6B35' };
  } else if (percentage >= 25) {
    return { title: "RISING STAR", accent: '#06B6D4' };
  } else if (percentage >= 10) {
    return { title: "GETTING STARTED", accent: '#8B5CF6' };
  }
  return { title: "NEWCOMER", accent: '#9CA3AF' };
}

// ============================================
// COMPONENT
// ============================================

export const AchievementCertificate = React.forwardRef<View, AchievementCertificateProps>(
  ({ unlockedCount, totalCount, percentage, recentAchievements, userName }, ref) => {
    const certificateLabel = getCertificateTagline();
    const disclaimer = getCertificateDisclaimer();
    const verdict = getAchievementVerdict(percentage);

    return (
      <View ref={ref} style={styles.container}>
        {/* Background gradient - gold tint */}
        <LinearGradient
          colors={['#FFFBEB', '#FEF3C7', '#FFFBEB']}
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
            <Text style={[styles.appName, { color: COLORS.primaryPurple }]}>Bean Bye</Text>
            <Text style={[styles.certificateLabel, { color: verdict.accent }]}>{certificateLabel}</Text>
          </View>

          {/* Issued To section */}
          {userName && (
            <View style={styles.issuedToSection}>
              <Text style={styles.issuedToLabel}>ISSUED TO</Text>
              <Text style={[styles.issuedToName, { color: verdict.accent }]}>{userName}</Text>
            </View>
          )}

          {/* VERDICT SECTION */}
          <View style={[styles.verdictSection, { backgroundColor: `${verdict.accent}15` }]}>
            <Image source={TROPHY_ICON} style={styles.trophyIcon} resizeMode="contain" />
            <View style={styles.verdictText}>
              <Text style={[styles.verdictTitle, { color: verdict.accent }]}>{verdict.title}</Text>
              <Text style={styles.verdictSubtitle}>ACHIEVEMENT STATUS</Text>
            </View>
          </View>

          {/* STATS SECTION */}
          <View style={styles.statsSection}>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: verdict.accent }]}>{unlockedCount}</Text>
              <Text style={styles.statLabel}>UNLOCKED</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: `${verdict.accent}30` }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: verdict.accent }]}>{percentage}%</Text>
              <Text style={styles.statLabel}>COMPLETE</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: verdict.accent }]} />
            </View>
            <Text style={styles.progressLabel}>{unlockedCount} of {totalCount} achievements</Text>
          </View>

          {/* Recent achievements */}
          {recentAchievements.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={[styles.recentTitle, { color: verdict.accent }]}>RECENT UNLOCKS</Text>
              <View style={styles.recentList}>
                {recentAchievements.slice(0, 4).map((achievement, index) => (
                  <View key={index} style={styles.recentItem}>
                    <Text style={styles.recentEmoji}>{achievement.emoji}</Text>
                    <Text style={styles.recentName} numberOfLines={1}>{achievement.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Seal */}
          <View style={styles.sealContainer}>
            <OfficialSeal color={verdict.accent} />
          </View>

          {/* Footer with CTA placeholder */}
          <View style={styles.footer}>
            <Text style={styles.footerUrl}>beanbye.com</Text>
            {/* TODO: Add App Store link when available */}
            <Text style={styles.disclaimer}>{disclaimer}</Text>
          </View>
        </View>
      </View>
    );
  }
);

AchievementCertificate.displayName = 'AchievementCertificate';

// ============================================
// STYLES
// ============================================

const CERTIFICATE_WIDTH = 320;
const CERTIFICATE_HEIGHT = 480;

const styles = StyleSheet.create({
  container: {
    width: CERTIFICATE_WIDTH,
    height: CERTIFICATE_HEIGHT,
    backgroundColor: '#FFFBEB',
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
  trophyIcon: {
    width: 40,
    height: 40,
  },
  verdictText: {
    alignItems: 'flex-start',
  },
  verdictTitle: {
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verdictSubtitle: {
    fontSize: 8,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
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
    height: 35,
  },

  // Progress bar
  progressContainer: {
    alignItems: 'center',
    gap: 4,
  },
  progressBar: {
    width: '90%',
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Recent achievements
  recentSection: {
    paddingHorizontal: 4,
  },
  recentTitle: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  recentList: {
    gap: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
  },
  recentEmoji: {
    fontSize: 14,
  },
  recentName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },

  // Seal
  sealContainer: {
    alignItems: 'center',
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

export default AchievementCertificate;
