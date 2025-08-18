#!/bin/bash
# Mundo Tango Life CEO - Docker Setup Script
# 53x21s Framework: Layer 52 (Container Orchestration) Setup

set -e

echo "🐋 Mundo Tango Life CEO - Docker Setup Starting..."
echo "📋 53x21s Framework: Layer 52 (Container Orchestration) + Layer 51 (n8n) + Layer 53 (TestSprite)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p nginx/ssl
mkdir -p uploads
mkdir -p logs
mkdir -p tmp

# Set permissions
echo "🔒 Setting permissions..."
chmod +x scripts/docker-setup.sh
chmod 755 nginx
chmod 755 uploads logs tmp

# Create environment file for Docker
echo "⚙️ Setting up environment..."
if [ ! -f .env.docker ]; then
    echo "Creating .env.docker template..."
    cat > .env.docker << EOF
# Docker Environment Configuration
# Copy your Replit secrets here for Docker deployment

# Database
DATABASE_URL=your_database_url_here

# n8n Configuration
N8N_ENCRYPTION_KEY=your_n8n_encryption_key
N8N_JWT_SECRET=your_n8n_jwt_secret
N8N_BASE_URL=http://localhost:5678

# TestSprite AI Testing
TESTSPRITE_API_KEY=your_testsprite_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# HubSpot
HUBSPOT_ACCESS_TOKEN=your_hubspot_token
EOF
    echo "✅ Created .env.docker template. Please update with your actual values."
fi

# Pull latest images
echo "📥 Pulling Docker images..."
docker-compose pull

# Build custom images
echo "🔨 Building application image..."
docker-compose build

echo "✅ Docker setup complete!"
echo ""
echo "🚀 To start the full stack:"
echo "   docker-compose up -d"
echo ""
echo "🔧 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🌐 Services will be available at:"
echo "   • Main App: http://localhost"
echo "   • n8n Automation: http://localhost/n8n"
echo "   • Direct n8n: http://localhost:5678"
echo ""
echo "🛑 To stop:"
echo "   docker-compose down"
echo ""
echo "📊 53x21s Framework Status: Layer 52 (Container Orchestration) Ready ✅"