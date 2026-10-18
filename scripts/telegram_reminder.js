import { createClient } from '@supabase/supabase-js';

let SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("Missing environment variables. Please check your GitHub Secrets.");
  process.exit(1);
}

// Clean up URL in case trailing slashes or quotes are present
SUPABASE_URL = SUPABASE_URL.replace(/["']/g, "").trim();
if (SUPABASE_URL.endsWith('/')) SUPABASE_URL = SUPABASE_URL.slice(0, -1);
if (SUPABASE_URL.endsWith('/rest/v1')) SUPABASE_URL = SUPABASE_URL.replace('/rest/v1', '');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.replace(/["']/g, "").trim());

function getDeckIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('blindée') || t.includes('blindee')) return '🛡️';
  if (t.includes('air') || t.includes('aérienne') || t.includes('aerienne')) return '✈️';
  if (t.includes('gendarmerie')) return '👮';
  if (t.includes('infanterie') || t.includes('arme')) return '⚔️';
  return '📚';
}

function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramMessage(text) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error(`Failed to send Telegram message: ${response.status} ${response.statusText} — ${errBody}`);
    return false;
  }
  return true;
}

async function run() {
  const maskedUrl = SUPABASE_URL.replace(/https:\/\/(\w{4})\w+/, 'https://$1***');
  console.log(`Connecting to Supabase: ${maskedUrl}`);

  // Fetch all decks
  const { data: allDecks, error: decksError } = await supabase
    .from('decks')
    .select('*');

  if (decksError) {
    console.error("Error fetching decks from Supabase:", decksError);
    process.exit(1);
  }

  if (!allDecks || allDecks.length === 0) {
    console.log("No decks found in database.");
    return;
  }

  console.log(`Found ${allDecks.length} deck(s) in database:`);
  allDecks.forEach(d => console.log(`  - "${d.title}" (id: ${d.id})`));

  // Get distinct users
  const userIds = [...new Set(allDecks.map(d => d.user_id).filter(Boolean))];

  for (const userId of userIds) {
    const userDecks = allDecks.filter(d => d.user_id === userId);
    const deckIds = userDecks.map(d => d.id);

    // Fetch all cards for this user's decks
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, deck_id, question, difficulty, lapses, state')
      .eq('user_id', userId)
      .in('deck_id', deckIds);

    if (cardsError) {
      console.error(`Error fetching cards for user ${userId}:`, cardsError);
      continue;
    }

    if (!cards || cards.length === 0) {
      console.log(`No cards found for user ${userId}.`);
      continue;
    }

    // Filter ONLY difficult questions: difficulty > 5 OR lapses > 0
    const difficultCards = cards.filter(c => c.difficulty > 5 || c.lapses > 0);

    console.log(`User ${userId}: ${cards.length} total cards, ${difficultCards.length} difficult questions across all decks.`);

    if (difficultCards.length === 0) {
      console.log(`No difficult cards for user ${userId}, skipping notification.`);
      continue;
    }

    // Group difficult cards by deck
    const deckGroups = [];
    for (const deck of userDecks) {
      const cardsInDeck = difficultCards.filter(c => c.deck_id === deck.id);
      if (cardsInDeck.length > 0) {
        deckGroups.push({
          deck,
          cards: cardsInDeck,
        });
      }
    }

    let appUrl = 'https://memora.vercel.app';
    try {
      if (process.env.APP_URL) {
        appUrl = new URL(process.env.APP_URL).toString();
      }
    } catch {
      appUrl = 'https://memora.vercel.app';
    }

    // Prepare message chunks (Telegram allows max 4096 chars per message)
    // We group by deck and split if too long to ensure NO question is omitted
    const messages = [];
    let currentMessage = `🔥 <b>Rappels Memora — Questions Difficiles (${difficultCards.length} au total)</b>\n`;
    currentMessage += `<i>Voici toutes les questions difficiles réparties par arme :</i>\n\n`;

    for (const group of deckGroups) {
      const icon = getDeckIcon(group.deck.title);
      let deckSection = `${icon} <b><u>${escapeHtml(group.deck.title)}</u></b> (${group.cards.length} question${group.cards.length > 1 ? 's' : ''}) :\n`;

      group.cards.forEach((c, idx) => {
        deckSection += `<b>${idx + 1}.</b> ${escapeHtml(c.question.trim())}\n\n`;
      });

      // Check if adding this deck section would exceed Telegram's size limit (~3500 chars)
      if ((currentMessage + deckSection).length > 3500) {
        // Close current message and start a new one
        currentMessage += `Prêt à réviser ? <a href="${appUrl}">📖 Ouvrir Memora</a>\n`;
        messages.push(currentMessage);
        currentMessage = `🔥 <b>Rappels Memora (suite)</b>\n\n` + deckSection;
      } else {
        currentMessage += deckSection;
      }
    }

    currentMessage += `💪 Prêt à réviser ? <a href="${appUrl}">📖 Ouvrir Memora</a>\n`;
    messages.push(currentMessage);

    // Send each message
    console.log(`Sending ${messages.length} message(s) to Telegram for user ${userId}...`);
    for (let i = 0; i < messages.length; i++) {
      console.log(`Sending part ${i + 1}/${messages.length}...`);
      await sendTelegramMessage(messages[i]);
      // Small delay between multiple messages to avoid rate limits
      if (i < messages.length - 1) {
        await new Promise(res => setTimeout(res, 500));
      }
    }
  }

  console.log("Done running telegram reminder.");
}

run();
