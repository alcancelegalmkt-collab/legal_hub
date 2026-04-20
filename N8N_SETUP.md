# n8n Setup & Deployment - Legal Hub

Complete guide to setting up self-hosted n8n for Legal Hub automation.

---

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker & Docker Compose
- 2GB RAM minimum
- Port 5678 available

### 1. Add to docker-compose.yml

```yaml
version: '3.8'

services:
  # ... existing services (PostgreSQL, etc.)

  n8n:
    image: n8nio/n8n:latest
    container_name: legal-hub-n8n
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgres
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n_user
      - DB_POSTGRESDB_PASSWORD=secure_password_here
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_SECURE_COOKIE=false
      - WEBHOOK_TUNNEL_URL=http://localhost:5678/
      - API_BASE_URL=http://backend:3000/api
      - FIRM_NAME="Seu Escritório"
      - APP_URL=http://localhost:3000
    volumes:
      - n8n_storage:/home/node/.n8n
    depends_on:
      - postgres
    networks:
      - legal-hub-network
    restart: unless-stopped

volumes:
  n8n_storage:

networks:
  legal-hub-network:
    driver: bridge
```

### 2. Start Services

```bash
docker-compose up -d n8n postgres

# Wait for n8n to start (check logs)
docker-compose logs n8n
```

### 3. Access n8n

Open: `http://localhost:5678`

First run setup:
- Set admin email
- Set admin password
- Configure basic settings

---

## 🔐 Authentication Setup

### Step 1: Get API Token

Login to n8n and get the JWT token from Legal Hub API:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@seuscritorio.com.br",
    "password": "sua_senha"
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": { ... }
# }
```

Copy the token value.

### Step 2: Create Credentials in n8n

1. Go to **Credentials** in n8n UI
2. Click **New Credential**
3. Choose **HTTP Header Auth**
4. Name: `legal_hub_jwt_token`
5. Header Name: `Authorization`
6. Header Value: `Bearer eyJhbGciOiJIUzI1NiIs...`
7. Save

### Step 3: Test Connection

```bash
# In n8n, add HTTP Request node
# Method: GET
# URL: {{ $env.API_BASE_URL }}/auth/profile
# Authentication: Select legal_hub_jwt_token
# Save and execute - should return user profile
```

---

## 📧 Email Setup (SendGrid)

### Step 1: Get SendGrid API Key

1. Go to [sendgrid.com](https://sendgrid.com)
2. Create account or login
3. Settings → API Keys → Create API Key
4. Copy the key

### Step 2: Create SendGrid Credential

In n8n:
1. **Credentials** → **New**
2. Choose **SendGrid**
3. Name: `sendgrid_api`
4. API Key: Paste your SendGrid key
5. Save

### Step 3: Test Email

```bash
# In n8n workflow
# Add SendGrid node
# From Email: noreply@seuscritorio.com.br
# To Email: seu_email@example.com
# Subject: Test
# Body: Test email
# Execute
```

---

## 💬 Slack Setup (Optional)

### Step 1: Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App**
3. Select **From scratch**
4. Name: `Legal Hub`
5. Workspace: Select your workspace
6. Create

### Step 2: Enable Incoming Webhooks

1. Settings → Incoming Webhooks
2. Toggle **On**
3. Click **Add New Webhook to Workspace**
4. Select channel: `#legal-hub`
5. Authorize
6. Copy Webhook URL

### Step 3: Create Credential in n8n

In n8n:
1. **Credentials** → **New**
2. Choose **Slack Webhook**
3. Name: `slack_webhook`
4. Webhook URL: Paste the URL
5. Save

---

## 🔄 Import Workflows

### Method 1: Via UI

1. Go to **Workflows** in n8n
2. Click **+ New**
3. Click **Import** (or Menu → Import)
4. Paste JSON from workflow files:
   - `05-gerar-documentos-automatico.json`
   - `06-enviar-zapsign-automatico.json`
   - `07-documento-assinado-webhook.json`
5. Click **Import**
6. Click **Save**

### Method 2: Via API

```bash
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -d @05-gerar-documentos-automatico.json
```

### Post-Import Setup

For each workflow:

1. **Click on the workflow**
2. **Update environment variables**:
   - Click `{{ }}` in nodes
   - Configure API URLs
3. **Select credentials**:
   - HTTP Request nodes → Select `legal_hub_jwt_token`
   - Email nodes → Select `sendgrid_api`
   - Slack nodes → Select `slack_webhook`
4. **Click Save**

---

## 🌐 Production Deployment

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name n8n.seuscritorio.com.br;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable HTTPS

```bash
# Using Let's Encrypt
sudo certbot certonly --standalone -d n8n.seuscritorio.com.br

# Update Nginx config
sudo vi /etc/nginx/sites-available/n8n
# Add:
# listen 443 ssl;
# ssl_certificate /etc/letsencrypt/live/n8n.seuscritorio.com.br/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/n8n.seuscritorio.com.br/privkey.pem;

sudo systemctl restart nginx
```

### Update Environment

Change in docker-compose.yml:

```yaml
environment:
  - N8N_HOST=n8n.seuscritorio.com.br
  - N8N_PROTOCOL=https
  - WEBHOOK_TUNNEL_URL=https://n8n.seuscritorio.com.br/
```

Restart:
```bash
docker-compose restart n8n
```

---

## 🔧 Configuration Reference

### Environment Variables

```bash
# N8N Core
N8N_HOST=n8n.seuscritorio.com.br
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_SECURE_COOKIE=true

# Database
DB_TYPE=postgres
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=very_secure_password

# Webhooks
WEBHOOK_TUNNEL_URL=https://n8n.seuscritorio.com.br/

# Legal Hub Integration
API_BASE_URL=http://backend:3000/api
FIRM_NAME="Seu Escritório de Advocacia"
APP_URL=https://seu-app.com.br

# Email
SENDGRID_API_KEY=SG.xxxx...

# Slack (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Security
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
EXECUTIONS_DATA_PRUNE_TIMEOUT=3600
```

---

## 📊 Monitoring

### Check Health

```bash
# Health check endpoint
curl http://localhost:5678/healthz

# Response:
# { "status": "ok" }
```

### View Logs

```bash
# Docker logs
docker-compose logs -f n8n

# Watch for errors
docker-compose logs n8n | grep -i error
```

### Database Backup

```bash
# Backup n8n database
docker exec legal-hub-postgres pg_dump -U n8n_user n8n > n8n_backup.sql

# Restore
docker exec -i legal-hub-postgres psql -U n8n_user n8n < n8n_backup.sql
```

---

## 🚨 Troubleshooting

### n8n won't start

```bash
# Check logs
docker-compose logs n8n

# Common issues:
# 1. Port 5678 already in use
# 2. Database connection failed
# 3. Out of disk space

# Solution:
docker-compose down
docker system prune
docker-compose up -d n8n
```

### Webhooks not working

1. Check webhook URL is accessible
2. Verify WEBHOOK_TUNNEL_URL is correct
3. Test with curl:
   ```bash
   curl -X POST http://localhost:5678/webhook/lead_converted \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### Credential authentication failing

1. Verify API token is still valid
2. Check JWT token expiration
3. Get new token and update credential
4. Test with simple HTTP request

### Emails not sending

1. Check SendGrid API key is valid
2. Verify sender email is verified in SendGrid
3. Check email address format
4. Review SendGrid logs

---

## 🔄 Workflow Maintenance

### Regular Tasks

1. **Daily**: Monitor execution logs
2. **Weekly**: Review workflow performance
3. **Monthly**: Update credentials (rotate API keys)
4. **Quarterly**: Backup database and workflows

### Backup Workflows

```bash
# Export all workflows as backup
for workflow in $(curl http://localhost:5678/api/v1/workflows); do
  echo $workflow > "backup_$(date +%s).json"
done
```

---

## 📈 Scaling

### For High Volume

1. **Increase Resources**
   ```yaml
   n8n:
     cpus: '2'
     mem_limit: 4096m
   ```

2. **Use Queue**
   - Enable n8n Queue feature
   - Run multiple worker instances

3. **Database Optimization**
   - Add indexes
   - Archive old executions
   - Monitor query performance

---

## 🎯 Integration with Legal Hub

### Trigger Workflows from API

```typescript
// backend/src/services/workflowService.ts
import axios from 'axios';

export const triggerDocumentGeneration = async (clientId: number) => {
  await axios.post(
    `${process.env.N8N_WEBHOOK_URL}/webhook/lead_converted_to_client`,
    {
      clientId,
      // Include necessary data
    }
  );
};
```

### Environment Setup

```bash
# .env
N8N_WEBHOOK_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
```

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** Production Ready
