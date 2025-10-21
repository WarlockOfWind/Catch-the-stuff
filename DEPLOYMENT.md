# Guide de déploiement - Catch the Stuff

## Déploiement sur Vercel

### 1. Préparation
- ✅ Configuration Next.js optimisée
- ✅ Headers de sécurité configurés
- ✅ Redirections configurées
- ✅ Optimisations de performance

### 2. Variables d'environnement
Créez un fichier `.env.local` avec :
```env
NEXT_PUBLIC_BASE_URL=https://catch-the-stuff.vercel.app
NEXT_PUBLIC_REDIRECT_URL=https://promptconsulting.fr/?utm_source=qr-card&utm_campaign=bcv2025
VERCEL_ENV=production
```

### 3. Commandes de déploiement
```bash
# Installation des dépendances
npm install

# Build de production
npm run build

# Test local
npm run start

# Déploiement Vercel
vercel --prod
```

### 4. Configuration Vercel
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5. Optimisations incluses
- Compression gzip/brotli
- Headers de sécurité
- Optimisation des images (WebP/AVIF)
- Bundle optimization
- CSS optimization

### 6. URLs importantes
- **Production**: https://catch-the-stuff.vercel.app
- **Redirection**: https://promptconsulting.fr/?utm_source=qr-card&utm_campaign=bcv2025
- **GitHub**: https://github.com/WarlockOfWind/Catch-the-stuff

### 7. Monitoring
- Vercel Analytics activé
- Performance monitoring
- Error tracking




