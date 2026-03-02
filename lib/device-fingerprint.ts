/**
 * Device Fingerprinting untuk Web - Custom Implementation
 * Implementasi manual tanpa library external untuk stabilitas maksimal
 * Menggunakan berbagai browser APIs untuk akurasi tinggi
 */

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
    canvasFingerprint: string;
    webglFingerprint: string;
    audioFingerprint: string;
  };
  timestamp: number;
}

/**
 * Generate Canvas Fingerprint
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;

    // Draw text with different styles
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('DanaMasjid 🕌', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('DanaMasjid 🕌', 4, 17);

    return canvas.toDataURL();
  } catch (e) {
    return 'canvas-error';
  }
}

/**
 * Generate WebGL Fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return 'no-webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `${vendor}~${renderer}`;
    }

    return 'webgl-no-debug';
  } catch (e) {
    return 'webgl-error';
  }
}

/**
 * Generate Audio Fingerprint
 */
function getAudioFingerprint(): string {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return 'no-audio';

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0; // Mute
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(0);
    
    const fingerprint = `${context.sampleRate}-${analyser.fftSize}`;
    
    oscillator.stop();
    context.close();

    return fingerprint;
  } catch (e) {
    return 'audio-error';
  }
}

/**
 * Get installed fonts (simplified)
 */
function getFonts(): string {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New',
    'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Impact'
  ];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'no-fonts';

  const testString = 'mmmmmmmmmmlli';
  const textSize = '72px';
  
  const baseFontWidths: { [key: string]: number } = {};
  baseFonts.forEach(baseFont => {
    ctx.font = `${textSize} ${baseFont}`;
    baseFontWidths[baseFont] = ctx.measureText(testString).width;
  });

  const detectedFonts: string[] = [];
  testFonts.forEach(font => {
    baseFonts.forEach(baseFont => {
      ctx.font = `${textSize} ${font}, ${baseFont}`;
      const width = ctx.measureText(testString).width;
      if (width !== baseFontWidths[baseFont]) {
        if (!detectedFonts.includes(font)) {
          detectedFonts.push(font);
        }
      }
    });
  });

  return detectedFonts.join(',');
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
 * Generate device fingerprint - Custom implementation
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  // Check if running in browser
  if (typeof window === 'undefined') {
    throw new Error('Device fingerprinting only works in browser');
  }

  try {
    // Collect all components
    const canvasFingerprint = getCanvasFingerprint();
    const webglFingerprint = getWebGLFingerprint();
    const audioFingerprint = getAudioFingerprint();
    const fonts = getFonts();

    const components = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset().toString(),
      language: navigator.language,
      languages: navigator.languages.join(','),
      platform: navigator.platform,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints,
      vendor: navigator.vendor,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || null,
      canvasFingerprint,
      webglFingerprint,
      audioFingerprint,
      fonts,
      plugins: Array.from(navigator.plugins || []).map(p => p.name).join(','),
    };

    // Combine all components into a single string
    const fingerprintString = Object.values(components).join('|');
    
    // Generate hash
    const fingerprintId = await hashString(fingerprintString);

    // Calculate confidence based on available features
    let confidence = 0.5;
    if (canvasFingerprint !== 'no-canvas' && canvasFingerprint !== 'canvas-error') confidence += 0.15;
    if (webglFingerprint !== 'no-webgl' && webglFingerprint !== 'webgl-error') confidence += 0.15;
    if (audioFingerprint !== 'no-audio' && audioFingerprint !== 'audio-error') confidence += 0.1;
    if (fonts !== 'no-fonts' && fonts.length > 0) confidence += 0.1;

    const fingerprint: DeviceFingerprint = {
      id: fingerprintId,
      visitorId: fingerprintId,
      confidence: Math.min(confidence, 1),
      components: {
        userAgent: components.userAgent,
        screenResolution: components.screenResolution,
        timezone: components.timezone,
        language: components.language,
        platform: components.platform,
        colorDepth: components.colorDepth,
        pixelRatio: components.pixelRatio,
        hardwareConcurrency: components.hardwareConcurrency,
        deviceMemory: components.deviceMemory,
        touchSupport: components.touchSupport,
        vendor: components.vendor,
        cookieEnabled: components.cookieEnabled,
        doNotTrack: components.doNotTrack,
        canvasFingerprint: canvasFingerprint.substring(0, 50) + '...', // Truncate for storage
        webglFingerprint: components.webglFingerprint,
        audioFingerprint: components.audioFingerprint,
      },
      timestamp: Date.now(),
    };

    return fingerprint;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    throw error;
  }
}

/**
 * Simpan device fingerprint ke localStorage
 */
export function saveDeviceFingerprint(fingerprint: DeviceFingerprint): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('device_fingerprint', JSON.stringify(fingerprint));
  localStorage.setItem('device_fingerprint_id', fingerprint.id);
}

/**
 * Get device fingerprint dari localStorage
 */
export function getStoredDeviceFingerprint(): DeviceFingerprint | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('device_fingerprint');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Get only fingerprint ID (faster)
 */
export function getStoredFingerprintId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('device_fingerprint_id');
}

/**
 * Compare two device fingerprints
 */
export function compareFingerprints(fp1: DeviceFingerprint, fp2: DeviceFingerprint): boolean {
  return fp1.id === fp2.id;
}

/**
 * Check if device is trusted for specific user
 */
export function isDeviceTrusted(userId: string): boolean {
  if (typeof window === 'undefined') return false;
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
  if (typeof window === 'undefined') return;
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
  if (typeof window === 'undefined') return;
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
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`trusted_devices_${userId}`);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Clear all trusted devices for user
 */
export function clearTrustedDevices(userId: string): void {
  if (typeof window === 'undefined') return;
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
  return fingerprint.confidence >= 0.8;
}
