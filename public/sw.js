// Memora Service Worker — Daily Revision Reminder
// Handles scheduling and firing browser notifications for due flashcard reviews.

const SW_VERSION = 'memora-sw-v1';
let scheduledTimerId = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'SCHEDULE_REMINDER') {
    // payload: { time: "09:00", dueCount: 12 }
    clearScheduledReminder();
    scheduleReminder(payload.time, payload.dueCount);
  }

  if (type === 'CANCEL_REMINDER') {
    clearScheduledReminder();
  }

  if (type === 'TEST_NOTIFICATION') {
    fireNotification(payload?.dueCount ?? 0);
  }
});

function clearScheduledReminder() {
  if (scheduledTimerId !== null) {
    clearTimeout(scheduledTimerId);
    scheduledTimerId = null;
  }
}

function scheduleReminder(timeStr, dueCount) {
  const msUntilFire = getMsUntilTime(timeStr);
  scheduledTimerId = setTimeout(() => {
    fireNotification(dueCount);
    // Re-schedule for next day
    scheduledTimerId = setTimeout(() => scheduleReminder(timeStr, dueCount), 24 * 60 * 60 * 1000);
  }, msUntilFire);
}

function getMsUntilTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  // If target time already passed today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

function fireNotification(dueCount) {
  const title = dueCount > 0
    ? `📚 ${dueCount} carte${dueCount > 1 ? 's' : ''} à réviser !`
    : '📚 Memora — Heure de révision !';

  const body = dueCount > 0
    ? `Tu as ${dueCount} carte${dueCount > 1 ? 's' : ''} qui t'attend${dueCount > 1 ? 'ent' : ''}. Maintiens ta série ! 🔥`
    : 'Ouvre Memora pour maintenir ta progression de révision espacée.';

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'memora-daily-review',
    renotify: true,
    requireInteraction: false,
    data: { url: self.location.origin },
  });
}

// When user clicks the notification, open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If tab already open, focus it
      for (const client of clientList) {
        if (client.url.startsWith(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
