import React, { useState } from 'react';
import { useMemoraState } from './hooks/useMemoraState';
import { ActiveTab, Card } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { CommandPalette } from './components/ui/CommandPalette';
import { CardEditorModal } from './components/cards/CardEditorModal';
import { DeckModal } from './components/decks/DeckModal';
import { AuthGuard } from './components/auth/AuthGuard';

import { DashboardView } from './components/dashboard/DashboardView';
import { DecksView } from './components/decks/DecksView';
import { ReviewSessionView } from './components/review/ReviewSessionView';
import { LibraryView } from './components/library/LibraryView';
import { ImportExportView } from './components/import/ImportExportView';
import { StatisticsView } from './components/statistics/StatisticsView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  const {
    decks,
    cards,
    reviewLogs,
    dueCards,
    difficultCards,
    favoriteCards,
    stats,
    settings,
    addCard,
    updateCard,
    deleteCard,
    toggleFavorite,
    toggleFlag,
    addDeck,
    updateDeck,
    deleteDeck,
    resetDeckProgress,
    submitCardReview,
    importCardsBatch,
    updateUserSettings,
    resetReviewStats,
  } = useMemoraState();

  const getInitialTab = (): ActiveTab => {
    if (typeof window === 'undefined') return 'dashboard';
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const validTabs: ActiveTab[] = ['dashboard', 'decks', 'review', 'library', 'import', 'statistics', 'settings'];
    if (tab && validTabs.includes(tab as ActiveTab)) {
      return tab as ActiveTab;
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialTab);
  const [targetDeckForReview, setTargetDeckForReview] = useState<string | null>(null);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCardEditorOpen, setIsCardEditorOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);

  const handleOpenQuickAddCard = () => {
    setCardToEdit(null);
    setIsCardEditorOpen(true);
  };

  const handleOpenEditCard = (card: Card) => {
    setCardToEdit(card);
    setIsCardEditorOpen(true);
  };

  const handleSaveCard = (cardData: {
    deckId: string;
    question: string;
    answer: string;
    tags: string[];
    difficulty: number;
  }) => {
    if (cardToEdit) {
      updateCard(cardToEdit.id, cardData);
    } else {
      addCard(cardData);
    }
  };

  const handleSelectDeckForReview = (deckId: string) => {
    setTargetDeckForReview(deckId);
    setActiveTab('review');
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateUserSettings({ theme: nextTheme });
  };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col lg:flex-row antialiased font-sans">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'review' && activeTab !== 'review') setTargetDeckForReview(null);
          setActiveTab(tab);
        }}
        dueCardsCount={dueCards.length}
        difficultCardsCount={difficultCards.length}
        favoriteCardsCount={favoriteCards.length}
        settings={settings}
        onUpdateSettings={updateUserSettings}
        onOpenQuickAddCard={handleOpenQuickAddCard}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'review' && activeTab !== 'review') setTargetDeckForReview(null);
            setActiveTab(tab);
          }}
          streak={stats.streak}
          dueCardsCount={dueCards.length}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenQuickAddCard={handleOpenQuickAddCard}
        />

        {/* View Switcher */}
        <main className="flex-1 p-4 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              cards={cards}
              decks={decks}
              dueCards={dueCards}
              stats={stats}
              settings={settings}
              setActiveTab={setActiveTab}
              onSelectDeckForReview={handleSelectDeckForReview}
              onOpenQuickAddCard={handleOpenQuickAddCard}
              onOpenQuickAddDeck={() => setIsDeckModalOpen(true)}
            />
          )}

          {activeTab === 'decks' && (
            <DecksView
              decks={decks}
              cards={cards}
              setActiveTab={setActiveTab}
              onSelectDeckForReview={handleSelectDeckForReview}
              onAddDeck={addDeck}
              onUpdateDeck={updateDeck}
              onDeleteDeck={deleteDeck}
              onResetDeckProgress={resetDeckProgress}
            />
          )}

          {activeTab === 'review' && (
            <ReviewSessionView
              cards={cards}
              decks={decks}
              targetDeckId={targetDeckForReview}
              settings={settings}
              setActiveTab={setActiveTab}
              onSubmitRating={submitCardReview}
              onToggleFavorite={toggleFavorite}
              onToggleFlag={toggleFlag}
              onOpenEditCard={handleOpenEditCard}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              cards={cards}
              decks={decks}
              onOpenQuickAddCard={handleOpenQuickAddCard}
              onOpenEditCard={handleOpenEditCard}
              onDeleteCard={deleteCard}
              onToggleFavorite={toggleFavorite}
              onToggleFlag={toggleFlag}
            />
          )}

          {activeTab === 'import' && (
            <ImportExportView
              cards={cards}
              decks={decks}
              reviewLogs={reviewLogs}
              stats={stats}
              settings={settings}
              onImportBatch={importCardsBatch}
            />
          )}

          {activeTab === 'statistics' && <StatisticsView cards={cards} stats={stats} />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateUserSettings}
              onResetStats={resetReviewStats}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Bar Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'review' && activeTab !== 'review') setTargetDeckForReview(null);
          setActiveTab(tab);
        }}
        dueCardsCount={dueCards.length}
      />

      {/* Command Palette Overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        cards={cards}
        decks={decks}
        setActiveTab={setActiveTab}
        onSelectDeckForReview={handleSelectDeckForReview}
        onOpenQuickAddCard={handleOpenQuickAddCard}
        onToggleTheme={handleToggleTheme}
      />

      {/* Card Editor Modal */}
      <CardEditorModal
        isOpen={isCardEditorOpen}
        onClose={() => setIsCardEditorOpen(false)}
        cardToEdit={cardToEdit}
        decks={decks}
        onSave={handleSaveCard}
      />

      {/* Deck Creator Modal */}
      <DeckModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        onSave={(deckData) => addDeck(deckData)}
      />
    </div>
    </AuthGuard>
  );
}
