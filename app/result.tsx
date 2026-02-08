import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useCollectionStore } from '../lib/store';

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
      <ResultScreenMinimal />
    </ResultErrorBoundary>
  );
}

// DIAGNOSTIC: Minimal result screen to isolate crash
function ResultScreenMinimal() {
  // Read params from store
  const [params] = useState(() => {
    return useCollectionStore.getState().pendingResultParams || {};
  });

  // Clear pending params
  useEffect(() => {
    useCollectionStore.getState().setPendingResultParams(null);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#FAFAFA' }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: '#8B5CF6', marginBottom: 20 }}>BUILD 9 - DIAGNOSTIC</Text>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10 }}>{params.name || 'No name received'}</Text>
      <Text style={{ fontSize: 18, color: '#666', marginBottom: 8 }}>{params.animal_type || 'No type'} - {params.variant || 'No variant'}</Text>
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#00CED1', marginBottom: 20 }}>
        ${params.estimated_value_low || '?'} - ${params.estimated_value_high || '?'}
      </Text>
      <Text style={{ fontSize: 14, color: '#999', marginBottom: 30, textAlign: 'center' }}>
        Confidence: {params.confidence || 'N/A'}{'\n'}
        Has params: {Object.keys(params).length > 0 ? 'YES' : 'NO'}{'\n'}
        Param keys: {Object.keys(params).join(', ') || 'none'}
      </Text>
      <Pressable
        onPress={() => router.replace('/')}
        style={{ padding: 16, backgroundColor: '#FF00FF', borderRadius: 12 }}
      >
        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>Go Home</Text>
      </Pressable>
    </View>
  );
}
