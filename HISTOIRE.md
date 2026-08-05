# CHEZ NONO — Document d'histoire (GDD narratif)

> Jeu d'horreur 3D inspiré de FNAF. Hommage. Jouable sur navigateur (Three.js, GitHub Pages).

---

## Le lieu

**Chez Nono** — fast-food familial ouvert en 1998, fermé du jour au lendemain vingt ans plus tard.
Formule connue : burgers, menus enfants avec jouet surprise, anniversaires le mercredi,
mascottes en costume qui dansaient entre les tables.

Aujourd'hui : chaises sur les tables, friteuses froides, ball pit crevé, tubes de l'aire
de jeux qui grincent. Au mur, des photos d'anniversaires délavées et des dessins d'enfants
encore punaisés. La démolition est prévue dans une semaine.

Le joueur est engagé comme **gardien de nuit**. Cinq nuits. Minuit → 6h.

## L'histoire — couche visible (pour tout joueur)

Les mascottes rôdent la nuit. On comprend peu à peu qu'elles rejouent en boucle
**un anniversaire précis qui n'a jamais eu lieu** : la salle des fêtes est restée dressée,
le gâteau est là, les cadeaux sont emballés. Elles attendent l'invitée d'honneur.
Elle n'est jamais venue — et elles ne l'acceptent pas.

## L'histoire — couche cachée (la nôtre)

Les fragments débloqués (tickets de caisse, dessins, cassettes, jouets de menus enfants)
racontent **un père et sa fille** qui venaient là tous les mercredis. Table préférée,
commande habituelle, petits rituels. Puis les visites s'arrêtent. Le restaurant ferme.

**Fin secrète** : si le joueur a trouvé les 12 fragments et survit à la nuit 5,
la salle d'anniversaire s'illumine et le message du père apparaît.

> ⚠️ Le message final est personnalisable dans `js/lore.js` (constante `MESSAGE_FINAL`).
> C'est là qu'on mettra ce qui n'appartient qu'à toi. Dans le jeu, la fille s'appelle
> simplement « M. » — discret, reconnaissable seulement par qui sait. Modifiable.

## Les mascottes

| Mascotte | Apparence | Comportement | Active dès |
|---|---|---|---|
| **NONO** | Chat-clown roux, collerette, nez rouge | Méthodique. Salle → comptoir → couloir gauche → porte gauche. | Nuit 1 |
| **KIKI** | Souris grise, grandes oreilles, robe rose | Rapide, imprévisible. Passe par l'aire de jeux → couloir droit. | Nuit 2 |
| **CHEF GASTON** | Gros cuisinier moustachu, toque | Ne bouge **que quand tu regardes les caméras**. Cuisine → comptoir → un couloir. | Nuit 3 |
| **LULU** | Lapine rose au costume abîmé, une oreille pliée, un œil éteint | Retirée du service il y a longtemps. Reste dans la salle d'anniversaire. Si tu la fixes trop à la caméra, elle vient. Le jingle la renvoie. | Nuit 4 |

Les mascottes ne sont pas « méchantes ». Elles **cherchent quelqu'un**. Le twist final :
elles cherchent l'invitée de l'anniversaire. Lulu est la plus effrayante — et la plus triste :
c'était la préférée de M.

## Mécaniques

- Poste fixe : **bureau du gérant**. Vue à la souris ou aux flèches ← →.
- **7 caméras** sur un **plan spatial du restaurant** (SVG) : on voit comment les salles
  s'imbriquent et où mènent les deux couloirs. Quand une mascotte se déplace,
  **sa salle clignote en rouge sur le plan** — l'écho visuel du bruit qu'elle fait.
- **2 portes** (gauche/droite) + lumières de couloir. Nuit de minuit à **06:00** (horloge en minutes).
- **Énergie limitée** : chaque porte fermée, lumière ou caméra levée consomme. Panne = noir → Lys arrive en chantant.
- **LA MÉCANIQUE SIGNATURE — la console de haut-parleurs** : caméras levées, on peut diffuser
  un son *dans la pièce regardée* :
  - ♫ **La chanson de Lys** → apaise Lys et la Première Lys (elles retournent à leur place)
  - 📢 **L'annonce de fermeture** → renvoie Gaston en cuisine
  - 🔔 **Le carillon de l'aire de jeux** → rappelle Kiki
  - Le **mauvais son irrite** la mascotte : elle avance. Les notes du gérant (intros de nuit)
    et les fragments enseignent qui aime quoi : **comprendre l'histoire est la vraie arme.**
- **Jingle global** (bouton panique) : fait reculer tout le monde d'une pièce. Coûteux, recharge lente.
- **Difficulté adaptative** : chaque défaite sur une nuit radoucit discrètement l'agressivité
  (jusqu'à −35 %) et allonge le délai aux portes. Ni trop dur, ni trop facile.
- **Screamers** : chaque mort = jumpscare (cri + statique) puis **révèle un fragment** de l'histoire.
- Chaque nuit réussie révèle aussi un fragment. Gaston choisit son couloir au hasard.
- **Sons d'ambiance réels** (assets/sons/, générés par Gabriel via Firefly) joués aléatoirement.
- **L'apparition** : si une photo existe en `assets/visage.jpg`, un visage surgit parfois
  une seconde en changeant de caméra, avec un murmure. (Déposer la photo suffit.)

## Contrôles

| Touche | Action |
|---|---|
| ← / → | regarder (bureau) · changer de caméra (caméras levées) |
| ESPACE | lever / baisser les caméras |
| 1 à 7 | choisir une caméra |
| A / P | porte gauche / droite |
| Z / M | lumière gauche / droite |
| J | jingle global |

## Arc des 5 nuits

1. **Nuit 1** — Découverte. Seul Nono est actif. Consigne laissée par le gérant : « Ne t'occupe pas des costumes. »
2. **Nuit 2** — L'aire de jeux s'anime (Kiki). Premiers dessins retrouvés.
3. **Nuit 3** — Gaston. On découvre la salle d'anniversaire dressée sur CAM5.
4. **Nuit 4** — Lulu s'éveille. On comprend *qui* elles attendent.
5. **Nuit 5** — La nuit de l'anniversaire. Toutes actives, agressivité maximale.
   - Survivre = **fin normale** (le gardien s'en va, la démolition aura lieu).
   - Survivre avec les 12 fragments = **fin secrète** (la salle s'illumine, le message).

## Les 12 fragments

Tickets de caisse, dessins punaisés, cassettes du répondeur, jouets de menus enfants,
photo d'anniversaire, carnet du gérant. Ils reconstituent l'histoire des mercredis,
puis le silence, puis la fermeture. Texte complet dans `js/lore.js` — modifiable à volonté.

## Technique

- **Three.js** (vendored dans `lib/`), aucune dépendance externe, aucun build.
- Décors et mascottes 100 % procéduraux pour le prototype (upgrade Blender/glTF possible ensuite).
- Sons générés en WebAudio (screamer, jingle, ambiance, portes) — zéro fichier audio.
- Sauvegarde `localStorage` (nuit atteinte + fragments).
- Hébergement : GitHub Pages, jouable par simple lien, PC et mobile.
