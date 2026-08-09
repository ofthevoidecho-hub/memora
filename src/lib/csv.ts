import { Card, Deck } from '../types';

export interface CSVRow {
  question: string;
  answer: string;
  deck: string;
  tags: string;
}

/**
 * Robust CSV parser that correctly handles quotes, escaped quotes, commas, newlines and UTF-8.
 */
export function parseCSV(csvText: string): CSVRow[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip CRLF
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];

  // Parse header line
  const headerCells = parseCSVLine(lines[0]);
  const hasHeader = headerCells.some(h =>
    ['question', 'answer', 'deck', 'tags', 'carte', 'reponse', 'réponse'].includes(h.toLowerCase().trim())
  );

  const startIdx = hasHeader ? 1 : 0;
  const rows: CSVRow[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    if (cells.length >= 2) {
      rows.push({
        question: cells[0]?.trim() || '',
        answer: cells[1]?.trim() || '',
        deck: cells[2]?.trim() || 'Général',
        tags: cells[3]?.trim() || '',
      });
    }
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(currentCell);
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  cells.push(currentCell);
  return cells;
}

/**
 * Download a CSV template file
 */
export function downloadCSVTemplate() {
  const templateContent = `question,answer,deck,tags
"Quelle est la capitale du Maroc ?","Rabat","Géographie","Maroc, Capitales"
"What is 'To bite the bullet'?","Serrer les dents et affronter la difficulté","Anglais","Idioms, Expressions"
"Quel accord met fin à la guerre d'Algérie ?","Accords d'Évian (1962)","Histoire","1962, France, Algérie"
`;

  const blob = new Blob(['\uFEFF' + templateContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'memora_template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export cards & decks to CSV file
 */
export function exportCardsToCSV(cards: Card[], decks: Deck[], targetDeckId?: string) {
  const deckMap = new Map(decks.map((d) => [d.id, d.title]));
  const filteredCards = targetDeckId ? cards.filter((c) => c.deckId === targetDeckId) : cards;

  let csv = 'question,answer,deck,tags,dueDate,interval,state\n';

  filteredCards.forEach((c) => {
    const q = `"${c.question.replace(/"/g, '""')}"`;
    const a = `"${c.answer.replace(/"/g, '""')}"`;
    const deckName = `"${(deckMap.get(c.deckId) || 'Général').replace(/"/g, '""')}"`;
    const tags = `"${c.tags.join(', ').replace(/"/g, '""')}"`;
    const dueDate = `"${c.dueDate}"`;
    const interval = c.interval;
    const state = c.state;

    csv += `${q},${a},${deckName},${tags},${dueDate},${interval},${state}\n`;
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = targetDeckId ? `memora_export_${targetDeckId}.csv` : 'memora_export_all.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

import { ReviewLog, UserSettings, UserStats } from '../types';
import { saveCards, saveDecks, saveReviewLogs, saveSettings, saveStats } from './storage';

/**
 * Export full backup to JSON file including all app data
 */
export function exportToJSON(
  cards: Card[],
  decks: Deck[],
  logs?: ReviewLog[],
  stats?: UserStats,
  settings?: UserSettings
) {
  const data = {
    app: 'MEMORA',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    decks,
    cards,
    logs: logs || [],
    stats: stats || null,
    settings: settings || null,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `memora_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restore full app state from a Memora JSON backup file
 */
export async function importFromJSON(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          return resolve({ success: false, message: 'Fichier vide ou illisible.' });
        }
        const data = JSON.parse(text);

        if (!data || (data.app !== 'MEMORA' && !Array.isArray(data.cards))) {
          return resolve({ success: false, message: 'Format de fichier JSON invalide ou incompatible.' });
        }

        if (Array.isArray(data.decks) && data.decks.length > 0) {
          saveDecks(data.decks);
        }
        if (Array.isArray(data.cards)) {
          saveCards(data.cards);
        }
        if (Array.isArray(data.logs)) {
          saveReviewLogs(data.logs);
        }
        if (data.stats && typeof data.stats === 'object') {
          saveStats(data.stats);
        }
        if (data.settings && typeof data.settings === 'object') {
          saveSettings(data.settings);
        }

        resolve({
          success: true,
          message: `Restauration réussie ! ${data.cards?.length || 0} cartes et ${data.decks?.length || 0} paquets restaurés.`,
        });
      } catch (err: any) {
        resolve({ success: false, message: `Erreur lors de la lecture du fichier JSON: ${err.message}` });
      }
    };

    reader.readAsText(file, 'UTF-8');
  });
}

