import fs from 'fs';

let pushScript = fs.readFileSync('c:\\Users\\DAM\\Desktop\\memora\\scripts\\push_blindee.mjs', 'utf-8');
const newCards = fs.readFileSync('c:\\Users\\DAM\\Desktop\\memora\\scripts\\new_cards.txt', 'utf-8');

pushScript = pushScript.replace(/const CARDS = \[[\s\S]*?\];/, newCards.trim());

fs.writeFileSync('c:\\Users\\DAM\\Desktop\\memora\\scripts\\push_blindee.mjs', pushScript);
console.log('updated push script');
