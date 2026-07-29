# † Graveyard

A quiet, premium marketplace for **failed and zero-revenue startups**. Founders lay a
dead product to rest with an honest autopsy; buyers browse the graveyard for code,
domains, users and pivots. Built with Next.js 14 (App Router), Supabase, and Dodo Payments.

---

## What's built

| Area | Route | Notes |
|------|-------|-------|
| Landing page | `/` | Premium minimal dark theme, hero, stats, how-it-works, latest arrivals |
| Auth | `/login` `/register` | Email/password **+ Google OAuth** |
| Onboarding | `/onboarding` | Profile completion after first sign-up |
| Marketplace | `/browse` | Search, filters, sort, **3 + 3 ad slots** down each side |
| For-sale board | `/sales` | Leaderboard of startups for sale (price or revenue multiple) |
| Startup detail | `/startup/[slug]` | Autopsy, metrics, verified-revenue badge, make offer |
| Founder dashboard | `/dashboard` | Listings, stats, offers received |
| Listing form | `/sell` | 3-step: identity → autopsy → money & sale |
| Public profile | `/profile/[id]` | Founder profile + their graveyard |
| Edit profile | `/profile/edit` | |
| Payments | `/api/checkout`, `/api/webhooks/dodo` | Dodo hosted checkout for the 3 paid actions |
| Revenue verify | `/api/verify-revenue` | Read-only Stripe key → real MRR, key never stored |

### Paid actions (via Dodo Payments)
- **Ad slot** — $49 / 30 days (6 slots total: 3 left, 3 right on `/browse`)
- **Publish a listing** — $9
- **List for sale** — $90 (verification fee)

---

## Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query →** paste [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   This creates all tables, RLS policies, the new-user trigger, and seeds the 6 ad slots.
3. **Authentication → Providers → Google →** enable and add your OAuth credentials.
4. **Authentication → URL Configuration →** set Site URL and add
   `http://localhost:3000/auth/callback` (and your prod URL) to Redirect URLs.

### 2. Dodo Payments
1. Sign up at [app.dodopayments.com](https://app.dodopayments.com).
2. Create **3 products**: `$49 Ad Slot`, `$9 Listing`, `$90 Sale Listing`. Copy each product ID
   into the matching `DODO_PRODUCT_*` env var.
3. **Developer → Webhooks →** add an endpoint pointing at `https://YOUR_DOMAIN/api/webhooks/dodo`
   and copy the signing secret into `DODO_WEBHOOK_SECRET`.

### 3. Environment
Copy `.env.example` → `.env.local` and fill in the values. **Never commit `.env.local`.**

> ⚠️ The Supabase **service-role key** is a full-access secret. If it ever leaks (e.g. pasted
> into a chat), rotate it immediately in Supabase → Settings → API.

### 4. Run
```bash
npm install
npm run dev      # http://localhost:3000
```

### 5. Deploy (Vercel)
```bash
vercel --prod
```
Add all env vars in the Vercel project settings, then update Supabase Site URL / Redirect URLs
and the Dodo webhook URL to your production domain.

---

## Notes & next steps (MVP stubs)
- **Webhook signature verification** is stubbed — add Standard-Webhooks/svix verification with
  `DODO_WEBHOOK_SECRET` before going live so payments can't be spoofed.
- **Image uploads** currently take URLs (logo, avatar, screenshots). Wire UploadThing or Supabase
  Storage next for direct uploads.
- **Offer accept/reject/counter** UI is read-only on the dashboard for now; the `offers` table and
  RLS already support the full flow.
- **Analytics** uses a manual share-link field; a GA4 Data API integration can replace it later.

Rest in production.
