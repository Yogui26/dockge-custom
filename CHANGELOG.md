# Changelog

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
