/**
 * Image utilities for compression and manipulation
 */

import { Platform } from 'react-native';

/**
 * Compress a base64 image for thumbnail storage.
 * Reduces image size significantly while maintaining visual quality.
 *
 * On native: Uses canvas-based compression (when available)
 * On web: Uses canvas API
 *
 * Target: ~50KB thumbnails (down from 200-500KB originals)
 */
export async function compressImageForThumbnail(
  base64: string,
  maxWidth: number = 400,
  quality: number = 0.6
): Promise<string> {
  // On native platforms, the image picker already provides reasonable compression
  // with quality: 0.7. For additional compression, we'd need expo-image-manipulator.
  // For now, return the original on native (already compressed by picker).
  if (Platform.OS !== 'web') {
    // Native: Return as-is since ImagePicker already compresses
    // The quality: 0.7 setting in ImagePicker gives us ~100-200KB images
    return base64;
  }

  // Web: Use canvas for compression
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Create canvas and draw scaled image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64); // Fallback to original
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with quality setting
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        // Remove the data URL prefix to get just base64
        const compressedBase64 = compressedDataUrl.replace(/^data:image\/\w+;base64,/, '');

        resolve(compressedBase64);
      };

      img.onerror = () => {
        resolve(base64); // Fallback to original on error
      };

      // Handle both with and without data URL prefix
      if (base64.startsWith('data:')) {
        img.src = base64;
      } else {
        img.src = `data:image/jpeg;base64,${base64}`;
      }
    } catch (error) {
      resolve(base64); // Fallback to original on error
    }
  });
}

/**
 * Estimate the size of a base64 string in bytes
 */
export function estimateBase64Size(base64: string): number {
  // Base64 encoding increases size by ~33%
  // Formula: original_bytes = base64_length * 3/4
  const padding = (base64.match(/=/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
