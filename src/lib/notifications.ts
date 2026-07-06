import { Capacitor } from '@capacitor/core';
import { PushNotifications, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { getAuth } from 'firebase/auth';

const isNative = Capacitor.isNativePlatform();
const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function getAuthToken(): Promise<string | null> {
  const user = getAuth().currentUser;
  if (!user) return null;
  try { return await user.getIdToken(); } catch { return null; }
}

export async function registerPushNotifications(): Promise<void> {
  if (!isNative) return;

  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  if (permStatus.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    const idToken = await getAuthToken();
    if (!idToken) return;
    try {
      await fetch(`${SERVER_URL}/api/notifications/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ fcmToken: token.value }),
      });
    } catch (e) {
      console.warn('Failed to register FCM token:', e);
    }
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.warn('FCM registration error:', err.error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    if (notification.body) {
      alert(`${notification.title}: ${notification.body}`);
    }
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    const data = action.notification.data;
    if (data?.route) {
      window.location.hash = data.route as string;
    }
  });
}
