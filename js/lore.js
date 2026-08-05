// ── Textes de l'histoire ──────────────────────────────────────────
// Tout est modifiable ici sans toucher au code du jeu.

// ⚠️ NOMS — change-les ici, tout le jeu suit.
export const NOMS = {
  jeu: "L'INVITÉE D'HONNEUR",
  sousTitre: "CINQ NUITS CHEZ LYS",
  enseigne: "CHEZ LYS",
  mascottes: {
    lys: "LYS",
    kiki: "KIKI",
    gaston: "CHEF GASTON",
    premiere: "LA PREMIÈRE LYS",
  },
};

// Message de la fin secrète (débloqué : 12 fragments + nuit 5 réussie).
// ⚠️ PERSONNALISABLE — écris ici ce qui n'appartient qu'à toi.
export const MESSAGE_FINAL = [
  "La salle s'illumine.",
  "Le gâteau n'a pas vieilli. Les cadeaux non plus.",
  "",
  "« M.,",
  "Si un jour tu trouves cet endroit,",
  "sache que la lumière est restée allumée.",
  "Chaque mercredi. Toutes les nuits.",
  "Elle t'attendra le temps qu'il faudra.",
  "",
  "— Papa »",
];

// Petit texte d'intro affiché au début de chaque nuit.
export const INTROS_NUITS = {
  1: "Premier soir. Un mot du gérant : « Ne t'occupe pas des costumes. Si la lapine s'approche trop, passe sa chanson dans le haut-parleur de la pièce. Elle s'en souvient toujours. »",
  2: "Quelque chose a bougé dans l'aire de jeux. Sur le registre : « Kiki ne rentrait jamais sans le carillon de l'aire de jeux. Le mauvais son la rend nerveuse. »",
  3: "La salle d'anniversaire est dressée. Note en cuisine : « Gaston n'obéit qu'à l'annonce de fermeture. Et il ne bouge que quand on le regarde. »",
  4: "Le premier costume n'est plus dans la réserve. Dernière page du registre : « Ne la fixez pas à la caméra. Si elle vient, seule la chanson la ramène. »",
  5: "Mercredi. C'est cette nuit. Elles l'attendent toutes. Économise l'énergie, écoute les couloirs, et souviens-toi de qui aime quel son.",
};

// Les 12 fragments. `mort:` = débloqués par une défaite, `nuit:` = par une victoire.
export const FRAGMENTS = [
  {
    id: 1, titre: "Ticket de caisse — mercredi",
    texte: "CHEZ LYS — 17h12. 1 menu Lys. 1 menu enfant, jouet surprise. Table 7, comme d'habitude.",
  },
  {
    id: 2, titre: "Dessin punaisé",
    texte: "Une lapine blanche tenant la main d'une petite silhouette. En bas, d'une écriture d'enfant : « moi et papa ». Signé d'un seul M.",
  },
  {
    id: 3, titre: "Carnet du gérant — page 12",
    texte: "« Les habitués du mercredi sont revenus. La petite connaît la chanson de Lys par cœur. Son père rit plus fort qu'elle. »",
  },
  {
    id: 4, titre: "Jouet de menu enfant",
    texte: "Une figurine de Lys, première série, 1998. Retirée de la vente depuis des années. Celle-ci est neuve, encore sous plastique. Mise de côté pour quelqu'un.",
  },
  {
    id: 5, titre: "Cassette du répondeur — 1/3",
    texte: "« Bonjour, c'est pour réserver la salle d'anniversaire. Un mercredi, c'est important. Elle aura huit ans. »",
  },
  {
    id: 6, titre: "Photo délavée",
    texte: "Un anniversaire. Lys penchée au-dessus d'un gâteau. Une enfant floue rit, les mains sur les joues. Au dos : « la plus belle journée ».",
  },
  {
    id: 7, titre: "Carnet du gérant — page 31",
    texte: "« Plus vus depuis des semaines. La table 7 reste vide le mercredi. Le costume de Lys demande où est la petite. Je n'ai pas su quoi répondre à un costume. »",
  },
  {
    id: 8, titre: "Cassette du répondeur — 2/3",
    texte: "« C'est encore moi. Pour l'anniversaire… gardez la réservation. Je vous rappelle. Gardez-la, s'il vous plaît. »",
  },
  {
    id: 9, titre: "Note de service",
    texte: "« Le premier costume de Lys sera retiré du service. Les enfants demandent pourquoi il attend près de la porte tous les mercredis. Ça les effraie. »",
  },
  {
    id: 10, titre: "Cassette du répondeur — 3/3",
    texte: "« … Annulez la salle. Non — non, ne l'annulez pas. Laissez-la comme elle est. Je paierai ce qu'il faut. Laissez-la dressée. »",
  },
  {
    id: 11, titre: "Carnet du gérant — dernière page",
    texte: "« On ferme. Les repreneurs démoliront. Je n'ai pas eu le cœur de ranger la salle d'anniversaire. Personne n'a soufflé les bougies. »",
  },
  {
    id: 12, titre: "Enveloppe jamais envoyée",
    texte: "Une carte d'invitation. « Tu es l'invitée d'honneur. » L'adresse est écrite, le timbre collé. Elle n'a jamais été postée. Dedans, une place réservée : Table 7.",
  },
];

// Fragments garantis en fin de nuit réussie (les autres tombent lors des défaites).
export const FRAGMENTS_PAR_NUIT = { 1: 1, 2: 2, 3: 6, 4: 9, 5: 12 };

// Fin normale (nuit 5 réussie, fragments incomplets).
export const FIN_NORMALE = [
  "6h00. Le soleil se lève sur le parking vide.",
  "Dans une semaine, tout sera démoli.",
  "En partant, tu passes devant la salle d'anniversaire.",
  "Tu pourrais jurer que les bougies sont neuves.",
  "",
  "Il manque des fragments de l'histoire…",
  "(Retrouve les 12 fragments pour découvrir la vraie fin.)",
];
