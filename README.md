# 🍕 Pâte à Pizza — PWA

Assistant de préparation de pâte à pizza napolitaine (protocoles **24 h** et **48 h**).
Calcule le planning à rebours depuis l'heure de service et notifie au début de chaque étape.

PWA **100 % côté client** : aucune base de données, aucun backend. Tout est stocké en `localStorage`.

## Stack

- **Next.js 14** (App Router, export statique) + **React 18** + **TypeScript**
- **Tailwind CSS** (mobile-first)
- Service Worker maison (`public/sw.js`) : précache + offline + clic notification
- Web Notifications API (planification via `setTimeout`, replanifiées au redémarrage)

## Développement

> Nécessite **Node ≥ 18.17** (voir `.nvmrc` → Node 20).

```bash
nvm use            # Node 20
npm install
npm run dev        # http://localhost:3000
```

Régénérer les icônes PWA (optionnel) :

```bash
node scripts/generate-icons.mjs
```

## Build de production

```bash
npm run build
npm run start
```

## Déploiement Vercel

Le projet est détecté automatiquement par Vercel (preset Next.js, aucune config requise) :

1. Pousser le dépôt sur GitHub/GitLab.
2. « New Project » sur Vercel → importer le dépôt.
3. Réglage **Node.js Version = 20.x** dans les *Project Settings* (le code requiert ≥ 18.17).
4. Déployer. HTTPS est fourni par Vercel — requis pour le Service Worker et les notifications.

## Structure

| Dossier | Rôle |
|---|---|
| `app/` | Layout, page racine, styles globaux, métadonnées PWA |
| `components/` | Écrans (Accueil, Configuration, Planning, Recette, Admin) + UI |
| `lib/` | Logique métier : protocoles, calcul du planning, recette, config admin, notifications, stockage |
| `public/` | `manifest.webmanifest`, `sw.js`, icônes |
| `scripts/` | Générateur d'icônes PNG (sans dépendance) |

## Logique de planning

Les horaires sont calculés **en remontant depuis T** (heure de service). Le début de la
1ʳᵉ étape = `T − somme des durées`, puis cascade vers l'avant. Toute modification dans le
panneau d'administration déclenche un recalcul complet à la session suivante.

## Limites connues (cf. specs §13)

- **iOS / Safari** : notifications uniquement en Safari 16.4+ avec l'app installée sur
  l'écran d'accueil. L'app détecte ce cas et guide l'utilisateur.
- **Arrière-plan** : la planification repose sur `setTimeout` (app vivante) + replanification
  au redémarrage. Le mode installé (écran d'accueil) maximise la fiabilité.
- Hors périmètre v1 : comptes, sync cloud, historique, snooze, multi-langue.
