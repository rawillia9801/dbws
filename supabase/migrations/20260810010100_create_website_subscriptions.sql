create table if not exists public.website_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  paypal_subscription_id text not null unique check (paypal_subscription_id ~ '^I-[A-Za-z0-9]+$'),
  paypal_plan_id text not null,
  paypal_status text not null check (paypal_status in ('APPROVED', 'ACTIVE')),
  requested_domain text not null check (requested_domain ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.com$'),
  purchaser_email text,
  setup_fee_cents integer not null default 8900 check (setup_fee_cents = 8900),
  monthly_price_cents integer not null default 2000 check (monthly_price_cents = 2000),
  annual_domain_renewal_cents integer not null default 3900 check (annual_domain_renewal_cents = 3900),
  domain_renewal_billed_separately boolean not null default true check (domain_renewal_billed_separately),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists website_subscriptions_owner_id_idx
on public.website_subscriptions(owner_id);

create index if not exists website_subscriptions_requested_domain_idx
on public.website_subscriptions(requested_domain);

create or replace function public.set_website_subscription_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_website_subscription_updated_at on public.website_subscriptions;
create trigger set_website_subscription_updated_at
before update on public.website_subscriptions
for each row execute function public.set_website_subscription_updated_at();

alter table public.website_subscriptions enable row level security;

revoke all on public.website_subscriptions from anon, authenticated;
grant select, insert, update on public.website_subscriptions to authenticated;

create policy "Breeders can view their website subscriptions"
on public.website_subscriptions for select to authenticated
using ((select auth.uid()) = owner_id);

create policy "Breeders can attach their website subscriptions"
on public.website_subscriptions for insert to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Breeders can update their website subscriptions"
on public.website_subscriptions for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

comment on table public.website_subscriptions is
'Verified PayPal website-service subscriptions and requested non-premium .com domains connected to authenticated breeders.';
