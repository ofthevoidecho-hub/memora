import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error("Missing environment variables. Please check your GitHub Secrets.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Fetching decks with Telegram reminders enabled...");
  
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

    const difficultCards = cards.filter(c => c.difficulty >= 7 || c.flagged || c.lapses > 1);

    if (difficultCards.length > 0) {
      let message = `📚 <b>Rappels Memora — Questions Difficiles</b>\n\n`;
      
      difficultCards.forEach((c, idx) => {
        message += `<b>${idx + 1}. Q:</b> ${c.question}\n`;
        message += `<b>R:</b> <tg-spoiler>${c.answer}</tg-spoiler>\n\n`;
      });
      
      message += `Prêt à les restituer ? 🔥\n\n`;
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
        console.error(`Failed to send Telegram message: ${response.statusText}`);
      } else {
        console.log(`Successfully sent message.`);
      }
    } else {
      console.log(`No difficult cards for user ${userId} today.`);
    }
  }
}

run();
