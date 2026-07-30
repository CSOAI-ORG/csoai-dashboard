#!/bin/bash
# deploy-vercel.sh — One-command deploy to Vercel
# Usage: ./deploy-vercel.sh

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           🚀 CSOAI Vercel Deployment                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
if ! command -v vercel >/dev/null 2>&1; then
  echo "❌ Vercel CLI not installed. Run: npm i -g vercel"
  exit 1
fi

if ! vercel whoami >/dev/null 2>&1; then
  echo "❌ Not logged in to Vercel. Run: vercel login"
  exit 1
fi

# Check env
if [ ! -f ".env.production" ]; then
  echo "⚠️  .env.production not found. Using .env.production.example as template."
  echo "   Please edit .env.production with real values before deploying."
  cp .env.production.example .env.production
  exit 1
fi

echo "[1/4] Installing dependencies..."
pnpm install

echo "[2/4] Building project..."
pnpm run build

echo "[3/4] Pulling Vercel environment..."
vercel pull --yes

echo "[4/4] Deploying to production..."
vercel deploy --prod

echo ""
echo "✅ Deployment initiated! Check https://vercel.com/dashboard"
