# Dog Breeder Web

Production website and structured breeder-site studio for [dogbreederweb.site](https://dogbreederweb.site), built with Next.js App Router, Supabase, Anthropic-powered server-side AI, PayPal, and Vercel.

## Stack

- Next.js 16 and React 19
- Supabase Auth and Postgres for breeder-owned drafts, published sites, version history, website subscriptions, AI generations, inquiries, and shared breeder identity
- Anthropic through the Vercel AI SDK for the customer-facing BreederWeb Designer
- PayPal Subscriptions for the $89 setup fee plus $20/month connected website service
- Vercel for production deployment
- TypeScript and Zod validation

## Required environment variables

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
ANTHROPIC_API_KEY=your_anthropic_api_key
CLAUDE_SITE_BUILDER_MODEL=claude-sonnet-5
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=live
NEXT_PUBLIC_SITE_URL=https://dogbreederweb.site
```

`ANTHROPIC_API_KEY` and `PAYPAL_CLIENT_SECRET` are server-only and must never be prefixed with `NEXT_PUBLIC_` or committed. The PayPal client ID is returned by the server only as required by PayPal's browser SDK. BreederWeb Designer falls back to `claude-sonnet-5` when `CLAUDE_SITE_BUILDER_MODEL` is missing or still contains a placeholder value.

## Product model

The connected website service costs:

- $89 one-time setup, including registration of one available, non-premium `.com`
- $20 per month for BreederWeb Designer, managed Vercel hosting, SSL, updates, two business email addresses branded to the connected domain, puppy and litter publishing, applications and contact forms, embeddable website sections, mobile-ready pages, brand controls, version history, connected MyDogPortal breeder-workspace access, and DogBreederDocs.Online document-workspace access
- $39 per year for domain renewal, billed separately each year before renewal

A connected domain is required for kennel-branded email addresses. The included non-premium `.com` supplies that domain when it is available. The annual $39 domain renewal is deliberately not represented as a parallel PayPal billing cycle inside the monthly subscription.

Additional services:

- Done-for-you personalization: $299 one time
- Ground-up custom website: from $749
- Business Voice: $69 setup, then $8.99/month or $99/year, plus usage

## Connected platform

The intended customer experience is one breeder identity across three connected product surfaces:

- `dogbreederweb.site` — public website building, publishing, domain, email, and BreederWeb Designer
- `mydogportal.site` — breeder operating system, dogs, litters, puppies, applications, families, balances, updates, scheduling, records, and Puppy Portals
- `dogbreederdocs.online` — state-aware breeder documents, reusable masters, branding, clause editing, and buyer/puppy paperwork

MyDogPortal is the authenticated operating hub. Website and document tools should be reachable from the same breeder account and should use the same breeder, puppy, family, and document records instead of requiring separate account creation or duplicated data entry.

## PayPal flow

1. The customer enters a preferred `.com` before PayPal opens.
2. The app normalizes and validates the requested `.com` format.
3. The live PayPal plan is uniquely named for the $89 setup + $20 monthly configuration.
4. The plan uses `payment_preferences.setup_fee` for $89 and `setup_fee_failure_action: "CANCEL"`.
5. The requested domain is supplied to the PayPal subscription as `custom_id`.
6. After approval, the server retrieves the subscription from PayPal and verifies its subscription ID, expected plan ID, APPROVED/ACTIVE status, and requested domain/custom ID.
7. The verified subscription and requested domain are connected to the authenticated breeder in Supabase. If checkout occurs before sign-in, the verified identifiers are carried into the authenticated builder flow and re-verified server-side.

## Supabase

Use the existing production project `gobeibjrfyyiazpmnztd`. Do not create a second Supabase project. Production Auth must allow:

```text
https://dogbreederweb.site/auth/callback
```

The builder uses `breeder_sites`, `breeder_site_versions`, `published_breeder_sites`, and `ai_site_generations`. Verified website checkout records use `website_subscriptions`.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Vercel production requirements

The intended production project is `roerts-projects/dbws`, with the repository root as the Next.js root directory and `main` as the production branch. The project should be Git-connected to `rawillia9801/dbws`; production deployment protection should be disabled; `dogbreederweb.site` and `www.dogbreederweb.site` should both be attached; and the environment variables above should be project-level Production variables.
