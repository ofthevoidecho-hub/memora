import React, { useEffect, useState } from 'react';
import { Search, Layers, BookOpen, Play, Plus, BarChart3, Settings, Moon, Sun, X, Sparkles } from 'lucide-react';
import { ActiveTab, Card, Deck } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  decks: Deck[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectDeckForReview: (deckId: string) => void;
  onOpenQuickAddCard: () => void;
  onToggleTheme: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  cards,
  decks,
  setActiveTab,
  onSelectDeckForReview,
  onOpenQuickAddCard,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');

  // Key binding for Escape & Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDecks = query.trim()
    ? decks.filter(
        (d) =>
          d.title.toLowerCase().includes(query.toLowerCase()) ||
          d.folder.toLowerCase().includes(query.toLowerCase()) ||
          d.description.toLowerCase().includes(query.toLowerCase())
      )
    : decks.slice(0, 4);

  const filteredCards = query.trim()
    ? cards
        .filter(
          (c) =>
            c.question.toLowerCase().includes(query.toLowerCase()) ||
            c.answer.toLowerCase().includes(query.toLowerCase()) ||
            c.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une carte, un deck, un tag ou lancer une action... (Échap pour fermer)"
            className="w-full bg-transparent border-none text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-0"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Quick Actions */}
          {!query.trim() && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Actions rapides
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onOpenQuickAddCard();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
                >
                  <Plus className="w-4 h-4 text-indigo-500" />
                  <span>Créer une nouvelle carte</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('review');
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
                >
                  <Play className="w-4 h-4 text-emerald-500" />
                  <span>Lancer la session de révision du jour</span>
                </button>

                <button
                  onClick={() => {
                    onToggleTheme();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Changer le thème clair / sombre</span>
                </button>
              </div>
            </div>
          )}

          {/* Decks Results */}
          {filteredDecks.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Decks ({filteredDecks.length})
              </div>
              <div className="space-y-1">
                {filteredDecks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => {
                      onSelectDeckForReview(deck.id);
                      setActiveTab('review');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      <span className="font-semibold">{deck.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                        {deck.folder}
                      </span>
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 font-semibold text-[11px]">
                      Réviser →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cards Results */}
          {filteredCards.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Cartes ({filteredCards.length})
              </div>
              <div className="space-y-1.5">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      setActiveTab('library');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-neutral-50/50 dark:bg-neutral-800/30 cursor-pointer transition-colors"
                  >
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-1">
                      {card.question}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      {card.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.trim() && filteredDecks.length === 0 && filteredCards.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-xs">
              Aucun résultat pour <span className="font-semibold text-neutral-600 dark:text-neutral-200">"{query}"</span>
            </div>
          )}
        </div>

        {/* Command Footer */}
        <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between px-4">
          <span>MEMORA Search Engine</span>
          <div className="flex items-center gap-2">
            <span>Naviguer avec les flèches</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-[10px]">
              ↵ Choisir
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
