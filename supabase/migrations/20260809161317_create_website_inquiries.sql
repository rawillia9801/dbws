create table if not exists public.website_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 254),
  kennel_name text check (kennel_name is null or char_length(kennel_name) <= 140),
  breed text not null check (char_length(breed) between 2 and 120),
  current_website text check (current_website is null or char_length(current_website) <= 240),
  timeline text not null check (
    timeline in ('as-soon-as-possible', 'one-to-two-months', 'three-plus-months', 'exploring')
  ),
  goals text not null check (char_length(goals) between 10 and 2000),
  source text not null default 'dogbreederweb.site' check (source = 'dogbreederweb.site'),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.website_inquiries enable row level security;

revoke all on table public.website_inquiries from anon, authenticated;

grant insert (
  name,
  email,
  kennel_name,
  breed,
  current_website,
  timeline,
  goals,
  source
) on table public.website_inquiries to anon, authenticated;

create policy "Public can submit website inquiries"
on public.website_inquiries
for insert
to anon, authenticated
with check (
  source = 'dogbreederweb.site'
  and status = 'new'
  and char_length(name) between 2 and 100
  and char_length(email) between 3 and 254
  and char_length(breed) between 2 and 120
  and char_length(goals) between 10 and 2000
);

create index if not exists website_inquiries_created_at_idx
on public.website_inquiries (created_at desc);

comment on table public.website_inquiries is
'Private sales inquiries submitted through dogbreederweb.site. Public roles may insert but cannot read or modify records.';
