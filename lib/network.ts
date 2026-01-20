/**
 * Network utilities for checking connectivity
 */

import { Platform } from 'react-native';

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
