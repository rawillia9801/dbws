# Dog Breeder Web

Production website and structured breeder-site studio for [dogbreederweb.site](https://dogbreederweb.site), built with Next.js App Router, Supabase, Anthropic-powered server-side AI, PayPal, Hostinger automation, and Vercel.

## Stack

- Next.js 16 and React 19
- Supabase Auth and Postgres for breeder-owned drafts, published sites, version history, website subscriptions, AI generations, inquiries, and shared breeder identity
- Anthropic through the Vercel AI SDK for the customer-facing BreederWeb Designer
- PayPal Subscriptions for the $149 setup fee plus $24.95/month website service
- Hostinger API for live `.com` search, included domain registration, DNS, and included mailbox provisioning where a Hostinger Email order is active
- Vercel for production deployment and tenant custom-domain routing
- TypeScript and Zod validation

## Required environment variables

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
CLAUDE_SITE_BUILDER_MODEL=claude-sonnet-5
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=live
HOSTINGER_API_TOKEN=your_server_only_hostinger_api_token
VERCEL_API_TOKEN=your_server_only_vercel_api_token
VERCEL_TEAM_ID=your_vercel_team_id
VERCEL_PROJECT_ID=your_dogbreederweb_vercel_project_id
NEXT_PUBLIC_SITE_URL=https://dogbreederweb.site
```

`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `PAYPAL_CLIENT_SECRET`, `HOSTINGER_API_TOKEN`, and `VERCEL_API_TOKEN` are server-only and must never be prefixed with `NEXT_PUBLIC_`, sent to the browser, or committed. BreederWeb Designer defaults to `claude-sonnet-5` and uses Anthropic ephemeral prompt caching for its stable builder instructions.

## Product model

The complete Dog Breeder Web website service costs:

- $149 one-time setup, including first-year registration of one available, non-premium `.com`
- $24.95 per month for BreederWeb Designer, managed Vercel hosting, SSL, updates, two business email addresses branded to the connected domain, puppy and litter publishing, applications and contact forms, embeddable website sections, mobile-ready pages, brand controls, version history, and an included MyDogPortal companion workspace
- $39 per year for managed standard `.com` renewal after the first year, billed separately before renewal

The included MyDogPortal companion workspace lets an active Dog Breeder Web customer review applications, manage buyers/families and the waitlist, maintain breeding dogs, litters, and puppies, and use those records to power website publishing. MyDogPortal Professional and Studio remain paid upgrades for advanced breeding intelligence, automation, document generation and e-signatures, payment workflows, private Puppy Portals, and the broader operating-system feature set.

DogBreederDocs remains a separate document product. The complete editable packet is included with eligible MyDogPortal Professional or Studio subscriptions.

The separate $299 personalization service and $749 ground-up custom website service are not offered. BreederWeb Designer is intended to perform the website design and content workflow as part of the standard subscription.

Optional service:

- Business Voice: $69 setup, then $8.99/month or $99/year, plus usage

## Domain ownership and cancellation

The included domain is registered for the breeder's kennel as part of setup. The breeder may cancel the recurring Dog Breeder Web website service at any time. Cancellation ends the managed website/email services at the end of the applicable paid service period but does not convert the kennel's domain into Dog Breeder Web property. The domain must remain releasable/transferable to the breeder, subject to registrar transfer rules and any renewal amount already due. Do not market the domain as forfeited on cancellation.

## Automated domain flow

1. The customer searches for a preferred `.com` directly on DogBreederWeb.Site.
2. `/api/domains/availability` checks current Hostinger registrar availability before PayPal checkout is presented.
3. The requested available domain is carried into the verified PayPal subscription.
4. After PayPal approval, the server rechecks availability and purchases the included standard `.com` through Hostinger.
5. The domain is attached to the Dog Breeder Web Vercel project, including apex, `www`, and `mail` hostnames.
6. Required A/CNAME and any Vercel verification records are written through Hostinger DNS.
7. The public custom-domain request is rewritten to the correct breeder's latest published site using the shared owner/subscription record.
8. `mail.<domain>` routes the breeder to Hostinger webmail rather than becoming a second website.
9. Domain/DNS/publish/email provisioning states are recorded in `website_subscriptions` so incomplete setup is visible instead of being silently treated as complete.

Automatic Vercel attachment requires the server-only Vercel API token plus team/project identifiers. The Hostinger token alone can purchase and manage the registrar/DNS side but cannot authorize Vercel project-domain changes.

## Included email flow

BreederWeb Designer can request creation of up to two included mailbox names from chat, for example `hello@domain.com` and `applications@domain.com`. The server resolves the active paid website subscription and Hostinger mail order, creates only the breeder's included mailboxes, and records the addresses in Supabase. Generated temporary mailbox passwords are not stored in Supabase. If Hostinger has not yet made an Email order available for that domain, the app records `manual_attention` rather than pretending mailbox creation succeeded.

## Connected platform

The intended customer experience is one breeder identity across three connected product surfaces:

- `dogbreederweb.site` — public website building, publishing, domain, email, and BreederWeb Designer
- `mydogportal.site` — included companion breeder workspace for website customers, with optional paid upgrades to the complete breeder operating system
- `dogbreederdocs.online` — state-aware breeder documents, reusable masters, branding, clause editing, and buyer/puppy paperwork

A verified Dog Breeder Web subscription provisions or reuses the shared Supabase breeder identity and grants both the `dogbreederweb` entitlement and the included `mydogportal` companion entitlement. It does not grant DogBreederDocs purchases or the paid MyDogPortal Professional/Studio entitlements.

## AI Builder operations

BreederWeb Designer is not only a copy generator. Its structured response can request these account-scoped operations when the breeder explicitly asks:

- `publish_site` — publish the current saved website
- `configure_domain` — finish/repair the paid setup domain and DNS
- `create_mailboxes` — create one or two included business mailbox names

The server executes the operation and appends the real result to the conversation; the model is not allowed to claim success merely because it requested an action.

## PayPal flow

1. The customer selects an available preferred `.com` before PayPal opens.
2. The app normalizes and validates the requested `.com` format and checks live availability.
3. The live PayPal plan is uniquely named for the $149 setup + $24.95 monthly configuration.
4. The plan uses `payment_preferences.setup_fee` for $149 and `setup_fee_failure_action: "CANCEL"`.
5. The requested domain is supplied to the PayPal subscription as `custom_id`.
6. After approval, the server retrieves the subscription from PayPal and verifies its subscription ID, expected plan ID, APPROVED/ACTIVE status, and requested domain/custom ID.
7. The verified subscription is attached to the authenticated Supabase user. The shared kennel/membership is created or reused, the Dog Breeder Web and MyDogPortal companion entitlements are granted, and domain provisioning begins.

## Supabase

Use the existing production project `gobeibjrfyyiazpmnztd`. Do not create a second Supabase project. Production Auth must allow:

```text
https://dogbreederweb.site/auth/callback
```

The builder uses `breeder_sites`, `breeder_site_versions`, `published_breeder_sites`, and `ai_site_generations`. Verified website checkout records use `website_subscriptions`. Connected access uses `platform_entitlements` with authenticated read-only access and trusted server-side writes.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Vercel production requirements

The production project should remain Git-connected to `rawillia9801/dbws`, use the repository root, and deploy `main`. `dogbreederweb.site` and `www.dogbreederweb.site` stay attached to that same multi-tenant project. Each breeder custom domain is added to that project by the server after verified checkout; the application routes the incoming hostname to the correct breeder site. Production secrets and automation credentials belong in Vercel Production environment variables, not in GitHub.
