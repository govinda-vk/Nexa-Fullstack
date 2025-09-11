# Deployment Guide

## Production Deployment Overview

This guide covers deploying the ASKit backend to production environments including cloud providers, containerized deployments, and production best practices.

---

## Production Requirements

### Infrastructure Requirements

**Minimum Production Specs:**
- **CPU**: 4 cores (2.4GHz+)
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 100Mbps bandwidth
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2

**Recommended Production Specs:**
- **CPU**: 8+ cores (3.0GHz+)
- **RAM**: 16GB+
- **Storage**: 250GB+ SSD with backup
- **Network**: 1Gbps bandwidth
- **Load Balancer**: For multi-instance deployments

### Database Requirements

**MongoDB Production:**
- **Version**: MongoDB 5.0+
- **RAM**: 4GB+ dedicated
- **Storage**: 100GB+ with daily backups
- **Replica Set**: 3-node minimum for high availability

**Redis Production:**
- **Version**: Redis 6.0+
- **RAM**: 2GB+ dedicated
- **Persistence**: AOF + RDB enabled
- **Sentinel**: For high availability

**Pinecone Production:**
- **Plan**: Standard or Enterprise
- **Index**: Dedicated pods
- **Replicas**: Multiple for high availability

---

## Environment Configuration

### Production Environment Variables

Create `production.env`:

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Database Configuration
MONGODB_URI=mongodb+srv://prod-user:secure-password@cluster.mongodb.net/askit-prod
REDIS_URL=redis://prod-redis:secure-password@redis-host:6379

# Security Configuration
JWT_SECRET=ultra-secure-jwt-secret-for-production-at-least-64-characters-long
JWT_EXPIRES_IN=24h
SESSION_SECRET=ultra-secure-session-secret-for-production-environment
BCRYPT_ROUNDS=14

# API Keys (Production)
OPENAI_API_KEY=sk-production-openai-key
GEMINI_API_KEY=AI-production-gemini-key
PINECONE_API_KEY=production-pinecone-key
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX_NAME=askit-prod

# Application URLs
API_BASE_URL=https://api.yourdomain.com
WIDGET_SCRIPT_URL=https://widget.yourdomain.com
WIDGET_API_BASE_URL=https://api.yourdomain.com

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting (Stricter for production)
RATE_LIMIT_WINDOW=900000    # 15 minutes
RATE_LIMIT_MAX=50           # Lower limit for production
LOGIN_RATE_LIMIT=3          # Stricter login attempts

# Processing Configuration
MAX_PAGES_PER_CRAWL=200
MAX_CONCURRENT_JOBS=5
CRAWL_DELAY=1000

# Monitoring & Logging
LOG_LEVEL=info
ERROR_REPORTING_SERVICE=sentry
SENTRY_DSN=your-sentry-dsn-here

# Performance
CLUSTER_WORKERS=4           # Number of worker processes
COMPRESSION_LEVEL=6
CACHE_TTL=3600

# SSL Configuration
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private.key

# Health Checks
HEALTH_CHECK_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=5000
```

### Security Hardening

**1. Secrets Management**
```bash
# Use environment-specific secret management
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id prod/askit/jwt-secret

# Azure Key Vault
az keyvault secret show --vault-name askit-prod --name jwt-secret

# Google Secret Manager
gcloud secrets versions access latest --secret="jwt-secret"
```

**2. Network Security**
```bash
# Firewall rules (UFW example)
ufw deny incoming
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from 10.0.0.0/8 to any port 3000  # Internal only
ufw --force enable
```

**3. SSL/TLS Configuration**
```javascript
// src/server.js production SSL setup
if (process.env.NODE_ENV === 'production') {
  const https = require('https');
  const fs = require('fs');
  
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  };
  
  https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });
}
```

---

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder /app ./

# Create necessary directories
RUN mkdir -p logs tmp && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node healthcheck.js

# Expose port
EXPOSE 3000

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
```

### Docker Compose Production

```yaml
version: '3.8'

services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - production.env
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    depends_on:
      - mongodb
      - redis
    networks:
      - askit-network
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'

  mongodb:
    image: mongo:6
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASS}
      MONGO_INITDB_DATABASE: askit
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/init.js
    networks:
      - askit-network
    deploy:
      resources:
        limits:
          memory: 4G

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - askit-network
    deploy:
      resources:
        limits:
          memory: 2G

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./static:/usr/share/nginx/html
    depends_on:
      - app
    networks:
      - askit-network

volumes:
  mongodb_data:
  redis_data:

networks:
  askit-network:
    driver: bridge
```

### Health Check Script

```javascript
// healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.log(`Health check failed with status: ${res.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log(`Health check failed: ${err.message}`);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('Health check timeout');
  request.abort();
  process.exit(1);
});

request.end();
```

---

## Cloud Platform Deployments

### AWS Deployment

#### Using AWS App Runner

```yaml
# apprunner.yaml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - npm ci --production
      - npm run build
run:
  runtime-version: 18
  command: node src/server.js
  network:
    port: 3000
    env: PORT
  env:
    - name: NODE_ENV
      value: production
```

**Deploy Command:**
```bash
# Create App Runner service
aws apprunner create-service \
  --service-name askit-backend \
  --source-configuration '{
    "CodeRepository": {
      "RepositoryUrl": "https://github.com/username/askit-backend",
      "SourceCodeVersion": {
        "Type": "BRANCH",
        "Value": "main"
      },
      "CodeConfiguration": {
        "ConfigurationSource": "CONFIGURATION_FILE"
      }
    }
  }'
```

#### Using ECS Fargate

```json
{
  "family": "askit-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "askit-app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/askit-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:prod/mongodb-uri"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/askit-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

#### Cloud Run Deployment

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/askit-backend', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/askit-backend']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'askit-backend'
      - '--image=gcr.io/$PROJECT_ID/askit-backend'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--memory=2Gi'
      - '--cpu=2'
      - '--max-instances=10'
```

**Deploy Command:**
```bash
# Deploy to Cloud Run
gcloud run deploy askit-backend \
  --image gcr.io/PROJECT_ID/askit-backend \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production
```

### Azure Container Instances

```json
{
  "apiVersion": "2021-07-01",
  "type": "Microsoft.ContainerInstance/containerGroups",
  "name": "askit-backend",
  "location": "East US",
  "properties": {
    "containers": [
      {
        "name": "askit-app",
        "properties": {
          "image": "your-registry.azurecr.io/askit-backend:latest",
          "resources": {
            "requests": {
              "cpu": 2,
              "memoryInGb": 4
            }
          },
          "ports": [
            {
              "port": 3000,
              "protocol": "TCP"
            }
          ],
          "environmentVariables": [
            {
              "name": "NODE_ENV",
              "value": "production"
            }
          ]
        }
      }
    ],
    "osType": "Linux",
    "ipAddress": {
      "type": "Public",
      "ports": [
        {
          "protocol": "TCP",
          "port": 3000
        }
      ]
    },
    "restartPolicy": "Always"
  }
}
```

---

## Load Balancer Configuration

### Nginx Load Balancer

```nginx
# nginx.conf
upstream askit_backend {
    least_conn;
    server app1:3000 max_fails=3 fail_timeout=30s;
    server app2:3000 max_fails=3 fail_timeout=30s;
    server app3:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
    limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;

    # Proxy Configuration
    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://askit_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Stricter rate limiting for auth endpoints
    location /auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://askit_backend;
        # ... other proxy settings
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://askit_backend;
        proxy_set_header Host $host;
    }

    # Static files (if serving widgets)
    location /widget {
        root /usr/share/nginx/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### AWS Application Load Balancer

```json
{
  "LoadBalancerArn": "arn:aws:elasticloadbalancing:region:account:loadbalancer/app/askit-alb/id",
  "DNSName": "askit-alb-123456789.region.elb.amazonaws.com",
  "Scheme": "internet-facing",
  "VpcId": "vpc-12345678",
  "Type": "application",
  "SecurityGroups": ["sg-12345678"],
  "IpAddressType": "ipv4",
  "LoadBalancerAttributes": [
    {
      "Key": "idle_timeout.timeout_seconds",
      "Value": "60"
    },
    {
      "Key": "deletion_protection.enabled",
      "Value": "true"
    }
  ]
}
```

---

## Monitoring & Logging

### Application Monitoring

#### PM2 Process Manager

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'askit-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=2048'
  }]
};
```

**PM2 Commands:**
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart gracefully
pm2 reload askit-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Structured Logging

```javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'askit-backend',
    version: process.env.APP_VERSION 
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

#### Error Tracking with Sentry

```javascript
// src/utils/sentry.js
const Sentry = require('@sentry/node');

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.APP_VERSION,
    tracesSampleRate: 0.1
  });
}

module.exports = Sentry;
```

### Infrastructure Monitoring

#### Prometheus Metrics

```javascript
// src/utils/metrics.js
const promClient = require('prom-client');

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
});

module.exports = {
  httpRequestDuration,
  httpRequestsTotal,
  activeConnections
};
```

#### Health Checks

```javascript
// src/routes/health.js
const express = require('express');
const mongoose = require('mongoose');
const redis = require('../config/redis');
const { Pinecone } = require('@pinecone-database/pinecone');

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '1.0.0',
    services: {}
  };

  // Check MongoDB
  try {
    await mongoose.connection.db.admin().ping();
    health.services.mongodb = 'connected';
  } catch (error) {
    health.services.mongodb = 'disconnected';
    health.status = 'error';
  }

  // Check Redis
  try {
    await redis.ping();
    health.services.redis = 'connected';
  } catch (error) {
    health.services.redis = 'disconnected';
    health.status = 'error';
  }

  // Check Pinecone
  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    await index.describeIndexStats();
    health.services.pinecone = 'connected';
  } catch (error) {
    health.services.pinecone = 'disconnected';
    health.status = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

---

## Backup & Recovery

### Database Backup Strategy

```bash
#!/bin/bash
# backup.sh - Automated backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
RETENTION_DAYS=30

# MongoDB Backup
mongodump \
  --uri="$MONGODB_URI" \
  --out="$BACKUP_DIR/mongodb_$DATE" \
  --gzip

# Redis Backup
redis-cli --rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Compress backups
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" \
  "$BACKUP_DIR/mongodb_$DATE" \
  "$BACKUP_DIR/redis_$DATE.rdb"

# Upload to cloud storage (AWS S3 example)
aws s3 cp "$BACKUP_DIR/backup_$DATE.tar.gz" \
  "s3://your-backup-bucket/backups/"

# Clean up old backups
find "$BACKUP_DIR" -name "backup_*.tar.gz" \
  -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

### Automated Backup with Cron

```bash
# Add to crontab: crontab -e
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1

# Weekly full backup on Sundays
0 1 * * 0 /path/to/full-backup.sh >> /var/log/backup.log 2>&1
```

---

## Performance Optimization

### Application Performance

#### Clustering
```javascript
// src/cluster.js
const cluster = require('cluster');
const os = require('os');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  require('./server.js');
  console.log(`Worker ${process.pid} started`);
}
```

#### Memory Optimization
```javascript
// Memory management settings
process.env.NODE_OPTIONS = '--max-old-space-size=2048';

// Garbage collection tuning
if (process.env.NODE_ENV === 'production') {
  require('v8').setFlagsFromString('--expose-gc');
  
  // Force GC every 5 minutes
  setInterval(() => {
    if (global.gc) {
      global.gc();
    }
  }, 5 * 60 * 1000);
}
```

### Database Optimization

#### MongoDB Indexes
```javascript
// Database indexes for optimal performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "googleId": 1 }, { sparse: true });

db.websites.createIndex({ "owner": 1, "createdAt": -1 });
db.websites.createIndex({ "url": 1, "owner": 1 });
db.websites.createIndex({ "status": 1 });

db.widgets.createIndex({ "owner": 1 });
db.widgets.createIndex({ "isActive": 1, "createdAt": -1 });
```

#### Connection Pool Optimization
```javascript
// MongoDB connection optimization
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 50,      // Maximum connections
  minPoolSize: 5,       // Minimum connections  
  maxIdleTimeMS: 30000, // Close after 30s of inactivity
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
});
```

---

## Security Checklist

### Pre-Deployment Security

- [ ] **Environment Variables**: All secrets in environment variables, not code
- [ ] **JWT Secrets**: Strong, unique secrets (64+ characters)
- [ ] **Database Security**: Authentication enabled, network access restricted
- [ ] **API Rate Limiting**: Implemented and configured appropriately
- [ ] **CORS**: Configured for specific origins only
- [ ] **HTTPS**: SSL/TLS certificates installed and configured
- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **Error Handling**: No sensitive information leaked in error responses
- [ ] **Dependencies**: All dependencies updated, vulnerability scan completed
- [ ] **Logging**: Audit logs enabled, sensitive data not logged
- [ ] **Firewall**: Network access restricted to necessary ports only

### Post-Deployment Security

- [ ] **Monitor Logs**: Set up log monitoring and alerting
- [ ] **Security Updates**: Automated security update process
- [ ] **Penetration Testing**: Regular security assessments
- [ ] **Backup Encryption**: Backups encrypted and access controlled
- [ ] **Access Control**: Principle of least privilege applied
- [ ] **Incident Response**: Security incident response plan in place

---

**Last Updated**: September 2025  
**Deployment Version**: 1.0.0
