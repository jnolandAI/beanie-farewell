import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated, Easing, Platform, Dimensions, Image, Modal } from 'react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { getVerdict, getScanAnotherText, getShareButtonText, VerdictInfo, generateFunFacts, getFlexFlopLabel, FlexFlopLabel, getShareCaption, getFlexFlopStatus } from '../lib/humor';
import { Confetti } from '../components/Confetti';
import { FollowUpAnswers, CollectionItem, ConditionLevel, PelletType, ValueBreakdown, DetectedAssumptions } from '../types/beanie';
import { FarewellCertificate } from '../components/FarewellCertificate';
import { AchievementToast } from '../components/AchievementToast';
import { ChallengeToast } from '../components/ChallengeToast';
import { LevelUpToast } from '../components/LevelUpToast';
import { MilestoneToast, CollectionMilestone } from '../components/MilestoneToast';
import { RareFindCelebration } from '../components/RareFindCelebration';
import { LuckyScanToast } from '../components/LuckyScanToast';
import { ValueMilestoneToast, ValueMilestone } from '../components/ValueMilestoneToast';
import { useCollectionStore, generateId } from '../lib/store';
import { Achievement } from '../lib/achievements';
import { DailyChallenge } from '../lib/challenges';
import { safeParseURLParam, showShareFailedAlert } from '../lib/errors';

// Force all imports to be retained (prevent tree-shaking)
const _keepImports = {
  BlurView, LinearGradient, captureRef, Sharing, MediaLibrary, Haptics,
  Svg, Path, Circle, Polygon, Confetti, FarewellCertificate,
  AchievementToast, ChallengeToast, LevelUpToast, MilestoneToast,
  RareFindCelebration, LuckyScanToast, ValueMilestoneToast,
  getVerdict, getScanAnotherText, getShareButtonText, generateFunFacts,
  getFlexFlopLabel, getShareCaption, getFlexFlopStatus,
  safeParseURLParam, showShareFailedAlert, generateId,
  Animated, Easing, Dimensions, Image, Modal, StyleSheet,
};

// Error boundary to catch crashes and show the error instead of crashing
class ResultErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: `${error.message}\n\n${error.stack || ''}` };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ResultScreen crash:', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error.split('\n')[0] || 'Unknown error';
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FAFAFA' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#FF0000' }}>Something went wrong</Text>
          <View style={{ backgroundColor: '#FFF3F3', padding: 16, borderRadius: 12, marginBottom: 12, width: '100%' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#CC0000' }}>{errorMsg}</Text>
          </View>
          <ScrollView style={{ maxHeight: 300, width: '100%' }}>
            <Text style={{ fontSize: 11, color: '#666', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>{this.state.error}</Text>
          </ScrollView>
          <Pressable onPress={() => router.replace('/')} style={{ marginTop: 16, padding: 16, backgroundColor: '#FF00FF', borderRadius: 12 }}>
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Go Home</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function ResultScreenWrapper() {
  return (
    <ResultErrorBoundary>
      <ResultScreenDiag />
    </ResultErrorBoundary>
  );
}

// BUILD 10: All imports present, minimal hooks/JSX
// Tests if module imports alone cause the crash
function ResultScreenDiag() {
  // Read params from store (same as working build 9)
  const [params] = useState(() => {
    return useCollectionStore.getState().pendingResultParams || {};
  });

  // Clear pending params
  useEffect(() => {
    useCollectionStore.getState().setPendingResultParams(null);
  }, []);

  // Now add the useCollectionStore HOOK (not just getState)
  // This is what the full result screen uses
  const store = useCollectionStore();

  // Add the humor.ts initializers that were in the original
  const [scanButtonText] = useState(() => getScanAnotherText());
  const [shareButtonText] = useState(() => getShareButtonText());

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#FAFAFA' }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: '#8B5CF6', marginBottom: 20 }}>BUILD 10 - IMPORTS TEST</Text>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10 }}>{params.name || 'No name received'}</Text>
      <Text style={{ fontSize: 18, color: '#666', marginBottom: 8 }}>{params.animal_type || 'No type'} - {params.variant || 'No variant'}</Text>
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#00CED1', marginBottom: 20 }}>
        ${params.estimated_value_low || '?'} - ${params.estimated_value_high || '?'}
      </Text>
      <Text style={{ fontSize: 14, color: '#999', marginBottom: 10, textAlign: 'center' }}>
        Buttons: [{scanButtonText}] [{shareButtonText}]{'\n'}
        Store userName: {store.userName || 'null'}{'\n'}
        Store items: {store.collection?.length || 0}{'\n'}
        Param keys: {Object.keys(params).join(', ') || 'none'}
      </Text>
      <Pressable
        onPress={() => router.replace('/')}
        style={{ padding: 16, backgroundColor: '#FF00FF', borderRadius: 12, marginTop: 20 }}
      >
        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>Go Home</Text>
      </Pressable>
    </View>
  );
}
