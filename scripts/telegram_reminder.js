import { createClient } from '@supabase/supabase-js';

let SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("Missing environment variables. Please check your GitHub Secrets.");
  process.exit(1);
}

// Clean up URL in case the user accidentally included trailing slashes, /rest/v1 or literal quotes
SUPABASE_URL = SUPABASE_URL.replace(/["']/g, "").trim();
if (SUPABASE_URL.endsWith('/')) SUPABASE_URL = SUPABASE_URL.slice(0, -1);
if (SUPABASE_URL.endsWith('/rest/v1')) SUPABASE_URL = SUPABASE_URL.replace('/rest/v1', '');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.replace(/["']/g, "").trim());

async function run() {
  // Debug: show which Supabase project we're connecting to
  const maskedUrl = SUPABASE_URL.replace(/https:\/\/(\w{4})\w+/, 'https://$1***');
  console.log(`Connecting to Supabase: ${maskedUrl}`);

  // Debug: first check total decks to verify connectivity
  const { data: allDecks, error: allDecksError } = await supabase
    .from('decks')
    .select('id, title, telegram_reminder_enabled');

  if (allDecksError) {
    console.error("Error connecting to Supabase / fetching decks:", allDecksError);
    console.error("This likely means SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is wrong in your GitHub Secrets.");
    process.exit(1);
  }

  console.log(`Found ${allDecks?.length || 0} total deck(s) in database.`);
  if (allDecks && allDecks.length > 0) {
    allDecks.forEach(d => console.log(`  - "${d.title}" → telegram_reminder_enabled = ${d.telegram_reminder_enabled}`));
  }

  console.log("\nFetching decks with Telegram reminders enabled...");
  
  // Get decks that have telegram_reminder_enabled = true
  const { data: decks, error: decksError } = await supabase
    .from('decks')
    .select('*')
    .eq('telegram_reminder_enabled', true);

  if (decksError) {
    console.error("Error fetching decks:", decksError);
    process.exit(1);
  }

  if (!decks || decks.length === 0) {
    console.log("No decks have Telegram reminders enabled.");
    return;
  }

  // Get users who own these decks
  const userIds = [...new Set(decks.map(d => d.user_id))];
  const nowISO = new Date().toISOString();

  for (const userId of userIds) {
    const userDecks = decks.filter(d => d.user_id === userId);
    const deckIds = userDecks.map(d => d.id);
    
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .in('deck_id', deckIds);

    if (cardsError) {
      console.error(`Error fetching cards for user ${userId}:`, cardsError);
      continue;
    }

    if (!cards || cards.length === 0) {
      console.log(`No cards found for user ${userId}, skipping.`);
      continue;
    }

    // Cards that are due for review (due_date <= now)
    const dueCards = cards.filter(c => c.due_date && c.due_date <= nowISO);
    // Cards that are struggling (lower threshold to be useful)
    const difficultCards = cards.filter(c => c.difficulty >= 5 || c.flagged || c.lapses > 0);

    console.log(`User ${userId}: ${cards.length} total cards, ${dueCards.length} due, ${difficultCards.length} difficult/flagged.`);

    // Build the message
    let message = '';

    if (dueCards.length > 0) {
      message += `📚 <b>Rappels Memora — ${dueCards.length} carte(s) à réviser</b>\n\n`;
      
      // Show up to 10 due cards
      const preview = dueCards.slice(0, 10);
      preview.forEach((c, idx) => {
        message += `<b>${idx + 1}. Q:</b> ${c.question}\n`;
        message += `<b>R:</b> <tg-spoiler>${c.answer}</tg-spoiler>\n\n`;
      });
      
      if (dueCards.length > 10) {
        message += `<i>...et ${dueCards.length - 10} autre(s)</i>\n\n`;
      }
    } else if (difficultCards.length > 0) {
      message += `📚 <b>Rappels Memora — Questions à renforcer</b>\n\n`;
      
      const preview = difficultCards.slice(0, 10);
      preview.forEach((c, idx) => {
        message += `<b>${idx + 1}. Q:</b> ${c.question}\n`;
        message += `<b>R:</b> <tg-spoiler>${c.answer}</tg-spoiler>\n\n`;
      });

      if (difficultCards.length > 10) {
        message += `<i>...et ${difficultCards.length - 10} autre(s)</i>\n\n`;
      }
    } else {
      // General reminder even if no cards are due right now
      message += `📚 <b>Rappels Memora</b>\n\n`;
      message += `✅ Aucune carte à réviser pour le moment !\n`;
      message += `Tu as <b>${cards.length}</b> carte(s) au total.\n\n`;
    }

    message += `Prêt à réviser ? 🔥\n\n`;
    message += `<a href="${process.env.APP_URL || 'https://memora.vercel.app'}">📖 Ouvrir Memora</a>`;

    console.log(`Sending message to Telegram for user ${userId}...`);
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Failed to send Telegram message: ${response.status} ${response.statusText} — ${errBody}`);
    } else {
      console.log(`Successfully sent message.`);
    }
  }
}

run();
