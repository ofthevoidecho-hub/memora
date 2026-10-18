// scripts/push_force_aerienne.mjs
// Pousse le deck "Force Aérienne" et ses 69 cartes dans la base de données Supabase
// Fidèle au texte intégral du document de cours "FRA - PRÉPARATION CEM"

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rwcdvoliowjmoaunarod.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y2R2b2xpb3dqbW9hdW5hcm9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYwNjE4OCwiZXhwIjoyMTAyMTgyMTg4fQ.yOQm8Ujs_QU4PrkCLVFARTg-Is6lt-nWgY_RmFuEn7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DECK_ID = 'deck-force-aerienne';
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
  title: 'Force Aérienne',
  description: 'Préparation CEM (FRA) : Définitions, C2, Opérations aériennes (CAO, OCA, DCA, AI, CAS, TASMO, Soutien) et emploi des composantes (chasse, reco, transport, hélicos, drones).',
  folder: 'Forces Royales Air',
  color: 'sky',
  icon: 'Plane',
  telegram_reminder_enabled: true,
  created_at: now,
};

const CARDS = [
  // ==========================================
  // SECTION 1 : GÉNÉRALITÉS & COMPOSITION (Q1 - Q5)
  // ==========================================
  card(
    'fa1',
    '1. Définir les Forces Aériennes :',
    `Les **FA** sont celles dont l'emploi requiert l'**utilisation du milieu aérien**. Elles comprennent, en outre, tout ce qui sert à la **mise en œuvre** et au **soutien**.

Elles disposent de vecteurs capables de se déplacer dans les **trois dimensions** sans être astreints à suivre une trajectoire préétablie.

Les vecteurs des autres Armées répondant à cette définition font partie des forces aériennes, bien que leur emploi puisse concerner uniquement les **forces de surface**.`,
    ['Forces Aériennes', 'Définition']
  ),

  card(
    'fa2',
    '2. Donner la composition des Forces Aériennes : DAM',
    `**DAM** :

❖ **Forces de défense aériennes (FDA)** chargées de :
➢ Évaluer la menace et diffuser l'alerte ;
➢ Garantir la souveraineté du pays dans l'espace aérien national et assurer la défense aérienne du territoire en priorité dans les zones les plus sensibles.

❖ **Forces aériennes tactiques (FAT)** chargées de :
➢ Rechercher et exploiter le renseignement à vue, photographique et électronique ;
➢ Mener des actions de guerre électronique et participer à la mission de défense aérienne ;
➢ Attaquer le potentiel militaire adverse (au sol et en vol) et fournir l'appui aérien rapproché et éloigné des forces terrestres.

❖ **Transport aérien militaire (TAM)** chargé de :
➢ Participer au soutien logistique des forces armées ;
➢ Participer aux opérations tactiques combinées ;
➢ Fournir l'appui transport aux forces de surface ;
➢ Participer au redéploiement des unités des forces aériennes ;
➢ Participer à l'acheminement des forces d'assistance rapide et assurer leur appui transport.`,
    ['Forces Aériennes', 'Composition', 'DAM']
  ),

  card(
    'fa3',
    '3. Donner la composition des Forces Aériennes Tactique (FAT) : ODSOU',
    `**ODSOU** :

➢ **Moyens Offensifs** : chasseurs-bombardiers, et parfois des bombardiers légers ;
➢ **Moyens Défensifs** : chasseurs, missiles S/A, artillerie S/A, stations de détection et de contrôle et AWACS ;
➢ **Moyens de Support** : transport aérien tactique, Avions de reconnaissance, de GE, ravitailleurs en vol ;
➢ **Organismes de commandement et de contrôle** : assurer la coopération avec les autres forces ;
➢ **Unités de support administratif et logistique**.`,
    ['Forces Aériennes Tactiques', 'FAT', 'Composition', 'ODSOU']
  ),

  card(
    'fa4',
    "4. Quels sont les types d'opérations aériennes ? SATNS",
    `**SATNS** :

➢ **Opérations Aériennes Stratégiques** (*Strategic Air Operations*).

➢ **Opérations Contre les Moyens Aériens ENIs (CAO)** :
  - Opérations d’opposition Aérienne Offensive (**OCA**) ;
  - Opérations d’opposition Aérienne Défensive (**DCA**).

➢ **Opérations Contre les Forces Terrestres ENIs** (*ASFAO in a land environment*) :
  - Interdiction (**AI**) ;
  - Appui aérien rapproché (**CAS**).

➢ **Opérations Contre les Forces Navales** (*ASFAO in a maritime environment*) :
  - Contre les forces de surface (*Anti-Surface Warfare*) ;
  - Contre les sous-marins (*Anti-Submarine Warfare*).

➢ **Opérations de Support : TRIG**
  - **I**STAR ;
  - **G**uerre électronique ;
  - **T**ransport aérien ;
  - **R**avitaillement en vol.

➢ **Opérations Spéciales : CS**
  - Airborne Command and Control (**C**) ;
  - SAR / CSAR (**S**).`,
    ['Opérations Aériennes', 'Typologie', 'SATNS']
  ),

  card(
    'fa5',
    '5. Le principe de base de la mise en œuvre de la puissance aérienne.',
    `La recherche constante d’une **situation favorable** permettant aux forces amies d’**utiliser l’espace aérien** tout en l’**interdisant à l’ennemi**.`,
    ['Puissance Aérienne', 'Principe de Base']
  ),

  // ==========================================
  // SECTION 2 : COMMANDEMENT ET CONTRÔLE (Q6 - Q8)
  // ==========================================
  card(
    'fa6',
    '6. Définir Commandement centralisé, exécution décentralisée :',
    `Les forces aériennes manquent souvent de ressources suffisantes pour répondre simultanément à tous les besoins opérationnels.

Pour optimiser l’emploi, le potentiel et l’efficacité :
- Un **commandement centralisé** est nécessaire pour concentrer les efforts et mener un effort aérien cohérent ;
- Une **exécution décentralisée** permet aux commandants subordonnés d'**agir avec flexibilité** dans la réalisation des objectifs qui leur ont été fixés.`,
    ['C2', 'Commandement', 'Décentralisation']
  ),

  card(
    'fa7',
    '7. Quels sont les niveaux de commandement et de contrôle ?',
    `➢ **Détachement pour emploi (Allotment)** : Affectations temporaires entre commandements subordonnés pour équilibrer les forces, sous le commandement opérationnel « OPCON ».

➢ **Répartition des ressources (Apportionment)** : Prérogative du « Commandant interarmées / Joint commander ». Consiste à l'attribution du pourcentage de l'effort global à consacrer aux différentes opérations et/ou secteurs pendant une durée déterminée.

➢ **Attribution des ressources (Allocation)** : Traduction en nombre de sorties de l’Apportionment en sorties par type d’avion et mission.

➢ **Attribution des missions (Tasking)** : La traduction de « l’allocation » sous forme d'Ordres détaillés destinés à chaque unité pour l’exécution des missions.`,
    ['C2', 'Niveaux de Commandement', 'Allotment', 'Apportionment', 'Allocation', 'Tasking']
  ),

  card(
    'fa8',
    "8. Facteurs à respecter lors du Processus « d'allotment / apportionment / allocation » :",
    `➢ L'**objectif** à atteindre ;
➢ La **nature du conflit** et la menace ;
➢ Les **capacités opérationnelles** et les limitations de tous les systèmes d’armes ;
➢ La présence du **support logistique** ;
➢ Les **contraintes politiques** éventuelles.`,
    ['C2', 'Processus de Planification', 'Facteurs']
  ),

  // ==========================================
  // SECTION 3 : OPÉRATIONS D'OPPOSITION AÉRIENNE (CAO) (Q9 - Q21)
  // ==========================================
  card(
    'fa9',
    '9. Quels sont les trois degrés de contrôle de l’air ?',
    `Les Opérations d’oppositions aériennes (CAO) sont menées en vue d’obtenir et de maintenir le degré de contrôle de l’air requis. On distingue :

➢ **Situation aérienne Favorable** : L’effort aérien fourni par l’ennemi est insuffisant pour porter atteinte aux opérations terrestres, aériennes ou maritimes de la seconde.

➢ **Supériorité aérienne** : Degré de maîtrise de la bataille aérienne qui permet à une force d’effectuer des opérations aériennes, terrestres ou maritimes, à un moment et en un lieu donné, sans intervention prohibitive de la seconde.

➢ **Maîtrise de l’air** : Degré de supériorité aérienne à partir duquel les forces aériennes adverses sont incapables d’intervenir efficacement.`,
    ['Contrôle de l’Air', 'CAO', 'Supériorité Aérienne']
  ),

  card(
    'fa10',
    '10. Définir Les Opérations d’oppositions aériennes CAO.',
    `Les opérations d’opposition aérienne (**Counter Air Operations – CAO**) sont divisées en :
➢ Opérations d’opposition aérienne défensive (**DCA**) ;
➢ Opérations d’opposition aérienne offensive (**OCA**).

• **Missions de DCA** : incluent l’emploi des systèmes de défense actifs (chasseurs, SAM, AAA) complétés par des mesures de défense passives. Elles s’effectuent principalement au-dessus du territoire ami et sont liées à l’initiative ennemie.

• **Opérations OCA** : comprennent la destruction ou la neutralisation des FA ennemies au-dessus du territoire ennemi. Elles sont menées à l’initiative des forces amies.`,
    ['CAO', 'OCA', 'DCA', 'Définition']
  ),

  card(
    'fa11',
    '11. Quelle est la relation entre CAO offensifs et défensifs ?',
    `Les CAO comprennent des actions offensives (OCA) et des actions défensives (DCA) qui sont **étroitement liées**. Ce sont des actions différentes qui visent la **conquête de la supériorité aérienne**.

L'importance à consacrer aux unes plutôt qu'aux autres dépendra de la situation tactique.

Il est dès lors essentiel que la responsabilité des opérations d'opposition aérienne réside dans les mains d'**un seul commandant aérien** qui planifie et contrôle l'ensemble des activités d'opposition aérienne.`,
    ['CAO', 'OCA', 'DCA', 'Relation']
  ),

  card(
    'fa12',
    '12. Définir Les Opérations Aériennes Offensives OCA.',
    `Les opérations **OCA** sont celles menées pour **détruire, désorganiser ou limiter le potentiel aérien ennemi** aussi près que possible de sa source (si possible au sol).

Les forces de surface peuvent aussi contribuer aux missions OCA.`,
    ['OCA', 'Définition']
  ),

  card(
    'fa13',
    '13. Quels sont missions offensives de l’OCA (Offensive Counter Air) ?',
    `➢ **Attaque aérienne (Counter Air Attack)** : (effectuée par les bombardiers) dans le but de neutraliser les moyens aériens ENI au sol.

➢ **Chasse offensive (Fighter Sweep)** : vise à rechercher et à détruire les avions ennemis au-dessus de leur territoire.

➢ **Escorte (Fighter Escort)** : accompagner des avions bombardiers dans l’exécution de leur mission en territoire ennemi pour les protéger des chasseurs ennemis.

➢ **Élimination des défenses aériennes ENIs (SEAD)** : neutraliser, détruire ou éliminer temporairement la défense sol-air ennemie, par moyens physiques ou électroniques.`,
    ['OCA', 'Missions Offensives', 'SEAD', 'Fighter Sweep']
  ),

  card(
    'fa14',
    '14. Comment sont conduites les opérations l’OCA ?',
    `➢ **Direction** : Commandant des FA (**JFACC**) qui détermine les priorités et les objectifs de l’OCA et les traduit en moyens alloués à l'OCA.

➢ **Planification selon PMC** :
  - *Considérations politiques* : pour éviter toute escalade non voulue ;
  - *Considérations militaires* : par analyse du rapport entre les résultats possibles et les pertes éventuelles ;
  - *Choix des objectifs* : chaque objectif est assorti d’un degré de priorité déterminé.

➢ **Attributions des missions (Tasking)** : Traduire la planification en ordres d’actions, en détaillant unités concernées, objectifs et moyens.

➢ **Contrôle et coordination** : Les OCA se déroulent hors de portée des systèmes de contrôle amis au sol. D’où la nécessité d’alerte précoce (*Air Earlier Warning*) et du contrôle par des PC aériens (*Airborne Control Systems*).`,
    ['OCA', 'Conduite', 'JFACC', 'PMC']
  ),

  card(
    'fa15',
    '15. Quelles sont les Opérations de support (appui) de l’OCA ? IGR',
    `Les opérations OCA sont souvent appuyées par (**IGR**) :

➢ **I - ISTAR** : en temps de paix et après attaque « *Post Strike Recce* » ;
➢ **G - Guerre électronique (EW)** : *Stand-Off* ou *Escort jamming* ;
➢ **R - Ravitaillement en vol (AAR)** : augmente l’autonomie et le rayon d’action.`,
    ['OCA', 'Support', 'IGR', 'ISTAR', 'EW', 'AAR']
  ),

  card(
    'fa16',
    '16. Quelles sont les caractéristiques des moyens des OCA (AI) ?',
    `➢ **Grand rayon d’action** ;
➢ **Bonne capacité de pénétration** ;
➢ **Capacité d’emport adéquate** ;
➢ **Capacité tout temps** ;
➢ **Grande précision**.`,
    ['OCA', 'Caractéristiques', 'Moyens']
  ),

  card(
    'fa17',
    '17. Quelles sont les objectifs traités en OCA ? 2SAID',
    `**2SAID** :

➢ **S - Systèmes d’armes** (*Air Weapons Systems*) : Avion à découvert et avion protégé (HAS) ;
➢ **A - Aérodromes**, bases d’opérations et porte-avions ;
➢ **I - Installations C3** ;
➢ **D - Défense Aérienne ennemie** ;
➢ **S - Systèmes de guerre électronique** / *Electronic Warfare* (EW).`,
    ['OCA', 'Objectifs', '2SAID']
  ),

  card(
    'fa18',
    '18. Comment sont menées les opérations DCA ?',
    `Les opérations de DCA sont menées **en réaction à des actions aériennes hostiles**. Elles supposent une préparation constante pour une menace multiforme et peuvent être menées de deux manières :

➢ D’abord, **Limiter les pertes amies** ;
➢ **Rendre impossibles les opérations de l’ennemi**, en lui infligeant une **attrition maximale**.`,
    ['DCA', 'Conduite', 'Opérations Défensives']
  ),

  card(
    'fa19',
    '19. Quels sont les Moyens utilisés pour la (DCA) ? MASE',
    `**MASE** :

➢ **M - Moyens d’alerte** (EW) ;
➢ **A - Avions de Chasse** ;
➢ **S - Système de défense sol-air (GBAD)** adaptés aux différentes altitudes et portées ;
➢ **E - Effets de la guerre électronique**.`,
    ['DCA', 'Moyens', 'MASE', 'GBAD']
  ),

  card(
    'fa20',
    '20. Quelle est la mission spécifique de la DCA ?',
    `La mission spécifique de la défense aérienne consiste à **annuler ou à réduire l'efficacité et les effets des opérations aériennes ennemies**, afin de **préserver le potentiel national ou ami**.`,
    ['DCA', 'Mission Spécifique']
  ),

  card(
    'fa21',
    '21. Quels sont les deux volets du (DCA) ? Quel est le double but de la DCA ?',
    `La mission spécifique de la DCA se traduit par un double but :

➢ **DA Active** : Englobe les **actions défensives directes** visant à arrêter les avions et engins ennemis en vol. Ceci inclut la mise en œuvre de tous les systèmes d’armes de défense ainsi que la guerre électronique.

➢ **DA Passive** : Englobe **toute autre action**, sauf celles de la DA active, visant à prévenir et à réduire les effets et l’efficacité des actions aériennes hostiles (*dispersion, déception, constructions de protection, etc.*).`,
    ['DCA', 'DA Active', 'DA Passive', 'Double But']
  ),

  // ==========================================
  // SECTION 4 : OPÉRATIONS CONTRE LES FORCES DE SURFACE (Q22 - Q38)
  // ==========================================
  card(
    'fa22',
    '22. Quels sont les opérations aériennes contre les forces de surface ?',
    `➢ **Opérations aériennes d’interdiction** (*Air Interdiction* - **AI**) ;
➢ **Opérations d’appui aérien rapproché** (*Close Air Support* - **CAS**).`,
    ['Forces de Surface', 'Opérations Aériennes', 'AI', 'CAS']
  ),

  card(
    'fa23',
    '23. Quel est le but des opérations aériennes d’interdiction ?',
    `Les opérations d’interdiction visent à **détruire, neutraliser ou retarder le potentiel militaire ennemi avant qu’il ne soit engagé contre les propres amies**.

La coordination des feux et mouvements **n'est pas nécessaire**.`,
    ['Interdiction Aérienne', 'AI', 'But']
  ),

  card(
    'fa24',
    '24. Quelle est l’importance de l’AI ?',
    `L’AI vise à **désorganiser les mouvements induits par les opérations militaires ennemies** par la destruction de l’infrastructure, des moyens de transport ou des réserves ENI, afin de **rendre intenable la position de ses troupes au combat**.

Il est plus facile et économique de détruire des objectifs **à la source** que lorsqu'ils sont déployés au front.`,
    ['Interdiction Aérienne', 'AI', 'Importance']
  ),

  card(
    'fa25',
    '25. Comment sont conduites les opérations AI ? En parlant des considérations de planification ? 2E PO CPC',
    `➢ **Direction** : C'est le Commandant de la force aérienne qui décidera, en fonction des directives du Chef de la Force interarmées, quelle priorité il faudra accorder au programme (AI) et quels en seront les buts (avec quels moyens, quand et de quelle façon).

➢ **Planning (Considérations) 2E PO CPC** :
  - **C**onsidérations politiques : des restrictions sont imposées sur les types d'objectifs afin d'éviter toute escalade non désirée ;
  - **P**lanning interarmées FA-FT : se fait au niveau opérationnel au sein d’une cellule jointe, la *Joint Air Interdiction Cell* (**JAIC**) ;
  - **C**hoix des objectifs : basé sur les données les plus récentes de la situation du combat. À chaque objectif est accordé un degré de priorité déterminé ;
  - **P**ression sur l'ENI : assurée par la FT pour forcer l’ENI à consommer le maximum en parallèle avec l’AI ;
  - **O**pérations tout temps : continuité des opérations pour empêcher l’ENI de reprendre son approvisionnement ;
  - **E**xploitation rapide : l'interruption de la cadence régulière du trafic sur les axes de communications entraîne une désorganisation fournissant des objectifs supplémentaires exploitables pendant un moment court ;
  - **E**ntretien de l'opération AI : maintenir le degré d'AI quand il est atteint.

➢ **Tasking** : Se fait de façon identique à celui des opérations OCA. Le commandement des forces aériennes détermine les priorités et les objectifs de l’AI et les traduit en moyens alloués à l’AI.

➢ **Exécution** : Attack, RECCE armée, Missions pré-planifiées et immédiates.

➢ **Contrôle et coordination** : Similaire aux opérations OCA, mais l’interdiction aérienne (AI) exige un **C3 renforcé** pour une désignation rapide des cibles mobiles.`,
    ['AI', 'Conduite', 'Planification', '2E PO CPC', 'JAIC']
  ),

  card(
    'fa26',
    '26. Quels sont les types de missions de l’interdiction aérienne ? AR',
    `**AR** :

➢ **A - Attaque** : (bombardiers, missiles sol-sol ou de croisière) contre des objectifs souvent statiques et généralement choisis à l'avance tels que :
  - Les axes de communication ;
  - Centres de transmissions, EM ;
  - Concentrations de troupes, d'approvisionnement et de matériel.

➢ **R - Reconnaissance armée** : rechercher et attaquer les **objectifs de fortune** souvent mobiles le long d'un axe ou dans une zone définie à l’avance.`,
    ['AI', 'Types de Missions', 'AR', 'Attaque', 'Reconnaissance Armée']
  ),

  card(
    'fa27',
    '27. Comment sont classées les missions AI selon le critère de planification ?',
    `➢ **Missions pré-planifiées** : permettent une planification, l’armement peut être choisi en fonction de l'objectif, et les pilotes seront très bien informés de la tâche qui leur incombe.

➢ **Missions immédiates** : ne permettent pas un planning détaillé, l'armement emporté ne sera pas nécessairement adapté aux objectifs et les pilotes disposeront de moins de temps pour préparer leur mission.`,
    ['AI', 'Classification', 'Pré-planifiées', 'Immédiates']
  ),

  card(
    'fa28',
    '28. Quels sont les Opérations de support aux missions AI ?',
    `➢ Similaires aux missions **OCA** (*Offensive Counter Air*).
➢ Incluent :
  - **Reconnaissance** ;
  - **Guerre électronique** ;
  - **Ravitaillement en vol** ;
  - **SEAD** (OCA).`,
    ['AI', 'Support', 'Reconnaissance', 'SEAD']
  ),

  card(
    'fa29',
    '29. Quels sont les Objectifs traités des missions AI ?',
    `➢ **Objectifs Fixes** :
  - Axes (*voies ferrées, routes, rivières, oléoducs*) ;
  - Points de passage (*cols, détroits, ponts*) ;
  - Points de concentration (*dépôts, gares*) ;
  - Installations C3.

➢ **Objectifs Mobiles** :
  - Troupes avec équipements, matériel et produits de consommation ;
  - Moyens de transport (*terrestres, navals, aériens*).`,
    ['AI', 'Objectifs', 'Fixes', 'Mobiles']
  ),

  card(
    'fa30',
    '30. Quels sont les facteurs à prendre en considération lors de la planification CAS ?',
    `Les opérations **C.A.S** sont celles menées en **appui direct des opérations terrestres**.

• **But** : Conduire des opérations conjointement planifiées et coordonnées contre des objectifs ENI dont la destruction, l'isolation, la neutralisation ou le ralentissement ont un **effet direct sur le déroulement de la bataille terrestre**.

• Elles sont dirigées contre des **objectifs ennemis en contact avec ou à proximité immédiate des forces terrestres amies**.

• Le CAS exige une **coordination étroite** avec les mouvements et les feux de ces forces.`,
    ['CAS', 'Planification', 'Facteurs']
  ),

  card(
    'fa31',
    '31. Définir la FLOT et la FSCL.',
    `(02) lignes de planification du combat terrestre tactique structurant ces opérations :

➢ **FLOT** (*Forward Line of Own Troops*) :
**(Ligne de contact)** indique la position la plus avancée des forces terrestres amies. Elle est donnée aux unités volantes par la force terrestre.

➢ **FSCL** (*Fire Support Coordination Line*) :
**Ligne de coordination de l’appui feu**. Elle est déterminée par la portée des armes organiques des forces terrestres, principalement celle de l'artillerie de la GU.
Elle se trouvera le plus souvent entre **20 à 30 Km en avant de la FLOT**.`,
    ['FLOT', 'FSCL', 'CAS', 'Lignes de Planification']
  ),

  card(
    'fa32',
    '32. Intégration Air-terre ?',
    `• Dans sa zone d’opérations, le **Commandant de la Force interarmées** désigne ses priorités d'objectifs, effets escomptés et séquences d'attaque.
• Les opérations aériennes doivent impérativement être menées en coordination avec le **Commandant de la force terrestre** via des éléments de liaison essentiels pour ne pas affecter les opérations terrestres.
• Partie intégrante de la bataille terrestre, l'**hélicoptère d'attaque** s'adapte à l'environnement tactique ; ses opérations figurent dans l’**Air Tasking Order (ATO)** pour éviter les conflits avec les autres avions.
• Les opérations aéromobiles, sous commandement terrestre ou d'un Commandant opération aéromobile, peuvent aussi inclure des avions en support.
• Complémentaires, les aptitudes des hélicoptères d’attaque et des avions offrent une **synergie rentable**, combinée à la guerre électronique et l'artillerie. Un **COMAO** peut également bénéficier du support des hélicoptères d'attaque.`,
    ['Air-Terre', 'Intégration', 'ATO', 'COMAO']
  ),

  card(
    'fa33',
    "33. Quels sont catégories d'appui aérien ?",
    `➢ **Planifié ou à temps** : Planification détaillée de la mission, qui fait partie d'un programme planifié, **4 heures minimum** avant l'exécution des opérations.

➢ **Immédiat** : Déclenché en urgence, privilégiant la rapidité. Mission effectuée en appui des situations tactiques surgissant au cours de la bataille par des avions en alerte au sol ou en vol.`,
    ['Appui Aérien', 'Catégories', 'Planifié', 'Immédiat']
  ),

  card(
    'fa34',
    '34. Quels sont les fonctions assurées par la structure intégrée pour le CAS ? (Le cycle CAS)',
    `Le cycle CAS comprend 5 fonctions :

➢ **Planning** : La planification et la prise de décisions ;
➢ **Requesting** : La demande d'appui par les forces terrestres ;
➢ **Tasking** : L'envoi des ordres d'exécution ;
➢ **Exécution** : L'exécution des missions ;
➢ **Reporting** : Le compte rendu des missions exécutées.`,
    ['CAS', 'Cycle CAS', 'Fonctions', 'Planning', 'Tasking']
  ),

  card(
    'fa35',
    '35. Coordination du CAS entre les FA et les FT :',
    `➢ Le CAS est basé sur le principe du **commandement centralisé et de l'exécution décentralisée** ;
➢ Un **« niveau d'adaptation »** est créé : les deux états-majors vont former un seul organisme qui s'occupera de la coordination ;
➢ En dessous de ce niveau, les forces terrestres et aériennes **gardent leur autonomie** de commandement et de structure ;
➢ À chaque niveau inférieur, la coordination est assurée par les **C.O** ou des **éléments de liaison** ;
➢ L'ensemble est appelé la structure interarmées ou **« joint »**.`,
    ['CAS', 'Coordination', 'FA-FT', 'Joint']
  ),

  card(
    'fa36',
    "36. Niveau d'adaptation :",
    `C'est la **juxtaposition de deux autorités**, appartenant à des hiérarchies différentes, en vue de réaliser un **but commun**.

Dans les commandements adaptés, les chefs exercent leur autorité sur les forces qui leur sont propres, mais sont appelés à **concevoir, préparer et conduire conjointement** une manœuvre combinée.`,
    ['C2', 'Niveau d Adaptation', 'Définition']
  ),

  card(
    'fa37',
    '37. Quels sont les acteurs de la structure intégrée pour le CAS ? (composition)',
    `❖ **Centres d'opérations** : organismes qui assurent la mise en œuvre des moyens alloués et qui font le planning détaillé des missions.

➢ **AOC (Air Operations Center)** :
Organe de l’état-major de la Composante Air, implanté au sein du A3-OPS.
Il est responsable de la **programmation et de la conduite des opérations aériennes**.
L’AOC exerce le **TACOM** des moyens aériens qui lui sont alloués et le **TACON** des moyens qui lui sont détachés.

➢ **AOCC (Air Operations Coordination Center / Centre de coordination des opérations aériennes)** :
Cellule de coordination de la force aérienne placée au niveau de l’état-major ou du centre d’opérations équivalent terre/mer.
L'AOCC est fonctionnellement **subordonné à l’AOC**.
Il assure la coordination des opérations aériennes **offensives, défensives et de support**.`,
    ['CAS', 'Structure Intégrée', 'AOC', 'AOCC']
  ),

  card(
    'fa38',
    '38. Quelles sont les exigences (caractéristiques) des moyens CAS ?',
    `➢ **Réaction rapide** ;
➢ **Grande Autonomie** ;
➢ **Grande Manœuvrabilité** ;
➢ **Faible Vulnérabilité** ;
➢ **Grande capacité d'Emport** ;
➢ **Grande Précision**.`,
    ['CAS', 'Moyens CAS', 'Exigences', 'Caractéristiques']
  ),

  // ==========================================
  // SECTION 5 : OPÉRATIONS CONTRE LES FORCES NAVALES (Q39)
  // ==========================================
  card(
    'fa39',
    '39. Quels sont les types d’opérations aériennes en mer ?',
    `Opérations aériennes menées pour **détruire, retarder ou réduire les capacités navales imposantes de l’ENI** ou celles qui sont proches des forces amies (exigent planification et coordination continue) :

➢ **1. Appui Aérien Tactique des Opérations Maritimes (TASMO)** :
  ❖ **Reconnaissance aérienne** : effectuée dans les ports d’embarquement/débarquement et zones de rassemblement de la force amphibie ENI (déterminer la NVA et axes de progression).
  ❖ **Opérations aériennes d’interdiction** : conduites contre l’ENI de surface. L'AI et le CAS appuient la lutte de surface navale contre les menaces pesant sur les opérations amies.
  ❖ **Opérations aériennes défensives** : assister les systèmes sol-air des navires pour protéger les moyens de force et navires marchands amis ; acquérir et maintenir la supériorité aérienne locale en cas de débarquement.

➢ **2. Patrouilles aériennes maritimes** :
Observation systématique des étendues maritimes pour détecter, localiser et classer les objectifs aériens, de surface ou sous-marins.
Assurent une **alerte précoce lointaine**. Missions : reconnaissance, détection, identification, attaque.
Se subdivisent en :
  - Opérations de contrôle et d’identification ;
  - Opérations d’attaque aérienne.`,
    ['Opérations Maritimes', 'TASMO', 'Patrouille Maritime']
  ),

  // ==========================================
  // SECTION 6 : OPÉRATIONS AÉRIENNES DE SOUTIEN (Q40 - Q46)
  // ==========================================
  card(
    'fa40',
    '40. Quelles sont les opérations aériennes de soutien ?',
    `➢ **Commandement, contrôle et communication aéroportée (ABC3)** ;
➢ **Guerre électronique** ;
➢ **Ravitaillement en vol** ;
➢ **Opérations de transport aérien tactique** ;
➢ **Opérations de recherche et de sauvetage (SAR)**.`,
    ['Opérations de Soutien', 'Typologie', 'ABC3', 'SAR']
  ),

  card(
    'fa41',
    '41. Quel est le Commandement, contrôle et communication aéroporté / Airborne command, control and communication (ABC3) ?',
    `Les systèmes de surveillance (**AWACS, AGS…**) donnent au commandement l’opportunité de **conduire les opérations** en ayant une excellente connaissance de la situation sur le terrain ou dans l’espace.

Ces systèmes sont équipés de **radars et de systèmes de communications** qui permettent le transfert de données vers le sol et de **gérer les systèmes de défense aérienne** (avions entre autres).`,
    ['ABC3', 'AWACS', 'AGS', 'C2']
  ),

  card(
    'fa42',
    '42. Définir Guerre électronique',
    `Définie comme étant l'**action militaire visant à utiliser le spectre électromagnétique (EM)**.

Cela comprend :
➢ **ESM** : L'interception des signaux ;
➢ **ECM** : L'interdiction du spectre pour l'ENI ;
➢ **EPM** : La protection des forces alliées.`,
    ['Guerre Électronique', 'ESM', 'ECM', 'EPM', 'Spectre EM']
  ),

  card(
    'fa43',
    '43. Définir Ravitaillement en vol',
    `Utilisé en support de tous les aspects de l'arme aérienne :
- Pour l'**entraînement** et la **surveillance** en temps de paix ;
- Pour le **déploiement rapide** des moyens aériens ;
- Pour l'**optimalisation de la défense aérienne** en augmentant l’endurance des chasseurs dans leurs CAP (*Combat Air Patrol*).`,
    ['Ravitaillement en Vol', 'AAR', 'CAP']
  ),

  card(
    'fa44',
    '44. Définir Opérations Transport aérien tactique ?',
    `Les opérations de transport aérien tactique sont des **missions de transport aérien effectuées à l'intérieur d'un théâtre d’opération (intra-théâtre)**.

Elles sont exécutées soit par avion soit par hélicoptère, souvent dans la zone des combats et sous la menace ennemie.`,
    ['Transport Aérien Tactique', 'Définition', 'Intra-théâtre']
  ),

  card(
    'fa45',
    '45. Quelles sont les Opérations Transport aérien tactique ?',
    `➢ **Opérations Aéroportées** : visant à transporter par air des troupes, prêtes au combat et leur support logistique, directement vers leur zone d'engagement ;

➢ **Opérations d’Appui logistique aérien** : menées à l’intérieur d’un théâtre dans le but d’amener, de distribuer ou de retirer du personnel, de l’équipement et des approvisionnements ;

➢ **Opération d’Évacuation des non-combattants** : font également partie des opérations d’appui logistique aérien, ayant un caractère plutôt opérationnel que logistique ;

➢ **Évacuations sanitaires** : transport de blessés et/ou de malades (avion ou hélicoptère) en dehors de la zone de combat vers les lignes arrière ou entre centres médicaux, en principe sous supervision médicale.`,
    ['Transport Aérien Tactique', 'Types', 'Aéroportées', 'Évacuation Sanitaire']
  ),

  card(
    'fa46',
    '46. Définir de recherche et de sauvetage ?',
    `Le **SAR** (*Search and Rescue*) regroupe les opérations comportant l'emploi d'avions, de véhicules et de navires par des équipes de sauvetage spécialisées en vue de **rechercher et de sauver du personnel en détresse**, tant en mer que sur terre.

Les opérations SAR doivent pouvoir être exécutées aussi en temps de guerre dans un territoire ennemi : on parle alors de **Combat SAR (CSAR)**.`,
    ['SAR', 'CSAR', 'Sauvetage', 'Définition']
  ),

  // ==========================================
  // SECTION 7 : EMPLOI DES AVIONS DE CHASSE (Q47 - Q51)
  // ==========================================
  card(
    'fa47',
    '47. Quel est le rôle de la chasse et quel sont ses actions ?',
    `Les avions de chasse ont un rôle crucial en **détruisant les forces ennemies** (*rôle offensif*) et en **protégeant les forces amies** (*rôle défensif*).

• **En temps de paix**, ils assurent la sécurité de la nation et la sûreté des forces en :
  ➢ Participant à la **dissuasion** grâce à la capacité de riposte ;
  ➢ Exerçant le **contrôle actif de la souveraineté** dans l’espace aérien.

• **En temps de guerre**, ils mènent des **actions offensives** contre les objectifs ennemis et des **actions de défense aérienne directe** contre les menaces aériennes.`,
    ['Avions de Chasse', 'Rôle', 'Actions']
  ),

  card(
    'fa48',
    '48. Donner le but des actions offensives et celui des actions de défense aérienne directe : CEI',
    `❖ **Action offensive** :
Vise la **destruction / neutralisation du potentiel de guerre ennemi** (infrastructures, radars, dépôts de munitions et de carburant, forces aériennes au sol et éventuellement en vol, forces de surface, organismes de contrôle et réseaux de transmission).

➢ **Action de défense aérienne directe : CEI**
❖ **C - Dès le temps de paix** : **Contrôle actif** de l'espace aérien et assure la souveraineté ;
❖ **E - En temps de crise** : **Évalue** l'intention d'agression et son niveau ;
❖ **I - En temps de guerre** : **Interdit l'accès** à l’ENI dans l'espace aérien ami, et destruction de l'ENI aérien en vol.`,
    ['Chasse', 'Actions Offensives', 'Défense Directe', 'CEI']
  ),

  card(
    'fa49',
    '49. Quelles sont les missions des avions de chasse ? CAP - PDD - LCD 3R',
    `➢ **1. Les missions de chasse : CAP**
Caractère offensif (*attaque du potentiel adverse*) ou défensif (*interdiction de volumes et moyens*) :
  ❖ **C - Couverture** : à caractère défensif, interdire à l'ennemi l'observation ou l'attaque de zones (*Couverture Générale*) ou de points sensibles (*C. particulière*) ;
  ❖ **D - Destruction générale** : à caractère offensif, rechercher et imposer le combat à l'ennemi aérien pour le détruire en vol chez lui ou sur terrain ami ;
  ❖ **P - Protection** : à caractère défensif, interdire à l’ENI aérien l’approche et l’attaque en vol d’avions amis.

➢ **2. Les missions d’assaut : PDD**
Destruction ou neutralisation des objectifs de surface ennemis (moyens aériens au sol et forces de surface) :
  ❖ **Assaut Préparé** ;
  ❖ **Assaut Dirigé** ;
  ❖ **Assaut Découverte**.

➢ **3. Missions particulières : LCD 3R**
Recherche permanente du renseignement aérien et missions exceptionnelles :
  ❖ **L**iaisons rapides ;
  ❖ **C**ontre-mesures électroniques ;
  ❖ **D**iversion ;
  ❖ **R**econnaissance météorologique ;
  ❖ **R**echerche et sauvetage ;
  ❖ **R**echerche du renseignement aérien.`,
    ['Avions de Chasse', 'Missions', 'CAP', 'PDD', 'LCD 3R']
  ),

  card(
    'fa50',
    '50. Quelles sont les procédés de recherche du renseignement aérien ?',
    `➢ **Reconnaissance à vue** ;
➢ **Recherche sur points particuliers** ;
➢ **Recherche sur itinéraires** ;
➢ **Recherche photographique**, limitée aux possibilités de l'équipement de l'avion.`,
    ['Renseignement Aérien', 'Procédés', 'Recherche']
  ),

  card(
    'fa51',
    '51. Quelles sont Règles d’emploi des avions de chasse ?',
    `❖ **Poursuite d'un objectif unique** ;
❖ **Esprit d'offensive** (pour garder l’initiative des opérations) ;
❖ **Surprise** (agir de manière inattendue) ;
❖ **Concentration** (pour accroître l’efficacité) ;
❖ **Coopération** (assurer la coordination et la cohésion nécessaire) ;
❖ **Mobilité** ;
❖ **Économie** (augmenter le rendement) ;
❖ **Sûreté** (être à l’abri d'éventuelles actions et réactions ENI) ;
❖ **Simplicité** (garantir une bonne compréhension à tous les échelons).`,
    ['Avions de Chasse', 'Règles d Emploi', 'Principes']
  ),

  // ==========================================
  // SECTION 8 : EMPLOI DES AVIONS DE RECONNAISSANCE (Q52 - Q58)
  // ==========================================
  card(
    'fa52',
    '52. C’est quoi un renseignement aérien et quelle sont ses caractéristiques ? RDC',
    `C’est un **renseignement recueilli par un moyen d'investigation transporté par air**.

• **L'intérêt du renseignement aérien réside dans** :
➢ Étendue de sa zone de recueil possible ;
➢ Indiscrétion de la recherche ;
➢ Précision ;
➢ Rapidité de recueil et de diffusion.

• **En revanche, il est discontinu en raison de : RDC**
➢ **R - Réactions ennemies** ;
➢ **D - Dépendance des conditions météorologiques** ;
➢ **C - Caractère intermittent et passager de l’investigation**.`,
    ['Renseignement Aérien', 'Définition', 'Caractéristiques', 'RDC']
  ),

  card(
    'fa53',
    '53. Quel est le but du renseignement aérien ? RDC',
    `**RDC** :

➢ **D - Découvrir** des renseignements nouveaux ;
➢ **R - Recouper et compléter** des renseignements existants ;
➢ **C - Contrôler** l'emploi des feux amis terrestres ou aériens (**BDA** - *Battle Damage Assessment*).`,
    ['Renseignement Aérien', 'But', 'RDC', 'BDA']
  ),

  card(
    'fa54',
    '54. Quelles sont les méthodes de recherche du renseignement aérien ? SD',
    `**SD** :

➢ **S - Recherche Systématique** : Surveillance générale sans idée préconçue, offrant des résultats objectifs mais exigeant des moyens et du temps.

➢ **D - Recherche Dirigée** : Basée sur des hypothèses spécifiques, moins coûteuse mais limitée et fragmentaire, utilisée selon les priorités.

*Note* : Il est essentiel de déterminer et fixer une **périodicité de la recherche** pour compenser la contrainte de discontinuité du renseignement aérien.`,
    ['Renseignement Aérien', 'Méthodes', 'SD', 'Systématique', 'Dirigée']
  ),

  card(
    'fa55',
    '55. Quel est la Classification du renseignement aérien ? IE MTM',
    `➢ **Stratégique** : Destiné au Haut Commandement pour la conduite de la guerre, couvre l’ensemble des activités ENIs.

➢ **Tactique** : Appuie les forces engagées, cible les mouvements ENIs et frappes amies. Comprend (**IE MTM**) :
  ❖ Renseignements **M**ilitaires ;
  ❖ Renseignements **I**ndustriels et **É**conomiques ;
  ❖ Renseignements **T**opographiques ;
  ❖ Renseignements **M**étéorologiques.`,
    ['Renseignement Aérien', 'Classification', 'Stratégique', 'Tactique', 'IE MTM']
  ),

  card(
    'fa56',
    '56. Quel est le rôle des avions de reconnaissance ?',
    `La recherche du renseignement aérien est une mission permanente des forces aériennes menée par tous les appareils en vol, mais **spécialisée par les avions de reconnaissance** qui ont pour rôle :

➢ **La Conception de la manœuvre** ;
➢ **La Préparation des plans** ;
➢ **Le Déroulement des opérations** ;
➢ **Le Contrôle des résultats obtenus**.`,
    ['Avions de Reconnaissance', 'Rôle']
  ),

  card(
    'fa57',
    '57. Quelles sont les missions des avions de reconnaissance ?',
    `Du point de vue de l'exécution, on distingue :

➢ **1. Missions de reconnaissance de Jour** :
  ❖ **Msn reconnaissance à vue** : Fournir des renseignements d'exploitation immédiate, en particulier sur objectifs mobiles :
    - Sur points particuliers ;
    - Sur itinéraires ;
    - Sur zone.
  ❖ **Msn reconnaissance photographique** : Renseignements précis et détaillés sur objectifs fixes/permanents, et recherche systématique étendue :
    - Photographies verticales ;
    - Photographies obliques ou panoramiques.

➢ **2. Missions de reconnaissance de Nuit** :
  ❖ **Msn reconnaissance à vue** : Surveillance d'itinéraires pour surprendre les mouvements de nuit de l'ennemi (décelés à vue ou feux/lumières), surveillance d'activité nocturne (gares, passages, ports, travaux).
  ❖ **Msn reconnaissance photographique** : Nombre limité de photos verticales avec éclairage artificiel du sol pour :
    - Objectifs trop défendus par la DCA le jour ;
    - Objectifs plus intéressants de nuit ;
    - Objectifs dont la surveillance nocturne assure la continuité du renseignement.`,
    ['Avions de Reconnaissance', 'Missions', 'Jour', 'Nuit', 'Photo']
  ),

  card(
    'fa58',
    '58. Quelles sont les règles d’emploi des avions de reconnaissance ?',
    `➢ **Primauté du renseignement** (l’avion ne recherche jamais le combat) ;
➢ **Surprise** (opère isolément et fait un seul passage sur l’objectif) ;
➢ **Orientation préalable de la recherche** ;
➢ **Périodicité**.`,
    ['Avions de Reconnaissance', 'Règles d Emploi']
  ),

  // ==========================================
  // SECTION 9 : EMPLOI DES AVIONS DE TRANSPORT (Q59 - Q62)
  // ==========================================
  card(
    'fa59',
    '59. Quel est le but du transport aérien militaire TAM',
    `Acheminer **sans délai et à toutes distances** les personnels, les équipements et les approvisionnements nécessaires aux forces armées, aussi bien pour leur **mise en condition** que pour la **conduite de leurs opérations**.`,
    ['Transport Aérien Militaire', 'TAM', 'But']
  ),

  card(
    'fa60',
    '60. Quel est le rôle du transport aérien militaire ? PSM / SADI',
    `➢ **Rôle en temps de paix (PSM)** :
  ❖ **P**réparation pour la mission du temps de guerre ;
  ❖ **S**outien logistique des forces armées : transports réguliers et à la demande ;
  ❖ Participation à des **M**issions d'intérêt général : Recherche et sauvetage et EVASAN.

➢ **Rôle en temps de guerre (SADI)** :
  • **Le soutien logistique des forces armées** : transport stratégique et tactique, malgré les contraintes opérationnelles.
  • **La participation à la manœuvre des forces armées** :
    ❖ **Directe (D)** : déploiement immédiat de troupes dans des opérations aéroportées (**OAP**).
    ❖ **Indirecte (I)** : acheminement de renforts, évacuations et retrait d’unités exposées.`,
    ['Transport Aérien Militaire', 'Rôle', 'PSM', 'SADI', 'OAP']
  ),

  card(
    'fa61',
    '61. Quelles sont les Règles d\'emploi des avions de transport ? CEM SM',
    `**CEM SM** :

➢ **C - Coopération** (constante et étroite avec les autres armes) ;
➢ **E - Économie** (optimisation des forces en fonction de la mission) ;
➢ **M - Maintien de la destination** ;
➢ **S - Sûreté** ;
➢ **M - Mobilité** (opérant de différentes bases si nécessaire).`,
    ['Transport Aérien Militaire', 'Règles d Emploi', 'CEM SM']
  ),

  card(
    'fa62',
    '62. Quelles sont les Missions du transport aérien militaire ? 2A ÉM / AER',
    `➢ **Missions à caractère tactique : 2A ÉM**
  ❖ **Aéroportage** : transport de personnels et/ou matériels dont la mise à terre se fait par atterrissage sur une plateforme située en terrain hostile ;
  ❖ **Aérolargage** : la mise à terre se fait par largage ;
  ❖ **Évacuation sanitaire primaire** ;
  ❖ **Missions spéciales**.

➢ **Missions à caractère logistique : AER**
  ❖ **Aérotransport** : mise à terre par atterrissage des aéronefs sur des plates-formes hors d'action directe de l’ennemi ;
  ❖ **Évacuation sanitaire** ;
  ❖ **Recherche et sauvetage**.`,
    ['Transport Aérien Militaire', 'Missions', 'Tactique', 'Logistique', 'Aérolargage']
  ),

  // ==========================================
  // SECTION 10 : EMPLOI DES HÉLICOPTÈRES (Q63 - Q67)
  // ==========================================
  card(
    'fa63',
    '63. Définir Aéromobilité, Force aéromobile, Aérocombat',
    `➢ **Aéromobilité** : Possibilité des forces aéromobiles de se déplacer par aéronefs et de garder la possibilité d'engager un combat terrestre.

➢ **Force aéromobile** : Unités de combat, d'appui et de transport par air nécessaires à la conduite des opérations aéromobiles.

➢ **Aérocombat** : Intégration des tactiques et missions des hélicoptères à la manœuvre interarmes, permettant de créer un effet de surprise et de choc.`,
    ['Hélicoptères', 'Aéromobilité', 'Force Aéromobile', 'Aérocombat']
  ),

  card(
    'fa64',
    '64. Donner la classification des hélicos, et leurs caractéristiques ? AMAT LRA',
    `➢ **Hélicoptère d'Attaque (HA)** : Spécialisé dans la destruction d’objectifs ENIs avec un armement varié.

➢ **Hélicoptère de Manœuvre et d’Assaut (HMA)** : Assure la mobilité et le transport de troupes et matériels (*héliportage, hélitransport*).

➢ **Hélicoptère de Transport Lourd (HL)** : Dédié à la logistique, l’acheminement d’unités combattantes ainsi que leur soutien.

➢ **Hélicoptère de Reconnaissance et d’Attaque (HRA)** : Concerne l’ensemble des hélicoptères armés, quel que soit le type et le nombre d’armements, excepté les hélicoptères de manœuvre et d’assaut.`,
    ['Hélicoptères', 'Classification', 'HA', 'HMA', 'HL', 'HRA']
  ),

  card(
    'fa65',
    '65. Quels sont les niveaux d’engagement des hélicoptères ? (aérocombat) PMSG',
    `**PMSG** :

➢ **P - Patrouille** : 2 à 3 hélicos, homogène ou mixte selon la mission.

➢ **M - Module** : 4 à 6 hélicos, mène deux actions simultanées dans un espace-temps restreint.

➢ **S - S/Grpt Aérocombat (S/GAC)** : Composée de plusieurs modules à dominantes :
  - Feu (HAC/HRAP) ;
  - Manœuvre (HM) ;
  - Sûreté (HRAP/HAC) ;
  - Ou mixte.

➢ **G - Grpt d’aérocombat (GAC)** : Composé de plusieurs S/GAC (feu et manœuvre), capable de planifier et de conduire l’ensemble des missions d’aérocombat.
  Il peut agir en action combinée ou autonome, détacher ponctuellement des patrouilles à des unités interarmes et intégrer des unités interarmes.`,
    ['Hélicoptères', 'Niveaux d Engagement', 'PMSG', 'GAC', 'S/GAC']
  ),

  card(
    'fa66',
    '66. Quelles sont les caractéristiques opérationnelles des unités d’aérocombat ? ECL ECL',
    `➢ **Engagement** : Combiné, autonome, manœuvre mixte.

➢ **Commandement** : Adapté à la zone d’engagement, le PC est soit au GAC, S/GAC, Détachement d'appui aérocombat (**DAA**), Détachements de liaison aérocombat (**DL**).

➢ **Espace de manœuvre** : Les unités d'aérocombat agissent en coordination avec les forces au sol, en élargissant l'espace de manœuvre et en impactant l'ennemi à différents moments. Les **ZEH** (*Zones d'Évolution d'Hélicoptères*) sont les espaces de manœuvre qui leur sont attribués.

➢ **Coordination** : L'emploi des hélicoptères doit être synchronisé avec les autres moyens évoluant dans la 3e dimension.

➢ **Logistique** : La forte consommation de carburant et la disponibilité mécanique des hélicoptères imposent une planification rigoureuse.`,
    ['Hélicoptères', 'Caractéristiques Opérationnelles', 'ZEH', 'DAA']
  ),

  card(
    'fa67',
    '67. Quelles sont les missions des unités d’aérocombat ?',
    `➢ **Missions d’appui au commandement** :
Des hélicoptères peuvent être détachés auprès du PC d'une GU pour une phase particulière de la manœuvre, permettant au chef interarmes de s’affranchir des contraintes du relief et du réseau routier, et de faire face à une élongation importante ou à une brutale accélération du rythme de la manœuvre.

➢ **Missions à dominante renseignement** (*reconnaître, jalonner, surveiller, couvrir*) :
Grâce à leur furtivité, participent au recueil/recoupement de l’information en avant, sur les flancs ou sur les arrières d'une unité amie.

➢ **Missions à dominante feu** (*appuyer, attaquer, détruire, neutraliser en profondeur, freiner*) :
Contre un ennemi terrestre : missiles air/sol contre objectifs durs ou cibles à haute valeur ajoutée ; canons de 20 mm pour saturer/neutraliser des cibles surfaciques peu protégées.

➢ **Missions à dominante manœuvre** :
Accélérer les opérations tactiques et logistiques par hélitransport (zone sécurisée), héliportage (zone d'insécurité) et évacuations médicalisées.`,
    ['Hélicoptères', 'Missions', 'Aérocombat', 'Appui Feu', 'Renseignement']
  ),

  // ==========================================
  // SECTION 11 : EMPLOI DES DRONES (Q68 - Q69)
  // ==========================================
  card(
    'fa68',
    '68. Quelles sont les missions des drones ?',
    `Selon le rayon d’action et l’endurance, les drones de classe III sont classés en **MALE** (*Moyenne Altitude et Longue Endurance*) et **HALE** (*Haute Altitude et Longue Endurance*). Missions :

➢ **Missions d’appui au renseignement** :
  - Surveillance d’une zone, d’un axe ou d’un point particulier ;
  - Reconnaissance et collecte de renseignements ;
  - Évaluation des dommages de combat (**BDA** – *Battle Damage Assessment*).

➢ **Missions d’appui-feu** :
  - Tir contre des cibles terrestres et maritimes ;
  - Acquisition d’objectifs pour l’artillerie et correction des tirs ;
  - Désignation laser d’objectifs ;
  - Escorte de convois.

➢ **Missions d’intérêt général** :
  - Lutte contre l’immigration clandestine ;
  - Lutte contre les trafics illicites ;
  - Participation aux missions de recherche et sauvetage (**SAR**) ;
  - Contribution à la gestion des catastrophes naturelles.`,
    ['Drones', 'MALE', 'HALE', 'Missions', 'Appui-Feu', 'BDA']
  ),

  card(
    'fa69',
    '69. Quelles sont les contraintes des drones ?',
    `➢ **Facteur Météorologique** : Les vents forts, les rafales et les tempêtes de sable constituent des contraintes majeures pour les systèmes de drones.

➢ **Facteur Technique** : Le rythme des opérations doit prendre en compte la périodicité des visites de maintenance programmées.

➢ **Facteur Infrastructurel** : Le déploiement des vecteurs ne peut être effectué que sur des aérodromes disposant d’une piste d’envol et d’un hangar aéronautique.

➢ **Rythme des opérations** : Doit intégrer impérativement la périodicité des visites de maintenance programmées.`,
    ['Drones', 'Contraintes', 'Météo', 'Maintenance', 'Infrastructures']
  )
];

async function main() {
  console.log(`🚀 Synchronisation du deck "Force Aérienne" (${CARDS.length} cartes)...`);

  // 1. Upsert du deck
  const { error: deckError } = await supabase
    .from('decks')
    .upsert(DECK, { onConflict: 'id' });

  if (deckError) {
    console.error('❌ Erreur deck:', deckError.message);
    process.exit(1);
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
      console.error(`❌ Erreur batch ${Math.floor(i / BATCH) + 1}:`, error.message);
    } else {
      successCount += batch.length;
      console.log(`  ✅ Batch ${Math.floor(i / BATCH) + 1}: ${batch.length} cartes (${successCount}/${CARDS.length})`);
    }
  }

  console.log(`\n🎉 Synchronisation terminée : ${successCount}/${CARDS.length} cartes poussées.`);

  // 3. Vérification en base de données
  const { data, count, error: fetchError } = await supabase
    .from('cards')
    .select('id', { count: 'exact' })
    .eq('deck_id', DECK_ID);

  if (fetchError) {
    console.error('❌ Erreur vérification:', fetchError.message);
  } else {
    console.log(`📊 Vérification en ligne : ${data.length} cartes trouvées dans Supabase pour le deck "${DECK.title}".`);
  }
}

main().catch(console.error);
