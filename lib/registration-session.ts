/**
 * Registration Session Management
 * Mengelola session pendaftaran masjid dengan timeout 24 jam
 */

export interface RegistrationSession {
  userId: string;
  email: string;
  startTime: number;
  expiresAt: number;
  currentStep: number;
  formData: any;
  deviceFingerprint: string;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 jam dalam milliseconds
const SESSION_KEY = 'masjid_registration_session';

/**
 * Create new registration session
 */
export function createRegistrationSession(
  userId: string,
  email: string,
  deviceFingerprint: string
): RegistrationSession {
  const now = Date.now();
  const session: RegistrationSession = {
    userId,
    email,
    startTime: now,
    expiresAt: now + SESSION_DURATION,
    currentStep: 1,
    formData: {},
    deviceFingerprint,
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Get current registration session
 */
export function getRegistrationSession(): RegistrationSession | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  
  const session: RegistrationSession = JSON.parse(stored);
  
  // Check if session expired
  if (Date.now() > session.expiresAt) {
    clearRegistrationSession();
    return null;
  }
  
  return session;
}

/**
 * Update registration session
 */
export function updateRegistrationSession(updates: Partial<RegistrationSession>): void {
  const session = getRegistrationSession();
  if (!session) return;
  
  const updated = { ...session, ...updates };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
}

/**
 * Save form data to session
 */
export function saveFormDataToSession(step: number, data: any): void {
  const session = getRegistrationSession();
  if (!session) return;
  
  session.formData[`step${step}`] = data;
  session.currentStep = Math.max(session.currentStep, step);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Get form data from session
 */
export function getFormDataFromSession(step: number): any {
  const session = getRegistrationSession();
  return session?.formData[`step${step}`] || null;
}

/**
 * Clear registration session
 */
export function clearRegistrationSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Check if session is about to expire (less than 1 hour remaining)
 */
export function isSessionExpiringSoon(): boolean {
  const session = getRegistrationSession();
  if (!session) return false;
  
  const timeRemaining = session.expiresAt - Date.now();
  const oneHour = 60 * 60 * 1000;
  
  return timeRemaining < oneHour && timeRemaining > 0;
}

/**
 * Get time remaining in session (in milliseconds)
 */
export function getSessionTimeRemaining(): number {
  const session = getRegistrationSession();
  if (!session) return 0;
  
  return Math.max(0, session.expiresAt - Date.now());
}

/**
 * Format time remaining as human readable string
 */
export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  return `${minutes} menit`;
}
