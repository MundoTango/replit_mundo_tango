# Mundo Tango Life CEO - Docker Setup Guide

## 🐋 53x21s Framework: Complete Container Orchestration

This guide helps you deploy the full Mundo Tango Life CEO stack using Docker containers with n8n automation and TestSprite AI testing.

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                      │
│                    (Port 80/443)                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼────┐     ┌─────▼─────┐     ┌─────▼─────┐
│ Main   │     │    n8n    │     │ TestSprite│
│ App    │     │Automation │     │Integration│
│:5000   │     │  :5678    │     │           │
└───┬────┘     └─────┬─────┘     └─────┬─────┘
    │                │                 │
    └────────────────┼─────────────────┘
                     │
           ┌─────────▼─────────┐
           │   PostgreSQL      │
           │   (n8n data)      │
           │     :5432         │
           └─────────┬─────────┘
                     │
           ┌─────────▼─────────┐
           │      Redis        │
           │   (cache/jobs)    │
           │     :6379         │
           └───────────────────┘
```

## 🚀 Quick Start

### 1. Run Setup Script
```bash
./scripts/docker-setup.sh
```

### 2. Start the Stack
```bash
./scripts/start-docker-stack.sh
```

### 3. Access Services
- **Main App**: http://localhost
- **n8n Automation**: http://localhost/n8n
- **Direct n8n**: http://localhost:5678

## 📋 Manual Setup (Alternative)

### 1. Prerequisites
- Docker & Docker Compose installed
- Replit secrets configured (or .env.docker file)

### 2. Configure Environment
Copy your Replit secrets to `.env.docker`:
```bash
# Required secrets
DATABASE_URL=your_database_url
N8N_ENCRYPTION_KEY=your_n8n_key  
N8N_JWT_SECRET=your_n8n_secret
TESTSPRITE_API_KEY=your_testsprite_key
STRIPE_SECRET_KEY=your_stripe_key
```

### 3. Build and Start
```bash
# Create network
docker network create mundo-tango-network

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

## 🔧 Service Configuration

### n8n Automation Platform
- **URL**: http://localhost:5678
- **Credentials**: admin / mundotango2025
- **Database**: Dedicated PostgreSQL
- **Features**: 
  - User onboarding workflows
  - HubSpot integration
  - Email automation
  - TestSprite integration

### TestSprite AI Testing
- **Integration**: Webhook-based
- **Features**:
  - Autonomous testing (96% coverage)
  - Self-healing tests
  - CI/CD integration
  - Performance monitoring

### Main Application
- **Features**: Full Mundo Tango platform
- **Database**: External (Replit managed)
- **Authentication**: Replit OAuth
- **Storage**: Supabase integration

## 📊 Monitoring & Health Checks

### Health Endpoints
```bash
curl http://localhost/health              # Simple check
curl http://localhost/api/health          # Detailed status
```

### View Logs
```bash
docker-compose logs -f                    # All services
docker-compose logs -f app                # App only
docker-compose logs -f n8n                # n8n only
docker-compose logs -f postgres           # Database
```

### Resource Usage
```bash
docker stats                              # Live resource usage
docker-compose top                        # Process overview
```

## 🔄 Workflow Templates

### Import n8n Workflows
1. Access n8n at http://localhost:5678
2. Login with admin / mundotango2025
3. Import templates from `workflows/n8n-templates/`

### Available Templates:
- **User Onboarding**: Automated welcome emails
- **HubSpot Sync**: Contact synchronization  
- **TestSprite Integration**: Test result processing
- **Performance Alerts**: Monitoring workflows

## 🛠️ Maintenance

### Update Services
```bash
docker-compose pull                       # Pull latest images
docker-compose up -d                      # Recreate containers
```

### Backup Data
```bash
# PostgreSQL backup
docker-compose exec postgres pg_dump -U n8n_user n8n_workflows > n8n_backup.sql

# Redis backup
docker-compose exec redis redis-cli BGSAVE
```

### Scale Services
```bash
docker-compose up -d --scale app=3        # Scale main app
```

## 🚨 Troubleshooting

### Common Issues

**Service not starting:**
```bash
docker-compose logs [service-name]
```

**Database connection issues:**
```bash
docker-compose exec postgres pg_isready -U n8n_user
```

**Network problems:**
```bash
docker network ls
docker network inspect mundo-tango-network
```

**Port conflicts:**
```bash
netstat -tulpn | grep :5000
netstat -tulpn | grep :5678
```

### Reset Everything
```bash
docker-compose down -v                    # Stop and remove volumes
docker system prune -f                    # Clean Docker cache
./scripts/docker-setup.sh                 # Restart setup
```

## 🔐 Security Notes

- All containers run as non-root users
- Network isolation with custom bridge
- Secret management via environment variables
- Rate limiting enabled on nginx
- Security headers configured

## 📈 Performance Optimization

- Multi-stage Docker builds
- Image layer caching
- Resource limits configured
- Health checks enabled
- Auto-restart policies

## 🎯 Production Deployment

For production deployment:

1. Use external secrets management
2. Configure SSL certificates in `nginx/ssl/`
3. Set up external monitoring
4. Configure log aggregation
5. Enable backup automation

## 📞 Support

- Check logs first: `docker-compose logs -f`
- Verify health: `curl http://localhost/health`
- Review n8n workflows: http://localhost:5678
- TestSprite status: Check webhook logs

## 🏷️ Framework Tags

- **Layer 51**: n8n Automation Platform ✅
- **Layer 52**: Container Orchestration ✅  
- **Layer 53**: TestSprite AI Testing ✅
- **53x21s**: Complete Framework Implementation ✅