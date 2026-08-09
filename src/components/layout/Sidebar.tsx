import React from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  Layers,
  BookOpen,
  FileSpreadsheet,
  BarChart3,
  Star,
  AlertTriangle,
  Clock,
  Settings,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { ActiveTab, UserSettings } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  dueCardsCount: number;
  difficultCardsCount: number;
  favoriteCardsCount: number;
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onOpenQuickAddCard: () => void;
  onOpenCommandPalette: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  dueCardsCount,
  difficultCardsCount,
  favoriteCardsCount,
  settings,
  onUpdateSettings,
  onOpenQuickAddCard,
  onOpenCommandPalette,
}) => {
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'review', label: 'Réviser', icon: PlayCircle, badge: dueCardsCount > 0 ? dueCardsCount : undefined },
    { id: 'decks', label: 'Mes decks', icon: Layers },
    { id: 'library', label: 'Bibliothèque', icon: BookOpen },
    { id: 'import', label: 'Importer / Exporter', icon: FileSpreadsheet },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 min-h-screen select-none sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-500/20">
            M
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-900 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
              MEMORA
            </span>
            <span className="block text-[10px] text-neutral-400 font-medium tracking-wide uppercase">
              Répétition Espacée
            </span>
          </div>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs flex items-center gap-1 transition-colors"
          title="Rechercher (Ctrl+K)"
        >
          <span className="font-mono text-[11px] font-semibold">⌘K</span>
        </button>
      </div>

      {/* Main Action Button */}
      <div className="p-4">
        <button
          onClick={onOpenQuickAddCard}
          className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
          <span>Nouvelle carte</span>
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="px-3 space-y-1">
        <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Filters Section */}
      <div className="mt-6 px-3 space-y-1">
        <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Accès Rapide
        </div>

        <button
          onClick={() => setActiveTab('library')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
        >
          <div className="flex items-center gap-2.5">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Favoris</span>
          </div>
          {favoriteCardsCount > 0 && (
            <span className="text-[11px] text-neutral-400 font-mono">{favoriteCardsCount}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Cartes difficiles</span>
          </div>
          {difficultCardsCount > 0 && (
            <span className="text-[11px] text-neutral-400 font-mono">{difficultCardsCount}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            <span>Récentes</span>
          </div>
        </button>
      </div>

      <div className="mt-auto p-4 border-t border-neutral-100 dark:border-neutral-800/60 space-y-2">
        {/* Settings button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-neutral-400" />
            <span>Paramètres</span>
          </div>
        </button>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-medium">Thème</span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-white dark:bg-neutral-700 shadow-xs border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
          >
            {settings.theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
