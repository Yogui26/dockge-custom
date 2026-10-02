# Changelog

## 2.6.2

### Corrections
- La mise à jour d'un agent depuis la flèche violette échouait avec « Dockge is not running in a container » : l'image ne définit pas la variable `DOCKGE_IS_CONTAINER` que le contrôle attendait. Dockge détecte maintenant qu'il tourne dans un conteneur grâce au fichier `/.dockerenv` créé par Docker.

## 2.6.1

### Corrections
- Mobile, page d'accueil : avec un nom d'agent long, le bouton Maintenance ne déborde plus de la carte et ne recouvre plus les icônes Modifier, Log, Supprimer et Mise à jour. Le nom passe à la ligne et les icônes se placent dessous.
- Mobile, Paramètres > Général : le bouton « Obtention automatique » passe sous le champ « Nom d'hôte principal » au lieu de le réduire à quelques caractères.

## 2.6.0

### Nouveautés
- **Mise à jour de Dockge Custom par agent.** Chaque serveur (maître et agents) cherche lui-même la dernière version publiée. Quand une version plus récente existe, une flèche violette apparaît dans la carte de l'agent sur la page d'accueil, alignée avec les icônes Modifier, Log et Supprimer. Un clic propose de mettre l'agent à jour : un conteneur temporaire télécharge la nouvelle image et recrée Dockge, qui redémarre en quelques secondes. Cela suppose que Dockge ait été lancé avec docker compose et qu'il ait accès au socket Docker.
- **Paramètres > Général > Vérifier les mises à jour** interroge aussi la dernière version de chaque agent.

### Changements
- La flèche de mise à jour à côté du logo et du nom « Dockge » dans l'en-tête (qui renvoyait vers GitHub) est supprimée.
- Les agents en version inférieure à 2.6.0 n'envoient pas leur version : ils doivent être mis à jour une première fois à la main pour bénéficier de la flèche.

## 2.5.0

### Nouveautés
- **Mobile : navigation par glissement horizontal.** Glisser vers la gauche ou la droite fait passer d'un écran à l'autre dans l'ordre des boutons de l'en-tête : Accueil, Stacks, Paramètres. Le geste est ignoré sur les autres pages (éditeur compose, logs...), dans les champs de saisie, les terminaux, les fenêtres et les zones qui défilent horizontalement, pour ne jamais gêner leur usage.

### Corrections
- Mobile : l'en-tête n'affiche plus que des icônes (Accueil, Stacks, Paramètres) pour supprimer le défilement horizontal causé par les libellés trop longs dans certaines langues. Les libellés restent affichés sur ordinateur et tablette, avec une infobulle sur mobile.

## 2.4.0

### Nouveautés
- **Paramètres > Général** : nouvelle section « Actions » avec
  - « Analyser le dossier des piles » (déplacé depuis l'ancien menu) ;
  - « Vérifier les mises à jour » : force la recherche de nouvelles images pour les stacks de tous les serveurs en ligne et celle d'une nouvelle version de Dockge Custom, sans attendre les contrôles automatiques.

### Améliorations
- En-tête : le bouton « Menu » est remplacé par un bouton **Paramètres** qui mène directement aux paramètres. La déconnexion reste disponible dans Paramètres > Sécurité.
- Paramètres > Sécurité : le navigateur ne met plus automatiquement le nom de l'utilisateur dans la barre de recherche des stacks (à gauche) et ne pré-remplit plus les champs de mot de passe.
- Le contrôle périodique des mises à jour d'images (toutes les 6 heures) rafraîchit aussi l'état des stacks, et deux contrôles ne peuvent plus s'exécuter en même temps.

## 2.3.0

### Améliorations
- En-tête : le bouton **Console** est supprimé (accès jugé dangereux). La page `/console` reste inactive tant que la console n'est pas activée dans la configuration du serveur.
- En-tête : le menu déroulant (Analyser le dossier des piles, Paramètres, Déconnexion) devient un bouton **Menu** au même style que « Accueil » et « Stacks » (icône et libellé), pour une vue mobile plus homogène.

## 2.2.1

### Corrections
- Page d'accueil : l'icône du log en direct est harmonisée avec les icônes « Modifier » et « Supprimer » (même taille, même couleur, même alignement).

## 2.2.0

### Nouveautés
- **Log en direct de chaque agent** : une nouvelle icône à côté des boutons « Modifier » et « Supprimer » (page d'accueil, carte de l'agent) ouvre une page qui affiche le journal du serveur Dockge de cet agent en temps réel. Les 500 dernières lignes sont conservées en mémoire pour avoir un historique à l'ouverture, et la page fonctionne aussi bien pour le serveur local que pour les agents distants.

### Améliorations
- Le bouton **Maintenance** de la page d'accueil est réduit à son icône (clé à molette) pour gagner de la place ; l'infobulle et le libellé d'accessibilité sont conservés.
- Ajout des textes d'infobulle manquants en français et en anglais.

### Mise à jour
- Tous les serveurs (maître et agents) doivent passer en 2.2.0 pour que la page de log fonctionne avec les agents distants : `docker compose pull && docker compose up -d`.

## 2.1.1

### Corrections
- L'image Docker embarque désormais `skopeo`, nécessaire à la détection des mises à jour d'images des stacks (erreurs `spawn skopeo ENOENT` dans les logs, plus aucune mise à jour détectée).

## 2.1.0

### Nouveautés
- Page d'accueil : espace disque utilisé / total pour chaque agent, avec barre de progression (orange à partir de 75 %, rouge à partir de 90 %).

## 2.0.0

### Changements
- Passage en version 2.x : les agents plus anciens que 1.4.0 sont refusés par le serveur maître, ce qui rend la numérotation 1.x incompatible avec les autres agents.

## 1.0.0

### Nouveautés
- Nouvelle page « À propos » (logo, liens vers ce fork, hamphh/dockge et louislam/dockge) et vérification des mises à jour sur les releases de Yogui26/dockge-custom.
- Image Docker publiée sur ghcr.io (amd64 et arm64) et frontend compilé dans le Dockerfile.
- Mise à jour des dépendances majeures (Vite 8, etc.) et durcissement de sécurité.
