import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
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
  syncToSupabase,
  syncStatsToSupabase,
  syncCardsBatchToSupabase,
  fetchFromSupabase,
  fetchStatsFromSupabase,
  updateCardInSupabase,
  resetDeckInSupabase,
  deleteCardInSupabase,
  deleteDeckInSupabase,
  isSelfDbWriteRecent,
  syncToIndexedDB,
} from '../lib/storage';
import { supabase } from '../lib/supabase';
import { calculateNextReview, isCardDue, isCardDifficult } from '../lib/spacedRepetition';
import { registerServiceWorker, scheduleNotification, cancelNotification, checkAndFireOnAppLoad } from '../lib/notifications';

export function useMemoraState() {
  const [decks, setDecks] = useState<Deck[]>(loadDecks);
  const [cards, setCards] = useState<Card[]>(loadCards);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>(loadReviewLogs);
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [stats, setStats] = useState<UserStats>(loadStats);

  const { user } = useUser();
  const userId = user?.id;
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Ref to track if realtime channel is already subscribed and debouncing
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const realtimeDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pending review buffer: holds cards and stats updated during review session
  const pendingReviewCardsRef = useRef<Map<string, Card>>(new Map());
  const pendingStatsRef = useRef<UserStats | null>(null);
  const isFlushingRef = useRef<boolean>(false);
  const isInitialFetchDoneRef = useRef<boolean>(false);

  // Initial Fetch from Supabase (cards, decks, and stats) - Database is Source of Truth
  useEffect(() => {
    if (userId && !isInitialFetchDoneRef.current) {
      isInitialFetchDoneRef.current = true;
      Promise.all([
        fetchFromSupabase(userId),
        fetchStatsFromSupabase(userId),
      ])
        .then(([remoteData, remoteStats]) => {
          if (remoteData) {
            if (remoteData.decks.length > 0) setDecks(remoteData.decks);
            if (remoteData.cards.length > 0) setCards(remoteData.cards);
          }
          if (remoteStats) {
            setStats(remoteStats);
          }
          setIsDataLoaded(true);
        })
        .catch((err) => {
          console.warn('[Memora] Initial fetch fallback to local storage:', err);
          setIsDataLoaded(true);
        });
    } else if (!userId) {
      setIsDataLoaded(true);
    }
  }, [userId]);

  // Supabase Realtime — listen for card updates from other devices (debounced, avoids echoing self writes)
  useEffect(() => {
    if (!userId) return;

    // Avoid duplicate subscriptions
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`cards-sync-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (isSelfDbWriteRecent()) return;
          if (realtimeDebounceTimerRef.current) {
            clearTimeout(realtimeDebounceTimerRef.current);
          }
          realtimeDebounceTimerRef.current = setTimeout(async () => {
            if (isSelfDbWriteRecent()) return;
            console.log('[Realtime] Syncing cards updated from another device...');
            const remote = await fetchFromSupabase(userId);
            if (remote && remote.cards.length > 0) {
              setCards(remote.cards);
              setDecks(remote.decks);
            }
          }, 2500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (isSelfDbWriteRecent()) return;
          if (realtimeDebounceTimerRef.current) {
            clearTimeout(realtimeDebounceTimerRef.current);
          }
          realtimeDebounceTimerRef.current = setTimeout(async () => {
            if (isSelfDbWriteRecent()) return;
            console.log('[Realtime] Syncing stats updated from another device...');
            const remoteStats = await fetchStatsFromSupabase(userId);
            if (remoteStats) setStats(remoteStats);
          }, 2500);
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeDebounceTimerRef.current) {
        clearTimeout(realtimeDebounceTimerRef.current);
      }
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [userId]);

  // Computed helper counters
  const dueCards = cards.filter((c) => isCardDue(c));
  const difficultCards = cards.filter(isCardDifficult);
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
        checkAndFireOnAppLoad(
          settings.notificationTime,
          dueCards.length,
          {
            enabled: settings.telegramNotificationsEnabled,
            token: settings.telegramBotToken,
            chatId: settings.telegramChatId,
          },
          cards,
          decks
        );
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
      setCards(updated);
      saveCards(updated);
      if (user) {
        updateCardInSupabase(newCard);
      }
      return newCard;
    },
    [cards, user]
  );

  const updateCard = useCallback(
    (id: string, updates: Partial<Card>) => {
      const updated = cards.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
      setCards(updated);
      saveCards(updated);
      const target = updated.find((c) => c.id === id);
      if (target) {
        updateCardInSupabase(target);
      }
    },
    [cards]
  );

  const deleteCard = useCallback(
    (id: string) => {
      const updated = cards.filter((c) => c.id !== id);
      setCards(updated);
      saveCards(updated);
      deleteCardInSupabase(id);
    },
    [cards]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const card = cards.find((c) => c.id === id);
      if (card) {
        const updated = { ...card, favorite: !card.favorite, updatedAt: new Date().toISOString() };
        updateCard(id, { favorite: !card.favorite });
        updateCardInSupabase(updated);
      }
    },
    [cards, updateCard]
  );

  const toggleFlag = useCallback(
    (id: string) => {
      const card = cards.find((c) => c.id === id);
      if (card) {
        const updated = { ...card, flagged: !card.flagged, updatedAt: new Date().toISOString() };
        updateCard(id, { flagged: !card.flagged });
        updateCardInSupabase(updated);
      }
    },
    [cards, updateCard]
  );

  // Deck CRUD Operations
  const addDeck = useCallback(
    (deckData: { title: string; description: string; folder?: string; color?: string; icon?: string; telegramReminderEnabled?: boolean }) => {
      const newDeck: Deck = {
        id: 'deck_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: deckData.title,
        description: deckData.description,
        folder: deckData.folder || 'Général',
        color: deckData.color || 'indigo',
        icon: deckData.icon || 'Layers',
        createdAt: new Date().toISOString(),
        telegramReminderEnabled: deckData.telegramReminderEnabled || false,
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
      deleteDeckInSupabase(id);
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
      localStorage.removeItem(`memora_saved_index_${deckId}`);
      if (user) {
        resetDeckInSupabase(deckId, user.id);
      }
    },
    [cards, user]
  );

  // Flush Review Session to Supabase: saves all accumulated reviewed cards and stats in one single batch
  const flushReviewSession = useCallback(
    async (options?: { keepAlive?: boolean }) => {
      if (!user) return;
      if (isFlushingRef.current && !options?.keepAlive) return;

      let pendingCards: Card[] = Array.from(pendingReviewCardsRef.current.values());
      let pendingStats: UserStats | null = pendingStatsRef.current;

      // Also inspect localStorage for any pending sync that might have been saved
      if (pendingCards.length === 0 && !pendingStats) {
        try {
          const raw = localStorage.getItem('memora_pending_review_sync');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.cards) && parsed.cards.length > 0) {
              pendingCards = parsed.cards as Card[];
            }
            if (parsed?.stats) {
              pendingStats = parsed.stats as UserStats;
            }
          }
        } catch {
          // ignore parsing error
        }
      }

      if (pendingCards.length === 0 && !pendingStats) {
        return; // Nothing to sync
      }

      isFlushingRef.current = true;
      pendingReviewCardsRef.current.clear();
      pendingStatsRef.current = null;
      try {
        localStorage.removeItem('memora_pending_review_sync');
      } catch {
        // ignore
      }

      try {
        const promises: Promise<any>[] = [];
        if (pendingCards.length > 0) {
          promises.push(syncCardsBatchToSupabase(user.id, pendingCards, options?.keepAlive));
        }
        if (pendingStats) {
          promises.push(syncStatsToSupabase(user.id, pendingStats, options?.keepAlive));
        }

        if (!options?.keepAlive) {
          // Sync to IndexedDB once at the end of the review session
          promises.push(syncToIndexedDB(loadCards(), undefined, loadDecks()));
          await Promise.all(promises);
          console.log(`[Memora Review] Synced ${pendingCards.length} reviewed cards and stats to Supabase.`);
        }
      } catch (err) {
        console.error('[Memora Review] Error flushing review session:', err);
      } finally {
        isFlushingRef.current = false;
      }
    },
    [user]
  );

  // Sync to database when the browser/tab closes or is backgrounded
  useEffect(() => {
    const handleUnload = () => {
      flushReviewSession({ keepAlive: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushReviewSession({ keepAlive: true });
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flushReviewSession]);

  // Check and flush any pending review sync from a previous session on startup
  useEffect(() => {
    if (user && isDataLoaded) {
      flushReviewSession();
    }
  }, [user, isDataLoaded, flushReviewSession]);

  // Process Card Review Rating — Buffered in memory/localStorage during review, synced on session exit or browser close
  const submitCardReview = useCallback(
    (cardId: string, rating: CardRating, timeSpentSeconds: number = 5) => {
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;

      const nowISO = new Date().toISOString();
      const updatedCard = calculateNextReview(card, rating, nowISO);

      // Save updated card locally in state and localStorage immediately (without heavy IDB sync & without event spam)
      const newCards = cards.map((c) => (c.id === cardId ? updatedCard : c));
      setCards(newCards);
      saveCards(newCards, true, true);

      // Buffer updated card for bulk database sync when leaving review
      pendingReviewCardsRef.current.set(cardId, updatedCard);

      // Save Review Log locally
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
      setReviewLogs(newLogs);
      saveReviewLogs(newLogs);

      // Update User Stats & Streak locally
      const todayStr = nowISO.split('T')[0];
      const updatedHistory = { ...stats.historyLog, [todayStr]: (stats.historyLog[todayStr] || 0) + 1 };

      let newStreak = stats.streak;
      if (stats.lastActiveDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (stats.lastActiveDate === yesterdayStr) {
          newStreak += 1;
        } else if (stats.lastActiveDate !== todayStr) {
          newStreak = 1;
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
      setStats(newStats);
      saveStats(newStats);
      pendingStatsRef.current = newStats;

      // Persist pending buffer to localStorage so nothing is lost even on unexpected power loss
      try {
        localStorage.setItem(
          'memora_pending_review_sync',
          JSON.stringify({
            cards: Array.from(pendingReviewCardsRef.current.values()),
            stats: newStats,
          })
        );
      } catch {
        // ignore storage errors
      }

      // NOTE: Database write is strictly deferred until leaving review or browser close
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

      const updated = [...createdCards, ...cards];
      setCards(updated);
      saveCards(updated);
      if (user) {
        syncCardsBatchToSupabase(user.id, createdCards);
      }
      return createdCards.length;
    },
    [cards, user]
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
    flushReviewSession,
    resetReviewStats: storageResetReviewStats,
  };
}
