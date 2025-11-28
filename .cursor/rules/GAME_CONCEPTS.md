# GAME CONCEPTS & UX MODES

Ce document décrit les modes de jeu alternatifs au "Swipe classique" (Tinder-like) pour l'application Plex Movie Picker. L'objectif est de rendre la sélection de film en groupe plus ludique (Gamification) et stratégique.

/!\ Ce sont des évolutions à ajouter APRÈS l'implémentation de la feature "tinder"

## 1. Le Tournoi (The Bracket) 🏆
*L'approche compétitive à élimination directe.*

### Concept
Au lieu de noter des films individuellement, les utilisateurs arbitrent des duels.
1. Le système génère un arbre de tournoi (8 ou 16 films).
2. Deux films s'affichent côte à côte.
3. Question : "Lequel préfères-tu ce soir ?".
4. Le gagnant passe au tour suivant jusqu'à la finale.

### UX / UI
- **TV :** Affiche le duel en grand "GLADIATOR vs TITANIC".
- **Mobile :** Deux gros boutons A (Gauche) ou B (Droite).
- **Avantage :** Réduit la charge cognitive (loi du jugement comparatif).

### Implémentation Technique
- **Backend :** Doit générer des paires aléatoires à partir de la sélection.
- **Logique :** Le film gagnant est celui qui remporte la majorité des votes du groupe sur le duel.

---

## 2. Le Survivant (Survivor / Veto) 💀
*L'approche par élimination négative.*

### Concept
Souvent, il est plus facile de dire ce qu'on ne veut **pas** voir.
1. Une grille de 9 ou 12 films est proposée au groupe.
2. Chaque participant reçoit un "Pistolet" avec 3 munitions (3 vetos).
3. Les participants "tirent" sur les affiches qu'ils refusent catégoriquement.
4. Les films visés disparaissent pour tout le monde.
5. Le film restant (le survivant) est choisi.

### UX / UI
- **Mobile :** Tap pour "tuer" une affiche. Animation d'explosion ou de vitre brisée.
- **Avantage :** Évite les conflits ("Je ne veux pas voir d'horreur ce soir").

---

## 3. Les Enchères (The Budget Draft) 💰
*L'approche stratégique et nuancée.*

### Concept
Permet d'exprimer l'intensité d'une envie, pas juste un Oui/Non binaire.
1. Le groupe a une sélection de 5 films.
2. Chaque utilisateur reçoit un budget de **10 points**.
3. Ils répartissent leurs points sur les films de leur choix.
   * *Exemple :* 10 points sur un seul film (All-in) ou 2 points sur chaque.
4. Le film avec le plus grand total de points cumulés gagne.

### UX / UI
- **Mobile :** Sliders ou boutons +/- sous chaque affiche pour allouer le budget.
- **Avantage :** Donne du pouvoir aux utilisateurs passionnés et permet la négociation implicite.

---

## 4. La Machine à Sous (Shake & Lock) 🎰
*L'approche aléatoire contrôlée (pour les indécis).*

### Concept
On laisse le hasard proposer, l'utilisateur valide.
1. 3 emplacements (Slots) affichent 3 films aléatoires.
2. L'utilisateur secoue son téléphone (ou appuie sur "SPIN").
3. Les films défilent.
4. L'utilisateur peut "Cadenasser" (Lock) un film qui l'intéresse.
5. Au prochain spin, seuls les films non cadenassés changent.
6. La partie finit quand 3 films sont cadenassés (ou qu'un consensus est trouvé sur 1).

### UX / UI
- **Mobile :** Utilisation de l'accéléromètre pour le "Shake". Bruitage de casino.
- **Avantage :** Très addictif (Dopamine), demande peu d'effort de réflexion.

---

## Recommandation pour la V1
Le mode **Tournoi (Bracket)** est le meilleur candidat pour une première implémentation alternative car :
1. Il est techniquement simple (comparaison d'ID).
2. Il est très visuel sur un écran TV.
3. Il résout le choix très rapidement mathématiquement.