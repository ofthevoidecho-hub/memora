import React, { useState } from 'react';
import { Plus, Play, Folder, Edit3, Trash2, BookOpen, Layers, RotateCcw } from 'lucide-react';
import { ActiveTab, Card, Deck } from '../../types';
import { getDeckStats } from '../../lib/spacedRepetition';
import { DeckModal } from './DeckModal';

interface DecksViewProps {
  decks: Deck[];
  cards: Card[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectDeckForReview: (deckId: string) => void;
  onAddDeck: (deckData: { title: string; description: string; folder: string; color: string }) => void;
  onUpdateDeck: (id: string, updates: Partial<Deck>) => void;
  onDeleteDeck: (id: string) => void;
  onResetDeckProgress: (deckId: string) => void;
}

export const DecksView: React.FC<DecksViewProps> = ({
  decks,
  cards,
  setActiveTab,
  onSelectDeckForReview,
  onAddDeck,
  onUpdateDeck,
  onDeleteDeck,
  onResetDeckProgress,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState<Deck | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  // Unique folders
  const folders = Array.from(new Set(decks.map((d) => d.folder || 'Général')));

  const filteredDecks =
    selectedFolder === 'all' ? decks : decks.filter((d) => (d.folder || 'Général') === selectedFolder);

  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const [deckToReset, setDeckToReset] = useState<Deck | null>(null);

  const handleOpenCreate = () => {
    setDeckToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (deck: Deck) => {
    setDeckToEdit(deck);
    setIsModalOpen(true);
  };

  const handleSaveDeck = (data: { title: string; description: string; folder: string; color: string; telegramReminderEnabled?: boolean }) => {
    if (deckToEdit) {
      onUpdateDeck(deckToEdit.id, data);
    } else {
      onAddDeck(data);
    }
  };

  const confirmDelete = () => {
    if (deckToDelete) {
      onDeleteDeck(deckToDelete.id);
      setDeckToDelete(null);
    }
  };

  const confirmReset = () => {
    if (deckToReset) {
      onResetDeckProgress(deckToReset.id);
      setDeckToReset(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Mes Decks & Dossiers
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Gérez vos collections de flashcards et suivez la progression par sujet
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau deck</span>
        </button>
      </div>

      {/* Folder Tabs Filter */}
      {folders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedFolder === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
            }`}
          >
            Tous les dossiers ({decks.length})
          </button>

          {folders.map((folderName) => {
            const count = decks.filter((d) => (d.folder || 'Général') === folderName).length;
            return (
              <button
                key={folderName}
                onClick={() => setSelectedFolder(folderName)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedFolder === folderName
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-indigo-500" />
                <span>{folderName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200/50 dark:bg-neutral-800 text-neutral-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDecks.map((deck) => {
          const stats = getDeckStats(deck.id, cards);
          const progressPercent = stats.total > 0 ? Math.round(((stats.total - stats.due) / stats.total) * 100) : 100;

          return (
            <div
              key={deck.id}
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800 uppercase tracking-wider">
                      {deck.folder || 'Général'}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                      {deck.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(deck)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Modifier le deck"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeckToReset(deck)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                      title="Réinitialiser la progression"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeckToDelete(deck)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Supprimer le deck"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {deck.description || 'Aucune description fournie.'}
                </p>
              </div>

              {/* Progress & Card Stats */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-center">
                    <span className="block text-[10px] text-neutral-400 uppercase font-semibold">Total Cartes</span>
                    <span className="text-base font-bold text-neutral-900 dark:text-white">{stats.total}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-center border border-amber-500/20">
                    <span className="block text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold">À réviser</span>
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400">{stats.due}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    <span>Progression du deck</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectDeckForReview(deck.id);
                    setActiveTab('review');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Réviser ce deck ({stats.due})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <DeckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deckToEdit={deckToEdit}
        onSave={handleSaveDeck}
      />

      {/* Confirmation Modal for Deck Deletion */}
      {deckToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Supprimer le deck ?
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer <strong className="text-neutral-900 dark:text-white">"{deckToDelete.title}"</strong> ? 
              Toutes les cartes associées à ce deck seront également supprimées.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeckToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deck Reset */}
      {deckToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Réinitialiser la progression ?
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Êtes-vous sûr de vouloir réinitialiser la progression du deck <strong className="text-neutral-900 dark:text-white">"{deckToReset.title}"</strong> ?
              Toutes les cartes reviendront à l'état initial (nouvelles).
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeckToReset(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
