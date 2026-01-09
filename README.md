# PricePulse (Canada V1)

This is a **deployable skeleton** based on your prototype UI.

## What happens once you publish
When someone searches an item, PricePulse will:
1) Look in your cached/indexed products (later)
2) Query retailer adapters (Best Buy, Walmart, Amazon, etc.)
3) Normalize results and show the cheapest delivered price first
4) Show your UI features (deal score, match confidence, alerts)

Important: It supports “anything” **only across the retailers you’ve implemented** + **any URL you allow users to paste to track**.

## Run locally
```bash
npm i
npm run dev
```

## Deploy
- Frontend + API routes: Vercel is the simplest
- Database + background jobs: add Supabase/Neon + a worker (Render/Railway/Fly)

## Environment variables (when you enable adapters)
- BESTBUY_API_KEY
- WALMART_API_KEY
- AMAZON_ACCESS_KEY
- AMAZON_SECRET_KEY
- AMAZON_PARTNER_TAG
- (others optional)

## API endpoints
- `GET /api/search?q=...`  -> queries enabled adapters and returns normalized offers
- `POST /api/track { url, targetPrice }` -> creates a watch (stub right now)

## Where to implement real price pulling
All retailer-specific work goes in `lib/adapters/*` so your UI stays stable.
