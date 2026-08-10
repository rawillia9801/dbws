-- Align the shared production schema with the current Dog Breeder Web product model.
-- Dog Breeder Web: $149 setup + $24.95/month + $39/year domain renewal.
-- Website customers receive a limited MyDogPortal companion workspace rather than the paid Starter plan.

alter table public.website_subscriptions
  drop constraint if exists website_subscriptions_setup_fee_cents_check;
alter table public.website_subscriptions
  drop constraint if exists website_subscriptions_monthly_price_cents_check;

alter table public.website_subscriptions
  alter column setup_fee_cents set default 14900;
alter table public.website_subscriptions
  alter column monthly_price_cents set default 2495;

alter table public.website_subscriptions
  add constraint website_subscriptions_setup_fee_cents_check
  check (setup_fee_cents = 14900);
alter table public.website_subscriptions
  add constraint website_subscriptions_monthly_price_cents_check
  check (monthly_price_cents = 2495);

alter table public.kennels
  drop constraint if exists kennels_plan_check;
alter table public.kennels
  add constraint kennels_plan_check
  check (plan in ('website_companion', 'starter', 'professional', 'custom_domain'));

comment on column public.kennels.plan is
  'Access level: website_companion for Dog Breeder Web customers, starter, professional, or custom_domain (Studio).';
