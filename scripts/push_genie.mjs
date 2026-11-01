// push_genie.mjs
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rwcdvoliowjmoaunarod.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y2R2b2xpb3dqbW9hdW5hcm9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYwNjE4OCwiZXhwIjoyMTAyMTgyMTg4fQ.yOQm8Ujs_QU4PrkCLVFARTg-Is6lt-nWgY_RmFuEn7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DECK_ID = 'deck-genie';
const USER_ID = 'user_3HjjzpAUtcVDhMKLO8L3GcCw3Dv';
const now = new Date().toISOString();

const rawCards = JSON.parse(fs.readFileSync('scripts/genie_cards_clean.json', 'utf8'));

const DECK = {
  id: DECK_ID,
  user_id: USER_ID,
  title: 'Génie',
  description: "Questionnaire complet de l'Arme du Génie (Organisation, Missions, Emploi et Moyens).",
  folder: 'Génie',
  color: 'amber',
  icon: 'Wrench',
  telegram_reminder_enabled: false,
  created_at: now,
};

const CARDS = rawCards.map((c) => ({
  id: c.id,
  user_id: USER_ID,
  deck_id: DECK_ID,
  question: c.question,
  answer: c.answer,
  tags: ['Génie'],
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
}));

async function main() {
  console.log('🚀 Démarrage de la synchronisation Génie -> Supabase\n');

  // 1. Upsert du deck
  console.log('📁 Upsert du deck...');
  const { error: deckError } = await supabase
    .from('decks')
    .upsert(DECK, { onConflict: 'id' });

  if (deckError) {
    console.error('❌ Erreur deck:', deckError.message);
  } else {
    console.log(`✅ Deck "${DECK.title}" upserted avec succès.`);
  }

  // 2. Upsert des cartes par batch
  console.log(`\n🃏 Upsert de ${CARDS.length} cartes...`);
  const BATCH = 20;
  let successCount = 0;

  for (let i = 0; i < CARDS.length; i += BATCH) {
    const batch = CARDS.slice(i, i + BATCH);
    const { error } = await supabase
      .from('cards')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Erreur batch ${i / BATCH + 1}:`, error.message);
    } else {
      successCount += batch.length;
      console.log(`  ✅ Batch ${i / BATCH + 1}: ${batch.length} cartes (${successCount}/${CARDS.length})`);
    }
  }

  console.log(`\n✅ Synchronisation terminée : ${successCount}/${CARDS.length} cartes poussées.`);

  // 3. Vérification
  const { data, error: fetchError } = await supabase
    .from('cards')
    .select('id', { count: 'exact' })
    .eq('deck_id', DECK_ID);

  if (!fetchError) {
    console.log(`\n📊 Vérification : ${data.length} cartes trouvées dans Supabase pour le deck Génie.`);
  }
}

main().catch(console.error);
