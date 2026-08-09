import React, { useState, useEffect } from 'react';
import { X, Folder, Palette } from 'lucide-react';
import { Deck } from '../../types';

interface DeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckToEdit?: Deck | null;
  onSave: (deckData: { title: string; description: string; folder: string; color: string }) => void;
}

export const DeckModal: React.FC<DeckModalProps> = ({ isOpen, onClose, deckToEdit, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState('Général');
  const [color, setColor] = useState('indigo');

  useEffect(() => {
    if (deckToEdit) {
      setTitle(deckToEdit.title);
      setDescription(deckToEdit.description);
      setFolder(deckToEdit.folder || 'Général');
      setColor(deckToEdit.color || 'indigo');
    } else {
      setTitle('');
      setDescription('');
      setFolder('Général');
      setColor('indigo');
    }
  }, [deckToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, description, folder, color });
    onClose();
  };

  const colors = [
    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
    { id: 'emerald', label: 'Émeraude', bg: 'bg-emerald-500' },
    { id: 'amber', label: 'Ambre', bg: 'bg-amber-500' },
    { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
    { id: 'sky', label: 'Ciel', bg: 'bg-sky-500' },
    { id: 'purple', label: 'Violet', bg: 'bg-purple-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {deckToEdit ? 'Modifier le deck' : 'Créer un nouveau deck'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Nom du deck *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Histoire, Anglais des affaires..."
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Dossier / Catégorie
            </label>
            <input
              type="text"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="Ex: Langues, Sciences, Général..."
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objectifs d'apprentissage ou contenu du deck..."
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Couleur d'accentuation</span>
            </label>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`w-8 h-8 rounded-full ${c.bg} transition-all flex items-center justify-center ${
                    color === c.id ? 'ring-4 ring-offset-2 ring-indigo-500 dark:ring-offset-neutral-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
