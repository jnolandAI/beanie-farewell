/**
 * Network utilities for checking connectivity and API configuration
 */

import { Platform } from 'react-native';

/**
 * API endpoint configuration.
 * In production, uses Supabase Edge Function to keep API key server-side.
 * In development, can use direct Anthropic calls for faster iteration.
 */
const SUPABASE_PROJECT_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const USE_EDGE_FUNCTION = process.env.EXPO_PUBLIC_USE_EDGE_FUNCTION === 'true';

export function getApiEndpoint(): { url: string; headers: Record<string, string> } {
  if (USE_EDGE_FUNCTION && SUPABASE_PROJECT_URL) {
    // Production: Use Supabase Edge Function
    return {
      url: `${SUPABASE_PROJECT_URL}/functions/v1/identify-beanie`,
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': getDeviceId(),
      },
    };
  }

  // Development: Use direct Anthropic API
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  return {
    url: 'https://api.anthropic.com/v1/messages',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || '',
      'anthropic-version': '2023-06-01',
    },
  };
}

/**
 * Get a unique device ID for rate limiting.
 * Uses a simple random ID stored in memory (resets on app restart).
 */
let cachedDeviceId: string | null = null;
function getDeviceId(): string {
  if (!cachedDeviceId) {
    cachedDeviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return cachedDeviceId;
}

/**
 * Check if the device has network connectivity.
 * Makes a lightweight request to check actual connectivity.
 */
export async function checkNetworkConnectivity(): Promise<boolean> {
  try {
    // Simple fetch to check connectivity - use a reliable endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.anthropic.com', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get a user-friendly offline error message
 */
export function getOfflineErrorMessage(): string {
  return "You appear to be offline. Please check your internet connection and try again.";
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('offline') ||
      message.includes('timeout') ||
      message.includes('aborted')
    );
  }
  return false;
}
