-- ============================================================
--  GRAVEYARD — schema for the failed-startup marketplace
--  Paste into Supabase → SQL Editor → Run.
--  Safe to re-run (idempotent-ish: uses IF NOT EXISTS / OR REPLACE).
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
--  PROFILES  (1:1 with auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text,
  avatar_url          text,
  bio                 text,
  x_handle            text,
  linkedin_url        text,
  website_url         text,
  location            text,
  failed_count        int  default 0,
  fail_reasons        text,               -- free text: kis karan fail hue
  onboarded           boolean default false,
  created_at          timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
--  STARTUPS  (the graveyard listings)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.startups (
  id                  uuid primary key default gen_random_uuid(),
  founder_id          uuid not null references public.profiles(id) on delete cascade,
  slug                text unique not null,

  -- basics
  name                text not null,
  logo_url            text,
  screenshot_urls     text[] default '{}',
  tagline             text,
  about               text,
  marketing_channels  text[],             -- e.g. {seo, twitter, coldemail}
  category            text,
  tech_stack          text[],

  -- lifecycle / autopsy
  started_at          date,
  ended_at            date,
  outcome             text default 'shutdown',  -- shutdown | pivot
  failure_reason      text,               -- dropdown value
  failure_detail      text,               -- long story
  lessons_learned     text,
  total_users         int  default 0,

  -- metrics
  claimed_mrr         numeric default 0,
  verified_mrr        numeric default 0,
  revenue_verified    boolean default false,
  verified_provider   text,               -- stripe | lemonsqueezy | ...
  analytics_url       text,               -- GA / plausible share link
  monthly_visitors    int  default 0,

  -- sale
  for_sale            boolean default false,
  asking_price        numeric,
  price_multiplier    numeric,            -- e.g. 3.0  => 3x revenue
  open_to_offers      boolean default true,

  -- meta
  status              text default 'draft',   -- draft | listed | sold
  listing_paid        boolean default false,  -- listing is free; kept for history
  sale_listing_paid   boolean default false,  -- $9 for-sale listing fee paid
  featured            boolean default false,
  view_count          int  default 0,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists startups_status_idx   on public.startups(status);
create index if not exists startups_founder_idx   on public.startups(founder_id);
create index if not exists startups_for_sale_idx   on public.startups(for_sale);

-- ─────────────────────────────────────────────────────────────
--  AD SLOTS  ($49 sidebar placements — 3 left, 3 right)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ad_slots (
  id                  uuid primary key default gen_random_uuid(),
  position            text not null,      -- left-1 .. left-3 / right-1 .. right-3
  buyer_id            uuid references public.profiles(id) on delete set null,
  headline            text,
  body                text,
  cta_label           text,
  cta_url             text,
  image_url           text,
  active              boolean default false,
  starts_at           timestamptz,
  ends_at             timestamptz,
  created_at          timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
--  PAYMENTS  (Dodo transactions — source of truth is the webhook)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.profiles(id) on delete set null,
  kind                text not null,      -- ad_slot | listing | sale_listing
  reference_id        uuid,               -- startup_id or ad_slot_id
  amount_cents        int,
  currency            text default 'usd',
  status              text default 'pending', -- pending | paid | failed
  dodo_payment_id     text,
  dodo_session_id     text,
  created_at          timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
--  OFFERS  (buyers make offers on for-sale startups)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.offers (
  id                  uuid primary key default gen_random_uuid(),
  startup_id          uuid not null references public.startups(id) on delete cascade,
  buyer_id            uuid not null references public.profiles(id) on delete cascade,
  amount              numeric not null,
  message             text,
  status              text default 'pending', -- pending | accepted | rejected | countered
  counter_amount      numeric,
  created_at          timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
--  TRIGGERS
-- ─────────────────────────────────────────────────────────────
-- auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists startups_touch on public.startups;
create trigger startups_touch
  before update on public.startups
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.startups  enable row level security;
alter table public.ad_slots  enable row level security;
alter table public.payments  enable row level security;
alter table public.offers    enable row level security;

-- profiles: everyone can read, only owner writes
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles upsert"  on public.profiles;
drop policy if exists "profiles update"  on public.profiles;
create policy "profiles read"   on public.profiles for select using (true);
create policy "profiles upsert"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update"  on public.profiles for update using (auth.uid() = id);

-- startups: public can read LISTED ones; founders manage their own
drop policy if exists "startups public read" on public.startups;
drop policy if exists "startups owner read"  on public.startups;
drop policy if exists "startups insert"      on public.startups;
drop policy if exists "startups update"      on public.startups;
drop policy if exists "startups delete"      on public.startups;
create policy "startups public read" on public.startups for select using (status = 'listed' or auth.uid() = founder_id);
create policy "startups insert"      on public.startups for insert with check (auth.uid() = founder_id);
create policy "startups update"      on public.startups for update using (auth.uid() = founder_id);
create policy "startups delete"      on public.startups for delete using (auth.uid() = founder_id);

-- ad_slots: public reads active ads; writes happen server-side (service role)
drop policy if exists "ads read" on public.ad_slots;
create policy "ads read" on public.ad_slots for select using (true);

-- payments: a user can read their own; writes are server-side only
drop policy if exists "payments read own" on public.payments;
create policy "payments read own" on public.payments for select using (auth.uid() = user_id);

-- offers: buyer + the startup's founder can read; buyer inserts
drop policy if exists "offers read"   on public.offers;
drop policy if exists "offers insert"  on public.offers;
drop policy if exists "offers update"  on public.offers;
create policy "offers read" on public.offers for select using (
  auth.uid() = buyer_id
  or auth.uid() = (select founder_id from public.startups s where s.id = startup_id)
);
create policy "offers insert" on public.offers for insert with check (auth.uid() = buyer_id);
create policy "offers update" on public.offers for update using (
  auth.uid() = buyer_id
  or auth.uid() = (select founder_id from public.startups s where s.id = startup_id)
);

-- ─────────────────────────────────────────────────────────────
--  SEED: 6 empty ad slots (3 left, 3 right)
-- ─────────────────────────────────────────────────────────────
insert into public.ad_slots (position)
select p from (values ('left-1'),('left-2'),('left-3'),('right-1'),('right-2'),('right-3')) as t(p)
where not exists (select 1 from public.ad_slots);

-- ─────────────────────────────────────────────────────────────
--  RPC: atomic view-count bump
-- ─────────────────────────────────────────────────────────────
create or replace function public.increment_view(startup_slug text)
returns void language sql security definer set search_path = public as $$
  update public.startups set view_count = view_count + 1 where slug = startup_slug;
$$;

-- Backfill for projects created before screenshot_urls existed.
alter table public.startups add column if not exists screenshot_urls text[] default '{}';

-- ─────────────────────────────────────────────────────────────
--  STORAGE  (image uploads: avatars, logos, screenshots)
--  Public-read buckets; authenticated users write to their own
--  {user_id}/… folder only.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars','avatars',true), ('logos','logos',true), ('screenshots','screenshots',true)
on conflict (id) do nothing;

-- anyone can read
drop policy if exists "storage public read" on storage.objects;
create policy "storage public read" on storage.objects
  for select using (bucket_id in ('avatars','logos','screenshots'));

-- authenticated users can upload into a folder named after their uid
drop policy if exists "storage user upload" on storage.objects;
create policy "storage user upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('avatars','logos','screenshots')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- and update/delete their own files
drop policy if exists "storage user update" on storage.objects;
create policy "storage user update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('avatars','logos','screenshots')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage user delete" on storage.objects;
create policy "storage user delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('avatars','logos','screenshots')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
