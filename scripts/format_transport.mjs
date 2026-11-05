import fs from 'fs';

const content = fs.readFileSync('transmission', 'utf8');
const lines = content.split(/\r?\n/);
const qRegex = /^\s*(\d+)\.\s*(.*)/;
const rawQuestions = [];
let current = null;

for (let line of lines) {
  const match = line.match(qRegex);
  if (match) {
    if (current) rawQuestions.push(current);
    let title = match[2].trim().replace(/\s{2,}[A-Z0-9\-]+$/, '').trim();
    current = { num: parseInt(match[1]), q: title, rawLines: [] };
  } else if (current) {
    current.rawLines.push(line);
  }
}
if (current) rawQuestions.push(current);

// Mnemonics map per question number
const mnemonics = {
  3: 'LGISTIC-MR',
  4: '3M-BAFE',
  10: 'RAS',
  12: 'DADAC',
  15: 'FRRAN',
  17: 'CESS',
  20: 'APPACHE',
  21: 'TAR-M-T',
  23: 'PREF',
  24: 'FGSS',
  40: 'CHMTC-GSST',
  46: '3S-PG',
};

// Section tags map
function getTags(num) {
  const base = ['ATL', 'Transport et Logistique'];
  if (num <= 7) return [...base, 'Organisation', 'Historique'];
  if (num <= 17) return [...base, 'Circulation Routière', 'Missions'];
  if (num <= 23) return [...base, 'Transport', 'Logistique', 'PLGD'];
  if (num <= 28) return [...base, 'Missions Particulières'];
  if (num <= 32) return [...base, 'Emploi', 'Caractéristiques'];
  return [...base, 'Unités', 'Structures et Moyens'];
}

const cards = rawQuestions.map((q) => {
  // Filter out section headers
  const filtered = [];
  for (let l of q.rawLines) {
    let trimmed = l.trim();
    if (
      trimmed.startsWith('I-') ||
      trimmed.startsWith('II-') ||
      trimmed.startsWith('III-') ||
      trimmed.startsWith('A. Circulation') ||
      trimmed.startsWith('B. Transport') ||
      trimmed.startsWith('C. Missions particulières') ||
      trimmed.startsWith('A. Emploi et') ||
      trimmed.startsWith('B. Moyens et') ||
      trimmed === 'ARME TRANSPORT ET LOGISTIQUE'
    ) {
      continue;
    }
    // Remove standalone mnemonics at end of lines
    trimmed = trimmed.replace(/\s{2,}(LGISTIC-MR|3M-BAFE|RAS|DADAC|FRRAN|CESS|APPACHE|TAR-M-T|PREF|FGSS|CHMTC-GSST|3S-PG)$/, '');
    filtered.push(trimmed);
  }

  // Trim empty lines top and bottom
  while (filtered.length > 0 && !filtered[filtered.length - 1].trim()) filtered.pop();
  while (filtered.length > 0 && !filtered[0].trim()) filtered.shift();

  let answer = '';

  // Custom formatting for specific questions for optimal readability
  if (q.num === 3) {
    answer =
      'Structure de l’Inspection de l\'ATL : (LGISTIC-MR)\n\n' +
      '- Div Liaisons Etudes et Planification ;\n' +
      '- Div Gestion Courrier et Documents ;\n' +
      '- Div Informatique ;\n' +
      '- Div Soutien Adapté ;\n' +
      '- Div Technique ;\n' +
      '- Div Instruction ;\n' +
      '- Div Conduite, Prévention et Sécurité Routières ;\n' +
      '- Div MCPO ;\n' +
      '- Div Ressources Humaines.';
  } else if (q.num === 4) {
    answer =
      'Attributions de l’Inspection de l\'ATL : (3M-BAFE)\n\n' +
      '- Mettre l\'Arme en condition ;\n' +
      '- Maintenir les unités de l\'Arme à leur niveau opérationnel optimum ;\n' +
      '- Mettre les équipements en place ;\n' +
      '- Planifier les Besoins en Hommes et en Matériels ;\n' +
      '- Application de la Décision d\'emploi de l\'Arme ;\n' +
      '- Fonctionnement de l\'Arme ;\n' +
      '- Planifier l\'Exécution des Décisions relatives à l\'Arme.';
  } else if (q.num === 8) {
    answer =
      'L’action des unités de circulation est prépondérante dès l’entrée sur le théâtre. Elles contribuent à :\n' +
      '- Accueil des forces ;\n' +
      '- Intégration des forces projetées ;\n' +
      '- Appui des mouvements opérationnels.\n\n' +
      'L’emploi des unités de circulation est généralement Centralisé par le chef IA du niveau considéré. Toutefois, l’exécution peut être décentralisée aux niveaux subordonnés pour certaines phases.';
  } else if (q.num === 10) {
    answer =
      'Missions des Unités de circulation routière : (RAS)\n\n' +
      '- Missions de Renseignement ;\n' +
      '- Missions d’Appui aux mouvements ;\n' +
      '- Participation aux missions de Sûreté.';
  } else if (q.num === 12) {
    answer =
      'Le Renseignement des Unités de circulation routière porte sur : (DADAC)\n\n' +
      '- Déroulement des mouvements ;\n' +
      '- Attitude de la population ;\n' +
      '- Déploiement des PC, des Unités et des Bases Logistiques ;\n' +
      '- Activités des forces en présence (amies ou ennemies) ;\n' +
      '- Conditions d’utilisation et d’équipement des itinéraires.';
  } else if (q.num === 13) {
    answer =
      '- Reconnaître un itinéraire ou une zone : Chercher, au profit du commandement et des autres unités, des renseignements d\'ordre tactique ou technique.\n' +
      '- Mettre en œuvre une Ligne de Contrôle : Recueillir, au profit du commandement, dans des conditions lieu et temps fixées, des renseignements sur le déroulement des déplacements.';
  } else if (q.num === 15) {
    answer =
      'Missions dans le cadre d’Appui au mouvement : (FRRAN)\n\n' +
      '- Appuyer un Franchissement de coupure ou d’obstacle ;\n' +
      '- Régulation des mouvements et transports ;\n' +
      '- Participer à une Relève ;\n' +
      '- Appuyer les mouvements d’une unité ;\n' +
      '- Intervenir suite à un incident NRBC.';
  } else if (q.num === 17) {
    answer =
      'Missions de Sûreté auxquelles participent les Unités de circulation routière : (CESS)\n\n' +
      '- Contrôle d’une zone ;\n' +
      '- Escorte d’un convoi ;\n' +
      '- Mission de Surveillance ;\n' +
      '- Sécurisation d’un axe logistique.';
  } else if (q.num === 20) {
    answer =
      'Missions des Formations de Transport : (APPACHE)\n\n' +
      '• Appui à la mobilité :\n' +
      '- Acheminer des unités à engins lourds ;\n' +
      '- Participer à l’évacuation des matériels.\n\n' +
      '• Acheminement Logistique par voie terrestre.';
  } else if (q.num === 21) {
    answer =
      'Actions lors de l’Acheminement Logistique par voie terrestre : (TAR-M-T)\n\n' +
      '• Au profit de certaines Formations :\n' +
      '- Transporter les CDI de certaines Unités (GAR en particulier) ;\n' +
      '- Appui à la mobilité au profit des unités chenillées (Blindée, Artillerie, Génie…) ;\n' +
      '- Renforcer une Formation pendant tout ou partie de ses mouvements.\n\n' +
      '• Au sein d\'un « Système logistique » :\n' +
      '- Participer à la Manœuvre des ravitaillements par voie routière.\n\n' +
      '• Au profit des Populations sinistrées :\n' +
      '- Transporter et évacuer des populations sinistrées.';
  } else if (q.num === 23) {
    answer =
      'L’intégration de la PLGD à la chaîne logistique permet de : (PREF)\n\n' +
      '- Préserver le potentiel humain et autochars des unités soutenues ;\n' +
      '- Rationaliser les coûts de transport ;\n' +
      '- Eviter les contraintes liées au transport individuel et organique des appros ;\n' +
      '- Faciliter la planification en amont des acheminements.';
  } else if (q.num === 24) {
    answer =
      'Missions Particulières de l’ATL : (FGSS)\n\n' +
      '- Formation des conducteurs ;\n' +
      '- Gardiennage des sites ONEE ;\n' +
      '- Soutien aux Etats-Majors ;\n' +
      '- Soutien à l’ONCF.';
  } else if (q.num === 26) {
    answer =
      'Assurer au profit de l’EMG ainsi que des EM/ZS et ZE, des Secteurs, S/Secteurs et Places d’Armes :\n' +
      '- Soutien Humain ;\n' +
      '- Soutien Matériel ;\n' +
      '- Soutien Administratif ;\n' +
      '- Mise sur pied d’un Détachement Hors Rang ;\n' +
      '- Garde et protection.';
  } else if (q.num === 27) {
    answer =
      'A travers un détachement de militaires de l’Arme auprès de l’ONCF. Il consiste à :\n\n' +
      '• En temps normal :\n' +
      '- Participer au Transport du phosphate, marchandises et voyageurs ;\n' +
      '- Participer à la Sécurité de la circulation des trains.\n\n' +
      '• En temps de crise :\n' +
      '- Permettre à l’ONCF d’assurer le service minimum et la continuité du transport ferroviaire stratégique et la sécurité de la circulation des trains.';
  } else if (q.num === 28) {
    answer =
      '- Conduite ;\n' +
      '- Sécurité et circulation ;\n' +
      '- Maintenance et manœuvre.';
  } else if (q.num === 31) {
    answer =
      '• Souplesse d\'emploi : unités dotées d\'une grande autonomie d\'action et peuvent facilement être adaptées à la nature de la mission ;\n\n' +
      '• Fiabilité : véhicules tous chemins utilisables en tout temps et sur tous les itinéraires.';
  } else if (q.num === 33) {
    answer =
      '• Unités de Transport :\n' +
      '- Groupes de Transport (GT) ;\n' +
      '- Groupe Engin Lourd de Transport (GELT) ;\n' +
      '- Groupe de Soutien du Transport (GST).\n\n' +
      '• Unités de Soutien aux Etats-Majors :\n' +
      '- Bataillon du Quartier Général (BQG) ;\n' +
      '- Bataillon de soutien de Théâtre (BSTH) ;\n' +
      '- Bataillon de Soutien Local (BSL) ;\n' +
      '- Bataillon de Soutien de Secteur (BSS).\n\n' +
      '• Unités de Formation :\n' +
      '- Ecole Royale du Transport et de la Logistique (ERTL) ;\n' +
      '- Centre de Formation des Conducteurs (CFC).';
  } else if (q.num === 34) {
    answer =
      'Unité formant Corps et administrativement autonome, à vocation transport et circulation :\n\n' +
      '- 01 Esc Commandement et Services (ECS) ;\n' +
      '- 01 Esc Transport (ET) ;\n' +
      '- 01 Esc Engins Lourds Transport (EELT) ;\n' +
      '- 01 Esc Circulation Routière (ECR) ;\n' +
      '- 01 Esc Transport Mixte ;\n' +
      '- 01 CFQC ;\n' +
      '- Des PLGD.';
  } else if (q.num === 35) {
    answer =
      '• Transport :\n' +
      '- Fret : 780T de matériels divers et 1200 militaires.\n' +
      '- Produits liquides : 360T de carburants et d\'eau.\n' +
      '- Par autocars : 1200 permissionnaires.\n\n' +
      '• Appui à la mobilité (avec 28 Porte-chars) :\n' +
      '- Une Bde Blindée en (04) rotations.\n' +
      '- Un RRC ou Une Compagnie de Travaux du Génie en (02) rotations.\n' +
      '- Un GAR en (01) rotation.\n\n' +
      '• Circulation Routière (Escadron à 03 Pelotons de Circulation Routière) :\n' +
      '- Appuyer les mouvements d\'un GF sur une distance de 100 à 150 km.\n' +
      '- Reconnaitre et signaler 120 à 160 km d\'itinéraire en 2H.\n' +
      '- Baliser 30 km d\'itinéraire en 3H.\n' +
      '- Fournir le support de 03 Postes de Régulation.\n' +
      '- Mettre en œuvre une Ligne de Contrôle.\n' +
      '- Participer à d’autres missions (Franchissements, Recueil, Sûreté).';
  } else if (q.num === 36) {
    answer =
      'Unité formant Corps et administrativement autonome à vocation appui à la mobilité :\n\n' +
      '- 01 Esc Commandement et Services (ECS) ;\n' +
      '- 01 Esc Transport (ET) ;\n' +
      '- 03 Esc Engins Lourds Transport (EELT) ;\n' +
      '- 01 Esc Circulation Routière (ECR) ;\n' +
      '- 01 CFQC ;\n' +
      '- Des PLGD.';
  } else if (q.num === 37) {
    answer =
      'Le GELT peut assurer des missions similaires au GT, à l’exception du transport mixte. Pour l’appui à la mobilité, sa capacité est 3 fois plus importante :\n\n' +
      '• Transport de Fret : Doté de 60 camions de 5T, il est capable de transporter 300T de matériels divers ou 1200 militaires.\n\n' +
      '• Appui à la mobilité (avec 84 Porte-chars) :\n' +
      '- Une Bde Blindée en (02) rotations ;\n' +
      '- Un RRC, un GAR ou une Compagnie de Travaux du Génie en (01) rotation.';
  } else if (q.num === 38) {
    answer =
      'Unité formant Corps et administrativement autonome, destinée à un soutien particulier :\n\n' +
      '- 01 Escadron Commandement et Services (ECS) ;\n' +
      '- 02 Escadrons Transport Adaptés (ETA) ;\n' +
      '- 02 Escadrons Soutien Particulier (ESP).';
  } else if (q.num === 39) {
    answer =
      'Doté d’une panoplie de moyens (camions, autocars…), le GST peut assurer :\n\n' +
      '- Soutien administratif et logistique du personnel en affectation particulière ;\n' +
      '- Transport en réserve pour les missions particulières ;\n' +
      '- Eventuellement, l’Accompagnement et Escorte des convois lors des missions particulières.';
  } else if (q.num === 40) {
    answer =
      'Chargé du soutien de l’EMG, le BQG est une unité formant Corps et administrativement autonome : (CHMTC-GSST)\n\n' +
      '- 01 Cnie Commandement et Sces ;\n' +
      '- 01 Cnie Hors Rang ;\n' +
      '- 01 Cnie Musique ;\n' +
      '- 01 Cnie Transport ;\n' +
      '- 01 Cnie Casernement ;\n' +
      '- 04 Cnies Garde Protection ;\n' +
      '- 03 Cnies Soutien ;\n' +
      '- Des Sces Techniques.';
  } else if (q.num === 42) {
    answer =
      'Unité formant Corps et administrativement autonome :\n\n' +
      '- 01 Dét Commandement et Services ;\n' +
      '- 01 Dét Soutien de Secteur ;\n' +
      '- 01 Dét Soutien de Place d\'Armes ;\n' +
      '- 01 Dét Soutien Cercle Mess Officiers ;\n' +
      '- 03 Déts Protection et Garde.';
  } else if (q.num === 44) {
    answer =
      'Unité formant Corps et administrativement autonome, il soutient les EM des Secteurs et des Places d’Armes. Il est organisé en :\n\n' +
      '- 01 Dét Commandement et Services ;\n' +
      '- 01 Dét Soutien de Secteur ;\n' +
      '- 01 Dét Soutien de Place d\'Armes ;\n' +
      '- 01 Dét Soutien Cercle Mess Officiers ;\n' +
      '- 01 Dét Protection et Garde.';
  } else if (q.num === 45) {
    answer =
      'Unité formant Corps et administrativement autonome :\n\n' +
      '- 01 Dét Commandement et Services ;\n' +
      '- 01 Dét Soutien de Place d’Armes ;\n' +
      '- 01 Dét Soutien Cercle Mess officiers ;\n' +
      '- 01 Dét Protection et Garde.';
  } else if (q.num === 46) {
    answer =
      'Unité de Soutien des Places d\'Armes et des EM des Secteurs, le BSL assure : (3S-PG)\n\n' +
      '- Soutien humain et matériel du Cdt d’Armes Délégué ;\n' +
      '- Soutien administratif ;\n' +
      '- Participation aux missions de Secours des populations sinistrées ;\n' +
      '- Missions de Police et de contrôle de la circulation militaire et accompagnement des convois ;\n' +
      '- Gardiennage des sites majeurs de l’ONEE.';
  } else if (q.num === 47) {
    answer =
      '- 01 Grpt Commandement et Services ;\n' +
      '- 01 Grpt Stagiaires Formation Arme ;\n' +
      '- 01 Grpt Stagiaires Ecole Conduite et Prévention Routière ;\n' +
      '- 01 Grpt Moyens Instruction ;\n' +
      '- 01 Direction Formation ;\n' +
      '- 01 Direction Etudes et Contrôle.';
  } else if (q.num === 48) {
    answer =
      '- Formation continue des cadres de l\'Arme ;\n' +
      '- Formation en conduite automobile, par l’organisation des stages ci-après :\n' +
      '  • Officiers de Prévention et Sécurité Routières (OPSR) et d’éducateurs en PSR et auxiliaires ;\n' +
      '  • Formation d’offs formateurs (Chef de Centre de Formation de Conduite) et moniteurs ;\n' +
      '  • Formation des conducteurs toutes catégories confondues au profit des unités ZN ;\n' +
      '  • Organisation des séminaires et des campagnes de Prévention et de Sécurité Routières.';
  } else if (q.num === 49) {
    answer =
      '- 01 Groupement Commandement et Services ;\n' +
      '- 01 Peloton Ecole Conduite ;\n' +
      '- 01 Peloton Conduite et Simulation ;\n' +
      '- 01 Peloton Prévention et Sécurité Routières.';
  } else {
    // Standard cleaning for remaining questions (1, 2, 5, 6, 7, 9, 11, 14, 16, 18, 19, 22, 25, 29, 30, 32, 41, 43, 50)
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
    id: 'atl' + q.num,
    num: q.num,
    question: 'Q' + q.num + ' : ' + q.q,
    answer: answer,
    tags: getTags(q.num),
  };
});

fs.writeFileSync('scripts/transport_cards_clean.json', JSON.stringify(cards, null, 2), 'utf8');
console.log(`✅ Généré avec succès scripts/transport_cards_clean.json (${cards.length} cartes).`);

