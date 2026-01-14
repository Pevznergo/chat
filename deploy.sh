#!/bin/bash

# Stop on error
set -e

echo "🚀 Starting deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest changes..."
git pull

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

# 4. Build application
echo "🏗️  Building application..."
npm run build

# 5. Restart application (Example using PM2, adjust if using systemd or other)
echo "🔄 Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 reload all || pm2 restart all
else
    echo "⚠️  PM2 not found. Please restart your application process manually."
    # echo "systemctl restart my-app" # Uncomment if using systemd
fi

echo "✅ Deployment complete!"
