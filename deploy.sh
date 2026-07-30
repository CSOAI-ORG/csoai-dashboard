#!/bin/bash
# CSOAI Dashboard — Deploy to Cloudflare Pages
# Run this after: gh repo create csoai-dashboard --public --push

set -e

echo "=== CSOAI Dashboard Deploy ==="

# Check prerequisites
command -v gh >/dev/null 2>&1 || { echo "Error: gh CLI not installed. Install: brew install gh"; exit 1; }
command -v wrangler >/dev/null 2>&1 || { echo "Error: wrangler not installed. Install: npm install -g wrangler"; exit 1; }

# Step 1: Create GitHub repo and push
echo "Step 1: Creating GitHub repo..."
gh repo create csoai-dashboard --public --source=. --push || echo "Repo may already exist, pushing..."

# Step 2: Build
echo "Step 2: Building..."
npm run build

# Step 3: Deploy to Cloudflare Pages
echo "Step 3: Deploying to Cloudflare Pages..."
npx wrangler pages deploy .next --project-name=csoai-gspc

echo ""
echo "=== Deploy complete ==="
echo "Site will be available at: https://csoai-gspc.pages.dev"
echo ""
echo "Next steps:"
echo "1. Set up D1 database: wrangler d1 create csoai-gspc"
echo "2. Update wrangler.toml with the database_id"
echo "3. Run schema: wrangler d1 execute csoai-gspc --remote --file=schema.sql"
echo "4. Set WORKER_URL env var in Cloudflare Pages dashboard"
