/**
 * Registers push notifications or requests permission if available.
 */
export async function registerPushNotifications(): Promise<void> {
  if (!('Notification' in window)) {
    console.log('[Notifications] This browser does not support desktop push notifications.');
    return;
  }

  try {
    if (Notification.permission === 'granted') {
      console.log('[Notifications] Permission already granted.');
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('[Notifications] Permission granted successfully.');
      } else {
        console.log('[Notifications] Permission was dismissed or denied.');
      }
    }
  } catch (err) {
    console.error('[Notifications] Error requesting push notification permission:', err);
  }
}
