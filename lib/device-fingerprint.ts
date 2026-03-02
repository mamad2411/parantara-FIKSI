/**
 * Device Fingerprinting untuk Web
 * Menggunakan browser fingerprinting untuk identifikasi perangkat
 */

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  colorDepth: number;
  pixelRatio: number;
  timestamp: number;
}

/**
 * Generate device fingerprint dari browser
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let canvasFingerprint = '';
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('DanaMasjid', 2, 2);
    canvasFingerprint = canvas.toDataURL();
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.platform,
    window.devicePixelRatio,
    canvasFingerprint,
  ].join('|');

  const fingerprintId = await hashString(components);

  return {
    id: fingerprintId,
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
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
}

/**
 * Get device fingerprint dari localStorage
 */
export function getStoredDeviceFingerprint(): DeviceFingerprint | null {
  const stored = localStorage.getItem('device_fingerprint');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Compare two device fingerprints
 */
export function compareFingerprints(fp1: DeviceFingerprint, fp2: DeviceFingerprint): boolean {
  return fp1.id === fp2.id;
}

/**
 * Check if device is trusted
 */
export function isDeviceTrusted(userId: string): boolean {
  const trustedDevices = localStorage.getItem(`trusted_devices_${userId}`);
  if (!trustedDevices) return false;
  
  const devices: string[] = JSON.parse(trustedDevices);
  const currentFingerprint = getStoredDeviceFingerprint();
  
  return currentFingerprint ? devices.includes(currentFingerprint.id) : false;
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
