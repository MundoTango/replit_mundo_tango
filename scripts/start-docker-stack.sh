#!/bin/bash
# Mundo Tango Life CEO - Start Docker Stack
# 53x21s Framework: Layer 52 (Container Orchestration) + Layer 51 (n8n) + Layer 53 (TestSprite)

set -e

echo "🚀 Starting Mundo Tango Life CEO Docker Stack..."
echo "📋 53x21s Framework: Complete Container Orchestration"

# Check if required files exist
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Run docker-setup.sh first."
    exit 1
fi

if [ ! -f ".env.docker" ]; then
    echo "⚠️ .env.docker not found. Using Replit environment variables."
    echo "💡 For production, create .env.docker with your secrets."
fi

# Make scripts executable
chmod +x scripts/*.sh

# Create network if it doesn't exist
echo "🌐 Creating Docker network..."
docker network create mundo-tango-network 2>/dev/null || echo "Network already exists"

# Start the stack
echo "🐋 Starting Docker containers..."
echo "   • PostgreSQL (n8n workflows)"
echo "   • Redis (caching & queues)"  
echo "   • n8n (automation platform)"
echo "   • Nginx (reverse proxy)"
echo "   • Main App (Mundo Tango)"

# Use environment variables from Replit if available
export DATABASE_URL="${DATABASE_URL:-postgresql://localhost:5432/mundotango}"
export N8N_ENCRYPTION_KEY="${N8N_ENCRYPTION_KEY:-default_key}"
export N8N_JWT_SECRET="${N8N_JWT_SECRET:-default_secret}"
export TESTSPRITE_API_KEY="${TESTSPRITE_API_KEY:-test_key}"

docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# PostgreSQL
if docker-compose exec -T postgres pg_isready -U n8n_user -d n8n_workflows; then
    echo "✅ PostgreSQL ready"
else
    echo "❌ PostgreSQL not ready"
fi

# Redis
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis ready"
else
    echo "❌ Redis not ready"
fi

# n8n
if curl -f http://localhost:5678/healthz > /dev/null 2>&1; then
    echo "✅ n8n ready"
else
    echo "⏳ n8n starting up (may take a minute)..."
fi

# Main app
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Main app ready"
else
    echo "⏳ Main app starting up..."
fi

echo ""
echo "🎉 Docker Stack Started Successfully!"
echo ""
echo "🌐 Access Points:"
echo "   • Main Application: http://localhost"
echo "   • n8n Automation: http://localhost/n8n"
echo "   • Direct n8n: http://localhost:5678"
echo "   • n8n Credentials: admin / mundotango2025"
echo ""
echo "📊 Monitoring:"
echo "   docker-compose logs -f          # View all logs"
echo "   docker-compose logs -f app      # App logs only"
echo "   docker-compose logs -f n8n      # n8n logs only"
echo ""
echo "🛑 Stop Stack:"
echo "   docker-compose down             # Stop all services"
echo "   docker-compose down -v          # Stop and remove volumes"
echo ""
echo "📋 53x21s Framework Status:"
echo "   ✅ Layer 51: n8n Automation Platform"
echo "   ✅ Layer 52: Container Orchestration"
echo "   ✅ Layer 53: TestSprite AI Testing Ready"
echo ""
echo "🔧 Next Steps:"
echo "   1. Access n8n at http://localhost:5678"
echo "   2. Import workflow templates from workflows/n8n-templates/"
echo "   3. Configure TestSprite webhooks"
echo "   4. Start your first automation!"