import React, { useState, useEffect } from 'react';
import { X, Bold, List, Image, Code, Eye, Edit2, Sparkles } from 'lucide-react';
import { Card, Deck } from '../../types';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardToEdit?: Card | null;
  defaultDeckId?: string;
  decks: Deck[];
  onSave: (cardData: {
    deckId: string;
    question: string;
    answer: string;
    tags: string[];
    difficulty: number;
  }) => void;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  cardToEdit,
  defaultDeckId,
  decks,
  onSave,
}) => {
  const [deckId, setDeckId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [difficulty, setDifficulty] = useState(5); // 1..10
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  useEffect(() => {
    if (cardToEdit) {
      setDeckId(cardToEdit.deckId);
      setQuestion(cardToEdit.question);
      setAnswer(cardToEdit.answer);
      setTagsInput(cardToEdit.tags.join(', '));
      setDifficulty(cardToEdit.difficulty || 5);
    } else {
      setDeckId(defaultDeckId || (decks[0]?.id ?? ''));
      setQuestion('');
      setAnswer('');
      setTagsInput('');
      setDifficulty(5);
    }
    setActiveTab('write');
  }, [cardToEdit, defaultDeckId, decks, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !deckId) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({ deckId, question, answer, tags, difficulty });
    onClose();
  };

  const insertMarkdown = (target: 'question' | 'answer', format: string) => {
    const text = target === 'question' ? question : answer;
    const setText = target === 'question' ? setQuestion : setAnswer;

    if (format === 'bold') setText(text + ' **texte gras** ');
    if (format === 'list') setText(text + '\n- Élément de liste');
    if (format === 'code') setText(text + ' `code` ');
    if (format === 'image') setText(text + ' ![description](https://) ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {cardToEdit ? 'Modifier la carte' : 'Créer une nouvelle carte'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-0.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                  activeTab === 'write' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Éditer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                  activeTab === 'preview' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Aperçu</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
          {activeTab === 'write' ? (
            <>
              {/* Deck Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Deck associé *
                </label>
                <select
                  required
                  value={deckId}
                  onChange={(e) => setDeckId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Choisir un deck...
                  </option>
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.folder})
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Question / Recto *
                  </label>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('question', 'bold')}
                      className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
                      title="Gras"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('question', 'list')}
                      className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
                      title="Liste"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('question', 'code')}
                      className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
                      title="Code"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Inscrivez la question ou le terme à réviser..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
                />
              </div>

              {/* Answer Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Réponse / Verso *
                  </label>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('answer', 'bold')}
                      className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
                      title="Gras"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('answer', 'list')}
                      className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
                      title="Liste"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('answer', 'code')}
                      className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
                      title="Code"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Inscrivez la réponse exacte, des explications ou une définition..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
                />
              </div>

              {/* Tags & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Ex: WW2, Grammaire, Droit..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Niveau de difficulté initial
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDifficulty(3)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        difficulty <= 3
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-500'
                      }`}
                    >
                      Facile
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficulty(5)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        difficulty > 3 && difficulty <= 6
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-500'
                      }`}
                    >
                      Moyenne
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficulty(8)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        difficulty > 6
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-500'
                      }`}
                    >
                      Difficile
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Live Preview */
            <div className="space-y-6 py-4">
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  QUESTION (RECTO)
                </span>
                <div className="text-base font-bold text-neutral-900 dark:text-white leading-relaxed">
                  {question || 'Votre question apparaîtra ici'}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900 space-y-2">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                  RÉPONSE (VERSO)
                </span>
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {answer || 'Votre réponse apparaîtra ici'}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              Enregistrer la carte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
