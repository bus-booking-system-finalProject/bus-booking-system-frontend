// src/utils/session.ts

export const getSessionId = (): string => {
  const STORAGE_KEY = 'booking_session_id';

  // 1. Check if ID exists in localStorage
  let sessionId = localStorage.getItem(STORAGE_KEY);

  // 2. If not, generate a new UUID
  if (!sessionId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionId = crypto.randomUUID();
    } else {
      // Fallback for older browsers
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    // Save it
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
};
