import { useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../services/firebase';
import { apiClient } from '../services/api/index';

// VAPID key from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
// Replace this placeholder with your actual VAPID key pair
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY || '';

const STORAGE_KEY = 'fcm_device_token';

export interface FCMMessagePayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface UseFCMOptions {
  /** Called when a foreground message arrives */
  onForegroundMessage?: (payload: FCMMessagePayload) => void;
}

export function useFCM({ onForegroundMessage }: UseFCMOptions = {}): void {
  const registerToken = useCallback(async () => {
    if (!messaging) return;

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      // Get FCM token
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (!token) return;

      // Skip if we already registered this exact token this session
      if (sessionStorage.getItem(STORAGE_KEY) === token) return;

      // Register token with backend
      await apiClient.post('/device-tokens', { token });

      sessionStorage.setItem(STORAGE_KEY, token);
    } catch (err) {
      console.error('[FCM] Token registration failed:', err);
    }
  }, []);

  useEffect(() => {
    registerToken();
  }, [registerToken]);

  useEffect(() => {
    if (!messaging || !onForegroundMessage) return;

    // Handle messages when the app tab is open/focused
    const unsubscribe = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {};
      onForegroundMessage({
        title: title || 'SmartLab',
        body: body || '',
        data: payload.data,
      });
    });

    return unsubscribe;
  }, [onForegroundMessage]);
}

/** Remove the stored FCM token from both sessionStorage and the backend. */
export async function unregisterFCMToken(): Promise<void> {
  const token = sessionStorage.getItem(STORAGE_KEY);
  if (!token) return;

  try {
    await apiClient.delete('/device-tokens', { token });
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[FCM] Token unregistration failed:', err);
  }
}
