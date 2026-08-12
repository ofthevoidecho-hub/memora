// Memora Service Worker — Daily Revision Reminder
// Uses IndexedDB to read real card data at notification time,
// so the dueCount is always accurate even if the browser was closed for days.

const SW_VERSION = 'memora-sw-v2';
const IDB_NAME = 'memora_idb';
const IDB_VERSION = 1;

let scheduledTimerId = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      // On SW activation, try to restore scheduling from IndexedDB
      return restoreScheduleFromIDB();
    })
  );
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'SCHEDULE_REMINDER') {
    clearScheduledReminder();
    scheduleReminder(payload);
  }

  if (type === 'CANCEL_REMINDER') {
    clearScheduledReminder();
  }

  if (type === 'TEST_NOTIFICATION') {
    readIDBAndFireNotification();
  }
});

// ---------------------------------------------------------------------------
// IndexedDB helpers
// ---------------------------------------------------------------------------

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = self.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('cards')) {
        db.createObjectStore('cards', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('decks')) {
        db.createObjectStore('decks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Read cards from IndexedDB and compute how many are due right now.
 */
async function computeDueCount() {
  try {
    const db = await openIDB();
    const cards = await idbGetAll(db, 'cards');
    db.close();

    const now = new Date();
    return cards.filter((card) => {
      if (card.state === 'new') return true;
      return new Date(card.dueDate) <= now;
    }).length;
  } catch {
    return 0;
  }
}

/**
 * Read notification meta from IndexedDB.
 * Returns { notificationTime, notificationsEnabled, telegramEnabled, telegramBotToken, telegramChatId }
 */
async function readNotificationMeta() {
  try {
    const db = await openIDB();
    const notificationTime = await idbGet(db, 'meta', 'notificationTime');
    const notificationsEnabled = await idbGet(db, 'meta', 'notificationsEnabled');
    const telegramEnabled = await idbGet(db, 'meta', 'telegramEnabled');
    const telegramBotToken = await idbGet(db, 'meta', 'telegramBotToken');
    const telegramChatId = await idbGet(db, 'meta', 'telegramChatId');
    db.close();
    return {
      notificationTime: notificationTime || '09:00',
      notificationsEnabled: !!notificationsEnabled,
      telegramEnabled: !!telegramEnabled,
      telegramBotToken: telegramBotToken || '',
      telegramChatId: telegramChatId || '',
    };
  } catch {
    return {
      notificationTime: '09:00',
      notificationsEnabled: false,
      telegramEnabled: false,
      telegramBotToken: '',
      telegramChatId: '',
    };
  }
}

/**
 * After SW restart (browser reboot, update), restore the timer from IDB meta.
 */
async function restoreScheduleFromIDB() {
  const meta = await readNotificationMeta();
  if (meta.notificationsEnabled || meta.telegramEnabled) {
    scheduleReminder({
      time: meta.notificationTime,
      telegramNotificationsEnabled: meta.telegramEnabled,
      telegramBotToken: meta.telegramBotToken,
      telegramChatId: meta.telegramChatId,
    });
  }
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

function clearScheduledReminder() {
  if (scheduledTimerId !== null) {
    clearTimeout(scheduledTimerId);
    scheduledTimerId = null;
  }
}

function scheduleReminder(payload) {
  const { time, telegramBotToken, telegramChatId, telegramNotificationsEnabled } = payload;
  const msUntilFire = getMsUntilTime(time);

  scheduledTimerId = setTimeout(async () => {
    // Compute the REAL dueCount from IndexedDB at fire time
    const dueCount = await computeDueCount();

    fireNotification(dueCount);

    if (telegramNotificationsEnabled && telegramBotToken && telegramChatId) {
      fireTelegramNotification(telegramBotToken, telegramChatId, dueCount);
      await fireDeckTelegramNotifications(telegramBotToken, telegramChatId);
    }

    // Re-schedule for next day
    scheduledTimerId = setTimeout(() => scheduleReminder(payload), 24 * 60 * 60 * 1000);
  }, msUntilFire);
}

/**
 * Read IDB and fire notification immediately (used for TEST_NOTIFICATION).
 */
async function readIDBAndFireNotification() {
  const dueCount = await computeDueCount();
  fireNotification(dueCount);
}

function fireTelegramNotification(token, chatId, dueCount) {
  const text = dueCount > 0
    ? `📚 <b>Memora — Rappel de révision</b>\n\nTu as <b>${dueCount}</b> carte${dueCount > 1 ? 's' : ''} à réviser aujourd'hui. Maintiens ta série ! 🔥`
    : `📚 <b>Memora — Rappel de révision</b>\n\nC'est l'heure de tes révisions quotidiennes !`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    }),
  }).catch(err => console.error('[SW Telegram] Error sending notification:', err));
}

async function fireDeckTelegramNotifications(token, chatId) {
  try {
    const db = await openIDB();
    const cards = await idbGetAll(db, 'cards');
    const decks = await idbGetAll(db, 'decks');
    db.close();

    for (const deck of decks) {
      if (deck.telegramReminderEnabled) {
        const deckCards = cards.filter(c => c.deckId === deck.id);
        const difficultCards = deckCards.filter(c => c.difficulty >= 7 || c.flagged || c.lapses > 1);

        if (difficultCards.length > 0) {
          let text = `📚 <b>Rappel — Deck : ${deck.title}</b>\n`;
          text += `Voici les questions que vous avez déclarées difficiles à restituer :\n\n`;
          
          difficultCards.forEach((c, idx) => {
            text += `<b>${idx + 1}. Q:</b> ${c.question}\n`;
            text += `<b>R:</b> <tg-spoiler>${c.answer}</tg-spoiler>\n\n`;
          });
          
          text += `Prêt à les restituer ? 🔥`;

          const url = `https://api.telegram.org/bot${token}/sendMessage`;
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: text,
              parse_mode: 'HTML',
            }),
          });
        }
      }
    }
  } catch (err) {
    console.error('[SW Telegram] Error sending deck notifications:', err);
  }
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
