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

    // Cards rated "Difficile" or "À revoir" during review (difficulty > 5 or lapses > 0)
    // The user explicitly requested to base this on the rating buttons, ignoring the manual flag icon.
    const difficultCards = cards.filter(c => c.difficulty > 5 || c.lapses > 0);

    console.log(`User ${userId}: ${cards.length} total cards, ${difficultCards.length} rated as difficult/lapses.`);

    if (difficultCards.length === 0) {
      console.log(`No difficult cards for user ${userId}, skipping.`);
      continue;
    }

    // Build message with only questions, no answers, no ellipsis
    let message = `📚 <b>Rappels Memora — ${difficultCards.length} question(s) difficile(s)</b>\n\n`;

    // Display all difficult questions (or up to a safe limit for Telegram)
    const preview = difficultCards.slice(0, 30);
    preview.forEach((c, idx) => {
      message += `<b>${idx + 1}.</b> ${c.question}\n\n`;
    });

    message += `Prêt à réviser ? 🔥\n\n`;
    try {
      const url = new URL(process.env.APP_URL || 'https://memora.vercel.app');
      url.searchParams.set('tab', 'library');
      url.searchParams.set('filter', 'difficult');
      message += `<a href="${url.toString()}">📖 Ouvrir Memora (Cartes difficiles)</a>`;
    } catch (e) {
      // Fallback in case APP_URL is totally malformed
      message += `<a href="https://memora.vercel.app/?tab=library&filter=difficult">📖 Ouvrir Memora (Cartes difficiles)</a>`;
    }

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
