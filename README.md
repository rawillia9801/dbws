# Dog Breeder Web

Production website and structured breeder-site studio for [dogbreederweb.site](https://dogbreederweb.site), built with Next.js App Router, Supabase, Anthropic-powered server-side AI, PayPal, and Vercel.

## Stack

- Next.js 16 and React 19
- Supabase Auth and Postgres for breeder-owned drafts, published sites, version history, website subscriptions, AI generations, inquiries, and shared breeder identity
- Anthropic through the Vercel AI SDK for the customer-facing BreederWeb Designer
- PayPal Subscriptions for the $149 setup fee plus $24.95/month website service
- Vercel for production deployment
- TypeScript and Zod validation

## Required environment variables

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
CLAUDE_SITE_BUILDER_MODEL=claude-sonnet-4-5
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=live
NEXT_PUBLIC_SITE_URL=https://dogbreederweb.site
```

`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, and `PAYPAL_CLIENT_SECRET` are server-only and must never be prefixed with `NEXT_PUBLIC_` or committed. The Supabase service-role key is used only for trusted website-subscription provisioning and shared-account integration. The PayPal client ID is returned by the server only as required by PayPal's browser SDK. BreederWeb Designer uses `claude-sonnet-4-5` as its supported default model and may use `CLAUDE_SITE_BUILDER_MODEL` for an explicitly configured supported model.

## Product model

The complete Dog Breeder Web website service costs:

- $149 one-time setup, including first-year registration of one available, non-premium `.com`
- $24.95 per month for BreederWeb Designer, managed Vercel hosting, SSL, updates, two business email addresses branded to the connected domain, puppy and litter publishing, applications and contact forms, embeddable website sections, mobile-ready pages, brand controls, version history, and an included MyDogPortal companion workspace
- $39 per year for managed standard `.com` renewal after the first year, billed separately before renewal

The included MyDogPortal companion workspace is intended to let an active Dog Breeder Web customer review applications, manage buyers/families and the waitlist, maintain breeding dogs, litters, and puppies, and use those records to power website publishing. MyDogPortal Professional and Studio remain paid upgrades for advanced breeding intelligence, automation, document generation and e-signatures, payment workflows, private Puppy Portals, and the broader operating-system feature set.

A connected domain is required for kennel-branded email addresses. The included non-premium `.com` supplies that domain when it is available. The annual $39 domain renewal is deliberately not represented as a parallel PayPal billing cycle inside the monthly subscription.

DogBreederDocs remains a separate document product. The complete editable packet is included with eligible MyDogPortal Professional or Studio subscriptions.

Additional service:

- Business Voice: $69 setup, then $8.99/month or $99/year, plus usage

The separate $299 personalization service and $749 ground-up custom website service are not offered. BreederWeb Designer is intended to perform the website design and content workflow as part of the standard subscription.

## Connected platform

The intended customer experience is one breeder identity across three connected product surfaces:

- `dogbreederweb.site` — public website building, publishing, domain, email, and BreederWeb Designer
- `mydogportal.site` — included companion breeder workspace for website customers, with optional paid upgrades to the complete breeder operating system
- `dogbreederdocs.online` — state-aware breeder documents, reusable masters, branding, clause editing, and buyer/puppy paperwork

A verified Dog Breeder Web subscription provisions or reuses the shared Supabase breeder identity and grants both the `dogbreederweb` entitlement and the included `mydogportal` companion entitlement. It does not grant DogBreederDocs purchases or the paid MyDogPortal Professional/Studio entitlements.

## PayPal flow

1. The customer selects an available preferred `.com` before PayPal opens.
2. The app normalizes and validates the requested `.com` format.
3. The live PayPal plan is uniquely named for the $149 setup + $24.95 monthly configuration.
4. The plan uses `payment_preferences.setup_fee` for $149 and `setup_fee_failure_action: "CANCEL"`.
5. The requested domain is supplied to the PayPal subscription as `custom_id`.
6. After approval, the server retrieves the subscription from PayPal and verifies its subscription ID, expected plan ID, APPROVED/ACTIVE status, and requested domain/custom ID.
7. The verified subscription is attached to the authenticated Supabase user with a server-only admin client. The shared kennel/membership is created or reused, the requested domain is attached, and the Dog Breeder Web plus MyDogPortal companion entitlements are granted.

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

The intended production project is `roerts-projects/dbws`, with the repository root as the Next.js root directory and `main` as the production branch. The project should be Git-connected to `rawillia9801/dbws`; production deployment protection should be disabled; `dogbreederweb.site` and `www.dogbreederweb.site` should both be attached; and the environment variables above should be project-level Production variables.
