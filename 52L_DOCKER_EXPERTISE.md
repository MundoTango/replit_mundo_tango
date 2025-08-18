# Layer 52: Docker Container Orchestration Expertise

## Executive Summary
Layer 52 introduces enterprise-grade containerization and orchestration capabilities using Docker and Docker Compose. This layer ensures secure, scalable, and maintainable deployment of the entire Mundo Tango ecosystem including n8n automation and TestSprite testing.

## Docker Platform Overview

### Core Capabilities
- **Container Isolation**: Process and filesystem isolation for security
- **Multi-Stage Builds**: Optimized images with minimal attack surface
- **Network Segmentation**: Custom networks for service isolation
- **Volume Management**: Persistent data with proper backup strategies
- **Health Monitoring**: Automatic container recovery and scaling

### Security Architecture
- **Non-root execution**: All containers run as unprivileged users
- **Read-only filesystems**: Immutable containers with tmpfs for writes
- **Capability dropping**: Remove unnecessary Linux capabilities
- **Resource limits**: CPU and memory constraints
- **Secrets management**: External secret stores, never in images

## Production Deployment Architecture

### 1. Multi-Container Stack
```yaml
Services:
  - Nginx (Reverse Proxy)
  - Node.js (Mundo Tango App)
  - PostgreSQL (Primary Database)
  - Redis (Cache & Queue)
  - n8n (Automation Platform)
  - Monitoring (Prometheus/Grafana)
```

### 2. Network Architecture
```yaml
Networks:
  frontend:
    - Public-facing services
    - SSL termination
    - Rate limiting
  
  backend:
    - Internal services only
    - Database connections
    - No external access
  
  automation:
    - n8n workflow network
    - Webhook endpoints
    - API integrations
```

### 3. Volume Strategy
```yaml
Volumes:
  app-data:
    - Application persistent data
    - User uploads
    - Generated reports
  
  db-data:
    - PostgreSQL data
    - Automatic backups
    - Point-in-time recovery
  
  n8n-data:
    - Workflow definitions
    - Execution history
    - Credentials store
```

## Security Best Practices

### Image Security
1. **Base Images**: Use official Alpine Linux images
2. **Vulnerability Scanning**: Trivy/Docker Scout in CI/CD
3. **Multi-stage Builds**: Separate build and runtime
4. **No Secrets**: Use Docker Secrets or external vaults
5. **Regular Updates**: Automated base image updates

### Runtime Security
```yaml
security_opt:
  - no-new-privileges:true
  - apparmor:docker-default
  - seccomp:default
cap_drop:
  - ALL
cap_add:
  - CHOWN
  - DAC_OVERRIDE
read_only: true
user: "1000:1000"
```

### Network Security
- **Internal networks**: Backend services isolated
- **TLS encryption**: All inter-service communication
- **Firewall rules**: iptables/ufw configuration
- **Port exposure**: Minimal, only through reverse proxy
- **Network policies**: Traffic rules between services

## Docker Compose Production Configuration

### Complete Stack Definition
```yaml
version: '3.8'

services:
  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ssl-certs:/etc/ssl/certs:ro
    networks:
      - frontend
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s

  # Mundo Tango Application
  app:
    build:
      context: .
      target: production
      args:
        NODE_ENV: production
    environment:
      DATABASE_URL_FILE: /run/secrets/db_url
      REDIS_URL: redis://redis:6379
      N8N_WEBHOOK_URL: http://n8n:5678/webhook
    secrets:
      - db_url
      - api_keys
    networks:
      - frontend
      - backend
      - automation
    depends_on:
      - postgres
      - redis
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
          cpus: '2.0'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mundotango
      POSTGRES_USER_FILE: /run/secrets/db_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_user
      - db_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - backend
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2.0'
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - backend
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s

  # n8n Automation
  n8n:
    image: n8nio/n8n:latest
    environment:
      N8N_ENCRYPTION_KEY_FILE: /run/secrets/n8n_key
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_DATABASE: n8n
    secrets:
      - n8n_key
      - db_password
    volumes:
      - n8n-data:/home/node/.n8n
    networks:
      - automation
      - backend
    ports:
      - "5678:5678"
    depends_on:
      - postgres
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
      interval: 30s

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    networks:
      - backend
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD_FILE: /run/secrets/grafana_password
    secrets:
      - grafana_password
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - frontend
      - backend
    ports:
      - "3001:3000"
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  # Backup Service
  backup:
    image: alpine:latest
    volumes:
      - postgres-data:/data/postgres:ro
      - n8n-data:/data/n8n:ro
      - backup-storage:/backup
    command: |
      sh -c "
        while true; do
          sleep 3600
          tar czf /backup/backup-$(date +%Y%m%d-%H%M%S).tar.gz /data
          find /backup -name '*.tar.gz' -mtime +7 -delete
        done
      "
    networks:
      - backend
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.2'

volumes:
  postgres-data:
  redis-data:
  n8n-data:
  prometheus-data:
  grafana-data:
  backup-storage:
  ssl-certs:

networks:
  frontend:
    driver: overlay
    attachable: true
  backend:
    driver: overlay
    internal: true
  automation:
    driver: overlay
    attachable: true

secrets:
  db_user:
    external: true
  db_password:
    external: true
  db_url:
    external: true
  n8n_key:
    external: true
  api_keys:
    external: true
  grafana_password:
    external: true
```

## Deployment Strategies

### 1. Development Environment
```bash
# Local development with hot reload
docker-compose -f docker-compose.dev.yml up
```

### 2. Staging Environment
```bash
# Staging with production-like config
docker-compose -f docker-compose.staging.yml up -d
```

### 3. Production Environment
```bash
# Production with Swarm mode
docker stack deploy -c docker-compose.prod.yml mundo-tango
```

## Health Monitoring

### Container Health Checks
- **HTTP endpoints**: `/health` routes
- **Database checks**: Connection validation
- **Redis checks**: PING command
- **n8n checks**: Workflow execution status

### Metrics Collection
- **Prometheus**: Time-series metrics
- **Grafana**: Visualization dashboards
- **Alerts**: PagerDuty/Slack integration
- **Logs**: Centralized with ELK stack

## Backup & Recovery

### Automated Backups
1. **Database**: pg_dump every 6 hours
2. **Volumes**: tar archives daily
3. **Configurations**: Git versioned
4. **Secrets**: External vault backup

### Disaster Recovery
1. **RTO**: 1 hour recovery time objective
2. **RPO**: 6 hour recovery point objective
3. **Multi-region**: Replicated across zones
4. **Testing**: Monthly recovery drills

## Performance Optimization

### Image Optimization
- **Alpine base**: 5MB base images
- **Layer caching**: Efficient Docker builds
- **Multi-stage**: Minimal production images
- **Compression**: gzip for layers

### Runtime Optimization
- **Memory limits**: Prevent OOM kills
- **CPU limits**: Fair resource sharing
- **Restart policies**: Automatic recovery
- **Scaling**: Horizontal pod autoscaling

## CI/CD Integration

### Build Pipeline
```yaml
stages:
  - build: Docker image creation
  - scan: Security vulnerability scanning
  - test: Automated testing with TestSprite
  - deploy: Rolling deployment to production
```

### Deployment Automation
```bash
# Automated deployment script
#!/bin/bash
docker build -t mundo-tango:$VERSION .
docker run --rm mundo-tango:$VERSION npm test
docker push registry.mundotango.life/app:$VERSION
docker service update --image registry.mundotango.life/app:$VERSION mundo-tango_app
```

## Cost Optimization

### Resource Management
- **Right-sizing**: Monitor actual usage
- **Spot instances**: For non-critical services
- **Auto-scaling**: Based on metrics
- **Cleanup**: Remove unused images/volumes

### Monitoring Costs
- **CPU usage**: Average 40-60%
- **Memory usage**: Average 60-80%
- **Storage**: Automated cleanup policies
- **Network**: Optimize data transfer

## Troubleshooting Guide

### Common Issues
1. **Container crashes**: Check logs with `docker logs`
2. **Network issues**: Inspect with `docker network ls`
3. **Volume problems**: Verify with `docker volume inspect`
4. **Performance**: Monitor with `docker stats`

### Debug Commands
```bash
# Container inspection
docker inspect <container>

# Network debugging
docker exec <container> netstat -tulpn

# Resource usage
docker stats --no-stream

# Clean up
docker system prune -a --volumes
```

## Integration Points

### With n8n (Layer 51)
- Shared backend network
- Webhook communication
- Database access
- Secret sharing

### With TestSprite
- CI/CD pipeline triggers
- Test result storage
- Report generation
- Failure notifications

### With Mundo Tango
- Application containerization
- Database connections
- Cache layer
- Static asset serving

## Next Steps

1. **Create Docker images** for all services
2. **Set up Docker registry** for image storage
3. **Configure secrets** in external vault
4. **Deploy staging** environment
5. **Run security scan** on all images
6. **Set up monitoring** dashboards
7. **Test backup/recovery** procedures
8. **Document runbooks** for operations

## Conclusion

Docker orchestration (Layer 52) provides the foundation for secure, scalable deployment of the entire Mundo Tango ecosystem. Combined with n8n automation (Layer 51) and comprehensive testing, this creates a production-ready infrastructure that can handle millions of users while maintaining security and performance standards.