# 🚀 VidyaQuest — Deployment Guide

## Local Development

```bash
# 1. Clone
git clone https://github.com/suryanarayan100406/hackathon_tsoc.git
cd hackathon_tsoc

# 2. Install
npm install

# 3. Setup env
cp .env.example .env
# Edit .env with your Google OAuth credentials

# 4. Database
npx prisma migrate dev --name init
npx prisma db seed

# 5. Run
npm run dev
```

---

## Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → Import Git Repository
2. Select `hackathon_tsoc` repo
3. Framework: Next.js (auto-detected)
4. Environment Variables:
   - `DATABASE_URL` → PostgreSQL connection string from Render
   - `NEXTAUTH_SECRET` → random 32-char string
   - `NEXTAUTH_URL` → `https://tsoc.suryaxnarayan.in`
   - `GOOGLE_CLIENT_ID` → from Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` → from Google Cloud Console
5. Deploy → get URL
6. Update Google OAuth redirect URI to: `https://tsoc.suryaxnarayan.in/api/auth/callback/google`

---

## Render (Database)

1. Go to [render.com](https://render.com) → New PostgreSQL
2. Name: `vidyaquest-db`, Plan: Free
3. Copy connection string (External URL)
4. Paste into Vercel env vars as `DATABASE_URL`
5. After Vercel deploys, run migration:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

## Custom Domain

1. In Vercel → Project Settings → Domains
2. Add `tsoc.suryaxnarayan.in`
3. Add CNAME record in DNS: `tsoc` → `cname.vercel-dns.com`
4. Wait for SSL provisioning (~5 min)

---

## Netlify (Static Assets CDN) — Optional

1. Deploy `/public` folder to Netlify
2. Use Netlify URL as CDN for audio files, images
3. Configure `_redirects`:
   ```
   /*  /index.html  200
   ```
