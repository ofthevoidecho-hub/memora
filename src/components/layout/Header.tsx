import React from 'react';
import { Search, Flame, Plus, Play, Sparkles } from 'lucide-react';
import { ActiveTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  streak: number;
  dueCardsCount: number;
  onOpenCommandPalette: () => void;
  onOpenQuickAddCard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  streak,
  dueCardsCount,
  onOpenCommandPalette,
  onOpenQuickAddCard,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tableau de bord';
      case 'review':
        return 'Session de révision';
      case 'decks':
        return 'Mes decks & dossiers';
      case 'library':
        return 'Bibliothèque globale';
      case 'import':
        return 'Importer / Exporter';
      case 'statistics':
        return 'Statistiques & Progression';
      case 'settings':
        return 'Paramètres d\'application';
      default:
        return 'MEMORA';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {getTabTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search Command Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 text-xs transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-medium">Rechercher...</span>
          <kbd className="hidden sm:inline font-mono text-[10px] bg-white dark:bg-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-600 text-neutral-400">
            ⌘K
          </kbd>
        </button>

        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span>{streak} jours</span>
        </div>

        {/* Quick Review Launcher */}
        {dueCardsCount > 0 && activeTab !== 'review' && (
          <button
            onClick={() => setActiveTab('review')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden xs:inline">Réviser ({dueCardsCount})</span>
          </button>
        )}

        {/* Quick Add Card */}
        <button
          onClick={onOpenQuickAddCard}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 font-medium text-xs flex items-center gap-1.5 transition-all"
          title="Ajouter une carte"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>
    </header>
  );
};
