import { useEffect, useState, useCallback } from 'react';
import { Card, CardRating, Deck, ReviewLog, UserSettings, UserStats } from '../types';
import {
  loadCards,
  loadDecks,
  loadReviewLogs,
  loadSettings,
  loadStats,
  saveCards,
  saveDecks,
  saveReviewLogs,
  saveSettings,
  saveStats,
  resetReviewStats as storageResetReviewStats,
  storageEventBus,
} from '../lib/storage';
import { calculateNextReview, isCardDue } from '../lib/spacedRepetition';
import { registerServiceWorker, scheduleNotification, cancelNotification, checkAndFireOnAppLoad } from '../lib/notifications';

export function useMemoraState() {
  const [decks, setDecks] = useState<Deck[]>(loadDecks);
  const [cards, setCards] = useState<Card[]>(loadCards);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>(loadReviewLogs);
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [stats, setStats] = useState<UserStats>(loadStats);

  // Computed helper counters
  const dueCards = cards.filter((c) => isCardDue(c));
  const difficultCards = cards.filter((c) => c.lapses > 1 || c.difficulty >= 7);
  const favoriteCards = cards.filter((c) => c.favorite);
  const learnedCards = cards.filter((c) => c.state === 'review' && c.interval >= 7);

  // Sync state when storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setDecks(loadDecks());
      setCards(loadCards());
      setReviewLogs(loadReviewLogs());
      setSettings(loadSettings());
      setStats(loadStats());
    };

    storageEventBus.addEventListener('decks_updated', handleUpdate);
    storageEventBus.addEventListener('cards_updated', handleUpdate);
    storageEventBus.addEventListener('logs_updated', handleUpdate);
    storageEventBus.addEventListener('settings_updated', handleUpdate);
    storageEventBus.addEventListener('stats_updated', handleUpdate);

    return () => {
      storageEventBus.removeEventListener('decks_updated', handleUpdate);
      storageEventBus.removeEventListener('cards_updated', handleUpdate);
      storageEventBus.removeEventListener('logs_updated', handleUpdate);
      storageEventBus.removeEventListener('settings_updated', handleUpdate);
      storageEventBus.removeEventListener('stats_updated', handleUpdate);
    };
  }, []);

  // Sync Theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Register SW & check if notification should fire immediately on app load
  useEffect(() => {
    const init = async () => {
      await registerServiceWorker();
      if (
        (settings.notificationsEnabled || settings.telegramNotificationsEnabled) &&
        settings.notificationTime
      ) {
        checkAndFireOnAppLoad(settings.notificationTime, dueCards.length, {
          enabled: settings.telegramNotificationsEnabled,
          token: settings.telegramBotToken,
          chatId: settings.telegramChatId,
        });
      }
    };
    init();
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if ((settings.notificationsEnabled || settings.telegramNotificationsEnabled) && settings.notificationTime) {
      scheduleNotification(settings.notificationTime, dueCards.length, {
        enabled: settings.telegramNotificationsEnabled,
        token: settings.telegramBotToken,
        chatId: settings.telegramChatId,
      });
    } else {
      cancelNotification();
    }
  }, [
    settings.notificationsEnabled,
    settings.telegramNotificationsEnabled,
    settings.telegramBotToken,
    settings.telegramChatId,
    settings.notificationTime,
    dueCards.length,
  ]);

  // Card CRUD Operations
  const addCard = useCallback(
    (cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'dueDate' | 'lastReviewedAt' | 'interval' | 'ease' | 'repetitions' | 'lapses' | 'difficulty' | 'stability' | 'state' | 'favorite' | 'flagged'>) => {
      const now = new Date().toISOString();
      const newCard: Card = {
        ...cardData,
        id: 'card_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
        dueDate: now,
        lastReviewedAt: null,
        interval: 0,
        ease: 2.5,
        repetitions: 0,
        lapses: 0,
        difficulty: 5,
        stability: 2.0,
        state: 'new',
        favorite: false,
        flagged: false,
      };
      const updated = [newCard, ...cards];
      saveCards(updated);
      return newCard;
    },
    [cards]
  );

  const updateCard = useCallback(
    (id: string, updates: Partial<Card>) => {
      const updated = cards.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
      saveCards(updated);
    },
    [cards]
  );

  const deleteCard = useCallback(
    (id: string) => {
      const updated = cards.filter((c) => c.id !== id);
      saveCards(updated);
    },
    [cards]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const card = cards.find((c) => c.id === id);
      if (card) {
        updateCard(id, { favorite: !card.favorite });
      }
    },
    [cards, updateCard]
  );

  const toggleFlag = useCallback(
    (id: string) => {
      const card = cards.find((c) => c.id === id);
      if (card) {
        updateCard(id, { flagged: !card.flagged });
      }
    },
    [cards, updateCard]
  );

  // Deck CRUD Operations
  const addDeck = useCallback(
    (deckData: { title: string; description: string; folder?: string; color?: string; icon?: string }) => {
      const newDeck: Deck = {
        id: 'deck_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: deckData.title,
        description: deckData.description,
        folder: deckData.folder || 'Général',
        color: deckData.color || 'indigo',
        icon: deckData.icon || 'Layers',
        createdAt: new Date().toISOString(),
      };
      saveDecks([...decks, newDeck]);
      return newDeck;
    },
    [decks]
  );

  const updateDeck = useCallback(
    (id: string, updates: Partial<Deck>) => {
      saveDecks(decks.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    },
    [decks]
  );

  const deleteDeck = useCallback(
    (id: string) => {
      saveDecks(decks.filter((d) => d.id !== id));
      saveCards(cards.filter((c) => c.deckId !== id));
    },
    [decks, cards]
  );

  const resetDeckProgress = useCallback(
    (deckId: string) => {
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
    },
    [cards]
  );

  // Process Card Review Rating
  const submitCardReview = useCallback(
    (cardId: string, rating: CardRating, timeSpentSeconds: number = 5) => {
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;

      const nowISO = new Date().toISOString();
      const updatedCard = calculateNextReview(card, rating, nowISO);

      // Save updated card
      const newCards = cards.map((c) => (c.id === cardId ? updatedCard : c));
      saveCards(newCards);

      // Save Review Log
      const log: ReviewLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        cardId,
        deckId: card.deckId,
        rating,
        reviewedAt: nowISO,
        intervalBefore: card.interval,
        intervalAfter: updatedCard.interval,
        timeSpentSeconds,
      };
      const newLogs = [log, ...reviewLogs];
      saveReviewLogs(newLogs);

      // Update User Stats & Streak
      const todayStr = nowISO.split('T')[0];
      const updatedHistory = { ...stats.historyLog, [todayStr]: (stats.historyLog[todayStr] || 0) + 1 };

      // Calculate streak
      let newStreak = stats.streak;
      if (stats.lastActiveDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (stats.lastActiveDate === yesterdayStr) {
          newStreak += 1;
        } else if (stats.lastActiveDate !== todayStr) {
          newStreak = 1; // streak reset or fresh start
        }
      }

      const newStats: UserStats = {
        ...stats,
        streak: newStreak,
        lastActiveDate: todayStr,
        totalReviewsCount: stats.totalReviewsCount + 1,
        totalTimeSpentSeconds: stats.totalTimeSpentSeconds + timeSpentSeconds,
        historyLog: updatedHistory,
      };
      saveStats(newStats);

      return updatedCard;
    },
    [cards, reviewLogs, stats]
  );

  // Bulk Import
  const importCardsBatch = useCallback(
    (newCardsList: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'dueDate' | 'lastReviewedAt' | 'interval' | 'ease' | 'repetitions' | 'lapses' | 'difficulty' | 'stability' | 'state' | 'favorite' | 'flagged'>[]) => {
      const now = new Date().toISOString();
      const createdCards: Card[] = newCardsList.map((cData, idx) => ({
        ...cData,
        id: `imported_${Date.now()}_${idx}`,
        createdAt: now,
        updatedAt: now,
        dueDate: now,
        lastReviewedAt: null,
        interval: 0,
        ease: 2.5,
        repetitions: 0,
        lapses: 0,
        difficulty: 5,
        stability: 2.0,
        state: 'new',
        favorite: false,
        flagged: false,
      }));

      saveCards([...createdCards, ...cards]);
      return createdCards.length;
    },
    [cards]
  );

  // Settings Updater
  const updateUserSettings = useCallback(
    (updates: Partial<UserSettings>) => {
      const updated = { ...settings, ...updates };
      saveSettings(updated);
    },
    [settings]
  );

  return {
    decks,
    cards,
    reviewLogs,
    settings,
    stats,
    dueCards,
    difficultCards,
    favoriteCards,
    learnedCards,
    addCard,
    updateCard,
    deleteCard,
    toggleFavorite,
    toggleFlag,
    addDeck,
    updateDeck,
    deleteDeck,
    resetDeckProgress,
    submitCardReview,
    importCardsBatch,
    updateUserSettings,
    resetReviewStats: storageResetReviewStats,
  };
}
