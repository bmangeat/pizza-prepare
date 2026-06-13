# Spécifications Fonctionnelles — PWA Pâte à Pizza
**Version 1.1** — Mise à jour : ajout panneau d'administration, suppression historique et snooze

---

## Table des matières

1. [Contexte et objectif](#1-contexte-et-objectif)
2. [Utilisateurs cibles](#2-utilisateurs-cibles)
3. [Fonctionnalités](#3-fonctionnalités)
4. [Protocoles de préparation](#4-protocoles-de-préparation)
5. [Logique de calcul du planning](#5-logique-de-calcul-du-planning)
6. [Recette et proportions](#6-recette-et-proportions)
7. [Instructions de préparation de la pâte](#7-instructions-de-préparation-de-la-pâte)
8. [Système de notifications](#8-système-de-notifications)
9. [Panneau d'administration](#9-panneau-dadministration)
10. [Interfaces utilisateur](#10-interfaces-utilisateur)
11. [Persistance et stockage local](#11-persistance-et-stockage-local)
12. [Exigences techniques PWA](#12-exigences-techniques-pwa)
13. [Contraintes et limites connues](#13-contraintes-et-limites-connues)
14. [Hors périmètre v1](#14-hors-périmètre-v1)

---

## 1. Contexte et objectif

La préparation d'une pâte à pizza napolitaine requiert un processus de 24 à 48 heures, découpé en plusieurs étapes avec des contraintes de température précises. Le respect des horaires est critique.

L'application guide l'utilisateur pas à pas en envoyant une notification au début de chaque étape.

**Périmètre :**
- PWA (Progressive Web App) — aucun téléchargement requis
- Sans backend ni base de données — tout géré en local
- Usage principal sur smartphone (en cuisine)
- Deux protocoles : 24 heures et 48 heures
- Paramètres de recette configurables via un panneau d'administration

---

## 2. Utilisateurs cibles

Passionné de pizza artisanale, usage personnel ou familial, niveau amateur à avancé.

**Besoins clés :**
- Notifications fiables même en arrière-plan / téléphone en veille
- Interface rapide à consulter en cuisine
- Possibilité d'ajuster les paramètres de fermentation selon ses préférences

---

## 3. Fonctionnalités

| ID | Fonctionnalité | Description | Priorité |
|---|---|---|---|
| F-01 | Configuration session | Choix du protocole (24h / 48h), heure de service, nombre de pizzas | MUST |
| F-02 | Calcul du planning | Calcul automatique de toutes les heures d'étapes à partir de T | MUST |
| F-03 | Affichage du planning | Vue chronologique avec statut de chaque étape | MUST |
| F-04 | Notifications push | Notification au début de chaque étape via Service Worker | MUST |
| F-05 | Minuteur d'étape | Compte à rebours de l'étape en cours | SHOULD |
| F-06 | Recette & proportions | Quantités calculées selon le nombre de pizzas + instructions | MUST |
| F-07 | Persistance locale | Sauvegarde de la session dans localStorage | MUST |
| F-08 | Mode hors-ligne | Fonctionnement sans connexion via Service Worker | MUST |
| F-09 | Panneau d'administration | Interface de modification des paramètres de fermentation et de température | MUST |

> **Supprimés par rapport à v1.0 :** historique des sessions (F-09 ancien) et snooze des notifications (F-10 ancien).

---

## 4. Protocoles de préparation

### 4.1 Protocole 48 heures

| Jour | Début | Étape | Durée | Température | Action requise |
|---|---|---|---|---|---|
| J−2 | Calculée | 1. Préparation | 55 min | Ambiante | Préparer la pâte selon les instructions |
| | +55 min | 2. Pointage T° ambiante | 3 h | 20 °C | Couvrir et laisser lever |
| | +3 h | 3. Pointage basse T° | 20 h | 4–5 °C | Placer au réfrigérateur |
| J−1 | +20 h | 4. Repos ambiante | 1 h | Ambiante | Sortir du réfrigérateur |
| | +1 h | 5. Boulage / Pâtons | 15 min | Ambiante | Former les pâtons |
| | +15 min | 6. Apprêt T° ambiante | 2 h | 20 °C | Couvrir les pâtons |
| | +2 h | 7. Apprêt basse T° | 18 h | 4–5 °C | Placer au réfrigérateur |
| J | −4 h min. | 8. Repos final | ≥ 4 h | 20 °C | Sortir et laisser revenir à T° |

### 4.2 Protocole 24 heures

| Jour | Début | Étape | Durée | Température | Action requise |
|---|---|---|---|---|---|
| J−1 | Calculée | 1. Préparation | 55 min | Ambiante | Préparer la pâte selon les instructions |
| | +55 min | 2. Pointage T° ambiante | 3 h | 20 °C | Couvrir et laisser lever |
| | +3 h | 3. Pointage basse T° | 21 h | 4–5 °C | Placer au réfrigérateur |
| J | +21 h | 4. Repos ambiante | 1 h | Ambiante | Sortir du réfrigérateur |
| | +1 h | 5. Boulage / Pâtons | 30 min | Ambiante | Former les pâtons |
| | +30 min | 6. Repos final | ≥ 4 h | 20 °C | Couvrir, laisser revenir à T° |

---

## 5. Logique de calcul du planning

Les heures sont calculées **en remontant depuis T** (heure de service) par soustraction en cascade.

### Protocole 48h

| Étape | Durée | Formule |
|---|---|---|
| 8. Repos final | ≥ 4 h | Début = T − 4 h |
| 7. Apprêt basse T° | 18 h | Début = Étape 8 − 18 h |
| 6. Apprêt T° ambiante | 2 h | Début = Étape 7 − 2 h |
| 5. Boulage | 15 min | Début = Étape 6 − 15 min |
| 4. Repos ambiante | 1 h | Début = Étape 5 − 1 h |
| 3. Pointage basse T° | 20 h | Début = Étape 4 − 20 h |
| 2. Pointage T° ambiante | 3 h | Début = Étape 3 − 3 h |
| 1. Préparation | 55 min | Début = Étape 2 − 55 min |

### Protocole 24h

Même logique : T → −4h → −30min → −1h → −21h → −3h → −55min.

### Recalcul après modification admin

Toute modification d'une durée dans le panneau admin **déclenche un recalcul complet** du planning à partir de T. Les notifications planifiées sont annulées et replanifiées.

---

## 6. Recette et proportions

Proportions de référence pour **6 pizzas** (toutes les quantités sont proportionnelles) :

| Ingrédient | Quantité (6 pizzas) | Unité |
|---|---|---|
| Farine | 930 | g |
| Eau | 600 | g |
| Sel | 30 | g |
| Levure sèche | 2,7 | g |
| *ou* Levure fraîche | 6,3 | g |

**Formule :** `Quantité = (valeur référence ÷ 6) × nombre de pizzas`, arrondie à 1 g.

---

## 7. Instructions de préparation de la pâte

Affichées pendant l'étape 1 (Préparation), indépendantes du protocole.

1. Prélever un peu d'eau et y diluer la levure
2. Mélanger le reste d'eau avec le sel
3. Incorporer 180 g de farine à l'eau salée et mélanger
4. Ajouter la levure diluée et mélanger
5. Ajouter le reste de farine
6. Travailler la pâte pendant 15 minutes
7. Recouvrir et laisser reposer 15 minutes
8. Effectuer 2× des rabats
9. Recouvrir et laisser reposer 15 minutes
10. Effectuer à nouveau 2× des rabats
11. Lancer le 1er pointage à température ambiante

---

## 8. Système de notifications

### Déclenchement
- Une notification est envoyée au **début de chaque étape**.
- Planification via l'API Web Notification + Service Worker.
- Les timestamps sont calculés au lancement et stockés en localStorage.
- Au redémarrage, les notifications non encore déclenchées sont replanifiées.

### Contenu
- **Titre :** nom de l'étape (ex. : « Boulage / Pâtons »)
- **Corps :** action à effectuer + durée (ex. : « Former les pâtons — 15 min »)
- **Bouton :** « Voir le planning » → ouvre l'application

### Gestion des permissions
- Permission demandée à la fin de l'écran de configuration, avec explication claire.
- Si refusée : bandeau d'avertissement + rappel visuel in-app en secours.
- Si navigateur non compatible : message explicatif.

---

## 9. Panneau d'administration

### 9.1 Objectif

Le panneau admin permet de personnaliser les paramètres de fermentation sans toucher au code. Les valeurs modifiées sont sauvegardées en localStorage et appliquées à toutes les sessions suivantes.

Un bouton « Réinitialiser les valeurs par défaut » remet les paramètres d'origine.

### 9.2 Accès

Accessible via une icône engrenage ⚙️ depuis l'écran d'accueil. Non accessible pendant une session active (affichage en lecture seule avec message d'avertissement).

### 9.3 Paramètres configurables

#### Durées (en minutes ou heures)

| Paramètre | Protocole | Valeur par défaut | Min | Max | Unité |
|---|---|---|---|---|---|
| Durée de préparation | 24h & 48h | 55 | 30 | 120 | min |
| Durée pointage T° ambiante | 24h & 48h | 3 | 1 | 6 | h |
| Durée pointage basse T° | 48h | 20 | 12 | 36 | h |
| Durée pointage basse T° | 24h | 21 | 12 | 36 | h |
| Durée repos ambiante | 24h & 48h | 1 | 0,5 | 3 | h |
| Durée boulage / façonnage | 48h | 15 | 5 | 60 | min |
| Durée boulage / façonnage | 24h | 30 | 5 | 60 | min |
| Durée apprêt T° ambiante | 48h | 2 | 1 | 4 | h |
| Durée apprêt basse T° | 48h | 18 | 8 | 24 | h |
| Durée repos final (minimum) | 24h & 48h | 4 | 2 | 8 | h |

#### Températures (indicatives — affichage uniquement, pas de sonde)

| Paramètre | Valeur par défaut | Min | Max | Unité |
|---|---|---|---|---|
| T° pointage ambiante | 20 | 18 | 25 | °C |
| T° pointage basse | 4 | 2 | 8 | °C |
| T° apprêt ambiante | 20 | 18 | 25 | °C |
| T° repos final | 20 | 18 | 25 | °C |

> Les températures sont **affichées dans le planning et les notifications** à titre de rappel — l'application ne pilote pas de sonde.

### 9.4 Comportement

- Chaque champ est un input numérique avec validation min/max inline.
- Un bouton « Sauvegarder » persiste les valeurs (localStorage clé `pizza_admin_config`).
- Un bouton « Réinitialiser » restore les valeurs par défaut avec confirmation.
- Si une session est en cours, le panneau est en **lecture seule** avec un bandeau : *« Modifiable uniquement hors session active »*.

### 9.5 Structure de données (localStorage)

```json
{
  "pizza_admin_config": {
    "duree_preparation_min": 55,
    "duree_pointage_tamb_h": 3,
    "duree_pointage_bt_48h_h": 20,
    "duree_pointage_bt_24h_h": 21,
    "duree_repos_amb_h": 1,
    "duree_boulage_48h_min": 15,
    "duree_boulage_24h_min": 30,
    "duree_appret_tamb_h": 2,
    "duree_appret_bt_h": 18,
    "duree_repos_final_min_h": 4,
    "temp_pointage_amb_c": 20,
    "temp_pointage_basse_c": 4,
    "temp_appret_amb_c": 20,
    "temp_repos_final_c": 20
  }
}
```

---

## 10. Interfaces utilisateur

| Écran | Description | Composants clés |
|---|---|---|
| Accueil | Écran si aucune session active | Bouton « Nouvelle préparation », icône admin ⚙️ |
| Configuration | Formulaire de saisie de session | Radio 24h/48h, sélecteur heure, compteur pizzas, bouton « Lancer » |
| Planning / Suivi | Vue principale pendant la préparation | Timeline d'étapes, badge statut, compte à rebours, bouton « Recette » |
| Recette & Proportions | Quantités + instructions de pétrissage | Tableau ingrédients, liste des 11 étapes |
| Administration ⚙️ | Modification des paramètres de fermentation | Champs numériques groupés par catégorie, boutons Sauvegarder / Réinitialiser |
| Notification (overlay) | Alerte in-app à chaque changement d'étape | Titre étape, description action, bouton « OK » |

### Navigation
- Onglets ou boutons flottants entre Planning et Recette pendant une session.
- Icône ⚙️ accessible depuis l'accueil, désactivée (lecture seule) pendant une session.
- Bouton « Annuler la session » avec confirmation.

---

## 11. Persistance et stockage local

Toutes les données sont dans localStorage — aucun serveur.

### Session active (`pizza_session`)
```json
{
  "protocole": "48h",
  "nb_pizzas": 6,
  "heure_service": "2026-06-14T18:45:00",
  "etapes": [
    {
      "index": 0,
      "nom": "Préparation",
      "debut": "2026-06-12T17:35:00",
      "fin": "2026-06-12T18:30:00",
      "statut": "done"
    }
  ],
  "etape_courante": 2
}
```

### Paramètres admin (`pizza_admin_config`)
Voir structure section 9.5.

---

## 12. Exigences techniques PWA

| Catégorie | Exigence |
|---|---|
| PWA | Manifest Web App : nom, icônes 192px & 512px, `display: standalone`, `orientation: portrait` |
| PWA | Service Worker avec précache de tous les assets statiques |
| Notifications | API Notification + Service Worker pour alertes en arrière-plan |
| Notifications | Permission demandée explicitement avant le lancement de session |
| Notifications | Replanification au redémarrage depuis les timestamps en localStorage |
| Stockage | localStorage uniquement — zéro backend |
| Compatibilité | Chrome 90+, Safari 16.4+ (iOS : installation écran d'accueil requise), Firefox 90+ |
| Design | Mobile-first, responsive |
| Sécurité | HTTPS obligatoire (requis pour Service Worker et notifications) |

---

## 13. Contraintes et limites connues

**iOS / Safari :** les notifications push nécessitent Safari 16.4+ et que l'app soit installée sur l'écran d'accueil. L'app doit détecter ce cas et guider l'utilisateur.

**Arrière-plan Android :** certains appareils peuvent tuer le navigateur. Le mode installé (PWA sur écran d'accueil) maximise la fiabilité du Service Worker.

**Précision des timers :** quelques secondes de décalage possibles avec setTimeout — largement acceptable pour des étapes de 15 min minimum.

**Panneau admin hors session :** les paramètres admin ne peuvent pas être modifiés en cours de session pour éviter toute incohérence de planning.

---

## 14. Hors périmètre v1

- Comptes utilisateurs / authentification
- Synchronisation cloud
- Personnalisation de la recette de base (ratios d'ingrédients)
- Partage de planning
- Notifications email ou SMS
- Historique des sessions
- Snooze des notifications
- Multi-langue (français uniquement)

---

*Fin du document — Version 1.1*
