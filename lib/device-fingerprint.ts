/**
 * Device Fingerprinting untuk Web - Enhanced Version
 * Menggunakan FingerprintJS untuk akurasi maksimal
 * Library: @fingerprintjs/fingerprintjs
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface DeviceFingerprint {
  id: string;
  visitorId: string;
  confidence: number;
  components: {
    userAgent: string;
    screenResolution: string;
    timezone: string;
    language: string;
    platform: string;
    colorDepth: number;
    pixelRatio: number;
    hardwareConcurrency: number;
    deviceMemory?: number;
    touchSupport: boolean;
    vendor: string;
    cookieEnabled: boolean;
    doNotTrack: string | null;
  };
  timestamp: number;
}

let fpPromise: Promise<any> | null = null;

/**
 * Initialize FingerprintJS (singleton pattern)
 */
async function initFingerprint() {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load({
      monitoring: false, // Disable monitoring untuk privacy
    });
  }
  return fpPromise;
}

/**
 * Generate device fingerprint menggunakan FingerprintJS
 * Jauh lebih akurat dari implementasi manual
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  try {
    // Load FingerprintJS
    const fp = await initFingerprint();
    
    // Get fingerprint result
    const result = await fp.get();
    
    // Extract components
    const components = result.components;
    
    // Build detailed fingerprint
    const fingerprint: DeviceFingerprint = {
      id: result.visitorId, // Unique ID dari FingerprintJS
      visitorId: result.visitorId,
      confidence: result.confidence?.score || 1,
      components: {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: (navigator as any).deviceMemory,
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        vendor: navigator.vendor,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || null,
      },
      timestamp: Date.now(),
    };

    return fingerprint;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    // Fallback to basic fingerprint
    return generateBasicFingerprint();
  }
}

/**
 * Fallback: Basic fingerprint jika FingerprintJS gagal
 */
async function generateBasicFingerprint(): Promise<DeviceFingerprint> {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.platform,
    window.devicePixelRatio,
  ].join('|');

  const fingerprintId = await hashString(components);

  return {
    id: fingerprintId,
    visitorId: fingerprintId,
    confidence: 0.5, // Lower confidence for basic fingerprint
    components: {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      vendor: navigator.vendor,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || null,
    },
    timestamp: Date.now(),
  };
}

/**
 * Hash string menggunakan Web Crypto API
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simpan device fingerprint ke localStorage
 */
export function saveDeviceFingerprint(fingerprint: DeviceFingerprint): void {
  localStorage.setItem('device_fingerprint', JSON.stringify(fingerprint));
  localStorage.setItem('device_fingerprint_id', fingerprint.id);
}

/**
 * Get device fingerprint dari localStorage
 */
export function getStoredDeviceFingerprint(): DeviceFingerprint | null {
  const stored = localStorage.getItem('device_fingerprint');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Get only fingerprint ID (faster)
 */
export function getStoredFingerprintId(): string | null {
  return localStorage.getItem('device_fingerprint_id');
}

/**
 * Compare two device fingerprints
 * Returns true if they match
 */
export function compareFingerprints(fp1: DeviceFingerprint, fp2: DeviceFingerprint): boolean {
  return fp1.id === fp2.id;
}

/**
 * Check if device is trusted for specific user
 */
export function isDeviceTrusted(userId: string): boolean {
  const trustedDevices = localStorage.getItem(`trusted_devices_${userId}`);
  if (!trustedDevices) return false;
  
  const devices: string[] = JSON.parse(trustedDevices);
  const currentFingerprintId = getStoredFingerprintId();
  
  return currentFingerprintId ? devices.includes(currentFingerprintId) : false;
}

/**
 * Add device to trusted list
 */
export function trustDevice(userId: string, fingerprintId: string): void {
  const key = `trusted_devices_${userId}`;
  const stored = localStorage.getItem(key);
  const devices: string[] = stored ? JSON.parse(stored) : [];
  
  if (!devices.includes(fingerprintId)) {
    devices.push(fingerprintId);
    localStorage.setItem(key, JSON.stringify(devices));
  }
}

/**
 * Remove device from trusted list
 */
export function untrustDevice(userId: string, fingerprintId: string): void {
  const key = `trusted_devices_${userId}`;
  const stored = localStorage.getItem(key);
  if (!stored) return;
  
  const devices: string[] = JSON.parse(stored);
  const filtered = devices.filter(id => id !== fingerprintId);
  localStorage.setItem(key, JSON.stringify(filtered));
}

/**
 * Get all trusted devices for user
 */
export function getTrustedDevices(userId: string): string[] {
  const stored = localStorage.getItem(`trusted_devices_${userId}`);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Clear all trusted devices for user
 */
export function clearTrustedDevices(userId: string): void {
  localStorage.removeItem(`trusted_devices_${userId}`);
}

/**
 * Get device info as human-readable string
 */
export function getDeviceInfo(fingerprint: DeviceFingerprint): string {
  const { components } = fingerprint;
  
  // Parse user agent untuk browser name
  let browserName = 'Unknown Browser';
  if (components.userAgent.includes('Chrome')) browserName = 'Chrome';
  else if (components.userAgent.includes('Firefox')) browserName = 'Firefox';
  else if (components.userAgent.includes('Safari')) browserName = 'Safari';
  else if (components.userAgent.includes('Edge')) browserName = 'Edge';
  
  // Parse platform
  let osName = components.platform;
  if (components.userAgent.includes('Windows')) osName = 'Windows';
  else if (components.userAgent.includes('Mac')) osName = 'MacOS';
  else if (components.userAgent.includes('Linux')) osName = 'Linux';
  else if (components.userAgent.includes('Android')) osName = 'Android';
  else if (components.userAgent.includes('iOS')) osName = 'iOS';
  
  return `${browserName} on ${osName} (${components.screenResolution})`;
}

/**
 * Check if fingerprint is high confidence
 */
export function isHighConfidence(fingerprint: DeviceFingerprint): boolean {
  return fingerprint.confidence >= 0.9;
}

