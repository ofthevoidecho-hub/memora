import fs from 'fs';

const text = fs.readFileSync('c:\\Users\\DAM\\Desktop\\memora\\blindée', 'utf-8');
const lines = text.split(/\r?\n/);

let currentQ = null;
let currentTitle = '';
let currentAnswer = [];
const cards = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const qMatch = line.trim().match(/^Q(\d+)\s*[:.]\s*(.*)/);
  if (qMatch) {
    if (currentQ) {
      let ans = currentAnswer.join('\n').trim();
      cards.push({ id: 'ab' + currentQ, q: `Q${currentQ} : ` + currentTitle, a: ans });
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
  let ans = currentAnswer.join('\n').trim();
  cards.push({ id: 'ab' + currentQ, q: `Q${currentQ} : ` + currentTitle, a: ans });
}

let out = 'const CARDS = [\n';
for (let i = 0; i < cards.length; i++) {
  const c = cards[i];
  out += `  card('${c.id}', ${JSON.stringify(c.q)},\n    ${JSON.stringify(c.a)},\n    [])${i === cards.length - 1 ? '' : ','}\n`;
}
out += '];\n';

fs.writeFileSync('c:\\Users\\DAM\\Desktop\\memora\\scripts\\new_cards.txt', out);
console.log('Done, wrote ' + cards.length + ' cards');
