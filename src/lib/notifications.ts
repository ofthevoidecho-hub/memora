/**
 * Memora Notification Service
 * Manages browser push notification permissions, service worker registration,
 * and scheduling of daily revision reminders.
 */

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the Memora service worker (idempotent).
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return swRegistration;
  } catch (err) {
    console.warn('[Memora SW] Registration failed:', err);
    return null;
  }
}

/**
 * Get the current SW registration (registers if not yet done).
 */
async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (swRegistration) return swRegistration;
  return registerServiceWorker();
}

/**
 * Request browser notification permission from the user.
 * Returns the resulting permission state.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  const result = await Notification.requestPermission();
  return result;
}

/**
 * Get the current notification permission state without prompting.
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

/**
 * Schedule a daily reminder notification at the given time.
 * @param time  "HH:MM" string (24h), e.g. "09:00"
 * @param dueCount  Number of due cards at scheduling time
 */
export async function scheduleNotification(time: string, dueCount: number): Promise<void> {
  const reg = await getSWRegistration();
  if (!reg || !reg.active) {
    // Fallback: wait for SW to become active
    await navigator.serviceWorker.ready;
    swRegistration = await navigator.serviceWorker.getRegistration('/');
  }

  const sw = (await navigator.serviceWorker.ready).active;
  if (!sw) {
    console.warn('[Memora SW] No active service worker found.');
    return;
  }

  sw.postMessage({ type: 'SCHEDULE_REMINDER', payload: { time, dueCount } });
}

/**
 * Cancel any scheduled reminder.
 */
export async function cancelNotification(): Promise<void> {
  const sw = (await navigator.serviceWorker.ready).active;
  if (sw) {
    sw.postMessage({ type: 'CANCEL_REMINDER' });
  }
}

/**
 * Immediately fire a test notification (to verify permissions + SW work).
 */
export async function sendTestNotification(dueCount: number): Promise<void> {
  if (Notification.permission !== 'granted') {
    console.warn('[Memora] Notification permission not granted.');
    return;
  }

  const sw = (await navigator.serviceWorker.ready).active;
  if (sw) {
    sw.postMessage({ type: 'TEST_NOTIFICATION', payload: { dueCount } });
  } else {
    // Direct fallback if SW not active
    new Notification(`📚 ${dueCount} carte${dueCount > 1 ? 's' : ''} à réviser !`, {
      body: 'Test de notification Memora — tout fonctionne !',
      icon: '/favicon.ico',
    });
  }
}
