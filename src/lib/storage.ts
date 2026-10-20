import { Card, Deck, ReviewLog, UserSettings, UserStats } from '../types';
import { INITIAL_CARDS, INITIAL_DECKS, INITIAL_SETTINGS, INITIAL_STATS } from '../data/demoData';
import { supabase, supabaseUrlClean, supabaseAnonKeyClean } from './supabase';

let lastSelfDbWriteTime = 0;

export function markSelfDbWrite() {
  lastSelfDbWriteTime = Date.now();
}

export function isSelfDbWriteRecent(thresholdMs: number = 4000): boolean {
  return Date.now() - lastSelfDbWriteTime < thresholdMs;
}

const STORAGE_KEYS = {
  DECKS: 'memora_decks_v2',
  CARDS: 'memora_cards_v2',
  LOGS: 'memora_review_logs_v2',
  SETTINGS: 'memora_settings_v2',
  STATS: 'memora_stats_v2',
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

export function saveDecks(decks: Deck[], skipEvent: boolean = false) {
  try {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  } catch (err) {
    console.warn('[Storage] saveDecks failed:', err);
  }
  if (!skipEvent) {
    storageEventBus.dispatchEvent(new Event('decks_updated'));
  }
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

export function saveCards(cards: Card[], skipIndexedDB: boolean = false, skipEvent: boolean = false) {
  try {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  } catch (err) {
    console.warn('[Storage] saveCards failed:', err);
  }
  if (!skipEvent) {
    storageEventBus.dispatchEvent(new Event('cards_updated'));
  }
  // Sync to IndexedDB so the SW can read the real dueCount at notification time (skip during review sessions)
  if (!skipIndexedDB) {
    syncToIndexedDB(cards, undefined, loadDecks()).catch(() => {});
  }
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

export function saveStats(stats: UserStats, skipEvent: boolean = false) {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.warn('[Storage] saveStats failed:', err);
  }
  if (!skipEvent) {
    storageEventBus.dispatchEvent(new Event('stats_updated'));
  }
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
  localStorage.removeItem(`memora_saved_index_${deckId}`);
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

/**
 * Sync user stats (streak, total reviews, history) to Supabase.
 * This allows multi-device continuity: stats are loaded from Supabase on login.
 */
export async function syncStatsToSupabase(
  userId: string | null | undefined,
  stats: UserStats,
  keepAlive: boolean = false
): Promise<void> {
  if (!userId) return;

  markSelfDbWrite();

  const payload = {
    user_id: userId,
    streak: stats.streak,
    total_reviews_count: stats.totalReviewsCount,
    total_time_spent_seconds: stats.totalTimeSpentSeconds,
    last_active_date: stats.lastActiveDate,
    history_log: stats.historyLog,
    updated_at: new Date().toISOString(),
  };

  if (keepAlive && supabaseUrlClean && supabaseAnonKeyClean && typeof fetch !== 'undefined') {
    try {
      fetch(`${supabaseUrlClean}/rest/v1/user_stats`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKeyClean,
          Authorization: `Bearer ${supabaseAnonKeyClean}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
      return;
    } catch (err) {
      console.warn('[Supabase keepalive stats failed]:', err);
    }
  }

  try {
    const { error } = await supabase.from('user_stats').upsert(payload, { onConflict: 'user_id' });
    if (error) console.error('[Supabase Sync] Stats error:', error);
  } catch (err) {
    console.error('[Supabase Sync] Stats exception:', err);
  }
}

/**
 * Sync only a specific batch of cards to Supabase (e.g., cards modified during a review session).
 * Supports keepAlive for browser close / tab unload events.
 */
export async function syncCardsBatchToSupabase(
  userId: string | null | undefined,
  cards: Card[],
  keepAlive: boolean = false
): Promise<void> {
  if (!userId || cards.length === 0) return;

  const dbCards = cards.map((card) => ({
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
    updated_at: card.updatedAt || new Date().toISOString(),
  }));

  markSelfDbWrite();

  if (keepAlive && supabaseUrlClean && supabaseAnonKeyClean && typeof fetch !== 'undefined') {
    try {
      fetch(`${supabaseUrlClean}/rest/v1/cards`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKeyClean,
          Authorization: `Bearer ${supabaseAnonKeyClean}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(dbCards),
        keepalive: true,
      }).catch(() => {});
      return;
    } catch (err) {
      console.warn('[Supabase keepalive cards batch failed]:', err);
    }
  }

  try {
    const { error: cardsError } = await supabase.from('cards').upsert(dbCards, { onConflict: 'id' });
    if (cardsError) console.error('[Supabase Batch Sync] Cards error:', cardsError);
  } catch (err) {
    console.error('[Supabase Batch Sync] Exception:', err);
  }
}

let lastFetchStatsTime = 0;
let lastFetchStatsPromise: Promise<UserStats | null> | null = null;
let consecutiveStatsFetchFailures = 0;
let nextAllowedStatsFetchTime = 0;

/**
 * Fetch user stats from Supabase and merge with local stats (take the most recent).
 * Includes deduplication, throttling, and exponential backoff on network failure.
 */
export async function fetchStatsFromSupabase(userId: string): Promise<UserStats | null> {
  if (!userId) return null;

  const now = Date.now();
  if (now < nextAllowedStatsFetchTime) {
    return null;
  }

  if (lastFetchStatsPromise) {
    return lastFetchStatsPromise;
  }

  if (now - lastFetchStatsTime < 3000) {
    return null;
  }

  lastFetchStatsPromise = (async () => {
    lastFetchStatsTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      consecutiveStatsFetchFailures = 0;
      nextAllowedStatsFetchTime = 0;

      if (!data) return null;

      const remoteStats: UserStats = {
        streak: data.streak ?? 0,
        totalReviewsCount: data.total_reviews_count ?? 0,
        totalTimeSpentSeconds: data.total_time_spent_seconds ?? 0,
        lastActiveDate: data.last_active_date ?? null,
        historyLog: (data.history_log as Record<string, number>) ?? {},
      };

      // Merge: take the higher streak / review count to avoid data loss
      const localStats = loadStats();
      const merged: UserStats = {
        streak: Math.max(remoteStats.streak, localStats.streak),
        totalReviewsCount: Math.max(remoteStats.totalReviewsCount, localStats.totalReviewsCount),
        totalTimeSpentSeconds: Math.max(remoteStats.totalTimeSpentSeconds, localStats.totalTimeSpentSeconds),
        lastActiveDate: remoteStats.lastActiveDate ?? localStats.lastActiveDate,
        historyLog: { ...localStats.historyLog, ...remoteStats.historyLog },
      };

      saveStats(merged, true);
      return merged;
    } catch (err: any) {
      consecutiveStatsFetchFailures++;
      const backoffSecs = Math.min(30, 3 * Math.pow(2, consecutiveStatsFetchFailures - 1));
      nextAllowedStatsFetchTime = Date.now() + backoffSecs * 1000;
      if (consecutiveStatsFetchFailures <= 2) {
        console.warn(`[Supabase Fetch] Stats network issue (${err?.message || 'Failed to fetch'}). Retrying in ${backoffSecs}s.`);
      }
      return null;
    } finally {
      lastFetchStatsPromise = null;
    }
  })();

  return lastFetchStatsPromise;
}

let lastFetchCardsTime = 0;
let lastFetchCardsPromise: Promise<{ decks: Deck[]; cards: Card[] } | null> | null = null;
let consecutiveCardsFetchFailures = 0;
let nextAllowedCardsFetchTime = 0;

/**
 * Fetch Decks and Cards from Supabase with request deduplication, throttling,
 * and circuit breaker with exponential backoff on network failure.
 */
export async function fetchFromSupabase(userId: string): Promise<{ decks: Deck[]; cards: Card[] } | null> {
  if (!userId) return null;

  const now = Date.now();
  if (now < nextAllowedCardsFetchTime) {
    return null;
  }

  if (lastFetchCardsPromise) {
    return lastFetchCardsPromise;
  }

  if (now - lastFetchCardsTime < 3000) {
    return null;
  }

  lastFetchCardsPromise = (async () => {
    lastFetchCardsTime = Date.now();
    try {
      // Fetch Decks
      const { data: dbDecks, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', userId);

      if (decksError) {
        throw decksError;
      }

      // Fetch Cards
      const { data: dbCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId);

      if (cardsError) {
        throw cardsError;
      }

      consecutiveCardsFetchFailures = 0;
      nextAllowedCardsFetchTime = 0;

      let parsedDecks: Deck[] = [];
      if (dbDecks && dbDecks.length > 0) {
        parsedDecks = dbDecks.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description || '',
          folder: d.folder || 'Général',
          color: d.color || 'indigo',
          icon: d.icon || 'Layers',
          telegramReminderEnabled: !!d.telegram_reminder_enabled,
          createdAt: d.created_at,
        }));
        saveDecks(parsedDecks, true);
      }

      let parsedCards: Card[] = [];
      if (dbCards && dbCards.length > 0) {
        parsedCards = dbCards.map((c) => ({
          id: c.id,
          deckId: c.deck_id,
          question: c.question,
          answer: c.answer,
          tags: c.tags || [],
          difficulty: c.difficulty,
          ease: c.ease,
          interval: c.interval,
          repetitions: c.repetitions,
          lapses: c.lapses,
          stability: c.stability,
          state: c.state,
          favorite: !!c.favorite,
          flagged: !!c.flagged,
          dueDate: c.due_date,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          lastReviewedAt: null,
        }));
        saveCards(parsedCards, true, true);
      }

      return { decks: parsedDecks, cards: parsedCards };
    } catch (err: any) {
      consecutiveCardsFetchFailures++;
      const backoffSecs = Math.min(30, 3 * Math.pow(2, consecutiveCardsFetchFailures - 1));
      nextAllowedCardsFetchTime = Date.now() + backoffSecs * 1000;
      if (consecutiveCardsFetchFailures <= 2) {
        console.warn(`[Supabase Fetch] Cards/Decks network issue (${err?.message || 'Failed to fetch'}). Retrying in ${backoffSecs}s.`);
      }
      return null;
    } finally {
      lastFetchCardsPromise = null;
    }
  })();

  return lastFetchCardsPromise;
}

/**
 * Direct database write for single card updates (instant multi-device sync)
 */
export async function updateCardInSupabase(card: Card) {
  try {
    const { error } = await supabase.from('cards').update({
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
      updated_at: card.updatedAt || new Date().toISOString(),
    }).eq('id', card.id);

    if (error) console.error('[Supabase Card Update] Error:', error);
  } catch (err) {
    console.error('[Supabase Card Update] Exception:', err);
  }
}

/**
 * Direct database reset for a deck
 */
export async function resetDeckInSupabase(deckId: string, userId: string) {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase.from('cards').update({
      state: 'new',
      interval: 0,
      repetitions: 0,
      lapses: 0,
      due_date: now,
      updated_at: now,
    }).eq('deck_id', deckId).eq('user_id', userId);

    if (error) console.error('[Supabase Deck Reset] Error:', error);
  } catch (err) {
    console.error('[Supabase Deck Reset] Exception:', err);
  }
}

/**
 * Direct database delete for a card
 */
export async function deleteCardInSupabase(cardId: string) {
  try {
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (error) console.error('[Supabase Card Delete] Error:', error);
  } catch (err) {
    console.error('[Supabase Card Delete] Exception:', err);
  }
}

/**
 * Direct database delete for a deck and all its cards
 */
export async function deleteDeckInSupabase(deckId: string) {
  try {
    await supabase.from('cards').delete().eq('deck_id', deckId);
    await supabase.from('decks').delete().eq('id', deckId);
  } catch (err) {
    console.error('[Supabase Deck Delete] Exception:', err);
  }
}


