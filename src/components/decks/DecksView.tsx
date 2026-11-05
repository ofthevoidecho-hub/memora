import React, { useState } from 'react';
import { Plus, Play, Folder, Edit3, Trash2, BookOpen, Layers, RotateCcw, Flame, Shield, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { ActiveTab, Card, Deck } from '../../types';
import { getDeckStats, isCardDifficult } from '../../lib/spacedRepetition';
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

function getArmeEmoji(title = '') {
  const t = title.toLowerCase();
  if (t.includes('blindée') || t.includes('blindee')) return '🛡️';
  if (t.includes('air') || t.includes('aérienne') || t.includes('aerienne')) return '✈️';
  if (t.includes('gendarmerie')) return '👮';
  if (t.includes('génie') || t.includes('genie')) return '🛠️';
  if (t.includes('artillerie')) return '🎯';
  if (t.includes('transport') || t.includes('logistique') || t.includes('trans')) return '🚚';
  if (t.includes('infanterie') || t.includes('arme')) return '⚔️';
  return '📚';
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
  const [viewMode, setViewMode] = useState<'all' | 'difficult'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState<Deck | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [expandedDifficultDeckId, setExpandedDifficultDeckId] = useState<string | null>(null);

  // Unique folders
  const folders = Array.from(new Set(decks.map((d) => d.folder || 'Général')));

  const filteredDecks =
    selectedFolder === 'all' ? decks : decks.filter((d) => (d.folder || 'Général') === selectedFolder);

  const totalDifficultCount = cards.filter(isCardDifficult).length;

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
            Mes Decks & Questions Difficiles
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Accédez à vos cours complets ou à vos decks par arme dédiés uniquement aux questions difficiles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau deck</span>
          </button>
        </div>
      </div>

      {/* Primary Switcher: Tous les Decks vs Decks Difficiles par Arme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Tous les Decks ({decks.length})</span>
          </button>

          <button
            onClick={() => setViewMode('difficult')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'difficult'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Decks par Arme (Questions Difficiles)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                viewMode === 'difficult'
                  ? 'bg-white text-rose-600'
                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800'
              }`}
            >
              {totalDifficultCount}
            </span>
          </button>
        </div>

        {viewMode === 'difficult' && totalDifficultCount > 0 && (
          <button
            onClick={() => {
              onSelectDeckForReview('difficult');
              setActiveTab('review');
            }}
            className="py-2 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:opacity-90"
          >
            <Flame className="w-3.5 h-3.5 fill-current text-amber-400 dark:text-amber-500" />
            <span>Réviser TOUTES les armes ({totalDifficultCount})</span>
          </button>
        )}
      </div>

      {/* --- MODE 1: TOUS LES DECKS (COMPLETS) --- */}
      {viewMode === 'all' && (
        <>
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
              const progressPercent = stats.total > 0 ? Math.round(((stats.total - stats.newCount) / stats.total) * 100) : 0;
              const emoji = getArmeEmoji(deck.title);

              return (
                <div
                  key={deck.id}
                  className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{emoji}</span>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800 uppercase tracking-wider">
                            {deck.folder || 'Général'}
                          </span>
                        </div>
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
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-center">
                        <span className="block text-[10px] text-neutral-400 uppercase font-semibold">Total</span>
                        <span className="text-base font-bold text-neutral-900 dark:text-white">{stats.total}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-center border border-indigo-500/20">
                        <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-semibold">En cours</span>
                        <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{stats.learning}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-center border border-emerald-500/20">
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Maîtrisées</span>
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{stats.mastered}</span>
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

                    {/* Actions: Full review + Difficult-only review */}
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => {
                          onSelectDeckForReview(deck.id);
                          setActiveTab('review');
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Réviser ce deck ({stats.total})</span>
                      </button>

                      {stats.difficultCount > 0 && (
                        <button
                          onClick={() => {
                            onSelectDeckForReview('difficult:' + deck.id);
                            setActiveTab('review');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                          <span>Réviser les {stats.difficultCount} questions difficiles</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* --- MODE 2: DECKS PAR ARME (QUESTIONS DIFFICILES UNIQUEMENT) --- */}
      {viewMode === 'difficult' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-neutral-900 to-amber-950/30 border border-rose-500/20 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Mode Ciblé
                </span>
                <span className="text-xs text-neutral-400">
                  Base de données synchronisée multi-appareils
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Decks par Arme — Questions Difficiles</span>
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                Ces decks contiennent <strong>strictement et uniquement les questions</strong> notées comme difficiles ou à revoir lors de vos révisions. Toutes vos réponses sont directement sauvegardées sur Supabase.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-center shrink-0">
              <span className="block text-[10px] uppercase font-bold text-neutral-400">Total Difficiles</span>
              <span className="text-3xl font-black text-rose-500">{totalDifficultCount}</span>
              <span className="block text-[10px] text-neutral-400">toutes armes confondues</span>
            </div>
          </div>

          {/* Grid of Decks by Arme (Difficult Only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {decks.map((deck) => {
              const deckCards = cards.filter((c) => c.deckId === deck.id);
              const deckDifficultCards = deckCards.filter(isCardDifficult);
              const count = deckDifficultCards.length;
              const emoji = getArmeEmoji(deck.title);
              const isExpanded = expandedDifficultDeckId === deck.id;

              return (
                <div
                  key={deck.id}
                  className={`p-6 rounded-3xl bg-white dark:bg-neutral-900 border transition-all flex flex-col justify-between space-y-5 ${
                    count > 0
                      ? 'border-rose-200 dark:border-rose-900/40 shadow-xs hover:shadow-md'
                      : 'border-neutral-200 dark:border-neutral-800 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{emoji}</span>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 uppercase tracking-wider">
                            {deck.folder || 'Arme'}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">
                          {deck.title} — Difficiles
                        </h3>
                      </div>

                      <div
                        className={`px-3 py-1 rounded-2xl text-xs font-black flex items-center gap-1.5 ${
                          count > 0
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800'
                        }`}
                      >
                        {count > 0 ? (
                          <>
                            <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                            <span>{count} question{count > 1 ? 's' : ''}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>0 difficile</span>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Deck ciblé comprenant uniquement les questions difficiles de <strong className="text-neutral-700 dark:text-neutral-200">{deck.title}</strong> ({count} sur {deckCards.length} cartes au total).
                    </p>
                  </div>

                  {/* Actions & Question list preview */}
                  <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    {count > 0 ? (
                      <button
                        onClick={() => {
                          onSelectDeckForReview('difficult:' + deck.id);
                          setActiveTab('review');
                        }}
                        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        <Flame className="w-4 h-4 fill-white" />
                        <span>Réviser ces {count} question{count > 1 ? 's' : ''} difficile{count > 1 ? 's' : ''}</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-center text-xs font-semibold border border-emerald-200/50 dark:border-emerald-900/30 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Toutes les questions de cette arme sont maîtrisées !</span>
                      </div>
                    )}

                    {count > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedDifficultDeckId(isExpanded ? null : deck.id)}
                          className="w-full py-2 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? 'Masquer les questions' : `Voir les ${count} questions`}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800 space-y-2 max-h-56 overflow-y-auto">
                            {deckDifficultCards.map((c, idx) => (
                              <div
                                key={c.id}
                                className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 text-xs space-y-0.5"
                              >
                                <div className="font-semibold text-neutral-900 dark:text-white">
                                  {idx + 1}. {c.question}
                                </div>
                                <div className="text-[10px] text-neutral-400">
                                  Difficulté : {c.difficulty} / 10 • Échecs : {c.lapses}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
