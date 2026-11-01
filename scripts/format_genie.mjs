import fs from 'fs';

const content = fs.readFileSync('génie', 'utf8');
const lines = content.split(/\r?\n/);
const qRegex = /^\s*(\d+)\.\s*(.*)/;
const questions = [];
let current = null;

for (let line of lines) {
  const match = line.match(qRegex);
  if (match) {
    if (current) questions.push(current);
    let title = match[2].trim().replace(/\s{2,}[A-Z0-9\-]+$/, '').trim();
    current = { num: parseInt(match[1]), q: title, rawLines: [] };
  } else if (current) {
    current.rawLines.push(line);
  }
}
if (current) questions.push(current);

const cards = questions.map((q) => {
  const filtered = [];
  for (let l of q.rawLines) {
    const trimmed = l.trim();
    if (
      trimmed.startsWith('I-') ||
      trimmed.startsWith('II-') ||
      trimmed.startsWith('III-') ||
      trimmed === 'ARME GENIE'
    ) {
      continue;
    }
    filtered.push(l);
  }

  while (filtered.length > 0 && !filtered[filtered.length - 1].trim()) filtered.pop();
  while (filtered.length > 0 && !filtered[0].trim()) filtered.shift();

  let answer = '';

  if (q.num === 18) {
    answer =
      'TABLEAU COMPARATIF :\n\n' +
      '• Appui au déploiement d’urgence :\n' +
      '- Cadre : Appui Direct\n' +
      '- Situation tactique : Zone d’insécurité\n' +
      '- Délais : Réduits\n' +
      '- Moyens : Du B.Génie (CCG et CFT)\n\n' +
      '• Aide au déploiement de la force :\n' +
      '- Cadre : Appui Général\n' +
      '- Situation tactique : Zone sécurisée\n' +
      '- Délais : Importants\n' +
      '- Moyens : Du Génie spécialiste en infrastructures ESG';
  } else if (q.num === 9) {
    answer =
      'Secourir et Assister la Population sinistrée. Elle peut agir d’une manière Autonome ou Intégrée, comme elle peut participer aux opérations de Dépollution.\n\n' +
      'Elle se compose de (06) compagnies :  (NSN-CLD)\n' +
      '- Commandant\n' +
      '- Officier adjoint\n' +
      '- C. Commandement et services\n' +
      '- C. Lutte contre les incendies\n' +
      '- C. Déblaiement\n' +
      '- C. Sauvetage inondations\n' +
      '- C. NRBC\n' +
      '- C. Neutralisation et destruction d’engins explosifs (NEDEX)';
  } else if (q.num === 14) {
    answer =
      'Le CFQP est une Unité formant corps et administrativement autonome. Il est organisé en : (SMIC)\n' +
      '- Groupement Stagiaires ;\n' +
      '- Groupement des Moyens d’Instruction ;\n' +
      '- Groupement de Commandement et Services.\n\n' +
      'Il assure la formation professionnelle des ODR et la qualification des MDR de l’Arme du Génie et ceux des autres Armes et Services des FAR.';
  } else if (q.num === 16) {
    answer =
      '• Appui à la Mobilité : (ROPOD)\n' +
      '- Rétablir les itinéraires ;\n' +
      '- Ouvrir les axes de progression ;\n' +
      '- Participer à une opération d’Ouverture de brèche ;\n' +
      '- Désengluer une unité.\n\n' +
      '• Participation à la Contre mobilité : (RPDD)\n' +
      '- Réaliser un système d’obstacles planifié ;\n' +
      '- Participer à un Détachement de barrage ;\n' +
      '- Participer à un Détachement héliporté d’intervention du Génie.\n\n' +
      '• Appui au Déploiement d’Urgence : (DRPT)\n' +
      '- Déminer et dépolluer une zone ;\n' +
      '- Réaliser des Plates-formes de déploiement d’urgence ;\n' +
      '- Réaliser des Travaux simples d’infrastructure horizontale et Renforcer sommairement les infrastructures verticales.\n\n' +
      '• Participation au Combat de contact :\n' +
      '- Participer à l’Attaque d’un point fort ou la Saisie d’un ouvrage.\n\n' +
      '• Participation à la Sauvegarde et Protection :\n' +
      '- Réaliser un emplacement de tir et de protection.';
  } else if (q.num === 15) {
    answer =
      '• Missions d’Appui direct : (APAPP)\n' +
      '- Appui à la mobilité ;\n' +
      '- Participation à la contre mobilité ;\n' +
      '- Appui au déploiement d’urgence ;\n' +
      '- Participation au combat de contact ;\n' +
      '- Participation à la sauvegarde et protection.\n\n' +
      '• Missions d’Appui général : (ASRAP)\n' +
      '- Aide au déploiement de la force ;\n' +
      '- Soutien au stationnement de la force ;\n' +
      '- Missions de Recherche de renseignement ;\n' +
      '- Appui au déplacement de la force ;\n' +
      '- Participation aux opérations civilo-militaires.\n\n' +
      '• Missions d’appui aux Franchissements : dans les opérations offensives et défensives.';
  } else {
    const outLines = [];
    for (let l of filtered) {
      let trimmed = l.trim();
      if (!trimmed) {
        outLines.push('');
        continue;
      }
      if (trimmed.startsWith('•')) {
        trimmed = '• ' + trimmed.replace(/^•\s*/, '');
      } else {
        trimmed = trimmed.replace(/^[-*o]\s*/, '- ');
      }
      trimmed = trimmed.replace(/([^\n\r])\s+([➢→*])\s*/g, '$1\n- ');
      trimmed = trimmed.replace(/([^\n\r])\s+-\s+/g, '$1\n- ');
      outLines.push(trimmed);
    }
    answer = outLines.join('\n').trim();
  }

  return {
    id: 'gen' + q.num,
    question: 'Q' + q.num + ' : ' + q.q,
    answer: answer,
  };
});

fs.writeFileSync('scripts/genie_cards_clean.json', JSON.stringify(cards, null, 2), 'utf8');
console.log('✅ Generated polished scripts/genie_cards_clean.json successfully with', cards.length, 'cards');
