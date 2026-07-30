# CSOAI Dashboard — Deployment Guide

## Prerequisites
1. Cloudflare account with Workers, Pages, D1 enabled
2. Wrangler CLI installed: `npm install -g wrangler`
3. Logged in: `wrangler login`

## Step 1: Create D1 Database
```bash
wrangler d1 create csoai-gspc
```
Copy the `database_id` from the output and update `wrangler.toml`.

## Step 2: Apply Schema
```bash
wrangler d1 execute csoai-gspc --file=./schema.sql
```

## Step 3: Seed Data (optional)
```bash
wrangler d1 execute csoai-gspc --file=./seed.sql
```

## Step 4: Deploy Worker
```bash
cd workers-api
wrangler deploy
```

## Step 5: Deploy Frontend
```bash
npm run build
npx wrangler pages deploy .vercel/output/static --project-name=csoai-dashboard
```

## Step 6: Set Environment Variables
In Cloudflare Dashboard → Pages → Settings → Environment Variables:
- `NEXT_PUBLIC_WORKER_URL` = `https://csoai-gspc-api.<your-subdomain>.workers.dev`

## Step 7: Custom Domain (optional)
In Cloudflare Dashboard → Pages → Custom Domains:
- Add `csoai.org` or `dashboard.csoai.org`

## Step 8: Verify
1. Visit the deployed URL
2. Check all 9 pages load
3. Test verify flow: click "Verify Chain" → should show "CHAIN INTACT"
4. Test arena: submit a probe → should show J-space panel
5. Test gap map: should show coverage table
6. Test ledger: should show 12 decision records
