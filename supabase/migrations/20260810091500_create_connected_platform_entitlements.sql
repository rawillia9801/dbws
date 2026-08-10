create table if not exists public.platform_entitlements (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  kennel_id uuid references public.kennels(id) on delete cascade,
  entitlement_key text not null check (entitlement_key in ('dogbreederweb','mydogportal','dogbreederdocs')),
  source text not null check (source in ('dogbreederweb_subscription','mydogportal_subscription','manual')),
  source_reference text not null,
  status text not null default 'active' check (status in ('active','inactive','cancelled','expired')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_reference, entitlement_key)
);

create index if not exists platform_entitlements_user_idx
  on public.platform_entitlements(auth_user_id, status, entitlement_key);
create index if not exists platform_entitlements_kennel_idx
  on public.platform_entitlements(kennel_id, status, entitlement_key);

alter table public.platform_entitlements enable row level security;
revoke all on public.platform_entitlements from anon;
revoke all on public.platform_entitlements from authenticated;
grant select on public.platform_entitlements to authenticated;

drop policy if exists "platform_entitlements_select_own" on public.platform_entitlements;
create policy "platform_entitlements_select_own"
on public.platform_entitlements for select to authenticated
using ((select auth.uid()) = auth_user_id);

comment on table public.platform_entitlements is
  'Server-managed product access shared by DogBreederWeb, MyDogPortal, and DogBreederDocs.';
