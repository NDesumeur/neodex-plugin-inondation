# Inondation

Un casse-tête de couleurs : ta tache part du coin de la grille, prend la couleur que tu choisis et avale toutes les cases voisines de cette couleur. Couvre les 196 cases de la grille avant d'épuiser tes coups.

*English version: [README.en.md](README.en.md)*

## Commandes

- **Clic sur une couleur** de la palette, ou **sur une case** de cette couleur dans la grille.
- Touches **1 à 6** : choisir une couleur au clavier.
- **Espace** ou un clic après la fin : niveau suivant (ou rejouer le même si c'est raté).

## Règles

- La grille fait 14 × 14 cases de 6 couleurs. Ta tache commence dans le coin en haut à gauche, entourée d'un liseré blanc.
- À chaque coup, ta tache entière prend la couleur choisie et s'agrandit de toutes les cases voisines de cette couleur, qui deviennent les tiennes.
- Il faut couvrir toute la grille dans le **nombre de coups permis**, affiché en haut (il passe au rouge quand il en reste trois).
- Chaque couleur a aussi son motif gravé, pour les distinguer sans les couleurs.

Astuce : vise les couleurs qui ouvrent le plus de cases, et pense aux grandes zones que tu pourras avaler plus tard.

## Les niveaux

- Le niveau 1 laisse 30 coups ; tous les 4 niveaux, il y en a un de moins, jusqu'à 22. Chaque grille réussie ouvre le niveau suivant ; les flèches reviennent aux niveaux déjà atteints.
- Chaque niveau a toujours la même grille, pour pouvoir la retenter et battre ton record. Coche **Grilles au hasard** pour en avoir une nouvelle à chaque partie.

## Statistiques

Le panneau Records montre le **niveau le plus loin** atteint, ton **record** de coups sur le niveau en cours et tes **grilles réussies** sur le nombre de parties.

## Données et synchronisation

Ton niveau, tes records et tes réglages sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Inondation → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
