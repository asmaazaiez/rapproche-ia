# 🚀 Déploiement Rapproche.IA — Guide complet

Ce guide t'amène de **"j'ai mon code"** à **"mon app est en ligne sur Internet"** en ~15 minutes.

---

## ⚠️ Pré-requis

Avant de commencer, il te faut :

1. **Un compte Anthropic avec une clé API** → https://console.anthropic.com
   - Crée une clé API dans la section "API Keys"
   - Ajoute du crédit ($5 minimum, ça dure longtemps en usage perso)
   - **Garde ta clé en lieu sûr — ne la commit JAMAIS sur GitHub**

2. **Un compte GitHub** ✅ (tu l'as déjà)

3. **Un compte Vercel gratuit** → https://vercel.com/signup
   - Connecte-toi avec ton compte GitHub (1 clic)

4. **Node.js installé sur ta machine** (pour tester en local avant)
   - Vérifie : `node -v` (besoin v18+)
   - Sinon : https://nodejs.org

---

## 📂 Structure attendue du projet

Ton repo GitHub doit ressembler à ça :

```
ton-projet/
├── api/
│   └── claude.js          ← Le proxy serverless (NOUVEAU)
├── src/
│   ├── App.jsx            ← Ton App.jsx MODIFIÉ
│   └── main.jsx           ← Point d'entrée React
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

## 🛠️ Étape 1 — Préparer le code en local

### A. Clone ton repo (si pas déjà fait)

```bash
git clone https://github.com/TON-USERNAME/TON-REPO.git
cd TON-REPO
```

### B. Copie les fichiers que je t'ai préparés

Place les 7 fichiers téléchargés à leur emplacement respectif (cf. structure ci-dessus).

⚠️ **Important : `App.jsx` remplace ton ancien fichier**. Les seules modifications par rapport à ton original sont :
- La fonction `callClaude` (appelle maintenant `/api/claude` au lieu de l'API directe)
- Les fonctions `loadHistory`/`saveHistory` (utilisent `localStorage` au lieu de `window.storage`)
- Tout le reste est identique.

### C. Installe les dépendances et teste en local

```bash
npm install
npm run dev
```

→ Tu devrais voir ton app sur `http://localhost:5173`

⚠️ **Note** : en mode `npm run dev`, le proxy `/api/claude` ne fonctionne PAS (Vite ne sert pas les fonctions serverless). Pour le tester en local, utilise `vercel dev` (voir étape optionnelle plus bas) ou attends le déploiement.

---

## 📤 Étape 2 — Push sur GitHub

```bash
git add .
git commit -m "Adapt for Vercel deployment"
git push origin main
```

Vérifie sur github.com que les fichiers sont bien là.

---

## 🌐 Étape 3 — Déploiement sur Vercel

### A. Importer le projet

1. Va sur https://vercel.com/new
2. Clique sur **"Import"** à côté de ton repo GitHub
3. Vercel détecte automatiquement que c'est un projet Vite ✓

### B. Configurer la variable d'environnement (CRUCIAL)

Avant de cliquer "Deploy", scroll jusqu'à **"Environment Variables"** :

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` (ta vraie clé) |

Clique **Add**, puis **Deploy**.

### C. Attends ~1 minute

Vercel build et déploie. Tu verras une URL du type :
```
https://ton-projet-abc123.vercel.app
```

🎉 **Ton app est en ligne !**

---

## 🧪 Étape 4 — Tester

1. Ouvre l'URL Vercel
2. Va dans l'onglet **Conciliation QB** (le plus simple à tester sans PDF)
3. Remplis quelques mois avec des soldes bidons
4. Clique "Analyser"

Si ça marche → **bravo, c'est déployé** ✨
Si ça plante → ouvre la console du navigateur (F12) et regarde l'erreur.

---

## 🐛 Dépannage

### "API error: 401"
→ Ta clé API Anthropic est mauvaise ou pas configurée. Va dans **Vercel → ton projet → Settings → Environment Variables** et vérifie.

### "API error: 429"
→ Pas assez de crédit sur ton compte Anthropic. Recharge sur console.anthropic.com.

### "API error: 500" / Function timeout
→ Le PDF est peut-être trop gros. Vercel hobby plan limite les fonctions à 10s. Solution : passer au plan Pro ($20/mois) ou splitter les PDF.

### Le proxy `/api/claude` retourne 404
→ Vérifie que le fichier est bien à `/api/claude.js` à la racine du projet (pas dans `src/`). Vercel déploie automatiquement tout ce qui est dans `/api/` comme fonctions serverless.

### Modèle Claude introuvable
→ Dans `api/claude.js`, le modèle par défaut est `claude-sonnet-4-5`. Si Anthropic l'a déprécié, change-le pour le dernier en date sur https://docs.claude.com/en/docs/about-claude/models

---

## 🔐 Sécurité — important

Avec cette config :
- ✅ Ta clé API n'est **jamais** dans le code frontend
- ✅ Ta clé API n'est **jamais** committée sur GitHub
- ✅ Ta clé API est uniquement dans les variables d'env Vercel (chiffrées)

⚠️ **Mais attention** : ton proxy `/api/claude` est **public**. N'importe qui peut l'appeler depuis ton URL Vercel et consommer ton crédit Anthropic. Pour un projet perso c'est OK, mais pour de la prod tu voudras ajouter :
- Un système d'authentification (Clerk, Auth0, Supabase Auth)
- Un rate-limiting (Vercel KV + middleware)
- Un domaine spécifique avec CORS strict

---

## 🌍 (Optionnel) Domaine personnalisé

Une fois ton app déployée :
1. Vercel → ton projet → **Settings → Domains**
2. Ajoute `monapp.com` ou `rapproche.fr` (ce que tu veux)
3. Vercel te donne les DNS à configurer chez ton registrar (OVH, Namecheap, etc.)
4. ~10 minutes plus tard, ton domaine pointe sur ton app

---

## 💡 (Optionnel) Tester en local avec Vercel

Pour tester le proxy `/api/claude` en local :

```bash
npm install -g vercel
vercel login
vercel link             # lie le dossier au projet Vercel
vercel env pull .env.local  # récupère ANTHROPIC_API_KEY
vercel dev              # lance Vite + serverless functions
```

→ ton app tourne sur `http://localhost:3000` avec le vrai proxy fonctionnel.

---

## 📊 Coûts à prévoir

| Service | Coût |
|---------|------|
| Vercel | Gratuit (Hobby plan) |
| GitHub | Gratuit (repo public ou privé) |
| Anthropic API | ~$0.003 par requête Sonnet (dépend de la taille des PDF) |
| Domaine custom | ~$10-15/an (optionnel) |

Pour un usage perso (quelques rapprochements/jour), tu seras à **moins de $5/mois** total.

---

## ✅ Checklist finale

- [ ] Repo GitHub à jour avec les 7 fichiers
- [ ] Variable `ANTHROPIC_API_KEY` configurée sur Vercel
- [ ] Premier déploiement réussi
- [ ] App testée sur l'URL Vercel
- [ ] (Bonus) Domaine custom configuré

Bon déploiement ! 🚀
