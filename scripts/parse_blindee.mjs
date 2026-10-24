import fs from 'fs';

const text = fs.readFileSync('c:\\Users\\DAM\\Desktop\\memora\\Artillerie', 'utf-8');
const lines = text.split(/\r?\n/);

let currentQ = null;
let currentTitle = '';
let currentAnswer = [];
const cards = [];

const sectionHeadings = [
  'A-ARTILLERIE SOL-SOL',
  'I-ORGANISATION, MOYENS ET MISSIONS',
  'II-EMPLOI ET MISE EN OEUVRE',
  'III-FONCTIONS FEU, RENSEIGNEMENT ET LOGISTIQUE :',
  '1-FEU',
  '2-RENSEIGNEMENT',
  '3-LOGISTIQUE',
  'IV-POSSIBILITES',
  'V-SYSTEMES DRONES',
  'B-ARTILLERIE SOL-AIR'
];

function processAnswer(linesArray) {
  while (linesArray.length > 0) {
    const last = linesArray[linesArray.length - 1].trim();
    if (!last || sectionHeadings.some(h => last === h || last.startsWith(h))) {
      linesArray.pop();
    } else {
      break;
    }
  }

  while (linesArray.length > 0 && !linesArray[0].trim()) {
    linesArray.shift();
  }

  const result = [];
  for (let l of linesArray) {
    l = l.replace(/([^\n])\s+([➢•→])/g, '$1\n$2');
    result.push(l);
  }

  return result.join('\n').trim();
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const qMatch = line.trim().match(/^Q(\d+)\s*[:.]\s*(.*)/);
  if (qMatch) {
    if (currentQ) {
      let ans = processAnswer(currentAnswer);
      cards.push({ id: 'art' + currentQ, q: `Q${currentQ} : ` + currentTitle, a: ans });
    }
    currentQ = qMatch[1];
    currentTitle = qMatch[2].trim();
    currentAnswer = [];
  } else {
    if (currentQ) {
      currentAnswer.push(line);
    }
  }
}
if (currentQ) {
  let ans = processAnswer(currentAnswer);
  cards.push({ id: 'art' + currentQ, q: `Q${currentQ} : ` + currentTitle, a: ans });
}

let cardsBlock = 'const CARDS = [\n';
for (let i = 0; i < cards.length; i++) {
  const c = cards[i];
  cardsBlock += `  card('${c.id}', ${JSON.stringify(c.q)},\n    ${JSON.stringify(c.a)},\n    [])${i === cards.length - 1 ? '' : ','}\n`;
}
cardsBlock += '];\n';

const pushContent = `// push_artillerie.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rwcdvoliowjmoaunarod.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y2R2b2xpb3dqbW9hdW5hcm9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYwNjE4OCwiZXhwIjoyMTAyMTgyMTg4fQ.yOQm8Ujs_QU4PrkCLVFARTg-Is6lt-nWgY_RmFuEn7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DECK_ID = 'deck-artillerie';
const USER_ID = 'user_3HjjzpAUtcVDhMKLO8L3GcCw3Dv';
const now = new Date().toISOString();

function card(id, question, answer, tags) {
  return {
    id,
    user_id: USER_ID,
    deck_id: DECK_ID,
    question,
    answer,
    tags,
    difficulty: 5,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    lapses: 0,
    stability: 2.0,
    state: 'new',
    favorite: false,
    flagged: false,
    due_date: now,
    created_at: now,
    updated_at: now,
  };
}

const DECK = {
  id: DECK_ID,
  user_id: USER_ID,
  title: 'Artillerie',
  description: "Questionnaire complet d'Artillerie sol-sol et sol-air (Organisation, Emploi, Missions, Logistique, Drones, ASA).",
  folder: 'Artillerie',
  color: 'red',
  icon: 'Target',
  telegram_reminder_enabled: false,
  created_at: now,
};

${cardsBlock}

async function main() {
  console.log('🚀 Démarrage de la synchronisation Artillerie -> Supabase\\n');

  // 1. Upsert du deck
  console.log('📁 Upsert du deck...');
  const { error: deckError } = await supabase
    .from('decks')
    .upsert(DECK, { onConflict: 'id' });

  if (deckError) {
    console.error('❌ Erreur deck:', deckError.message);
  } else {
    console.log(\`✅ Deck "\${DECK.title}" upserted avec succès.\`);
  }

  // 2. Upsert des cartes par batch
  console.log(\`\\n🃏 Upsert de \${CARDS.length} cartes...\`);
  const BATCH = 20;
  let successCount = 0;

  for (let i = 0; i < CARDS.length; i += BATCH) {
    const batch = CARDS.slice(i, i + BATCH);
    const { error } = await supabase
      .from('cards')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(\`❌ Erreur batch \${i / BATCH + 1}:\`, error.message);
    } else {
      successCount += batch.length;
      console.log(\`  ✅ Batch \${i / BATCH + 1}: \${batch.length} cartes (\${successCount}/\${CARDS.length})\`);
    }
  }

  console.log(\`\\n✅ Synchronisation terminée : \${successCount}/\${CARDS.length} cartes poussées.\`);

  // 3. Vérification
  const { data, error: fetchError } = await supabase
    .from('cards')
    .select('id', { count: 'exact' })
    .eq('deck_id', DECK_ID);

  if (!fetchError) {
    console.log(\`\\n📊 Vérification : \${data.length} cartes trouvées dans Supabase pour le deck Artillerie.\`);
  }
}

main().catch(console.error);
`;

fs.writeFileSync('c:\\Users\\DAM\\Desktop\\memora\\scripts\\push_artillerie.mjs', pushContent, 'utf-8');
console.log('Done, generated push_artillerie.mjs with ' + cards.length + ' cards');
