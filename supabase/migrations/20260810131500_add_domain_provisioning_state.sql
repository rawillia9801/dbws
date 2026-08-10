alter table public.website_subscriptions
  add column if not exists domain_registrar text not null default 'hostinger',
  add column if not exists domain_registration_status text not null default 'pending',
  add column if not exists domain_registration_order jsonb,
  add column if not exists domain_registered_at timestamptz,
  add column if not exists dns_status text not null default 'pending',
  add column if not exists website_publish_status text not null default 'pending',
  add column if not exists email_provisioning_status text not null default 'pending',
  add column if not exists mailbox_addresses text[] not null default '{}'::text[];

alter table public.website_subscriptions
  drop constraint if exists website_subscriptions_domain_registration_status_check;
alter table public.website_subscriptions
  add constraint website_subscriptions_domain_registration_status_check
  check (domain_registration_status in ('pending','purchasing','registered','failed','manual_attention'));

alter table public.website_subscriptions
  drop constraint if exists website_subscriptions_dns_status_check;
alter table public.website_subscriptions
  add constraint website_subscriptions_dns_status_check
  check (dns_status in ('pending','configuring','configured','failed','manual_attention'));

alter table public.website_subscriptions
  drop constraint if exists website_subscriptions_website_publish_status_check;
alter table public.website_subscriptions
  add constraint website_subscriptions_website_publish_status_check
  check (website_publish_status in ('pending','ready','published','failed','manual_attention'));

alter table public.website_subscriptions
  drop constraint if exists website_subscriptions_email_provisioning_status_check;
alter table public.website_subscriptions
  add constraint website_subscriptions_email_provisioning_status_check
  check (email_provisioning_status in ('pending','ready','configured','failed','manual_attention'));
