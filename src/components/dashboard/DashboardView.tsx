import React from 'react';
import {
  Play,
  Flame,
  CheckCircle2,
  BookOpen,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Folder,
  Layers,
  Award,
} from 'lucide-react';
import { ActiveTab, Card, Deck, UserSettings, UserStats } from '../../types';
import { getDeckStats } from '../../lib/spacedRepetition';
import { Heatmap } from '../ui/Heatmap';

interface DashboardViewProps {
  cards: Card[];
  decks: Deck[];
  dueCards: Card[];
  stats: UserStats;
  settings: UserSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectDeckForReview: (deckId: string) => void;
  onOpenQuickAddCard: () => void;
  onOpenQuickAddDeck: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cards,
  decks,
  dueCards,
  stats,
  settings,
  setActiveTab,
  onSelectDeckForReview,
  onOpenQuickAddCard,
  onOpenQuickAddDeck,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const reviewsToday = stats.historyLog[todayStr] || 0;
  const dailyTarget = settings.dailyGoal || 25;
  const dailyProgressPercent = Math.min(100, Math.round((reviewsToday / dailyTarget) * 100));

  const totalCardsCount = cards.length;
  const masteredCardsCount = cards.filter((c) => c.state === 'review' && c.interval >= 14).length;
  const difficultCardsCount = cards.filter((c) => c.lapses > 1 || c.difficulty >= 7).length;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Welcome & Review Launcher Card */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 dark:bg-neutral-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Aujourd'hui
              </span>
              <span className="text-xs text-neutral-400">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bonjour 👋
            </h2>

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              {dueCards.length > 0 ? (
                <>
                  Vous avez <span className="font-bold text-amber-400">{dueCards.length} carte{dueCards.length > 1 ? 's' : ''}</span> en attente de révision aujourd'hui.
                </>
              ) : (
                'Toutes vos révisions du jour sont terminées ! Félicitations ! 🎉'
              )}
            </p>

            {/* Daily Target Progress Bar */}
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
                <span>Objectif quotidien ({reviewsToday} / {dailyTarget} cartes)</span>
                <span className="font-semibold text-emerald-400">{dailyProgressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-800 dark:bg-neutral-700 rounded-full overflow-hidden p-0.5 border border-neutral-700/50">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            {dueCards.length > 0 ? (
              <button
                onClick={() => setActiveTab('review')}
                className="py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>COMMENCER LA RÉVISION</span>
              </button>
            ) : (
              <button
                onClick={onOpenQuickAddCard}
                className="py-3.5 px-6 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm border border-neutral-700 flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Créer de nouvelles cartes</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('decks')}
              className="py-2.5 px-4 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 font-medium text-xs border border-neutral-700/60 flex items-center justify-center gap-2 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Explorer les decks</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {stats.streak} <span className="text-sm font-semibold text-neutral-400">jours</span>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
              Série actuelle 🔥
            </div>
          </div>
        </div>

        {/* Due Cards */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {dueCards.length}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
              Cartes à réviser
            </div>
          </div>
        </div>

        {/* Mastered Cards */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {masteredCardsCount}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
              Cartes maîtrisées
            </div>
          </div>
        </div>

        {/* Difficult Cards */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {difficultCardsCount}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
              Cartes difficiles
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Activity Log */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Calendrier d'activité
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('statistics')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Voir toutes les stats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <Heatmap historyLog={stats.historyLog} weeksToShow={24} />
      </div>

      {/* Decks Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Vos Decks de révision
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Sélectionnez un deck pour lancer des cartes spécifiques
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQuickAddDeck}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau deck</span>
            </button>

            <button
              onClick={() => setActiveTab('decks')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Voir tout ({decks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const dStats = getDeckStats(deck.id, cards);
            const progressPercent = dStats.total > 0 ? Math.round(((dStats.total - dStats.due) / dStats.total) * 100) : 100;

            return (
              <div
                key={deck.id}
                className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400">
                        <Folder className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {deck.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                          {deck.folder}
                        </span>
                      </div>
                    </div>

                    {dStats.due > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {dStats.due} due{dStats.due > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        À jour
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{dStats.total} cartes au total</span>
                    <span className="font-semibold">{progressPercent}% appris</span>
                  </div>

                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      onSelectDeckForReview(deck.id);
                      setActiveTab('review');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-neutral-800 dark:text-neutral-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Réviser ce deck</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
