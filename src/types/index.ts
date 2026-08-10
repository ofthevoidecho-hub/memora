export type CardState = 'new' | 'learning' | 'review' | 'relearning';

export type CardRating = 1 | 2 | 3 | 4; // 1: Again (À revoir), 2: Hard (Difficile), 3: Good (Bien), 4: Easy (Facile)

export interface Card {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueDate: string; // ISO format date string (YYYY-MM-DD or full ISO)
  lastReviewedAt: string | null;
  interval: number; // in days
  ease: number; // multiplier, default 2.5
  repetitions: number;
  lapses: number;
  difficulty: number; // 1 to 10
  stability: number; // stability metric
  state: CardState;
  favorite: boolean;
  flagged: boolean;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  folder: string;
  color: string; // CSS color string or Tailwind color name
  icon: string;
  createdAt: string;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  rating: CardRating;
  reviewedAt: string; // ISO date string
  intervalBefore: number;
  intervalAfter: number;
  timeSpentSeconds: number;
}

export interface UserSettings {
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  algorithm: 'SM2' | 'FSRS' | 'LEITNER';
  theme: 'light' | 'dark' | 'system';
  audioFeedback: boolean;
  showTimer: boolean;
  dailyGoal: number; // target cards per day
  notificationsEnabled: boolean;
  notificationTime: string; // "HH:MM" 24h format, e.g. "09:00"
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramNotificationsEnabled?: boolean;
}

export interface UserStats {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalReviewsCount: number;
  totalTimeSpentSeconds: number;
  historyLog: Record<string, number>; // "YYYY-MM-DD": reviewCount
}

export type ActiveTab = 'dashboard' | 'decks' | 'review' | 'library' | 'import' | 'statistics' | 'settings';
