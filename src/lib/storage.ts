import { Card, Deck, ReviewLog, UserSettings, UserStats } from '../types';
import { INITIAL_CARDS, INITIAL_DECKS, INITIAL_SETTINGS, INITIAL_STATS } from '../data/demoData';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  DECKS: 'memora_decks_v1',
  CARDS: 'memora_cards_v1',
  LOGS: 'memora_review_logs_v1',
  SETTINGS: 'memora_settings_v1',
  STATS: 'memora_stats_v1',
};

// ---------------------------------------------------------------------------
// IndexedDB sync — allows the Service Worker to read card data even when
// the browser tab is closed, to compute the real due count at notification time.
// ---------------------------------------------------------------------------
const IDB_NAME = 'memora_idb';
const IDB_VERSION = 1;
const IDB_STORE_CARDS = 'cards';
const IDB_STORE_DECKS = 'decks';
const IDB_STORE_META = 'meta';

function openMemoraDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_CARDS)) {
        db.createObjectStore(IDB_STORE_CARDS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(IDB_STORE_DECKS)) {
        db.createObjectStore(IDB_STORE_DECKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(IDB_STORE_META)) {
        db.createObjectStore(IDB_STORE_META);
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Sync all cards, decks + notification settings to IndexedDB.
 * Called after every saveDecks(), saveCards() and saveSettings().
 */
export async function syncToIndexedDB(cards: Card[], settings?: UserSettings, decks?: Deck[]): Promise<void> {
  try {
    const db = await openMemoraDB();

    // Write all cards
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_CARDS, 'readwrite');
      const store = tx.objectStore(IDB_STORE_CARDS);
      store.clear();
      for (const card of cards) {
        store.put(card);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Write all decks
    const activeDecks = decks || loadDecks();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_DECKS, 'readwrite');
      const store = tx.objectStore(IDB_STORE_DECKS);
      store.clear();
      for (const d of activeDecks) {
        store.put(d);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Write notification meta if provided
    if (settings) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_STORE_META, 'readwrite');
        const store = tx.objectStore(IDB_STORE_META);
        store.put(settings.notificationTime || '09:00', 'notificationTime');
        store.put(settings.notificationsEnabled ? 1 : 0, 'notificationsEnabled');
        store.put(settings.telegramNotificationsEnabled ? 1 : 0, 'telegramEnabled');
        store.put(settings.telegramBotToken || '', 'telegramBotToken');
        store.put(settings.telegramChatId || '', 'telegramChatId');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    db.close();
  } catch (err) {
    // Non-blocking: IndexedDB sync failure should not break the app
    console.warn('[Memora IDB] Sync failed:', err);
  }
}

// Event emitter target for reactivity across components
export const storageEventBus = new EventTarget();

export function loadDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DECKS);
    if (!raw) {
      saveDecks(INITIAL_DECKS);
      return INITIAL_DECKS;
    }
    const stored: Deck[] = JSON.parse(raw);
    let updated = false;
    const existingIds = new Set(stored.map((d) => d.id));
    for (const initDeck of INITIAL_DECKS) {
      if (!existingIds.has(initDeck.id)) {
        stored.push(initDeck);
        updated = true;
      }
    }
    if (updated) {
      saveDecks(stored);
    }
    return stored;
  } catch {
    return INITIAL_DECKS;
  }
}

export function saveDecks(decks: Deck[]) {
  localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  storageEventBus.dispatchEvent(new Event('decks_updated'));
  syncToIndexedDB(loadCards(), undefined, decks).catch(() => {});
}

export function loadCards(): Card[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (!raw) {
      saveCards(INITIAL_CARDS);
      return INITIAL_CARDS;
    }
    const stored: Card[] = JSON.parse(raw);
    let updated = false;
    const existingIds = new Set(stored.map((c) => c.id));
    for (const initCard of INITIAL_CARDS) {
      if (!existingIds.has(initCard.id)) {
        stored.push(initCard);
        updated = true;
      }
    }
    if (updated) {
      saveCards(stored);
    }
    return stored;
  } catch {
    return INITIAL_CARDS;
  }
}

export function saveCards(cards: Card[]) {
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  storageEventBus.dispatchEvent(new Event('cards_updated'));
  // Sync to IndexedDB so the SW can read the real dueCount at notification time
  syncToIndexedDB(cards, undefined, loadDecks()).catch(() => {});
}

export function loadReviewLogs(): ReviewLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReviewLogs(logs: ReviewLog[]) {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  storageEventBus.dispatchEvent(new Event('logs_updated'));
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  storageEventBus.dispatchEvent(new Event('settings_updated'));
  // Sync notification settings to IndexedDB for the SW
  const cards = loadCards();
  const decks = loadDecks();
  syncToIndexedDB(cards, settings, decks).catch(() => {});
}

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      saveStats(INITIAL_STATS);
      return INITIAL_STATS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STATS;
  }
}

export function saveStats(stats: UserStats) {
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  storageEventBus.dispatchEvent(new Event('stats_updated'));
}

export function resetReviewStats() {
  saveReviewLogs([]);
  saveStats({
    totalReviewsCount: 0,
    totalTimeSpentSeconds: 0,
    streak: 0,
    lastActiveDate: null,
    historyLog: {},
  });
}

export function resetDeckProgress(deckId: string) {
  const cards = loadCards();
  const now = new Date().toISOString();
  const updatedCards = cards.map((card) => {
    if (card.deckId !== deckId) return card;
    return {
      ...card,
      state: 'new' as const,
      interval: 0,
      repetitions: 0,
      lapses: 0,
      dueDate: now,
      lastReviewedAt: null,
    };
  });
  saveCards(updatedCards);
}

export function resetAllData() {
  saveDecks(INITIAL_DECKS);
  saveCards(INITIAL_CARDS);
  saveReviewLogs([]);
  saveSettings(INITIAL_SETTINGS);
  saveStats(INITIAL_STATS);
}

// ---------------------------------------------------------------------------
// Supabase Sync
// ---------------------------------------------------------------------------

export async function syncToSupabase(userId: string | null | undefined, cards: Card[], decks: Deck[]) {
  if (!userId) return; // User not logged in

  try {
    // Sync Decks
    const dbDecks = decks.map((deck) => ({
      id: deck.id,
      user_id: userId,
      title: deck.title,
      description: deck.description || null,
      folder: deck.folder || null,
      color: deck.color || null,
      icon: deck.icon || null,
      telegram_reminder_enabled: !!deck.telegramReminderEnabled,
      created_at: deck.createdAt,
    }));

    if (dbDecks.length > 0) {
      const { error: decksError } = await supabase.from('decks').upsert(dbDecks, { onConflict: 'id' });
      if (decksError) console.error('[Supabase Sync] Decks error:', decksError);
    }

    // Sync Cards (filter out ghost cards that don't belong to any deck)
    const validDeckIds = new Set(decks.map(d => d.id));
    const validCards = cards.filter(c => validDeckIds.has(c.deckId));

    const dbCards = validCards.map((card) => ({
      id: card.id,
      user_id: userId,
      deck_id: card.deckId,
      question: card.question,
      answer: card.answer,
      tags: card.tags || [],
      difficulty: card.difficulty,
      ease: card.ease,
      interval: card.interval,
      repetitions: card.repetitions,
      lapses: card.lapses,
      stability: card.stability,
      state: card.state,
      favorite: !!card.favorite,
      flagged: !!card.flagged,
      due_date: card.dueDate,
      created_at: card.createdAt,
      updated_at: card.updatedAt,
    }));

    if (dbCards.length > 0) {
      const { error: cardsError } = await supabase.from('cards').upsert(dbCards, { onConflict: 'id' });
      if (cardsError) console.error('[Supabase Sync] Cards error:', cardsError);
    }
  } catch (err) {
    console.error('[Supabase Sync] Exception:', err);
  }
}
