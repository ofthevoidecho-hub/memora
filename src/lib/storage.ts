import { Card, Deck, ReviewLog, UserSettings, UserStats } from '../types';
import { INITIAL_CARDS, INITIAL_DECKS, INITIAL_SETTINGS, INITIAL_STATS } from '../data/demoData';

const STORAGE_KEYS = {
  DECKS: 'memora_decks_v1',
  CARDS: 'memora_cards_v1',
  LOGS: 'memora_review_logs_v1',
  SETTINGS: 'memora_settings_v1',
  STATS: 'memora_stats_v1',
};

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

export function resetAllData() {
  saveDecks(INITIAL_DECKS);
  saveCards(INITIAL_CARDS);
  saveReviewLogs([]);
  saveSettings(INITIAL_SETTINGS);
  saveStats(INITIAL_STATS);
}
