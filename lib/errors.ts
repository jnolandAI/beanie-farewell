/**
 * Centralized error handling utilities
 */

import { Alert, Platform, Linking } from 'react-native';

/**
 * Safely parse JSON with fallback value
 * Prevents app crashes from malformed JSON
 */
export function safeParseJSON<T>(
  jsonString: string,
  fallback: T,
  context?: string
): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`JSON parse failed${context ? ` in ${context}` : ''}:`, error);
    return fallback;
  }
}

/**
 * Safely parse URL parameter as JSON
 */
export function safeParseURLParam<T>(
  param: string | undefined,
  fallback: T
): T {
  if (!param) return fallback;
  return safeParseJSON(param, fallback, 'URL param');
}

/**
 * Show user-friendly error alert
 */
export function showErrorAlert(
  title: string,
  message: string,
  onRetry?: () => void
): void {
  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
    return;
  }

  const buttons: Array<{ text: string; style?: 'cancel' | 'default'; onPress?: () => void }> = [
    { text: 'OK', style: 'default' }
  ];

  if (onRetry) {
    buttons.unshift({ text: 'Try Again', onPress: onRetry });
  }

  Alert.alert(title, message, buttons);
}

/**
 * Show permission denied alert with option to open Settings
 */
export function showPermissionDeniedAlert(
  permissionName: string,
  purpose: string
): void {
  if (Platform.OS === 'web') {
    alert(`${permissionName} permission is required. ${purpose}`);
    return;
  }

  Alert.alert(
    'Permission Required',
    `${permissionName} access is needed ${purpose}. Please enable it in Settings.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() }
    ]
  );
}

/**
 * Show share failure alert
 */
export function showShareFailedAlert(): void {
  showErrorAlert(
    'Sharing Failed',
    'Unable to share. Please try again.'
  );
}

/**
 * Show export failure alert
 */
export function showExportFailedAlert(): void {
  showErrorAlert(
    'Export Failed',
    'Unable to export. Please try again.'
  );
}
