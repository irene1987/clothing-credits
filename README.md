# ClothingCredits 👕

Sistema di gestione crediti per distribuzione vestiario — ispirato a Boxtribute, ma focalizzato sulla gestione delle tessere punti degli utenti.

## 🚀 Deploy su Railway (gratis)

### 1. Prepara il repository GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create clothing-credits --public --push
# oppure: crea manualmente il repo su github.com e fai push
```

### 2. Deploy su Railway

1. Vai su **[railway.app](https://railway.app)** → Login con GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Seleziona il tuo repository
4. Click **"Add Service"** → **"Database"** → **PostgreSQL**
5. Vai sulle variabili della tua app e aggiungi:
   ```
   NEXTAUTH_SECRET=<genera con: openssl rand -base64 32>
   NEXTAUTH_URL=https://<il-tuo-nome>.railway.app
   DATABASE_URL=${{Postgres.DATABASE_URL}}   ← Railway lo risolve automaticamente
   ```
6. Railway rileva il Dockerfile e fa il build automatico 🎉

### 3. Prima configurazione

Dopo il deploy, apri la **Railway Shell** (o usa la CLI) ed esegui:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

Questo crea le tabelle e il primo utente admin:
- **Email:** admin@example.com  
- **Password:** admin123

⚠️ **Cambia subito la password** dalle impostazioni!

---

## 💻 Sviluppo locale

```bash
# 1. Installa dipendenze
npm install

# 2. Crea il file .env.local
cp .env.example .env.local
# Modifica DATABASE_URL con il tuo PostgreSQL locale
# oppure usa: npx prisma migrate dev per SQLite (cambia provider nel schema)

# 3. Inizializza il database
npm run db:push
npm run db:seed

# 4. Avvia in dev
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

---

## 📁 Struttura progetto

```
src/
├── app/
│   ├── (app)/               # Pagine protette (sidebar layout)
│   │   ├── dashboard/       # Dashboard con statistiche
│   │   ├── users/           # Lista utenti + dettaglio + modifica
│   │   ├── transactions/    # Storico transazioni
│   │   └── settings/        # Gestione operatori (solo admin)
│   ├── api/                 # API Routes
│   │   ├── auth/            # NextAuth
│   │   ├── users/           # CRUD utenti
│   │   ├── transactions/    # Crea transazioni
│   │   └── operators/       # Crea operatori
│   └── login/               # Pagina login
├── components/
│   ├── Sidebar.tsx          # Navigazione laterale
│   ├── CreditActions.tsx    # Widget aggiungi/sottrai crediti
│   ├── NewOperatorForm.tsx  # Form nuovo operatore
│   └── Providers.tsx        # Session provider
└── lib/
    ├── auth.ts              # Configurazione NextAuth
    ├── prisma.ts            # Client Prisma singleton
    └── utils.ts             # Funzioni utility
```

---

## 🎨 Personalizzazione

### Cambiare nome e logo
- **Nome app:** cerca `ClothingCredits` e `Gestione tessere` nei file
- **Colore brand:** in `tailwind.config.js` modifica i valori `brand`
- **Favicon:** sostituisci `public/favicon.ico`

### Crediti massimi per utente
Nel file `src/app/(app)/users/[id]/page.tsx`, cambia:
```ts
const maxCredits = 20 // ← modifica questo
```

### Lingua
Tutta l'interfaccia è in italiano. I testi sono nei file delle pagine.

---

## 🔐 Ruoli

| Ruolo | Può fare |
|-------|----------|
| **OPERATOR** | Vedere utenti, aggiungere/sottrarre crediti, vedere transazioni |
| **ADMIN** | Tutto + gestire operatori |

---

## 🛠 Stack tecnico

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js (JWT + bcrypt)
- **UI:** Tailwind CSS
- **Hosting:** Railway (gratis fino a $5/mese di risorse)

