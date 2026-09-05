# Final launch step

`/sell` saves a draft and forwards to `/launch/[id]`. Dashboard draft actions use
that same gate. The free card is first; Featured Launch ($9), Directory Blast
($99) and Everything Bundle ($149) follow. Secondary placement plans expand
below. Prices and bundle savings use `src/lib/ad-pricing.ts` rather than copied
numbers. The current repository's $19 Sidebar makes the bundle saving $56.
The public site inspected during development displayed a $49 Sidebar and $86
saving; this change does not overwrite repository prices with those live values.

## Publishing

- Free: add the linked **Listed on Saasgrave** badge to the public HTTPS landing
  page, deploy it, then verify. The server checks the exact listing link and
  badge image in returned HTML before publishing. JavaScript-only injection is
  unsupported. Common hidden markup is rejected; this is HTML verification, not
  a browser-computed visibility audit. No ongoing removal monitoring is added.
- Paid: checkout is tied to this startup, user, order and Dodo product ID. Only a
  successful provider payment with matching metadata and product cart grants
  badge-free launch. A pending row or a browser return URL is insufficient.
- The database trigger prevents users from publishing directly or writing paid,
  featured or badge verification evidence through the Supabase REST API.
  Existing listed products are not unpublished. Verified free listing URLs and
  slugs need support to change, so their verified link cannot silently break.
- Checkout failure preserves the draft. Repeat checkout requests reuse the
  pending product checkout. The dashboard lists launch orders for recovery.
- Provider callbacks and return-page reconciliation share an atomic, idempotent
  database fulfilment function. A duplicate callback does not extend durations
  or allocate another bundle. Legacy payments also now require provider
  confirmation; webhook metadata is fetched from Dodo rather than trusted from
  an unsigned incoming payload.

## Apply before deploying

1. Apply `supabase/migrations/20260905_launch_plans.sql` in the existing Supabase
   project. It adds launch evidence, `launch_orders`, its RLS, the publish guard
   and the service-role-only fulfilment function. Do not deploy the application
   changes before the migration. The migration is additive and preserves live
   listings. Existing promotions schema/inventory remains in use; ensure actual
   sidebar/sponsored/newsletter inventory exists with correct `placement` values.
2. Confirm `NEXT_PUBLIC_SITE_URL` is `https://saasgrave.org`, and the existing
   Supabase URL, anon key and service role key are configured server-side.
3. Check the existing per-plan Dodo product IDs against the catalogue and their
   actual fixed prices. No new paid price is introduced. Use the Dodo test
   environment for a test purchase before enabling production traffic.
4. Keep the Dodo `payment.succeeded` webhook directed to
   `/api/webhooks/dodo`. The handler independently retrieves the payment with
   the merchant API key; provider outages produce a retryable response.
5. Test one free listing, a missing badge, a cancelled checkout, a paid Featured
   launch, and a Bundle purchase. Replay the same provider callback and confirm
   only one set of grants. Check the return page and dashboard after payment.

## Inventory and operations

Launch-time placement grants are serialized. If a placement fills before a
payment settles, the listing still launches badge-free and the missing placement
is recorded in `launch_orders.queued_placements`, with `placement_status` set to
`needs_scheduling`. This possibility is disclosed before checkout. The admin
page shows these orders; coordinate the remaining placements with the founder.
After delivering them, update that order's `placement_status` to `fulfilled` and
clear `queued_placements` using the trusted admin database interface. Do not
clear `fulfilled_at` or replay the order to deliver a missing placement, since
that would also rerun benefits already delivered.

Directory submissions remain a manual service queued in `directory_status`.
Newsletter purchase includes a seven-day sidebar slot. Bundle slots run for a
month, while its Featured Launch runs for seven days. No guaranteed revival,
traffic, SEO result or invented conversion uplift is claimed.

## Validation

- Seven local tests passed covering badge parsing, private-network rejection, payment identity matching, database publish/entitlement bypass attempts, atomic/idempotent bundle fulfilment, queued inventory and newsletter durations.
- `npx tsc --noEmit`: passed.
- `npm run build`: compiled successfully; static guide prerendering then failed
  because this workspace has no Supabase environment configuration.
- Browser visual QA could not run: Chromium was absent and its download failed.
  Live authenticated checkout and production migration have not been run here.

Research references: [ScrollLaunch pricing](https://www.scrolllaunch.com/pricing),
[Tiny Startups](https://www.tinystartups.com/), and
[Nick Launches](https://nicklaunches.com/). These informed benefit presentation;
Saasgrave retains its own offers and prices. Payment matching follows
[Dodo payment retrieval](https://docs.dodopayments.com/api-reference/payments/get-payments-1).
