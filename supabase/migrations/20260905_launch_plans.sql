-- Apply once before deploying the launch-plan UI. Existing live listings stay live.
begin;
alter table public.startups add column if not exists launch_paid boolean not null default false;
alter table public.startups add column if not exists badge_verified_at timestamptz;
alter table public.startups add column if not exists badge_verified_url text;
alter table public.startups add column if not exists badge_check_at timestamptz;
alter table public.startups add column if not exists featured_until timestamptz;
alter table public.startups add column if not exists directory_status text;
alter table public.ad_slots add column if not exists placement text not null default 'sidebar';

create table if not exists public.launch_orders (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  product text not null check (product in ('featured','sidebar','sponsored','newsletter','directory','bundle')),
  product_id text not null,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  dodo_payment_id text unique,
  checkout_url text,
  fulfilled_at timestamptz,
  placement_status text not null default 'pending',
  queued_placements text[] not null default '{}',
  created_at timestamptz not null default now()
);
create unique index if not exists launch_orders_pending_product on public.launch_orders(startup_id, product) where status = 'pending';
alter table public.launch_orders enable row level security;
drop policy if exists "launch orders owner read" on public.launch_orders;
create policy "launch orders owner read" on public.launch_orders for select using (auth.uid() = user_id);

-- RLS alone allowed owners to publish or forge payment flags through REST.
-- Only the trusted server can grant launch evidence or cross the publish gate.
create or replace function public.guard_startup_launch() returns trigger language plpgsql set search_path = public as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') then
    if TG_OP = 'INSERT' then
      if new.status is distinct from 'draft' or new.launch_paid or new.badge_verified_at is not null
        or new.badge_verified_url is not null or new.badge_check_at is not null
        or new.featured or new.featured_until is not null or new.directory_status is not null then
        raise exception 'Save a draft, then complete the launch step.';
      end if;
    else
      if new.launch_paid is distinct from old.launch_paid
        or new.badge_verified_at is distinct from old.badge_verified_at
        or new.badge_verified_url is distinct from old.badge_verified_url
        or new.badge_check_at is distinct from old.badge_check_at
        or new.founder_id is distinct from old.founder_id
        or new.featured is distinct from old.featured
        or new.featured_until is distinct from old.featured_until
        or new.directory_status is distinct from old.directory_status then
        raise exception 'Launch verification can only be changed by the server.';
      end if;
      if new.status = 'listed' and old.status is distinct from 'listed' then
        raise exception 'Complete badge verification or paid checkout to launch.';
      end if;
      if new.website_url is distinct from old.website_url or new.slug is distinct from old.slug then
        if old.status = 'listed' and old.badge_verified_at is not null and not old.launch_paid then
          raise exception 'Contact support to change a verified free launch URL.';
        end if;
        new.badge_verified_at := null;
        new.badge_verified_url := null;
      end if;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists guard_startup_launch on public.startups;
create trigger guard_startup_launch before insert or update on public.startups
  for each row execute function public.guard_startup_launch();

-- All grants and the order marker commit together. Row/advisory locks serialize
-- duplicate callbacks and concurrent slot claims from this launch flow.
create or replace function public.fulfil_launch_order(order_id uuid, provider_payment_id text)
returns text language plpgsql security definer set search_path = public as $$
declare
  o public.launch_orders%rowtype;
  s public.startups%rowtype;
  slot_id uuid;
  placement_name text;
  placements text[] := '{}';
  queued boolean := false;
  missing_placements text[] := '{}';
  featured_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('saasgrave-launch-fulfilment'));
  select * into o from public.launch_orders where id = order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if o.fulfilled_at is not null then return o.placement_status; end if;
  select * into s from public.startups where id = o.startup_id and founder_id = o.user_id for update;
  if not found then raise exception 'Listing not found'; end if;
  if s.status not in ('draft', 'listed') then raise exception 'Listing cannot be launched'; end if;
  if o.product in ('featured','bundle') then
    select count(*) into featured_count from public.startups
      where featured = true and (featured_until is null or featured_until > now()) and id <> s.id;
    if featured_count < 3 then
      update public.startups set featured = true, featured_until = now() + interval '7 days' where id = s.id;
    else queued := true; missing_placements := array_append(missing_placements, 'featured');
    end if;
  end if;
  if o.product in ('directory','bundle') then
    update public.startups set directory_status = 'paid' where id = s.id;
  end if;
  if o.product = 'bundle' then placements := array['sidebar','sponsored','newsletter'];
  elsif o.product = 'newsletter' then placements := array['newsletter','sidebar'];
  elsif o.product in ('sidebar','sponsored') then placements := array[o.product];
  end if;
  foreach placement_name in array placements loop
    select id into slot_id from public.ad_slots
      where placement = placement_name and buyer_id is null and not (active and headline is not null)
      order by position limit 1 for update skip locked;
    if slot_id is null then queued := true; missing_placements := array_append(missing_placements, placement_name);
    else
      update public.ad_slots set buyer_id = o.user_id, active = true,
        starts_at = now(), ends_at = now() + case when o.product = 'newsletter' and placement_name = 'sidebar' then interval '7 days' else interval '30 days' end,
        headline = s.name, body = s.tagline, cta_url = s.website_url, image_url = s.logo_url
        where id = slot_id;
    end if;
  end loop;
  update public.startups set launch_paid = true, status = 'listed' where id = s.id;
  update public.launch_orders set status = 'paid', dodo_payment_id = provider_payment_id,
    fulfilled_at = now(), queued_placements = missing_placements, placement_status = case when queued then 'needs_scheduling' else 'fulfilled' end
    where id = o.id;
  return case when queued then 'needs_scheduling' else 'fulfilled' end;
end $$;
revoke all on function public.fulfil_launch_order(uuid, text) from public, anon, authenticated;
grant execute on function public.fulfil_launch_order(uuid, text) to service_role;
commit;
