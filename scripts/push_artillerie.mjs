// push_artillerie.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rwcdvoliowjmoaunarod.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Y2R2b2xpb3dqbW9hdW5hcm9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYwNjE4OCwiZXhwIjoyMTAyMTgyMTg4fQ.yOQm8Ujs_QU4PrkCLVFARTg-Is6lt-nWgY_RmFuEn7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DECK_ID = 'deck-artillerie';
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
  title: 'Artillerie',
  description: "Questionnaire complet d'Artillerie sol-sol et sol-air (Organisation, Emploi, Missions, Logistique, Drones, ASA).",
  folder: 'Artillerie',
  color: 'red',
  icon: 'Target',
  telegram_reminder_enabled: false,
  created_at: now,
};

const CARDS = [
  card('art1', "Q1 : Donner l’Organisation de l’Artillerie.",
    "➢\tGroupes d’Artillerie sol-sol \n➢\tGroupes d’Artillerie sol-air \n➢\tGroupe de Soutien Artillerie (GSA) \n➢\tEcole Royale de l’Artillerie (ERART)",
    []),
  card('art2', "Q2 : Quels sont les niveaux de Responsabilité de l’Artillerie sol-sol.",
    "➢\tEmploi, qui est de la responsabilité du chef IA ; \n➢\tMise en œuvre qui est de la responsabilité du Commandant le GAR ; \n➢\tExécution qui est de la responsabilité du Commandant la Batterie.",
    []),
  card('art3', "Q3 : Quels sont les niveaux d’Emploi de l’Artillerie sol-sol.",
    "Les GARs se répartissent en deux niveaux, en fonction de la GU responsable de leur emploi : \n➢\tArtillerie d'Appui direct pour les unités affectées aux Brigades. \n➢\tArtillerie d'Action d'ensemble pour les unités affectées à l’échelon supérieur.",
    []),
  card('art4', "Q4 : Quelles sont les Liaisons que l’Artillerie sol-sol doit établir.",
    "➢\tLes liaisons en Transmission automatique de données : à travers des liaisons entre les différentes entités d’un GAR pour assurer la permanence des feux. \n➢\tLes Détachements de liaison : Les DL, DLO et ELO assurent la liaison respectivement au sein du PC de la GU, au niveau des Groupements et au niveau des Sous-Groupements appuyés.",
    []),
  card('art5', "Q5 : Donnez la Composition (articulation) d’un GAR sol-sol.",
    "➢\t01 Batterie de Commandement et de Service (BCS) ; \n➢\t03 Batteries de tir de 06 pièces chacune.",
    []),
  card('art6', "Q6 : Comment sont Répartis les éléments de l’Artillerie sol-sol.",
    "➢\tPersonnel dans les PC des GU (niveau emploi) : \n•\tConseiller feux : Au niveau Brigade, c’est généralement le Commandant le GAR sol-sol. \n•\tCellule « appuis 3D » : c’est le Centre de Mise en Œuvre Feux (CMO) dans la profondeur, dont le responsable est désigné par le Commandement d’Artillerie. \n•\tDétachement de Liaison du GAR sous la responsabilité du Commandant du GAR : détaché auprès du PC de la GU, il participe à l'élaboration des ordres d'emploi.\n➢\tDétachements de Liaison et d’Observation : détachés auprès du chef d’un Groupement de mêlée. \n➢\tUnités constituées.",
    []),
  card('art7', "Q7 : Donnez le Déploiement du GAR sol-sol sur le terrain.",
    "Le GAR est répartit sur le terrain, de l’avant à l’arrière, de la façon suivante :\n➢\tDétachements de Liaison et d’Observation (DLO) : Les commandants de Batteries (chefs de DLO) assurent la liaison auprès des commandants de Bataillons/Groupements de la Brigade. \n➢\tERT (Equipes de Reconnaissance et de Topographie) précèdent leurs Batteries sur le terrain à la recherche de positions, vers l’avant ou vers l’arrière, suivant l’évolution de la manœuvre. \n➢\tBatteries de tir sont déployées à distance de sûreté aux ordres des Officiers de tir. Elles regroupent, à proximité des pièces, les trains de combat de l’unité (TC1). \n➢\tTC2 plus à l’arrière, entre zone de déploiement des Batteries et base de Bde où se trouvent les TR. \n➢\tLe PCG, où sont traités les problèmes de manœuvre, de tir et de renseignement, dirigé par le Cdt en Second, peut, pour les déplacements, se scinder en deux éléments semblables.",
    []),
  card('art8', "Q8 : Quels sont les types d’organisation d’un Groupement d’Artillerie sol-sol.",
    "➢\tCentralisation : Le Groupement est alors assimilable à un GAR à 06 Batteries. Cette organisation manque de souplesse et constitue une lourde charge pour le PC. \n➢\tDécentralisation : Le commandant du Groupement délègue au PC du GAR de renforcement, la conduite totale de la manœuvre de son GAR. Ce type d’organisation implique des assurances quant à la durée du renforcement. \n➢\tCentralisation limitée : Solution intermédiaire permettant de s’adapter à toutes les situations grâce à plusieurs organisations possibles comme :  \n•\tPC de Groupement envoie ses ordres au PC du GAR de renforcement qui sert du démultiplicateur; \n•\tPC de Groupement décentralise la manœuvre et la logistique mais centralise le tir et le rens.",
    []),
  card('art9', "Q9 : Quels sont les Moyens Feux que doit posséder l’Artillerie sol-sol.",
    "L’Artillerie sol-sol possède des moyens appropriés pour Traiter les objectifs justiciables du champ de bataille, de façon puissante et efficace. Ainsi, les nouveaux systèmes d’armes procurent à l’Artillerie des possibilités d’exécuter des tirs à cadence rapide en profondeur et sur le front.",
    []),
  card('art10', "Q10 : Quel est le But des équipements d’aide au Tir de l’Artillerie sol-sol.",
    "Les équipements d’aide au tir ont pour but d’éliminer : \n➢\tLes temps morts qui s’accumulent au long d’une séquence de tir ; \n➢\tLes erreurs liées à la détermination des coordonnés et des données météorologiques et balistiques.",
    []),
  card('art11', "Q11 : Que comprennent les Equipements d’aide au Tir de l’Artillerie sol-sol.",
    "➢\tSystèmes de Transmission de données ;                                                                            TAG\n➢\tMoyens d’Acquisition et d’observation ;\n➢\tSystèmes de Gestion des feux (ATLAS/CAESAR, C4I/PULS, SITTA/M109 et autres).",
    []),
  card('art12', "Q12 : Quels sont les Moyens qui permettent à l’Artillerie d’accomplir sa mission de Renseignement.",
    "➢\tRéseaux d’observateurs avancés complétés par les observateurs d’ensemble, des moyens électromagnétiques ou des drones ISTAR ;                                                                                  3RS\n➢\tRadars de Tir de l’Artillerie sol-sol ;  \n➢\tRadars de Trajectographie ; \n➢\tStations Numériques d’Observation (DOS).",
    []),
  card('art13', "Q13 : Quels sont les Moyens Transmissions dont sont dotées les unités d’Artillerie sol-sol.",
    "➢\tPostes MA de moyenne puissance qui assurent les liaisons externes ;\n➢\tPostes MF pour les liaisons internes et avec l’arme appuyée ; \n➢\tRécepteurs d’alerte.",
    []),
  card('art14', "Q14 : Quelles sont les Missions de l’Artillerie sol-sol.",
    "➢\tMission « Renseignement » :                                                                                     RASE-CAF\n•\tRecherche du renseignement de manœuvre ; \n•\tAcquisition d'objectifs ; \n•\tSuivi d'objectifs ; \n•\tEvaluation des dommages. \n➢\tMission « Feu » :  \n•\tContrebatterie : participer à la conquête de la supériorité du feu, au moins sur une direction ; \n•\tAppui au contact des unités de mêlée : en intervenant sur les objectifs hors d’atteinte des tirs directs ; \n•\tFeux dans la profondeur : désorganiser le dispositif adverse dans la profondeur.",
    []),
  card('art15', "Q15 : Quels sont les Principes qui régissent l’emploi de l’Artillerie sol-sol.",
    "➢\tRecherche de la Permanence des feux ;                                                                               P-RCC\n➢\tRecherche du Rendement ;                                                                                                  \n➢\tCoordination entre les formations ;\n➢\tCombinaison des moyens feux.",
    []),
  card('art16', "Q16 : En quoi consiste l’Emploi de l’Artillerie sol-sol pour le chef I.A.",
    "L’emploi de l’Artillerie consiste pour le chef I.A à Déterminer les missions qu’il entend confier à l’ensemble des unités de l’Artillerie placées sous ses ordres, dans le cadre de la mission d’ensemble donnée à la GU. \nDans le cadre de cette mission, le chef interarmes fixe pour chaque phase de la bataille :                D-MCOM\n➢\tMissions générales pour l’ensemble de l’Artillerie et particulières pour les unités réservées ; \n➢\tConsommations en munitions autorisées pour une durée déterminée ou pour chaque phase ; \n➢\tOrganisation de l’Artillerie, moyens reçus en renforcement ou conservés aux ordres ;\n➢\tMesures de coordination en particulier les liaisons à établir entre les diverses formations.",
    []),
  card('art17', "Q17 : Expliquez l’emploi de l’Artillerie sol-sol dans les différentes phases de la manœuvre.",
    "Dans l’offensive : L’Artillerie prépare et accompagne l’action des autres Armes par : \n➢\tTirs de préparation : exécutés avant le débouché de l'attaque amie qui visent à neutraliser ou détruire l’ennemi. \n➢\tTirs d’accompagnement : visent de neutraliser l’ennemi pendant l’attaque. \nDans la défensive : L’Artillerie effectue : \n➢\tTirs de contre préparation : qui ont pour objet de dissocier le dispositif d'attaque adverse. \n➢\tTirs d’accompagnement : visent de briser l'attaque ennemie avant qu'elle atteigne les premiers éléments de la défense.",
    []),
  card('art18', "Q18 : En quoi consiste la Mise en œuvre de l’Artillerie sol-sol.",
    "- La Mise en œuvre de l’Artillerie Sol-Sol est de la responsabilité du Chef d'Artillerie, elle recouvre l'ensemble des dispositions que prend celui-ci pour remplir la mission qui lui a été fixée par le Chef IA.  \n- En fonction des \"Ordres A l'Artillerie\" reçus du Chef IA concernant l'Emploi de l'Artillerie, il va élaborer      et donner les ordres de Mise en œuvre, appelés \"Ordres De l'Artillerie\". Ces ordres s'adressent aux subordonnés directs, c'est-à-dire au Cdt en Second du GAR. \n- La MEO couvre les domaines du renseignement, feux, matériels, transmissions et Logistique.",
    []),
  card('art19', "Q19 : Que signifient les Ordres A l’Artillerie et sur quoi portent-ils.",
    "Les ordres à l’Artillerie sont les Décisions d’emploi de l’artillerie prises par le commandant de la GU et qui sont incluses soit dans la conception de la manœuvre, soit dans la décision initiale, soit dans l’ordre d’opération. Les Ordres à l’Artillerie portent sur :                                                                           D-MCOM                                                                                                                     \n\tMissions (feux et renseignements) avec si nécessaire l’ordre de priorité ;  \n\tConsommations de munitions autorisées ; \n\tOrganisation de l’Artillerie avec les renforcements de feux prévus ; \n\tMesures de coordination.",
    []),
  card('art20', "Q20 : Quelle est la différence entre « l’Ordre A l’Artillerie » et « l’Ordre De l’Artillerie ».",
    "- Le Chef IA Arrête les décisions d’emploi de l’Artillerie qui constituent dans les plans et les Ordres d’Opérations, le paragraphe « ARTILLERIE » ou « ORDRES À L’ARTILLERIE ». \n- Mais la responsabilité du Chef d’Artillerie consiste à Elaborer et Donner les Ordres de Mise en œuvre de celles-ci et qui sont exprimées dans le paragraphe « ORDRES DE L’ARTILLERIE ».",
    []),
  card('art21', "Q21 : Quelles sont les Modalités de déclenchement des feux de l’Artillerie sol-sol.",
    "Les tirs de l’Artillerie peuvent être déclenchés : \n➢\tSur demande des unités appuyées (par l'intermédiaire d'un DLO) ; \n➢\tSur ordre du Commandant de la GU et exceptionnellement d'une autorité supérieure.",
    []),
  card('art22', "Q22 : Comment sont Gérés les feux de l’Artillerie sol-sol.",
    "➢\tTirs planifiés : déclenchement soit « à l'horaire », soit « à la demande ». Le PC du GAR est responsable du respect des horaires fixés pour l'engagement d'objectifs planifiés à la demande. \n➢\tTirs d'opportunité : le PC du GAR statue sur cette demande. En fonction de ses possibilités et des priorités tactiques, il décide de l'accorder, la différer ou la refuser.",
    []),
  card('art23', "Q23 : En quoi consiste la manœuvre dans le Processus de mise en œuvre de l’Artillerie Sol-Sol.",
    "➢\tFaire manœuvrer les Epes Reco et les Batteries avec un temps d’avance (délais inhérents terrain) ;                                                                                                                                                                                                          \n➢\tDéployer ses unités à bonnes portées de tir ;                                                                            FDM\n➢\tMettre une partie des Batteries en position avancée pour pouvoir effectuer des tirs en profondeur.",
    []),
  card('art24', "Q24 : Quels sont les effets Feux de l’Artillerie Sol-Sol.",
    "➢\tEffets d’Agression ; \n➢\tEffets Spéciaux ; \n➢\tEffets sur le Mouvement.",
    []),
  card('art25', "Q25 : Quels sont les effets feux d’Agression de l’Artillerie Sol-Sol.",
    "➢\tDestruction : peut être demandée sur des objectifs d’infrastructure.   \n➢\tDestruction tactique : mise hors de combat de 30 % des cibles composant un objectif tactique.  \n➢\tNeutralisation à temps : empêcher un ENI de poursuivre sa mission pendant une courte durée.  \n➢\tNeutralisation tactique : mise hors combat de 10 % des cibles composant un objectif tactique.   \n➢\tHarcèlement : créer un climat d’insécurité dans une zone que l'on ne peut observer. Ces tirs sont consommateurs de munitions et l’effet recherché est avant tout psychologique. \n➢\tSemonce : démonstration de capacité, en tirant sur des objectifs «vides» ou Munitions non létales ;",
    []),
  card('art26', "Q26 : Quels sont les effets feux Spéciaux de l’Artillerie Sol-Sol.",
    "➢\tAveuglement : plutôt réservé à la zone des contacts. Il est appliqué devant un observatoire ou une base de feux pendant le mvt des unités de mêlée amies. \n➢\tEclairement du champ de bataille : permet de dévoiler l'ennemi qui manœuvre dans une zone proche des contacts (l’effet de 8 obus permet d’éclairer une zone de 1 km² pendant 2 minutes).",
    []),
  card('art27', "Q27 : Quels sont les effets sur le Mouvement de l’Artillerie Sol-Sol.",
    "➢\tPréparation d’Artillerie : exécutée avant une attaque ou une contre-attaque amie, est une combinaison de destructions tactiques, de neutralisations et d’aveuglements. \n➢\tBarrage : vise à interdire la libre circulation entre plusieurs compartiments de terrain, en battant une ligne dans la profondeur. Il permet de cloisonner l’ENI et ainsi de faciliter la manœuvre amie. \n➢\tArrêt : vise à interdire à des objectifs en mouvement l'accès aux positions amies, en appliquant les feux sur une ligne du terrain, à proximité de celles-ci.",
    []),
  card('art28', "Q28 : Quels sont les Objectifs Prioritaires des Tirs de l’Artillerie Sol-Sol.",
    "➢\tChars ; \n➢\tSystèmes Antichars ; \n➢\tArtillerie adverse ;\n➢\tRampes de missiles ; \n➢\tMoyens C2 ;                     CAARMMUS\n➢\tMoyens d’acquisition ;\n➢\tUnités débarquées ; \n➢\tSites logistiques.",
    []),
  card('art29', "Q29 : Par quoi se caractérisent les objectifs du champ de bataille.",
    "Nature     Volume     Attitude    Localisation.                                                                        NVA-L",
    []),
  card('art30', "Q30 : En quoi consistent les Plans de Feux.",
    "Les plans de feux sont établis sur ordre du Cdt de l’Artillerie par le PCG du GAR (ou Groupement) à partir des demandes des unités appuyées.",
    []),
  card('art31', "Q31 : Expliquer pourquoi l’Artillerie constitue-t-elle une source privilégiée de renseignement.",
    "L'Artillerie est toujours considérée comme une source privilégiée de renseignement pour le chef IA. L'acquisition des objectifs dans la profondeur suit un Cycle, pour les Détecter, Reconnaître, Identifier, Suivre, et finalement les Caractériser et Localiser pour permettre leur Traitement.                C-DRISCL",
    []),
  card('art32', "Q32 : Que signifie la mission de Renseignement pour l’Artillerie.",
    "L’Artillerie S/S doit participer à la mission de Renseignement commune à toutes les Armes, dans le cadre du plan général de recherche du Renseignement établi par la GU.",
    []),
  card('art33', "Q33 : Quels sont les Principes de la manœuvre logistique du GAR.",
    "➢\tLe PC du GAR est responsable de la conception de la manœuvre logistique. \nCelle-ci est conduite par le Chef des Services Techniques ; \n➢\tDeux impératifs contradictoires sont à concilier en permanence : \n•\tStabilité des déploiements pour un fonctionnement optimal ; \n•\tSoutien au plus près pour réduire les délais. \n➢\tLes munitions tranche « D » sont perçues à chaque fois auprès de la base logistique.",
    []),
  card('art34', "Q34 : Comment le Soutien de l’Artillerie est organisé. (Déploiement)",
    "➢\tTrains de combat (TC1) ;\n➢\tTrains de combat (TC2), composé de cinq îlots : \n \n•\tCommandement ; \n•\tRavitaillement tranche D ;\n•\tRavitaillement munitions autres que D ;\n•\tMaintenance ;\n•\tSanté. \n \n➢\tTrain régimentaire (TR).",
    []),
  card('art35', "Q35 : Comment les Ravitaillements d’un GAR sont organisés.",
    "➢\tGAR Transporte environs 1,5 UF avec ses moyens propres ;                                                TASM\n➢\tAutonomie logistique doit être maintenue en permanence au niveau fixé initialement ;  \n➢\tSeuil est précisé par le Cdt du GAR, en liaison avec la GU ; \n➢\tMunitions tranche D perçues du TC2 directement auprès du S/GL. Elles sont aussi livrées aux TC1 par les véhicules du TC2.",
    []),
  card('art36', "Q36 : Comment la Maintenance d’un GAR est organisée.",
    "Le GAR est responsable de la majorité des opérations de maintenance. Les réparations et les évacuations sont entreprises conformément aux priorités techniques et tactiques fixées dans l’Ordre Administratif et Logistique.",
    []),
  card('art37', "Q37 : Quelles sont les possibilités de l’Artillerie sol-sol dans la manœuvre Offensive.",
    "➢\tReconnaissance offensive (Consommation 1UF/J) :                                                              REA  \n•\tRenseigner dans la profondeur.                            2RAGB\n•\tRéduction des résistances dépassées ;                  \n•\tPrendre à partie l’Artillerie adverse ;\n•\tGêner le Soutien ;\n•\tDésorganiser les Blindés en attaque.\n➢\tExploitation (Consommation 2UF/J) :                                                                  \n•\tRenseigner sur les échelons de soutien.                 3RCP\n•\tRéduction des résistances dépassées ;                  \n•\tBloquer des Réactions offensives ;\n•\tCouvrir un flanc ;\n•\tAppuyer la Progression. \n➢\tAttaque (Consommation 3UF/J) : \n•\tRenseigner dans la profondeur.                           RFDNCC\n•\tFaciliter le débouché ; \n•\tDisloquer les unités qui se déploient ;\n•\tNeutraliser les moyens feux ; \n•\tArrêter les Contre-attaques ;\n•\tCouvrir un flanc.",
    []),
  card('art38', "Q38 : Quelles sont les possibilités de l’Artillerie sol-sol dans la manœuvre Défensive.",
    "➢\tManœuvre Retardatrice (Consommation 2UF/J) :                                                                RAC\n•\tRenforcer les Coups d’arrêt ;                               3CoFRA            \n•\tAccompagner les Contre-attaques amies ;\n•\tDissocier les Contre-attaques ennemies ;\n•\tFaciliter les Décrochages des unités pendant le freinage. \n•\tRenseigner sur les échelons de soutien ;                 \n•\tPrendre à partie l’Artillerie adverse.\n➢\tManœuvre d’Arrêt (Consommation moyenne de 3UF/J) : \n•\tAccompagner les Contre-attaques amies ;\n•\tCouvrir un flanc ;\n•\tRenseigner sur un flanc et dans la profondeur.     2Co3RA\n•\tRalentir les Renforts ennemis ;\n•\tBloquer des Réactions offensives.\n•\tPrendre à partie l’Artillerie adverse ;\n➢\tContre-attaque (Consommation moyenne de 3UF/J) : \n•\tIdentique à l’attaque.                                            RFDNCC",
    []),
  card('art39', "Q39 : Comment les Conditions Générales de bataille ont modifié le style des combats.",
    "➢\tGénéralisation du blindage met les équipages à l'abri des effets directs de l'artillerie ; GMED-MSFR \n➢\tMécanisation des unités leur permet une grande mobilité tactique et une grande fluidité ; \n➢\tEquipement des unités en drones leur conférant de nouvelles capacités ; \n➢\tDispersion des unités sur le terrain diminue leur vulnérabilité aux tirs aériens et terrestres. \n➢\tMutation rapide du champ de bataille requiert des unités d'artillerie de : \n•\tSuivre le rythme des opérations ; \n•\tS’adapter aux Fluctuations du combat de l’avant ; \n•\tRéduire la possibilité de détection des positions de batteries par l’ennemi.",
    []),
  card('art40', "Q40 : Quels sont les Principes d’emploi des systèmes drones de l’Artillerie.",
    "➢\tAdaptation : de leur engagement au rythme des opérations ;                                                   ASIE\n➢\tSynergie : des efforts de tous les intervenants dans l’accomplissement de la mission d’Appui Drone ; \n➢\tIntégration : dans les différents échelons de la chaine de commandement ; \n➢\tEfficacité : à travers l’accroissement du rendement opérationnel des forces engagées.",
    []),
  card('art41', "Q41 : Quel est le Cadre d’emploi des systèmes drones de l’Artillerie.",
    "➢\tEmploi en temps de paix : dans le cadre de la Posture Permanente de Sûreté, les Commandants d’Armes Délégués détiennent l’emploi des systèmes drones pour les missions ISR.  \n➢\tEmploi en opération : l’emploi des systèmes relève des Commandements Opérationnels désignés.",
    []),
  card('art42', "Q42 : Quelles sont les Missions des systèmes drones de l’Artillerie.",
    "➢\tMissions de Combat. \n \n➢\tMissions d’Intérêt Général et de DOT.",
    []),
  card('art43', "Q43 : Quelles sont les missions de Combat des systèmes drones de l’Artillerie.",
    "➢\tMission « Renseignement » : \t\t\t\t\t\t\t             SAC-MED-ZC\n•\tSurveillance du champ de bataille ; \n•\tAcquisition des objectifs ; \n•\tCiblage (capteur). \n➢\tMission « Feu » : \n•\tMissions de Mise en Place des tirs ; \n•\tMission d’Evaluation des dommages ; \n•\tMissions de Destruction. \n➢\tMissions particulières : \n•\tMissions en Zone Urbaine ; \n•\tMissions de Collecte de l’information géographique.",
    []),
  card('art44', "Q44 : Quelle est l’Organisation des systèmes drones au niveau des Unités de l’Artillerie.",
    "Les Sections Systèmes Drones font partie intégrante de la Batterie d’Acquisition et de Traitement (BAT) des Régiments d’Artillerie. \n➢\tSection Drones ISTAR : regroupe les systèmes drones ISTAR classes I et II. Elle est chargée des missions de recueil du renseignement d’Origine Image. Elle participe également à l’acquisition des objectifs, la destruction et mise en place des tirs et l’évaluation des dommages. \n➢\tSection Drones à charge militaire : dispose des systèmes de drones à charge militaire, récupérables ou non, chargés d’explosifs qui s’amorcent au contact ou à proximité des cibles.",
    []),
  card('art45', "Q45 : Expliquez la Mise en œuvre des systèmes drones au niveau des unités de l’Artillerie.",
    "Au reçu de l’ordre à l’Artillerie, le Cdt l’Unité de l’Artillerie est responsable de l’application des directives planifiées, et ce, en faisant apparaitre dans son ordre de l’Artillerie un Paragraphe dédié exclusivement à la mise en œuvre de la BAT. La BAT est une unité élémentaire intégrée aux Unités de l’Artillerie et qui a pour mission l’acquisition du Renseignement d’Origines Image, Electromagnétique et Géographique ainsi que le traitement d’objectifs par drones à charge militaire. Elle est articulée en 05 sections :   Commandement, Drones ISTAR, Drones à charge militaire, Radars et Géographique.",
    []),
  card('art46', "Q46 : Quels sont les Déploiements possibles des systèmes drones de l’Artillerie.",
    "➢\tDéploiement Centralisé : l’entité drone reste groupée sous les ordres du Cdt l’Unité détentrice. \n➢\tDéploiement Décentralisé : chaque équipe drones sera détachée à une Unité subordonnée bénéficiaire.",
    []),
  card('art47', "Q47 : Quelles sont les Contraintes qui régissent le choix des déploiements des systèmes drones.",
    "➢\tSystèmes Anti-drones ENI ;                                                                                       ASCT-SCT\n➢\tSituation tactique générale ; \n➢\tCapacités techniques du système de drones ; \n➢\tType de mission drone ; \n➢\tIntégration au Spectre électromagnétique ; \n➢\tIntégration dans la Circulation aérienne (C3D) ; \n➢\tTerrain et Conditions météorologiques.",
    []),
  card('art48', "Q48 : Donner la Typologie de la Menace aérienne.",
    "➢\tMenace aérienne classique :                                                                                       3MVA-PD\n•\tMunitions Stand-off ; \n•\tMissiles balistiques tactiques (TBM) ;  \n•\tMissiles de croisière (CM) ; \n•\tVéhicules aériens sans pilote ; \n•\tAéronefs à voilure fixe et à voilure tournante.\n➢\tMenace aérienne non conventionnelle : \n•\tPlateforme aérienne non militaire ; \n•\tDrones commerciaux.",
    []),
  card('art49', "Q49 : Quelles sont les Caractéristiques de la menace aérienne.",
    "➢\tPermanence : Aptitude de l’ENI aérien à engager ses moyens 3D en tout temps.                       PUBI                                                                                                                    \n➢\tUbiquité : Aptitude de l’ENI aérien à intervenir simultanément contre plusieurs objectifs. \n➢\tBrutalité et soudaineté : Aptitude de l’ENI aérien à effectuer des attaques brèves et brutales. \n➢\tIntensité variable : Réside dans la diversité des vecteurs et armements.",
    []),
  card('art50', "Q50 : Quels sont les Modes d’action des aéronefs.",
    "➢\tReconnaissance : Depuis la ligne des contacts jusqu’à la profondeur du dispositif ;              RIAGA\n➢\tInterdiction sur les arrières (AI), principalement au niveau des coupures et des infrastructures, mais aussi par l’attaque des forces lors de leurs déplacements et stationnements avant l’engagement ; \n➢\tAppuis Feu rapproché (CAS) : dans la zone des combats, visant en priorité la destruction des moyens de défense sol-air et de commandement ; \n➢\tActions de Guerre électronique : mesures de soutien et d’attaque électronique dans le but d’obtenir des informations ou de neutraliser/détruire les radars distinctifs des Systèmes d’Armes sol-air ; \n➢\tAppui Transport, par avions ou hélicoptères, au cours d’opérations aéroportées dans la profondeur.",
    []),
  card('art51', "Q51 : Quel est le Rôle de l’ASA.",
    "•\tLiberté d’action des forces engagées et Protection des sites sensibles ;                        LiP-Att\n•\tParticiper à l’Attrition des moyens aériens adverses.",
    []),
  card('art52', "Q52 : Quelles sont les Missions de l’ASA.",
    "➢\tDéfense d’Ensemble : globale et uniformément répartie sur toute la zone, dédiée aux SALP et SAMP.                                                                                                         \n➢\tDéfense Particulière : interdire en permanence à l’ennemi aérien d'agresser un ou plusieurs sites dûment identifiés. Elle concerne tous les SA mais dédiée particulièrement aux SACP.              DEPAR\n➢\tDéfense d’Accompagnement : défense antiaérienne des unités de manœuvre contre toute attaque. \n➢\tRenseignement (surveillance aérienne) : l’ASA peut participer à cette mission. Néanmoins le recours aux radars de l’ASA pour la surveillance n’est pas recommandé.",
    []),
  card('art53', "Q53 : Quelle est l’Organisation d’un GAR ASA (SACP-SAMP).",
    "➢\tSACP  \n•\t01 Bie Commandement et Service (BCS) ; \n•\t03 Bies combinées (canons et missiles) ; \n➢\tSAMP  \n•\t01 Bie Commandement et Service (BCS) ; \n•\t03 Bies de Tir (à base de missiles).\n \n•\t01 Bie canon (VULCAN à 12 pièces).",
    []),
  card('art54', "Q54 : Quelle est l’Echelle des Altitudes des systèmes ASA.",
    "•\tTrès basse altitude : 0 à 150m ; \n•\tBasse altitude : 150 m à 1 500 m ; \n•\tMoyenne altitude : 1 500 à 7 500 m ; \n•\tHaute altitude : 7 500 à 15 000 m ; \n•\tTrès Haute Altitude : Au-delà de 15 000 m.",
    []),
  card('art55', "Q55 : Quelle est la Classification des S.A de l’ASA.",
    "•\tSATCP : 0 à 5km ; \n•\tSACP : 5 à 18km ; \n•\tSAMP : 18 à 90 km ; \n•\tSALP > 90Km.",
    []),
  card('art56', "Q56 : Quels sont les Principes d’emploi de l’ASA.",
    "•\tPermanence des feux : nécessaire de jour comme de nuit.                                                   PICI\n•\tIntégration à la manœuvre : l’ASA ne mène pas le combat isolément. La réussite de la manœuvre dépend de la capacité de l’ASA à annihiler l’ennemi aérien. \n•\tComplémentarité des moyens : complémentarité tactique (SALP, MP, CP et TCP) et technique (diversité de moyens sol-air utilisés).  \n•\tIntégration au réseau de CI3D : afin de prendre à partie l'adversaire aérien sans pour autant compromettre la sécurité et la liberté d'action des moyens aériens amis par des tirs fratricides.",
    []),
  card('art57', "Q57 : Quel est le Cadre d’emploi de l’ASA.",
    "•\tDéfense Aérienne du Territoire National (DATN) ; \n•\tProtection des forces (en opérations).",
    []),
  card('art58', "Q58 : Responsable de l’emploi et la MEO dans le cadre de la DATN.",
    "•\tEmploi : Autorité de Défense Aérienne (ADA) ;\n•\tMise en œuvre : Chef des modules ASA.",
    []),
  card('art59', "Q59 : Responsable de l’emploi et de la MEO dans le cadre de la Protection des forces en opération.",
    "➢\tEmploi :  \n•\tInterarmées : Commandant de Zone délègue au responsable de sa Composante Aérienne            les responsabilités de : \n\tAutorité de défense Aérienne (ADA) ;\n\tAutorité de contrôle de l’espace aérien du théâtre (Airspace Control Authority) (ACA) ; \n\tCommandant de la défense aérienne du théâtre (Air Defense Commander) (ADC). \n•\tInterarmes : Commandant des échelons de renforcement (Brigade ou Division). \n➢\tMise en œuvre : CDT de l’ASA (Commandant du GAR)",
    []),
  card('art60', "Q60 : A qui incombe la mise en œuvre des unités de l’ASA.",
    "La mise en œuvre des unités de l’Artillerie sol-air est de la responsabilité de leurs chefs (Cdts GAR ou éventuellement les Commandants des unités élémentaires).",
    []),
  card('art61', "Q61 : Quels sont les Domaines couverts par la mise en œuvre de l’ASA.",
    "•\tFeux ; \n•\tRenseignement ;           \n•\tManœuvre ;                      FeRMaL\n•\tLogistique.",
    []),
  card('art62', "Q62 : Quels sont les Modes de contrôle utilisés pour l’engagement des feux.",
    "\tMode Centralisé : les modules ASA reçoivent les mesures de contrôle directement de l’autorité ayant le Contrôle opérationnel ou tactique (OPCON) ou (TACON) ; \n\tMode Décentralisé : (absence de liaison, attaque par saturation) les modules ASA reçoivent des délégations pour assurer la permanence de la mission ; \n\tMode Autonome : aucune liaison n’est assurée avec le centre de contrôle, les modules ASA appliquent les mesures préalablement établies.",
    []),
  card('art63', "Q63 : Quelle est la différence entre le contrôle direct et le contrôle aux procédures dans le cadre de la Coordination Interarmées dans la 3° Dimension (CI3D). \t\t\t                  IPC-COP",
    "Le contrôle direct repose sur l’Identification sûre, la Poursuite et le Contrôle des aéronefs et des systèmes de défense antiaérienne. Alors que le contrôle aux procédures s’appuie sur une Combinaison d’Ordres et de Procédures préalablement définis et diffusés.",
    []),
  card('art64', "Q64 : Quels sont les Fonctions de la Gestion de la CI3D.",
    "•\tGestion des Feux ;           \n•\tGestion de l’Espace aérien ; \n•\tGestion des Moyens ;         \n•\tGestion des Mouvements aériens ;       FEMMS\n•\tGestion de la Situation aérienne.",
    [])
];


async function main() {
  console.log('🚀 Démarrage de la synchronisation Artillerie -> Supabase\n');

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
    console.log(`\n📊 Vérification : ${data.length} cartes trouvées dans Supabase pour le deck Artillerie.`);
  }
}

main().catch(console.error);
