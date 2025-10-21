# 🎮 Catch the Stuff - Mini-jeu Prompt Consulting

Un mini-jeu web interactif lancé via QR code sur la carte de visite de Prompt Consulting.

## 🎯 Objectif

Créer une micro-expérience web (< 20s) où le joueur attrape des objets positifs et évite les bombes pour promouvoir Prompt Consulting.

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Développement
npm run dev

# Build de production
npm run build

# Démarrage en production
npm start

# Vérification des types
npm run type-check

# Correction automatique du linting
npm run lint:fix
```

## 🎮 Comment jouer

1. **Contrôles** :
   - **Tactile** : Glisser horizontalement sur l'écran
   - **Souris** : Déplacer la souris horizontalement
   - **Clavier** : Flèches gauche/droite

2. **Objectif** :
   - Attraper les objets positifs (clients, café, pizza, etc.) : +1 point
   - Éviter les bombes : Game Over immédiat
   - Combo bonus : +1 point toutes les 5 captures sans faute

3. **Durée** : 20 secondes avec augmentation progressive de la difficulté

## 🛠️ Stack technique

- **Framework** : Next.js 15 (App Router) + TypeScript
- **Rendu** : HTML5 Canvas 2D
- **État** : Zustand
- **Styles** : Tailwind CSS
- **Analytics** : Plausible (cookieless)
- **Déploiement** : Vercel

## 📱 Fonctionnalités

### Accessibilité
- Contrôles clavier complets
- Option "Réduire les animations"
- Mode contraste renforcé
- Support des préférences système
- Effets sonores optionnels

### Performance
- 60 FPS ciblés avec fallback 30 FPS
- Delta-time cap pour éviter les saccades
- Optimisations Canvas 2D
- Gestion mémoire optimisée
- Animations fluides avec oscillations

### Analytics
- Tracking des événements de jeu
- Mesure des KPIs (démarrage, complétion, CTR)
- Redirection avec paramètres UTM

## 🎨 Personnalisation

Les paramètres de jeu sont centralisés dans `store/useGameStore.ts` :

```typescript
// Paramètres d'accessibilité
soundEnabled: boolean
reduceAnimations: boolean
highContrast: boolean

// Paramètres de jeu
gameDuration: 20000        // Durée du jeu (ms)
spawnRate: 0.03           // Taux de spawn
fallSpeed: 0.0001         // Vitesse de chute
```

## 📊 KPIs ciblés

- **Taux de démarrage** : > 80% des ouvertures
- **Taux de complétion** : > 70% des démarrages  
- **CTR vers site** : > 40% des complétions
- **Temps moyen** : 15-25 secondes par session

## 🔧 Développement

### Structure du projet

```
├── app/                    # Pages Next.js
├── components/             # Composants React
├── store/                  # État global (Zustand)
├── public/                 # Assets statiques (SVG)
└── lib/                    # Utilitaires
```

### Ajout de nouvelles fonctionnalités

1. **Nouveaux types d'entités** : Modifier `store/useGameStore.ts`
2. **Nouveaux effets visuels** : Modifier `components/GameCanvas.tsx`
3. **Nouveaux paramètres** : Ajouter dans `store/useGameStore.ts`

## 🚀 Déploiement

Le projet est configuré pour Vercel avec :

- Redirection automatique `/` → `/catch`
- Middleware pour les paramètres UTM
- Headers de sécurité
- Optimisations de performance
- Configuration Vercel optimisée

Voir `DEPLOYMENT.md` pour les détails complets.

## 📈 Monitoring

- **Plausible Analytics** : Événements de jeu et navigation
- **Vercel Analytics** : Performance et erreurs
- **Console** : Logs de debug en développement

## 🎯 Roadmap

### MVP ✅
- [x] Canvas minimal avec entités rondes
- [x] Collisions AABB
- [x] Système de score et timer
- [x] CTA vers le site principal
- [x] Tracking analytics
- [x] Accessibilité basique
- [x] Animations fluides
- [x] Effets sonores
- [x] Mode contraste renforcé
- [x] Réduction des animations

### V1 (à venir)
- [ ] Particules et effets visuels avancés
- [ ] Écran de pause
- [ ] Tutoriel interactif
- [ ] Palette de couleurs dynamique
- [ ] Redirection animée

## 📄 Licence

Propriétaire - Prompt Consulting
# Catch-the-stuff
