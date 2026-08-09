import React from 'react';
import { Flame, Award, TrendingUp, CheckCircle2, Clock, Calendar, BarChart3, Target, Sparkles } from 'lucide-react';
import { Card, UserStats } from '../../types';
import { Heatmap } from '../ui/Heatmap';

interface StatisticsViewProps {
  cards: Card[];
  stats: UserStats;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ cards, stats }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const reviewsToday = stats.historyLog[todayStr] || 0;

  // Calculate past week total
  let reviewsThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    reviewsThisWeek += stats.historyLog[dateStr] || 0;
  }

  // Mastery levels
  const totalCards = cards.length;
  const newCards = cards.filter((c) => c.state === 'new').length;
  const learningCards = cards.filter((c) => c.state === 'learning' || c.state === 'relearning').length;
  const masteredCards = cards.filter((c) => c.state === 'review' && c.interval >= 14).length;
  const strugglingCards = cards.filter((c) => c.lapses > 1 || c.difficulty >= 7).length;

  const retentionPercent =
    totalCards > 0 ? Math.round(((totalCards - strugglingCards) / totalCards) * 100) : 100;

  // Gamification Badges
  const badges = [
    {
      id: 'b1',
      title: '7 Jours Consécutifs',
      desc: 'Maintenez une régularité pendant une semaine',
      unlocked: stats.streak >= 7,
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'b2',
      title: '100 Cartes Maîtrisées',
      desc: 'Atteignez un intervalle de révision > 14 jours sur 100 cartes',
      unlocked: masteredCards >= 100 || stats.totalReviewsCount >= 100,
      icon: Award,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'b3',
      title: '90% de Rétention',
      desc: 'Maintenez un taux de rétention élevé',
      unlocked: retentionPercent >= 90,
      icon: Target,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
        <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Statistiques & Analyses de Rétention
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Suivez votre progression d'apprentissage et la performance de votre mémoire à long terme.
        </p>
      </div>

      {/* Top 4 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Aujourd'hui</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{reviewsToday}</div>
          <span className="text-xs text-neutral-500 font-medium">cartes révisées</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Cette Semaine</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{reviewsThisWeek}</div>
          <span className="text-xs text-neutral-500 font-medium">révisions réussies</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Taux de Rétention</span>
          <div className="text-2xl font-black text-amber-500">{retentionPercent}%</div>
          <span className="text-xs text-neutral-500 font-medium">mémoire préservée</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Historique</span>
          <div className="text-2xl font-black text-neutral-900 dark:text-white">{stats.totalReviewsCount}</div>
          <span className="text-xs text-neutral-500 font-medium">sessions réalisées</span>
        </div>
      </div>

      {/* Heatmap Full Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-neutral-900 dark:text-white text-base">
            Calendrier d'activité (Heatmap)
          </h3>
        </div>

        <Heatmap historyLog={stats.historyLog} weeksToShow={28} />
      </div>

      {/* Card Mastery Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">
              Niveaux de Maîtrise des Cartes
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-600">Cartes Maîtrisées (Intervalle {'>'} 14j)</span>
                <span>{masteredCards} ({totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalCards > 0 ? (masteredCards / totalCards) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-600">En Cours d'Apprentissage</span>
                <span>{learningCards} ({totalCards > 0 ? Math.round((learningCards / totalCards) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${totalCards > 0 ? (learningCards / totalCards) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-sky-600">Nouvelles Cartes</span>
                <span>{newCards} ({totalCards > 0 ? Math.round((newCards / totalCards) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${totalCards > 0 ? (newCards / totalCards) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-600">Cartes Difficiles / À Revoir</span>
                <span>{strugglingCards} ({totalCards > 0 ? Math.round((strugglingCards / totalCards) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${totalCards > 0 ? (strugglingCards / totalCards) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gamification Badges */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">
              Objectifs & Badges
            </h3>
          </div>

          <div className="space-y-3">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                    badge.unlocked
                      ? 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700'
                      : 'opacity-50 bg-neutral-50/50 dark:bg-neutral-800/20 border-neutral-100 dark:border-neutral-800'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${badge.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white">{badge.title}</h4>
                      {badge.unlocked ? (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600">
                          Débloqué
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">Verrouillé</span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
