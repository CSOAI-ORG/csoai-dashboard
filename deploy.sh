#!/bin/bash
set -e

echo "🚀 CSOAI Deployment Script"
echo "=========================="

# Check for .env.production
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found. Creating from template..."
    cat > .env.production << 'ENVFILE'
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
DATABASE_URL=mysql://csoai_user:csoai_pass@mysql:3306/csoai_prod
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_PUBLISHABLE_KEY=pk_live_...
# RESEND_API_KEY=re_...
# SENTRY_DSN=https://...
# OAUTH_SERVER_URL=https://...
# OWNER_OPEN_ID=your-openid
ENVFILE
    echo "✅ Created .env.production - EDIT THIS FILE WITH YOUR REAL KEYS BEFORE DEPLOYING!"
    exit 1
fi

echo "📦 Building Docker images..."
docker-compose build

echo "🗄️  Starting MySQL and running migrations..."
docker-compose up -d mysql
sleep 15

echo "🚀 Starting CSOAI platform..."
docker-compose up -d app

echo ""
echo "✅ CSOAI is deploying!"
echo "📍 Local: http://localhost:3000"
echo ""
echo "To view logs: docker-compose logs -f app"
echo "To stop: docker-compose down"
