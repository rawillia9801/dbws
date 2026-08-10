alter table public.website_inquiries
  add column if not exists requested_service text not null default 'general'
  check (requested_service in ('general', 'website-personalization', 'custom-website', 'business-voice'));

grant insert (requested_service) on table public.website_inquiries to anon, authenticated;

comment on column public.website_inquiries.requested_service is
'Optional Dog Breeder Web service selected before submitting the inquiry; general means no specific add-on was selected.';
