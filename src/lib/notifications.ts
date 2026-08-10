/**
 * Memora Notification Service
 * Manages browser push notification permissions, service worker registration,
 * and scheduling of daily revision reminders.
 */

const LAST_NOTIF_DATE_KEY = 'memora_last_notif_date';
const LAST_TELEGRAM_DATE_KEY = 'memora_last_telegram_date';

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
export async function scheduleNotification(
  time: string,
  dueCount: number,
  telegramOptions?: {
    enabled?: boolean;
    token?: string;
    chatId?: string;
  }
): Promise<void> {
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

  sw.postMessage({
    type: 'SCHEDULE_REMINDER',
    payload: {
      time,
      dueCount,
      telegramNotificationsEnabled: telegramOptions?.enabled,
      telegramBotToken: telegramOptions?.token,
      telegramChatId: telegramOptions?.chatId,
    },
  });
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

/**
 * On app load: check if today's notification time has already passed and
 * we haven't sent a notification yet today — if so, fire immediately.
 * This makes notifications reliable even when the browser was closed.
 *
 * @param time  "HH:MM" string (24h), e.g. "09:00"
 * @param dueCount  Number of due flashcards
 * @param telegramOptions  Optional Telegram settings
 */
export async function checkAndFireOnAppLoad(
  time: string,
  dueCount: number,
  telegramOptions?: {
    enabled?: boolean;
    token?: string;
    chatId?: string;
  }
): Promise<void> {
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  // Only fire if the scheduled time has passed today
  if (now < scheduledTime) return;

  // --- Browser notification ---
  const lastBrowserNotifDate = localStorage.getItem(LAST_NOTIF_DATE_KEY);
  if (
    Notification.permission === 'granted' &&
    lastBrowserNotifDate !== todayStr &&
    dueCount > 0
  ) {
    const sw = (await navigator.serviceWorker.ready).active;
    const title = `📚 ${dueCount} carte${dueCount > 1 ? 's' : ''} à réviser !`;
    const body = `Tu as ${dueCount} carte${dueCount > 1 ? 's' : ''} qui t'attend${dueCount > 1 ? 'ent' : ''}. Maintiens ta série ! 🔥`;
    if (sw) {
      sw.postMessage({ type: 'TEST_NOTIFICATION', payload: { dueCount } });
    } else {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
    localStorage.setItem(LAST_NOTIF_DATE_KEY, todayStr);
  }

  // --- Telegram notification ---
  if (
    telegramOptions?.enabled &&
    telegramOptions.token &&
    telegramOptions.chatId &&
    dueCount > 0
  ) {
    const lastTelegramDate = localStorage.getItem(LAST_TELEGRAM_DATE_KEY);
    if (lastTelegramDate !== todayStr) {
      const text = `📚 <b>Memora — Rappel de révision</b>\n\nTu as <b>${dueCount}</b> carte${dueCount > 1 ? 's' : ''} à réviser aujourd'hui. Maintiens ta série ! 🔥`;
      const success = await sendTelegramNotification(telegramOptions.token, telegramOptions.chatId, text);
      if (success) {
        localStorage.setItem(LAST_TELEGRAM_DATE_KEY, todayStr);
      }
    }
  }
}

/**
 * Sends a notification directly to a Telegram chat via custom bot token.
 */
export async function sendTelegramNotification(token: string, chatId: string, text: string): Promise<boolean> {
  if (!token || !chatId) return false;
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });
    return response.ok;
  } catch (err) {
    console.error('[Memora Telegram] Failed to send notification:', err);
    return false;
  }
}
