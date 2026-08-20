import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Star,
  Flag,
  Edit2,
  X,
  CheckCircle2,
  RotateCcw,
  Clock,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Shuffle,
} from 'lucide-react';
import { ActiveTab, Card, CardRating, Deck, UserSettings } from '../../types';
import { getFormattedNextInterval, isCardDue } from '../../lib/spacedRepetition';

interface ReviewSessionViewProps {
  cards: Card[];
  decks: Deck[];
  targetDeckId?: string | null;
  settings: UserSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onSubmitRating: (cardId: string, rating: CardRating, timeSpentSeconds: number) => void;
  onToggleFavorite: (cardId: string) => void;
  onToggleFlag: (cardId: string) => void;
  onOpenEditCard: (card: Card) => void;
}

export const ReviewSessionView: React.FC<ReviewSessionViewProps> = ({
  cards,
  decks,
  targetDeckId,
  settings,
  setActiveTab,
  onSubmitRating,
  onToggleFavorite,
  onToggleFlag,
  onOpenEditCard,
}) => {
  // Session States: 'briefing' | 'active' | 'completed'
  const [sessionState, setSessionState] = useState<'briefing' | 'active' | 'completed'>('briefing');
  const [sessionQueue, setSessionQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [originalQueue, setOriginalQueue] = useState<Card[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });

  const cardStartTimeRef = useRef<number>(Date.now());

  const selectedDeck = targetDeckId ? decks.find((d) => d.id === targetDeckId) : null;

  // Prepare session queue
  const prepareQueue = useCallback(() => {
    if (sessionState !== 'briefing') return;

    let pool = cards;
    let queue: Card[] = [];
    
    if (targetDeckId === 'difficult') {
      pool = cards.filter((c) => c.lapses > 1 || c.difficulty >= 7);
      queue = pool.slice(0, settings.maxReviewsPerDay || 100);
    } else {
      if (targetDeckId) {
        pool = cards.filter((c) => c.deckId === targetDeckId);
      }
      const dueList = pool.filter((c) => isCardDue(c));
      queue = dueList.slice(0, settings.maxReviewsPerDay || 100);
    }
    
    setOriginalQueue(queue);

    if (isShuffleEnabled) {
      setSessionQueue(() => {
        const shuffled = [...queue];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      });
    } else {
      setSessionQueue(queue);
    }

    setCurrentIndex(0);
    setIsAnswerRevealed(false);
    setRatingCounts({ 1: 0, 2: 0, 3: 0, 4: 0 });
  }, [cards, targetDeckId, settings.maxReviewsPerDay, isShuffleEnabled, sessionState]);

  useEffect(() => {
    prepareQueue();
  }, [prepareQueue]);

  // Timer interval during active session
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState === 'active' && sessionStartTime) {
      timer = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionState, sessionStartTime]);

  const startSession = () => {
    if (sessionQueue.length === 0) return;
    setSessionState('active');
    setSessionStartTime(Date.now());
    cardStartTimeRef.current = Date.now();
    setIsAnswerRevealed(false);
  };

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  const toggleShuffleMode = () => {
    setIsShuffleEnabled((prev) => {
      const nextState = !prev;
      setSessionQueue((currentQueue) => {
        // Remaining unreviewed cards from currentIndex onwards
        const reviewed = currentQueue.slice(0, currentIndex);
        const unreviewed = currentQueue.slice(currentIndex);

        if (nextState) {
          // Shuffle unreviewed cards
          const shuffledUnreviewed = [...unreviewed];
          for (let i = shuffledUnreviewed.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledUnreviewed[i], shuffledUnreviewed[j]] = [shuffledUnreviewed[j], shuffledUnreviewed[i]];
          }
          return [...reviewed, ...shuffledUnreviewed];
        } else {
          // Restore unreviewed cards to original order
          const reviewedIds = new Set(reviewed.map((c) => c.id));
          const originalUnreviewed = originalQueue.filter((c) => !reviewedIds.has(c.id));
          return [...reviewed, ...originalUnreviewed];
        }
      });
      return nextState;
    });
  };

  const handleRatingSelect = (rating: CardRating) => {
    const currentCard = sessionQueue[currentIndex];
    if (!currentCard) return;

    const timeSpent = Math.max(1, Math.round((Date.now() - cardStartTimeRef.current) / 1000));

    // Submit rating logic
    onSubmitRating(currentCard.id, rating, timeSpent);

    // Update session metrics
    setRatingCounts((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));

    // Move to next card or complete
    if (currentIndex + 1 < sessionQueue.length) {
      if (isShuffleEnabled) {
        // Pick a random remaining card from (currentIndex + 1) to (sessionQueue.length - 1)
        const remainingCount = sessionQueue.length - (currentIndex + 1);
        const randomOffset = Math.floor(Math.random() * remainingCount);
        const targetIndex = currentIndex + 1 + randomOffset;

        // Swap picked random card into position (currentIndex + 1)
        setSessionQueue((prevQueue) => {
          const newQ = [...prevQueue];
          const temp = newQ[currentIndex + 1];
          newQ[currentIndex + 1] = newQ[targetIndex];
          newQ[targetIndex] = temp;
          return newQ;
        });
      }

      setCurrentIndex((prev) => prev + 1);
      setIsAnswerRevealed(false);
      cardStartTimeRef.current = Date.now();
    } else {
      // Complete Session
      setSessionState('completed');
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore confetti errors
      }
    }
  };

  // Keyboard Shortcuts Listener (Space = reveal, 1..4 = ratings)
  useEffect(() => {
    if (sessionState !== 'active') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isAnswerRevealed) {
          setIsAnswerRevealed(true);
        }
      } else if (isAnswerRevealed) {
        if (e.key === '1') handleRatingSelect(1);
        if (e.key === '2') handleRatingSelect(2);
        if (e.key === '3') handleRatingSelect(3);
        if (e.key === '4') handleRatingSelect(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionState, isAnswerRevealed, currentIndex, sessionQueue]);

  const currentCard = sessionQueue[currentIndex];
  const deckOfCurrentCard = currentCard ? decks.find((d) => d.id === currentCard.deckId) : null;

  const estimatedTimeMinutes = Math.max(1, Math.ceil(sessionQueue.length * 0.4));
  const newCardsCount = sessionQueue.filter((c) => c.state === 'new').length;

  // Format Elapsed Time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs < 10 ? '0' : ''}${remainingSecs}s`;
  };

  // Fisher-Yates shuffle queue
  const handleShuffleQueue = () => {
    if (sessionQueue.length <= 1) return;
    const shuffled = [...sessionQueue];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setSessionQueue(shuffled);
    setCurrentIndex(0);
    setIsAnswerRevealed(false);
    cardStartTimeRef.current = Date.now();
  };

  // --- BRIEFING SCREEN ---
  if (sessionState === 'briefing') {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-6 pb-12 animate-in fade-in duration-200">
        <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Play className="w-8 h-8 fill-current ml-1" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {selectedDeck ? selectedDeck.title : 'Toutes les révisions'}
            </span>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Session de révision
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              Optimisez votre rétention grâce à l'algorithme de répétition espacée.
            </p>
          </div>

          {sessionQueue.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 py-4 border-y border-neutral-100 dark:border-neutral-800">
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="block text-[10px] text-neutral-400 uppercase font-semibold">Cartes Dues</span>
                  <span className="text-xl font-bold text-amber-500">{sessionQueue.length}</span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="block text-[10px] text-neutral-400 uppercase font-semibold">Nouvelles</span>
                  <span className="text-xl font-bold text-indigo-500">{newCardsCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
                  <span className="block text-[10px] text-neutral-400 uppercase font-semibold">Durée estimée</span>
                  <span className="text-xl font-bold text-emerald-500">~{estimatedTimeMinutes} min</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={toggleShuffleMode}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isShuffleEnabled
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                  title={isShuffleEnabled ? "Ordre aléatoire (activé)" : "Ordre séquentiel (désactivé)"}
                >
                  <Shuffle className={`w-3.5 h-3.5 ${isShuffleEnabled ? 'text-white' : 'text-indigo-500'}`} />
                  <span>Mode aléatoire : {isShuffleEnabled ? 'Activé (ON)' : 'Désactivé (OFF)'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              🎉 Aucune carte due pour ce deck aujourd'hui ! Revenez demain.
            </div>
          )}

          <div className="pt-2 flex flex-col gap-3">
            {sessionQueue.length > 0 && (
              <button
                onClick={startSession}
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Commencer la session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full py-3 px-4 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-xs font-semibold"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- COMPLETED SCREEN ---
  if (sessionState === 'completed') {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-6 pb-12 animate-in zoom-in-95 duration-200">
        <div className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              Session terminée 🎉
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Bravo ! Vos données de révision ont été enregistrées avec succès.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-neutral-100 dark:border-neutral-800 text-xs">
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
              <span className="block text-[10px] text-neutral-400 font-semibold uppercase">Révisées</span>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">{sessionQueue.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Faciles</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{ratingCounts[4]}</span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Bien</span>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{ratingCounts[3]}</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase">À revoir</span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{ratingCounts[1]}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Clock className="w-4 h-4" />
              <span>Temps écoulé : <strong className="font-bold">{formatTime(elapsedSeconds)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 font-bold">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>+1 jour de série</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE REVIEW SCREEN ---
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Session Progress Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            {deckOfCurrentCard?.title || 'Deck'}
          </span>
          <span className="text-xs font-semibold text-neutral-500">
            {currentIndex + 1} / {sessionQueue.length}
          </span>
        </div>

        {/* Progress Bar Line */}
        <div className="flex-1 max-w-xs mx-4 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / sessionQueue.length) * 100}%` }}
          />
        </div>

        {/* Card Action Icons */}
        <div className="flex items-center gap-1">
          {currentCard && (
            <>
              <button
                type="button"
                onClick={toggleShuffleMode}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isShuffleEnabled
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400 ring-2 ring-indigo-500'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title={isShuffleEnabled ? "Mode aléatoire (Activé) - Cliquez pour remettre dans l'ordre" : "Mode aléatoire (Désactivé) - Cliquez pour activer l'ordre aléatoire"}
              >
                <Shuffle className={`w-4 h-4 ${isShuffleEnabled ? 'stroke-[2.5]' : ''}`} />
              </button>

              <button
                onClick={() => onToggleFavorite(currentCard.id)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  currentCard.favorite
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
                title="Ajouter aux favoris"
              >
                <Star className={`w-4 h-4 ${currentCard.favorite ? 'fill-amber-500' : ''}`} />
              </button>

              <button
                onClick={() => onToggleFlag(currentCard.id)}
                className={`p-2 rounded-xl transition-colors ${
                  currentCard.flagged
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                }`}
                title="Signaler la carte"
              >
                <Flag className={`w-4 h-4 ${currentCard.flagged ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={() => onOpenEditCard(currentCard)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                title="Modifier la carte"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (confirm('Voulez-vous quitter la session en cours ?')) {
                setSessionState('briefing');
              }
            }}
            className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-2"
            title="Quitter la session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Flashcard Container */}
      {currentCard && (
        <div
          onClick={!isAnswerRevealed ? handleRevealAnswer : undefined}
          className={`min-h-[360px] p-8 sm:p-12 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl flex flex-col justify-between transition-all select-none ${
            !isAnswerRevealed ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700' : ''
          }`}
        >
          {/* Question Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              <span>QUESTION</span>
              {currentCard.tags.length > 0 && (
                <div className="flex gap-1.5">
                  {currentCard.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white leading-relaxed">
              {currentCard.question}
            </div>
          </div>

          {/* Answer Section */}
          {isAnswerRevealed ? (
            <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800/80 space-y-4 animate-in fade-in duration-200">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                RÉPONSE
              </div>

              <div className="text-base sm:text-lg font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed bg-neutral-50 dark:bg-neutral-800/40 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                {currentCard.answer}
              </div>
            </div>
          ) : (
            <div className="pt-8 text-center">
              <button
                onClick={handleRevealAnswer}
                className="py-3 px-8 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Afficher la réponse (Espace)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Spaced Repetition Rating Buttons */}
      {isAnswerRevealed && currentCard && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4 animate-in slide-in-from-bottom-2 duration-150">
          <div className="text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Comment était cette carte ?
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Rating 1: Again / À revoir */}
            <button
              onClick={() => handleRatingSelect(1)}
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold transition-all text-center space-y-1 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-xs">À revoir</div>
              <div className="text-[10px] font-mono opacity-80">{getFormattedNextInterval(currentCard, 1)}</div>
              <div className="text-[9px] font-mono uppercase opacity-60">Touche 1</div>
            </button>

            {/* Rating 2: Hard / Difficile */}
            <button
              onClick={() => handleRatingSelect(2)}
              className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 font-bold transition-all text-center space-y-1 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-xs">Difficile</div>
              <div className="text-[10px] font-mono opacity-80">{getFormattedNextInterval(currentCard, 2)}</div>
              <div className="text-[9px] font-mono uppercase opacity-60">Touche 2</div>
            </button>

            {/* Rating 3: Good / Bien */}
            <button
              onClick={() => handleRatingSelect(3)}
              className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold transition-all text-center space-y-1 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-xs">Bien</div>
              <div className="text-[10px] font-mono opacity-80">{getFormattedNextInterval(currentCard, 3)}</div>
              <div className="text-[9px] font-mono uppercase opacity-60">Touche 3</div>
            </button>

            {/* Rating 4: Easy / Facile */}
            <button
              onClick={() => handleRatingSelect(4)}
              className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold transition-all text-center space-y-1 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-xs">Facile</div>
              <div className="text-[10px] font-mono opacity-80">{getFormattedNextInterval(currentCard, 4)}</div>
              <div className="text-[9px] font-mono uppercase opacity-60">Touche 4</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
