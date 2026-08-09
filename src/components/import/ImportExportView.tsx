import React, { useState } from 'react';
import { Download, Upload, FileText, CheckCircle2, AlertCircle, Copy, FileSpreadsheet, FileJson, RefreshCw } from 'lucide-react';
import { Card, Deck, ReviewLog, UserStats, UserSettings } from '../../types';
import { downloadCSVTemplate, exportCardsToCSV, exportToJSON, importFromJSON, parseCSV, CSVRow } from '../../lib/csv';

interface ImportExportViewProps {
  cards: Card[];
  decks: Deck[];
  reviewLogs?: ReviewLog[];
  stats?: UserStats;
  settings?: UserSettings;
  onImportBatch: (cardsData: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'dueDate' | 'lastReviewedAt' | 'interval' | 'ease' | 'repetitions' | 'lapses' | 'difficulty' | 'stability' | 'state' | 'favorite' | 'flagged'>[]) => number;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  cards,
  decks,
  reviewLogs,
  stats,
  settings,
  onImportBatch,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<CSVRow[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || '');
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleParse = (text: string) => {
    setCsvText(text);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }
    const rows = parseCSV(text);
    setParsedRows(rows);
    setImportSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleParse(content);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleJSONRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Attention: La restauration depuis une sauvegarde va remplacer vos données actuelles. Continuer ?')) {
      e.target.value = '';
      return;
    }

    const res = await importFromJSON(file);
    if (res.success) {
      setImportSuccessMessage(res.message);
      setErrorMessage(null);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setErrorMessage(res.message);
      setImportSuccessMessage(null);
    }
    e.target.value = '';
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;

    // Map deck names or assign to selected deck
    const deckMap = new Map(decks.map((d) => [d.title.toLowerCase().trim(), d.id]));

    const batch = parsedRows.map((r) => {
      const targetId = deckMap.get(r.deck.toLowerCase().trim()) || selectedDeckId || (decks[0]?.id ?? '');
      const tags = r.tags
        ? r.tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
        : [];

      return {
        deckId: targetId,
        question: r.question,
        answer: r.answer,
        tags,
      };
    });

    const count = onImportBatch(batch);
    setImportSuccessMessage(`🎉 ${count} carte${count > 1 ? 's ont' : ' a'} été importée${count > 1 ? 's' : ''} avec succès !`);
    setCsvText('');
    setParsedRows([]);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
        <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Importer & Exporter des données
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Importez facilement vos paquets au format CSV ou exportez vos flashcards pour la sauvegarde.
        </p>
      </div>

      {/* Success Notification */}
      {importSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{importSuccessMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Two Column Grid: Import & Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Import Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                Importer au format CSV
              </h3>
            </div>
            <button
              onClick={downloadCSVTemplate}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Modèle CSV</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* File Upload Trigger */}
            <label className="block p-6 border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-indigo-500 rounded-2xl text-center cursor-pointer bg-neutral-50/50 dark:bg-neutral-800/30 transition-colors">
              <FileSpreadsheet className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                Cliquez pour choisir un fichier .csv
              </span>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                Format: question, answer, deck, tags
              </span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Manual Paste Textarea */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Ou collez votre texte CSV directement :
              </label>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => handleParse(e.target.value)}
                placeholder={`"Question 1","Réponse 1","Histoire","Tag1, Tag2"\n"Question 2","Réponse 2","Anglais","Grammaire"`}
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Default Target Deck */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Deck de destination par défaut :
              </label>
              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-medium focus:outline-none"
              >
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.folder})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white">
                <span>Prévisualisation ({parsedRows.length} cartes)</span>
                <span className="text-emerald-600">Prêt à importer</span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2">Question</th>
                      <th className="p-2">Réponse</th>
                      <th className="p-2">Deck</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="p-2 line-clamp-1 font-medium">{row.question}</td>
                        <td className="p-2 line-clamp-1 text-neutral-500">{row.answer}</td>
                        <td className="p-2 text-indigo-600 font-semibold">{row.deck}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleExecuteImport}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all"
              >
                Valider et importer {parsedRows.length} carte{parsedRows.length > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>

        {/* Export & Backup Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">
              Sauvegarde & Restauration
            </h3>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Conservez une sauvegarde locale de vos paquets de flashcards et de votre historique de répétition espacée, ou restaurez une sauvegarde existante.
          </p>

          <div className="space-y-3">
            {/* Export CSV Option */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="font-bold text-xs text-neutral-900 dark:text-white">
                Exporter au format CSV (Tableur Excel / Anki)
              </div>
              <p className="text-[11px] text-neutral-500">
                Génère un fichier .csv contenant toutes vos cartes, questions, réponses, tags et intervalles.
              </p>
              <button
                onClick={() => exportCardsToCSV(cards, decks)}
                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-bold text-xs border border-neutral-200 dark:border-neutral-600 shadow-xs transition-colors"
              >
                Télécharger l'export CSV ({cards.length} cartes)
              </button>
            </div>

            {/* Export JSON Option */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="font-bold text-xs text-neutral-900 dark:text-white">
                Sauvegarde complète JSON
              </div>
              <p className="text-[11px] text-neutral-500">
                Sauvegarde intégrale de l'application (decks, cartes, statistiques, réglages).
              </p>
              <button
                onClick={() => exportToJSON(cards, decks, reviewLogs, stats, settings)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger la sauvegarde JSON</span>
              </button>
            </div>

            {/* Import JSON Restore Option */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="font-bold text-xs text-neutral-900 dark:text-white">
                Restaurer depuis un fichier JSON
              </div>
              <p className="text-[11px] text-neutral-500">
                Restaurez toutes vos cartes, paquets et statistiques depuis une sauvegarde .json.
              </p>
              <label className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-center">
                <FileJson className="w-4 h-4" />
                <span>Choisir un fichier JSON à restaurer</span>
                <input type="file" accept=".json" onChange={handleJSONRestore} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

