// push_gendarmerie.mjs
// Pousse les 53 cartes du deck Gendarmerie Royale vers Supabase
// Correspondance exacte avec le fichier 'gendarmerie' (Q1-Q54, sans Q13)
// Usage: node scripts/push_gendarmerie.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rwcdvoliowjmoaunarod.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y2R2b2xpb3dqbW9hdW5hcm9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYwNjE4OCwiZXhwIjoyMTAyMTgyMTg4fQ.yOQm8Ujs_QU4PrkCLVFARTg-Is6lt-nWgY_RmFuEn7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DECK_ID = 'deck-gendarmerie-royale';
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
    favorite: id === 'gr1',
    flagged: false,
    due_date: now,
    created_at: now,
    updated_at: now,
  };
}

const DECK = {
  id: DECK_ID,
  user_id: USER_ID,
  title: 'Gendarmerie Royale',
  description: "Questionnaire complet sur les spécificités, missions et le maintien de l'ordre de la Gendarmerie Royale (FAR).",
  folder: 'Gendarmerie Royale',
  color: 'emerald',
  icon: 'Shield',
  telegram_reminder_enabled: false,
  created_at: now,
};

// ===================================================================
// 53 CARTES — correspondance exacte avec le fichier 'gendarmerie'
// Sections : I-Spécificités (Q1-Q23) | II-Missions (Q24-Q40) | III-MO (Q41-Q54)
// Note : Q13 n'existe pas dans le document source (il passe de Q12 à Q14)
// ===================================================================
const CARDS = [

  // I - SPÉCIFICITÉS
  card('gr1',
    '1. DÉFINIR LA GR.',
    "Force publique chargée de veiller à la sécurité publique, au MO et à l'exécution des lois. Son action s'exerce sur toute l'étendue du territoire ainsi qu'aux Armées. Elle est particulièrement destinée à la sûreté des campagnes et des voies de communication.",
    ['Définition', 'GR', 'Spécificités']),

  card('gr2',
    '2. DONNER UN APERÇU HISTORIQUE DE LA GR.',
    "▪ Avant 1900 : le pouvoir de police se confondait avec le pouvoir administratif.\n▪ Vers 1901 : My Hafid a signé un accord avec les Français pour créer un corps de Police marocain.\n▪ En 1907 : le Gouvernement français a créé la Force Publique des Troupes Débarquées.\n▪ En 1927 : le Commandement Français a transformé sa force publique en Légion de Gendarmerie.\n▪ En 1956 : les activités de la GR étaient axées sur la police judiciaire.\n▪ En avril 1957 : la GR a été créée par Dahir, pour assurer la relève de la Légion.\n▪ 14 janvier 1958 : sortie d'un Dahir sur le service de la GR, constituant son document de référence.",
    ['Historique', 'GR']),

  card('gr3',
    "3. QUELS SONT LES PRINCIPES D'ACTION DE LA GR.",
    "▪ **Prévention** : Prévenir le désordre afin de protéger les personnes et les biens ;\n▪ **Répression** : Réprimer toute violation des lois. S'impose éventuellement avec l'emploi de la force ;\n▪ **Assistance et Secours** : Soutenir toute personne en cas d'accident ou calamité publique.",
    ['Principes', 'GR', 'Action']),

  card('gr4',
    "4. QUELS SONT LES PRINCIPES D'EXÉCUTION DU SERVICE. (DST-SPOP)",
    "▪ Ne doit pas **Déborder** de ses attributions, ni s'immiscer dans les questions étrangères au service ;\n▪ **Surveillance** continue pour prévenir ou réprimer toute atteinte à l'ordre public ;\n▪ Agir en **Tenue** militaire ;\n▪ Agir **Spontanément** ou à l'initiative des autorités par réquisition ;\n▪ Ses brigades font des **Patrouilles** périodiques dans leurs circonscriptions ;\n▪ **Opère** journellement ou à des époques déterminées ;\n▪ **Dresse** un PV de toutes arrestations opérées.",
    ['Principes', 'Exécution', 'Service']),

  card('gr5',
    '5. QUELLES SONT LES CARACTÉRISTIQUES DE LA GR.',
    "▪ **Caractère militaire** de son organisation : fait partie intégrante des FAR et relève de l'ADN ;\n▪ **Nature mixte** de son service : relève du ministère de justice et du ministère de l'intérieur.",
    ['Caractéristiques', 'GR']),

  card('gr6',
    "6. QUEL EST LE CHAMP D'ACTION DE LA GR.",
    "L'action de la Gendarmerie s'exerce sur **toute l'étendue du territoire** ainsi qu'aux Armées. Elle est particulièrement destinée à la sûreté des **campagnes** et des **voies de communication**.",
    ["Champ d'action", 'GR']),

  card('gr7',
    '7. COMMENT EST ORGANISÉE LA GR. (FLER-TMP-AMES)',
    "**Un État-Major** comprenant : Fonctions opérationnelles de commandement ; Logistique ; Emploi ; Ressources Humaines.\n\n**Subdivisions :**\n▪ GR Territoriale ;\n▪ GR Mobile ;\n▪ GR Prévôtale.\n\n**Formations spécialisées :**\n▪ Groupement Aérien ;\n▪ GR Maritime ;\n▪ Groupement Escadron d'Honneur ;\n▪ Groupement de Sécurité et d'Intervention.",
    ['Organisation', 'GR', 'Structure']),

  card('gr8',
    "8. QUELLE EST L'ARTICULATION DE LA G. TERRITORIALE.",
    'Elle se décline en **Commandements Régionaux**, **Compagnies** et **Brigades Territoriales**. Cette articulation lui permet une bonne intégration dans le tissu social et une bonne action de proximité.',
    ['G. Territoriale', 'Articulation']),

  card('gr9',
    "9. EN PLUS DE SON ÉTAT-MAJOR RÉGION, DE QUOI DISPOSE LE COMMANDANT DE RÉGION.",
    "▪ **Chenil Régional** doté de chiens de pistage, détection de drogues et explosifs, attaque et défense ;\n▪ **Section de Techniciens d'Identification Judiciaire (TIJ)** ;\n▪ **Brigade d'Environnement (BE)** compétente sur toute la circonscription régionale ;\n▪ **Brigade de Sécurité et d'Intervention (BSI)** pour des missions contre le grand banditisme.",
    ['Commandant de Région', 'GR']),

  card('gr10',
    "10. EN PLUS DE SON ÉTAT-MAJOR COMPAGNIE, DE QUOI DISPOSE LE COMMANDANT DE COMPAGNIE.",
    "▪ **Brigade judiciaire (BJ)**, qui prend en charge les affaires importantes ou dépassant les capacités des autres brigades, grâce à son personnel spécialisé et aux moyens techniques adaptés.\n▪ **Peloton Motocycliste Routier et Autoroutier**, chargé de prévenir les accidents de la circulation, d'assurer la sécurité des usagers de la route et de leur porter éventuellement assistance.",
    ['Commandant de Compagnie', 'GR']),

  card('gr11',
    "11. ARTICULATION DES UNITÉS DE LA GENDARMERIE DE L'AIR RELEVANT DES COMMANDEMENTS RÉGIONAUX.",
    "▪ Compagnies ;\n▪ Brigades de l'Air ;\n▪ Brigades de Filtrage ;\n▪ Postes de Gendarmerie de Transport Aérien (PGTA).",
    ["Gendarmerie de l'Air", 'Articulation']),

  card('gr12',
    "12. QUEL EST LE RÔLE DE LA GENDARMERIE DE L'AIR. (CS2E-SSP)",
    "**Aux emprises territoriales des Bases Aériennes :**\n▪ Contrôle et Accès à la circulation ;\n▪ Sécurité des installations ;\n▪ Participation aux Enquêtes techniques ;\n▪ Participation aux Enquêtes relatives au voisinage immédiat.\n\n**Dans les Aéroports Civils :**\n▪ Sécurité des sites et accès ;\n▪ Surveillance des installations techniques aéronautiques ;\n▪ Protection des aéronefs particuliers.",
    ["Gendarmerie de l'Air", 'Rôle']),

  // NOTE : La question 13 n'existe pas dans le document source (passe de Q12 à Q14)

  card('gr13',
    '14. QUELLES SONT LES ATTRIBUTIONS DU COMMANDANT DE RÉGION. (2R2C)',
    "▪ **Représentant** du Commandant de la GR dans sa circonscription ;\n▪ **Responsable** de l'application de la loi, de la doctrine du Cdmt et de la bonne marche du Sce ;\n▪ **Coordination**, cohésion et développement du dynamisme chez ses subordonnés ;\n▪ **Collaboration** avec les autorités judiciaires, administratives et militaires ainsi que les Départements ministériels dans sa circonscription.",
    ['Attributions', 'Commandant de Région']),

  card('gr14',
    '15. COMMENT EST ARTICULÉE LA G. MOBILE ET QUELLES SONT SES MISSIONS MAJEURES. (MR-DO)',
    "**Articulation :**\n▪ Groupements ;\n▪ Groupes d'escadrons ;\n▪ Escadrons et Pelotons.\n\n**Missions Principales (MR-DO) :**\n▪ Maintien de l'ordre ;\n▪ Renforcement de l'ordre.\n\n**Missions Secondaires :**\n▪ Participer à la Défense intérieure du territoire et aux Opérations d'assistance et secours.",
    ['Gendarmerie Mobile', 'Missions', 'Articulation']),

  card('gr15',
    "16. QUELS SONT LES DIFFÉRENTS SERVICES QU'ASSURE LA G. MOBILE. (SMR)",
    "▪ **Service de l'ordre** : service de police exécuté pour éviter une perturbation de l'ordre public ;\n▪ **Maintien de l'ordre** : prévenir des troubles au cours d'un rassemblement houleux ;\n▪ **Rétablissement de l'ordre** : intervention visant à rétablir l'ordre public initial.",
    ['Gendarmerie Mobile', 'Services']),

  card('gr16',
    '17. QUELLES SONT LES ATTRIBUTIONS DU CENTRE DE PERFECTIONNEMENT DE LA G. MOBILE (CPGM). (PRAM)',
    "▪ **Perfectionnement** du personnel des unités de la Gendarmerie Mobile ;\n▪ **Recyclage** éventuel des éléments d'autres composantes de la GR ;\n▪ **Application** des prescriptions du Commandement de la GR dans le domaine du MO ;\n▪ **Mise à niveau** des unités territoriales dans le domaine du MO.",
    ['CPGM', 'Gendarmerie Mobile']),

  card('gr17',
    '18. QUELLES SONT LA MISSION ET LES ATTRIBUTIONS DE LA G. PRÉVÔTALE.',
    "**Mission :** Exercice des missions de police dans une GU des FAR en Campagne.\n\n**Attributions :**\n▪ Assurer des fonctions de la PJ ressortissant aux tribunaux civils ;\n▪ Exercer la fonction de la PJ Militaire ;\n▪ Entretenir des liaisons étroites avec les Commandants des Brigades Territoriales de sa zone ;\n▪ Adresser à la Brigade locale une expédition des PV rapportant les activités de la population.",
    ['Gendarmerie Prévôtale', 'Missions', 'Attributions']),

  card('gr18',
    '19. COMMENT EST ORGANISÉE LA G. PRÉVÔTALE.',
    "▪ Chaque GU dispose d'un élément de Prévôté chargé des missions de police.\n▪ Le Commandant de la Prévôté est placé sous les ordres du Commandant de la GU et de son chef d'État-Major ; il est leur conseiller technique en matière d'emploi de la prévôté.",
    ['Gendarmerie Prévôtale', 'Organisation']),

  card('gr19',
    '20. QUEL EST LE RÔLE ET LES MISSIONS DU GROUPEMENT AÉRIEN. (REM-SUP)',
    "**Rôle (REM-SUP) :**\n▪ **Renforcer** l'action des unités de l'Arme dans le domaine de police administrative et police judiciaire ;\n▪ **Escortes** ;\n▪ **Missions** nécessitant l'utilisation de la 3ème Dimension.\n\n**Missions :**\n▪ **Sécurité Publique** : Surveillance ZEE, espaces forestiers, zones inaccessibles et axes routiers ;\n▪ **Utilité Publique** : Assistance, secours et ravitaillement des zones sinistrées ;\n▪ **Protection et sécurité** : Protection des installations aéroportuaires, transport et escorte des VIP.",
    ['Groupement Aérien', 'Missions', 'Rôle']),

  card('gr20',
    '21. QUELLES SONT LES MISSIONS DU GEH. (RESS)',
    "▪ **Rendre** les honneurs ;\n▪ **Escorte** des convois et cortèges royaux ;\n▪ **Sécurité** rapprochée de SM le Roi ;\n▪ **Sécurité** dans les sites royaux.",
    ['GEH', "Escadron d'Honneur", 'Missions']),

  card('gr21',
    '22. COMMENT EST ARTICULÉE LA G. MARITIME ET QUELLES SONT SES MISSIONS. (2CSL-3PDN)',
    "**Articulation :** Compagnies et Brigades maritimes.\n\n**Missions de Sécurité :**\n▪ Contrôle de la Navigation de plaisance ;\n▪ Contrôle de la Navigation maritime et ports ;\n▪ Surveillance du littoral ;\n▪ Sauvetage et secours ;\n▪ Lutte contre le trafic des stupéfiants ;\n▪ Lutte contre l'immigration clandestine.\n\n**Missions d'Environnement :**\n▪ Pollution atmosphérique ;\n▪ Pollution des eaux ;\n▪ Pollution radioactive ;\n▪ Dégradation des littoraux ;\n▪ Nuisances diverses.",
    ['Gendarmerie Maritime', 'Missions', 'Articulation']),

  card('gr22',
    '23. COMMENT EST ARTICULÉ LE GSI ET QUELLES SONT SES MISSIONS. (BAP)',
    "**Articulation :** Articulé en BSI à l'échelon Régions ainsi que des unités Para, Equestres et Blindées.\n\n**Missions (BAP) :**\n▪ Lutte contre le grand **Banditisme** ;\n▪ Lutte **Anti-terroriste** ;\n▪ Lutte contre la **Piraterie**.",
    ['GSI', 'Missions', 'Sécurité']),

  // II - MISSIONS DE LA GR
  card('gr23',
    '24. QUELLES SONT LES MISSIONS DE LA GR.',
    "▪ **Police Administrative** : à caractère préventif, elle peut réprimer pour maintenir la sécurité publique ;\n▪ **Police Judiciaire** : constater les infractions, rassembler les preuves et chercher les auteurs ;\n▪ **Police Militaire** : prévenir le désordre et maintenir la discipline dans les Corps/FAR, et réprimer.",
    ['Missions', 'GR', 'Police']),

  card('gr24',
    "25. QUEL EST LE FONDEMENT DU CADRE D'ACTION DE LA GR. (D3C-RRS)",
    "▪ Dahir sur le service de la GR de 1958 ;\n▪ Code Pénal ;\n▪ Code de Procédure Pénale ;\n▪ Code de Justice Militaire ;\n▪ Règlement de Discipline Générale des FAR ;\n▪ Règlement Provisoire du Service de Garnison ;\n▪ Service Intérieur des FAR.",
    ["Cadre d'action", 'Fondement', 'GR']),

  card('gr25',
    "26. LES DOMAINES D'ACTION DE LA GR DANS SA MISSION DE POLICE ADMINISTRATIVE. (S-STEP)",
    "▪ **S**écurité publique ;\n▪ **S**alubrité publique ;\n▪ **T**ranquillité publique ;\n▪ **E**sthétique publique ;\n▪ **P**rotection de l'environnement.",
    ['Police Administrative', 'Domaines']),

  card('gr26',
    '27. QUELLES SONT LES SUBDIVISIONS DE LA POLICE ADMINISTRATIVE.',
    "**Police administrative Générale** : surveillance continue pour assurer (SL) :\n▪ Sécurité des populations ;\n▪ Libre circulation des personnes et des biens.\n\n**Police administrative Spéciale (A.CCES.EE) :**\n▪ Police de l'Air, Ports et Frontières ;\n▪ Police de Chasse et Pêche ;\n▪ Police de Circulation et Roulage ;\n▪ Police des Étrangers ;\n▪ Police Sanitaire ;\n▪ Police des Explosifs, Armes et Munitions ;\n▪ Police d'Environnement.",
    ['Police Administrative', 'Subdivisions']),

  card('gr27',
    '28. CITER LES DIFFÉRENTS PLANS DE SECOURS ET DE SAUVETAGE EXÉCUTÉS PAR LA POLICE ADMINISTRATIVE.',
    "▪ **ORSEC** : organisation des plans de secours suite à un évènement calamiteux ;\n▪ **SAR** : recherche et sauvetage des aéronefs/navires en détresse dans les zones contrôlées par l'État ;\n▪ **SATER** : recherche, secours et enquête sur aéronefs disparus et tombés au-dessus du territoire ;\n▪ **SAMER** : recherche et sauvetage des aéronefs disparus ou tombés en mers territoriales.",
    ['Plans de secours', 'Police Administrative']),

  card('gr28',
    '29. DÉFINIR LA POLICE JUDICIAIRE. (PHEES)',
    "L'expression police judiciaire a plusieurs sens (PHEES), elle peut désigner :\n▪ **Phase** de procès pénal qui englobe les opérations policières ;\n▪ **Ensemble des actes** de la phase policière ou dans les phases ultérieures du procès pénal ;\n▪ **Ensemble des personnes**, fonctionnaires et militaires chargés d'accomplir certains actes ;\n▪ **Service** de la Sûreté Nationale ou du Ministère de l'Intérieur.",
    ['Police Judiciaire', 'Définition']),

  card('gr29',
    '30. QUELS SONT LES PERSONNELS DE LA POLICE JUDICIAIRE.',
    "▪ Officiers supérieurs de police judiciaire ;\n▪ Officiers de police judiciaire ;\n▪ Agents de police judiciaire ;\n▪ Fonctionnaires et Agents chargés de certaines fonctions de police judiciaire.",
    ['Police Judiciaire', 'Personnels']),

  card('gr30',
    '31. QUELLE EST LA NATURE DES MISSIONS DE LA POLICE JUDICIAIRE. (CRRED)',
    "▪ **Constater** l'infraction à la loi ;\n▪ **Rassembler** les preuves ;\n▪ **Rechercher** les auteurs ;\n▪ **Exécuter** les délégations des juridictions d'instruction ;\n▪ **Déférer** aux réquisitions.",
    ['Police Judiciaire', 'Missions']),

  card('gr31',
    '32. QUELLES SONT LES SUBDIVISIONS DE LA POLICE MILITAIRE.',
    '▪ **Police Militaire Générale** : prévention du désordre et maintien de la discipline dans les FAR ;\n▪ **Police Militaire Judiciaire** : répression.',
    ['Police Militaire', 'Subdivisions']),

  card('gr32',
    "33. QUELLE EST LA RELATION ENTRE LA GENDARMERIE (POLICE MILITAIRE) ET L'AUTORITÉ MILITAIRE.",
    "▪ **Subordination** de la GR aux Autorités militaires : la GR doit aviser les autorités militaires des faits les intéressant ;\n▪ **Droits** de la GR vis-à-vis de l'Autorité militaire :\n  - Réquisition de main-forte ;\n  - Responsabilité en cas d'action combinée : relevant du service spécial de la Gendarmerie.",
    ['Police Militaire', 'Autorité militaire']),

  card('gr33',
    '34. QUELLES SONT LES MISSIONS DE LA POLICE MILITAIRE GÉNÉRALE. (4S-PAPE)',
    "▪ **Sécurité** des troupes ;\n▪ **Surveiller** les installations militaires ;\n▪ **Surveiller** les lieux publics ;\n▪ **Signaler** les matériels abandonnés ;\n▪ **Protection** de la population ;\n▪ Veiller à l'**Application** du règlement militaire ;\n▪ **Prêter** main forte à l'autorité militaire ;\n▪ **Escorter**.",
    ['Police Militaire Générale', 'Missions']),

  card('gr34',
    '35. QUELLES SONT LES PARTICULARITÉS DE LA PROCÉDURE MILITAIRE. (DAGOO)',
    "▪ **Droit** de perquisition ;\n▪ **Accès** dans un domicile privé ;\n▪ **Garde** à vue ;\n▪ **Opérations** de Police Militaire en milieu civil ;\n▪ **Opérations** de Police Judiciaire civile en milieu militaire.",
    ['Procédure Militaire', 'Particularités']),

  card('gr35',
    '36. QUELLES SONT LES MISSIONS DE LA POLICE JUDICIAIRE MILITAIRE. (2R-SPA)',
    "▪ **Recherche** des déserteurs ;\n▪ **Recherche** des insoumis ;\n▪ **Surveillance** des militaires isolés ;\n▪ **Police** des cantonnements ;\n▪ **Acheminement** des militaires arrêtés.",
    ['Police Judiciaire Militaire', 'Missions']),

  card('gr36',
    "37. ORGANISATION DE L'EXERCICE DE LA POLICE JUDICIAIRE MILITAIRE.",
    "▪ Constater les infractions de la compétence du tribunal Militaire ;\n▪ Aviser les chefs de corps des arrestations des militaires sous leurs ordres.",
    ['Police Judiciaire Militaire', 'Organisation']),

  card('gr37',
    "38. QUEL EST LE CADRE D'EXÉCUTION DE LA POLICE JUDICIAIRE MILITAIRE. (SDC)",
    "▪ Sous la **Surveillance** du Procureur Général du Roi ;\n▪ Sous la **Direction** du Procureur du Roi ;\n▪ Sous le **Contrôle** de la Chambre correctionnelle près la Cour d'appel.",
    ['Police Judiciaire Militaire', "Cadre d'exécution"]),

  card('gr38',
    "39. DANS LE CADRE DES ENQUÊTES, QUEL EST LE RÔLE DE LA GR. (RAM)",
    "▪ **Recevoir** les plaintes et procéder aux enquêtes ;\n▪ **Arrêter** et conduire devant l'autorité militaire les individus objets d'infraction ;\n▪ **Mettre à exécution** les mandats de justice.",
    ['Enquêtes', 'Rôle', 'GR']),

  card('gr39',
    '40. QUELS SONT LES PERSONNELS DE LA POLICE JUDICIAIRE MILITAIRE.',
    "▪ Magistrats ;\n▪ Officiers de PJ militaire ;\n▪ Agents de PJ militaire.",
    ['Police Judiciaire Militaire', 'Personnels']),

  // III - MAINTIEN DE L'ORDRE
  card('gr40',
    "41. DÉFINIR LE MAINTIEN DE L'ORDRE.",
    "Mission de défense civile, visant à **prévenir les troubles**, au cours des rassemblements houleux, afin de ne pas avoir à les réprimer.",
    ["Maintien de l'ordre", 'Définition']),

  card('gr41',
    '42. À QUI REVIENT LA RESPONSABILITÉ DU MO.',
    "C'est l'**Autorité civile** qui est responsable du maintien de l'ordre. Pour se faire, elle dispose :\n▪ **Ordinairement** des Forces de Police et de la Gendarmerie ;\n▪ **Exceptionnellement** des FAR, qui constituent avec la Police et la Gendarmerie la Force Publique.",
    ["Maintien de l'ordre", 'Responsabilité']),

  card('gr42',
    "43. QUELLES SONT LES AUTORITÉS POUVANT PROVOQUER L'INTERVENTION DES FORCES DE MO.",
    "▪ Ministre de l'Intérieur ;\n▪ Walis et Gouverneurs ;\n▪ Super-Caïds et Caïds ;\n▪ Pachas.",
    ["Maintien de l'ordre", 'Autorités']),

  card('gr43',
    '44. DANS QUELS CAS LA GR PEUT FAIRE USAGE DE LA FORCE EN DEHORS DU MAINTIEN DE LA PAIX. (VARID)',
    "▪ Lorsque des **Violences** sont exercées contre elle ;\n▪ **Arrestation** des personnes ;\n▪ **Rébellion** ou Tentative d'évasion de prisonniers ;\n▪ Pour l'**Immobilisation** des véhicules ;\n▪ Pour **Défense** des personnes, terrains ou postes confiés à sa garde.",
    ["Maintien de l'ordre", 'Usage de la force']),

  card('gr44',
    "45. QUELLES SONT LES MODALITÉS D'INTERVENTION DE LA GENDARMERIE EN MO.",
    "L'autorité civile ne peut faire intervenir la Force Armée au MO qu'en vertu de deux moyens :\n▪ **Demande de Concours** : concerne les attributions de la GR ;\n▪ **Réquisition** : demande formelle adressée à la GR pour une mise en action dans une opération légale.",
    ["Maintien de l'ordre", 'Intervention', 'Modalités']),

  card('gr45',
    '46. LES OPÉRATIONS ÉLÉMENTAIRES DU MO.',
    "▪ Opérations d'arrêt : les **barrages** ;\n▪ **Barrage fixe fermé**.",
    ["Maintien de l'ordre", 'Opérations élémentaires', 'Barrage']),

  card('gr46',
    "47. QUEL EST LE BUT D'UN BARRAGE DANS LES OPÉRATIONS DU MO.",
    "**Interdire** complètement à une foule, l'accès à un espace donné pendant un temps déterminé.",
    ["Maintien de l'ordre", 'Barrage', 'But']),

  card('gr47',
    '48. QUELS SONT LES TYPES DE BARRAGES EFFECTUÉS LORS DES OPÉRATIONS DU MO.',
    "▪ **Barrage de Canalisation** : la foule doit être amenée à emprunter un itinéraire au lieu d'un autre ;\n▪ **Barrage d'Arrêt** : la foule ne doit pas pénétrer ou déborder d'un espace déterminé ;\n▪ **Barrage Filtrant** : seules certaines personnes sont admises à pénétrer dans un espace interdit.",
    ["Maintien de l'ordre", 'Barrage', 'Types']),

  card('gr48',
    '49. QUEL EST LE PRINCIPE DU BARRAGE FIXE FERMÉ.',
    "▪ Interdiction d'accès est **absolue** ;\n▪ Impression de **masse, de puissance et de cohésion** est nécessaire face à une foule ;\n▪ Barrage doit être mis en place au **moment et lieu opportuns**.",
    ["Maintien de l'ordre", 'Barrage fixe fermé', 'Principe']),

  card('gr49',
    '50. QUELLE EST LA COMPOSITION DU BARRAGE FIXE FERMÉ. (CASR)',
    "▪ Élément de **Contact** ;\n▪ Élément d'**Appui** ;\n▪ Élément de **Sûreté** ;\n▪ Élément de **Réserve**.",
    ["Maintien de l'ordre", 'Barrage fixe fermé', 'Composition']),

  card('gr50',
    '51. QUELLES SONT LES FORMES DÉRIVÉES DU BARRAGE FIXE FERMÉ. (TT-MFIEC)',
    "▪ Barrage en **Tiroirs** ;\n▪ Barrage à **Tourniquet** ;\n▪ Barrage **Mobile** d'Arrêt ;\n▪ Barrage **Filtrant** ;\n▪ Barrage **Intermittent** ;\n▪ Barrage en **Éventail** ;\n▪ Barrage de **Canalisation**.",
    ["Maintien de l'ordre", 'Barrage', 'Formes dérivées']),

  card('gr51',
    '52. QUELS SONT LES PROCÉDÉS DES OPÉRATIONS DE DÉGAGEMENT FACE À UNE FOULE CALME.',
    "▪ **Traversée de la foule** : vise le dégagement des manifestants par départ volontaire ;\n▪ **Vague de refoulement** : oblige les manifestants à quitter les lieux ;\n▪ **Vague de ratissage** : impose un dégagement pacifique par tri.",
    ["Maintien de l'ordre", 'Dégagement', 'Procédés']),

  card('gr52',
    '53. DÉFINIR LA CHARGE.',
    "La charge est une **opération brutale et violente** de dégagement de foule. Elle ne se conçoit qu'en **dernier ressort** face à une foule hostile.",
    ["Maintien de l'ordre", 'Charge', 'Définition']),

  card('gr53',
    "54. DÉTACHEMENTS À ACTIONNER POUR L'ÉVACUATION DES LOCAUX OCCUPÉS. (SICR)",
    "▪ Dét **Surveillance-Sûreté** ;\n▪ Dét **Intervention** intérieure ;\n▪ Dét **Canalisation** manifestants expulsés ;\n▪ Dét **Réserve**.",
    ["Maintien de l'ordre", 'Évacuation', 'Détachements']),
];

async function main() {
  console.log('🚀 Démarrage de la synchronisation Gendarmerie Royale → Supabase\n');

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
    console.log(`\n📊 Vérification : ${data.length} cartes trouvées dans Supabase pour le deck GR.`);
  }
}

main().catch(console.error);
