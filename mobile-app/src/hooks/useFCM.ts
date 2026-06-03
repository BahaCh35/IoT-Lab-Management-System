import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { notificationService } from '../services/api/notificationService';
import { useAuth } from '../context/AuthContext';

const DEVICE_TOKEN_KEY = 'expo_device_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useFCM(
  onForegroundMessage?: (title: string, body: string, data?: Record<string, string>) => void,
) {
  const { user } = useAuth();
  const registeredToken = useRef<string | null>(null);

  const registerToken = useCallback(async () => {
    if (!Device.isDevice) return; // Skip on simulator

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.warn('[FCM] Expo projectId not configured — push notifications disabled.');
        return;
      }
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;

      if (registeredToken.current === token) return;
      registeredToken.current = token;

      await notificationService.registerDeviceToken(token);
    } catch (err) {
      console.error('[FCM] Token registration failed:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    registeredToken.current = null; // force re-register on user change
    registerToken();
  }, [user?.id, registerToken]);

  useEffect(() => {
    if (!onForegroundMessage) return;
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      onForegroundMessage(
        title || 'SmartLab',
        body || '',
        data as Record<string, string>,
      );
    });
    return () => sub.remove();
  }, [onForegroundMessage]);
}

export async function unregisterFCMToken(): Promise<void> {
  if (registeredTokenCache) {
    try {
      await notificationService.unregisterDeviceToken(registeredTokenCache);
      registeredTokenCache = null;
    } catch (err) {
      console.error('[FCM] Unregister failed:', err);
    }
  }
}

let registeredTokenCache: string | null = null;
