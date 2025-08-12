# Quran Reader (React + Vite)

Ce projet contient une application React (Vite) prête à l'emploi pour afficher le Coran,
jouer des récitations et afficher des traductions (via l'API AlQuran.cloud).

## Prérequis
- Installer Node.js (version 16+ recommandée) depuis https://nodejs.org
- Avoir `npm` disponible

## Installation (local)
```bash
# depuis le dossier quran-reader
npm install
npm run dev
```
Le site sera disponible sur http://localhost:5173 (adresse indiquée par Vite).

## Build (pour déployer)
```bash
npm run build
# puis servir le dossier dist via Netlify, Vercel ou tout hébergeur static
```

## Déploiement rapide
- Netlify / Vercel : crée un compte gratuit, connecte ton dépôt GitHub (ou upload du dossier)
  et choisis la commande `npm run build` et le dossier `dist` (ou laisse les réglages par défaut pour Vite).
