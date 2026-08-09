# Dog Breeder Web

Production website for [dogbreederweb.site](https://dogbreederweb.site), built with Next.js App Router, Supabase, and Vercel.

## Stack

- Next.js 16 and React 19
- Supabase Postgres for website inquiries
- Vercel for production deployment
- TypeScript and Zod validation

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase project URL and publishable key.
4. Apply the migration in `supabase/migrations` to the connected Supabase project.
5. Run `npm run dev`.

## Required environment variables

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

Use `PAYPAL_ENVIRONMENT=live` for production. The client secret is used only by server-side route handlers and must never be prefixed with `NEXT_PUBLIC_`.

Only the Supabase publishable key is used. A service-role or secret key must never be exposed to the browser or committed.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment

Import this repository into Vercel, set the two required environment variables for Production, Preview, and Development, and deploy. Connect `dogbreederweb.site` in Vercel's domain settings when DNS is ready.
