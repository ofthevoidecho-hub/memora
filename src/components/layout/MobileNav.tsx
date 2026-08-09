import React from 'react';
import { LayoutDashboard, PlayCircle, Layers, BookOpen, BarChart3 } from 'lucide-react';
import { ActiveTab } from '../../types';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  dueCardsCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, dueCardsCount }) => {
  const items = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'review', label: 'Réviser', icon: PlayCircle, badge: dueCardsCount > 0 ? dueCardsCount : undefined },
    { id: 'decks', label: 'Decks', icon: Layers },
    { id: 'library', label: 'Cartes', icon: BookOpen },
    { id: 'statistics', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as ActiveTab)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
