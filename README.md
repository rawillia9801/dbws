# Dog Breeder Web

Production website and structured breeder-site studio for [dogbreederweb.site](https://dogbreederweb.site), built with Next.js App Router, Supabase, Claude, PayPal, and Vercel.

## Stack

- Next.js 16 and React 19
- Supabase Auth and Postgres for breeder-owned drafts, published sites, version history, AI generations, and website inquiries
- Anthropic Claude through the Vercel AI SDK for schema-validated website editing
- PayPal Subscriptions for the single $17.95/month website plan
- Vercel for production deployment
- TypeScript and Zod validation

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase project URL, publishable key, and server-only integration secrets.
4. Apply the migrations in `supabase/migrations` to the connected Supabase project.
5. Add local and production callback URLs to the Supabase Auth redirect allow list.
6. Run `npm run dev`.

## Required environment variables

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
ANTHROPIC_API_KEY=your_anthropic_api_key
CLAUDE_SITE_BUILDER_MODEL=claude-sonnet-5
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

Use `PAYPAL_ENVIRONMENT=live` for production. The Anthropic API key and PayPal client secret are used only by server-side route handlers and must never be prefixed with `NEXT_PUBLIC_`.

## Product model

Dog Breeder Web has one recurring website plan, not tiered template packages. The plan includes the Claude website builder, managed hosting, SSL, two branded business email addresses, an included breeder subdomain, and the public puppy, litter, application, and embed capabilities from the WhiteLabel breeder platform. Brand Launch, done-for-you personalization, ground-up custom work, and Business Voice are optional add-ons.

Only the Supabase publishable key is used. A service-role or secret key must never be exposed to the browser or committed.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment

Import this repository into Vercel, set the required environment variables for Production, Preview, and Development, and deploy. Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin. Connect `dogbreederweb.site` in Vercel's domain settings when DNS is ready.
