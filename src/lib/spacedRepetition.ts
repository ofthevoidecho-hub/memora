import { Card, CardRating, CardState } from '../types';

/**
 * Calculates the next review parameters for a card based on SM-2 algorithm principles.
 */
export function calculateNextReview(card: Card, rating: CardRating, nowISO: string = new Date().toISOString()): Card {
  const now = new Date(nowISO);

  let { interval, ease, repetitions, lapses, difficulty, stability, state } = card;

  // Update difficulty rating (scale 1 to 10)
  if (rating === 1) difficulty = Math.min(10, difficulty + 1.5);
  else if (rating === 2) difficulty = Math.min(10, difficulty + 0.5);
  else if (rating === 3) difficulty = Math.max(1, difficulty - 0.2);
  else if (rating === 4) difficulty = Math.max(1, difficulty - 0.8);

  // Update Ease Factor (SM-2 standard)
  // EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)) where grade is 2..5 (we map rating 1..4 to 2..5)
  const grade = rating + 1; // 1->2, 2->3, 3->4, 4->5
  const newEase = Math.max(1.3, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

  let newInterval = interval;
  let newState: CardState = state;

  if (rating === 1) {
    // Again / À revoir
    lapses += 1;
    repetitions = 0;
    newInterval = 0; // Due same day / in minutes
    newState = 'relearning';
    stability = Math.max(0.5, stability * 0.5);
  } else {
    repetitions += 1;

    if (state === 'new' || state === 'learning' || state === 'relearning') {
      if (rating === 2) {
        newInterval = 1;
        newState = 'learning';
      } else if (rating === 3) {
        newInterval = 1;
        newState = 'review';
      } else {
        // Easy
        newInterval = 3;
        newState = 'review';
      }
    } else {
      // Review state
      if (repetitions === 1) {
        newInterval = 1;
      } else if (repetitions === 2) {
        newInterval = 6;
      } else {
        if (rating === 2) {
          // Hard
          newInterval = Math.max(1, Math.round(interval * 1.2));
        } else if (rating === 3) {
          // Good
          newInterval = Math.max(1, Math.round(interval * newEase));
        } else {
          // Easy
          newInterval = Math.max(1, Math.round(interval * newEase * 1.3));
        }
      }
      newState = 'review';
    }

    stability = Math.min(100, stability + newInterval * 0.5);
  }

  // Calculate Next Due Date
  const nextDueDate = new Date(now);
  if (newInterval === 0) {
    // Due in 10 minutes (represented as same day, ISO timestamp)
    nextDueDate.setMinutes(nextDueDate.getMinutes() + 10);
  } else {
    nextDueDate.setDate(nextDueDate.getDate() + newInterval);
  }

  return {
    ...card,
    ease: Number(newEase.toFixed(2)),
    interval: newInterval,
    repetitions,
    lapses,
    difficulty: Number(difficulty.toFixed(1)),
    stability: Number(stability.toFixed(1)),
    state: newState,
    lastReviewedAt: nowISO,
    dueDate: nextDueDate.toISOString(),
    updatedAt: nowISO,
  };
}

/**
 * Returns human-formatted preview interval string for review rating buttons (e.g., "<10 min", "1 j", "3 j", "6 j")
 */
export function getFormattedNextInterval(card: Card, rating: CardRating): string {
  if (rating === 1) return '< 10 min';

  const previewCard = calculateNextReview(card, rating);
  const days = previewCard.interval;

  if (days <= 0) return '< 10 min';
  if (days === 1) return '1 j';
  if (days < 30) return `${days} j`;
  if (days < 365) return `${Math.round(days / 30)} mois`;
  return `${(days / 365).toFixed(1)} ans`;
}

/**
 * Helper to check if a card is due for review today
 */
export function isCardDue(card: Card, nowISO: string = new Date().toISOString()): boolean {
  // Spaced repetition disabled as requested - all cards are always due
  return true;
}

/**
 * Helper to get deck statistics
 */
export function getDeckStats(deckId: string, cards: Card[]) {
  const deckCards = cards.filter((c) => c.deckId === deckId);
  const total = deckCards.length;
  const due = deckCards.filter((c) => isCardDue(c)).length;
  const newCount = deckCards.filter((c) => c.state === 'new').length;
  const learning = deckCards.filter((c) => c.state === 'learning' || c.state === 'relearning').length;
  const mastered = deckCards.filter((c) => c.state === 'review' && c.interval >= 21).length;
  const retentionRate = total > 0 ? Math.round(((total - deckCards.filter((c) => c.lapses > 2).length) / total) * 100) : 100;

  return {
    total,
    due,
    newCount,
    learning,
    mastered,
    retentionRate,
  };
}
