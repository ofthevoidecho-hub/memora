import React, { useState } from 'react';
import { Search, Star, Flag, Trash2, Edit2, Filter, Layers, Plus, BookOpen } from 'lucide-react';
import { Card, Deck } from '../../types';
import { isCardDue } from '../../lib/spacedRepetition';

interface LibraryViewProps {
  cards: Card[];
  decks: Deck[];
  onOpenQuickAddCard: () => void;
  onOpenEditCard: (card: Card) => void;
  onDeleteCard: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleFlag: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  cards,
  decks,
  onOpenQuickAddCard,
  onOpenEditCard,
  onDeleteCard,
  onToggleFavorite,
  onToggleFlag,
}) => {
  const getInitialStatus = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('filter') || 'all';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(getInitialStatus);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Deck map
  const deckMap = new Map<string, Deck>(decks.map((d) => [d.id, d]));

  // Unique tags across all cards
  const allTags = Array.from(new Set(cards.flatMap((c) => c.tags)));

  // Filter logic
  const filteredCards = cards.filter((card) => {
    // Search query
    const matchesQuery =
      !searchQuery.trim() ||
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Deck filter
    const matchesDeck = selectedDeckId === 'all' || card.deckId === selectedDeckId;

    // Tag filter
    const matchesTag = selectedTag === 'all' || card.tags.includes(selectedTag);

    // Status filter
    let matchesStatus = true;
    if (selectedStatus === 'due') matchesStatus = isCardDue(card);
    if (selectedStatus === 'difficult') matchesStatus = card.lapses > 1 || card.difficulty >= 7;
    if (selectedStatus === 'new') matchesStatus = card.state === 'new';
    if (selectedStatus === 'learned') matchesStatus = card.state === 'review' && card.interval >= 7;
    if (selectedStatus === 'favorites') matchesStatus = card.favorite;

    return matchesQuery && matchesDeck && matchesTag && matchesStatus;
  });

  const getStatusBadge = (card: Card) => {
    if (card.favorite)
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">Favori</span>;
    if (isCardDue(card))
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600">À réviser</span>;
    if (card.state === 'new')
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600">Nouvelle</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">Apprise ({card.interval}j)</span>;
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Bibliothèque globale des cartes
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Recherchez, filtrez et gérez vos {cards.length} cartes de révision
          </p>
        </div>

        <button
          onClick={onOpenQuickAddCard}
          className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une carte</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par mot-clé, question, réponse ou tag..."
            className="w-full bg-transparent border-none text-neutral-900 dark:text-white placeholder-neutral-400 text-xs focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns & Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'due', label: 'À réviser' },
              { id: 'difficult', label: 'Difficiles' },
              { id: 'new', label: 'Nouvelles' },
              { id: 'learned', label: 'Apprises' },
              { id: 'favorites', label: 'Favorites' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Deck Select */}
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium focus:outline-none"
            >
              <option value="all">Tous les Decks</option>
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>

            {/* Tag Select */}
            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium focus:outline-none"
              >
                <option value="all">Tous les Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Cards List Table/Cards */}
      <div className="space-y-3">
        <div className="text-xs text-neutral-500 font-semibold px-2">
          {filteredCards.length} carte{filteredCards.length > 1 ? 's' : ''} trouvée{filteredCards.length > 1 ? 's' : ''}
        </div>

        {filteredCards.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-neutral-300" />
            <div className="text-sm font-semibold">Aucune carte trouvée pour cette recherche</div>
            <p className="text-xs">Essayez de modifier vos filtres ou créez de nouvelles cartes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card) => {
              const deck = deckMap.get(card.deckId);
              return (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs flex flex-col justify-between space-y-3 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                          {deck?.title || 'Général'}
                        </span>
                        {getStatusBadge(card)}
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onToggleFavorite(card.id)}
                          className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                            card.favorite ? 'text-amber-500' : 'text-neutral-400'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${card.favorite ? 'fill-amber-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleFlag(card.id)}
                          className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                            card.flagged ? 'text-rose-500' : 'text-neutral-400'
                          }`}
                        >
                          <Flag className={`w-3.5 h-3.5 ${card.flagged ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => onOpenEditCard(card)}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Supprimer cette carte ?')) onDeleteCard(card.id);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-2">
                      {card.question}
                    </div>

                    <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      {card.answer}
                    </div>
                  </div>

                  {card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-500"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
