# CSOAI Deployment Guide

## The Problem
`csoai.org` currently shows a static legal placeholder. The real platform code is intact and builds successfully.

## What I Fixed
- **Production path bug**: The bundled server was looking for `client/index.html` in the wrong directory. Fixed in `server/_core/vite.ts`.
- **Verified build**: `pnpm run build` completes successfully and serves the real CSOAI platform.

## Quick Start (Docker)

You have Docker installed. To deploy locally or on any VPS:

```bash
# 1. Create your production env file
cp .env .env.production
# Edit .env.production with your real keys

# 2. Run the deploy script
./deploy.sh
```

This starts:
- MySQL 8.0 on port 3306
- CSOAI platform on port 3000

## Environment Variables Needed

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | MySQL connection string |
| `JWT_SECRET` | ✅ | Random string for auth tokens |
| `STRIPE_SECRET_KEY` | ❌ | For payments |
| `STRIPE_PUBLISHABLE_KEY` | ❌ | For payments |
| `RESEND_API_KEY` | ❌ | For email sending |
| `SENTRY_DSN` | ❌ | Error tracking |
| `OAUTH_SERVER_URL` | ❌ | OAuth provider |
| `OWNER_OPEN_ID` | ❌ | Your admin openId |

## Production Deployment Options

### Option A: VPS / Dedicated Server (Recommended)
1. Rent a VPS (Hetzner, DigitalOcean, AWS EC2, etc.)
2. Install Docker
3. Clone/pull this repo
4. Set `.env.production` with real keys
5. Run `./deploy.sh`
6. Point `csoai.org` DNS to the server IP
7. Add reverse proxy (Caddy or Nginx) with HTTPS

### Option B: Railway / Render (Managed)
1. Push this repo to GitHub
2. Connect Railway or Render
3. Add MySQL addon
4. Set environment variables in dashboard
5. Deploy

### Option C: Keep Vercel (Requires Adaptation)
The current domain is on Vercel. To keep it there, we'd need to:
- Convert the Express backend to Vercel serverless functions
- Or use Vercel for frontend only + separate backend host

This is more complex but doable if you want to stay on Vercel.

## Database Setup

If using a fresh database, run migrations after first deploy:
```bash
pnpm exec drizzle-kit migrate
```

Or the Docker setup handles it automatically on first run.

## Current Status
✅ Code builds  
✅ Frontend serves correctly  
✅ Docker setup ready  
⏳ Needs: hosting + env vars + DNS update
