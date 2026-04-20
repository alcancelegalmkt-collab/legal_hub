# 🔗 n8n Webhook Integration

**Status:** ✅ Endpoints criados e prontos para integração

---

## 📋 O que foi feito

✅ **Webhook Service** (`webhookService.ts`)
- Disparar webhooks para n8n quando casos são atualizados
- Receber ações do n8n e executar (enviar email, atualizar caso, etc)
- Gerar workflows de exemplo

✅ **Webhook Controller & Routes**
- `POST /api/webhooks/n8n-action` - Receber ação do n8n
- `POST /api/webhooks/case-update` - Disparar caso atualizado
- `POST /api/webhooks/document-signed` - Disparar documento assinado
- `POST /api/webhooks/client-created` - Disparar novo cliente
- `GET /api/webhooks/workflows` - Exemplos de workflows
- `GET /api/webhooks/health` - Health check

---

## 🔄 Fluxo: Como Funciona

### Cenário: Caso é atualizado em Legal Hub

```
1. Usuário atualiza status do caso em Legal Hub
2. Backend chama: webhookService.triggerCaseUpdateWebhook()
3. Envia POST para n8n: /webhook/case-update
4. n8n recebe evento
5. n8n executa workflow (ex: enviar email)
6. Email chega no cliente
```

### Cenário: n8n executa ação em Legal Hub

```
1. n8n detecta evento externo (Slack, email, etc)
2. n8n chama: POST /api/webhooks/n8n-action
3. Legal Hub processa ação (ex: criar documento)
4. Retorna resultado para n8n
```

---

## 🚀 Setup n8n

### 1️⃣ Instalar n8n (opcional - usar cloud)

```bash
# Local
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  n8nio/n8n

# Acesso: http://localhost:5678
```

### 2️⃣ Configurar variáveis de ambiente

Backend `.env`:
```bash
N8N_WEBHOOK_URL=http://localhost:5678/webhook
# Em produção:
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook
```

---

## 📡 Endpoints

### 1. POST /api/webhooks/n8n-action
**Receber ação do n8n**

```bash
curl -X POST https://localhost:3000/api/webhooks/n8n-action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send-email",
    "payload": {
      "to": "client@example.com",
      "subject": "Seu caso foi atualizado",
      "message": "Caso Silva vs. ABC: 65% concluído"
    }
  }'
```

**Ações disponíveis:**
- `send-email` - Enviar email
- `send-notification` - Enviar notificação push
- `update-case-status` - Atualizar status do caso
- `create-document` - Criar documento

**Resposta:**
```json
{
  "success": true,
  "message": "Action \"send-email\" processed",
  "result": {
    "success": true,
    "message": "Email sent successfully",
    "messageId": "email_abc123"
  }
}
```

---

### 2. POST /api/webhooks/case-update
**Disparar quando caso é atualizado**

```bash
curl -X POST https://localhost:3000/api/webhooks/case-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "caseId": 1,
    "title": "Silva vs. Empresa ABC",
    "status": "active",
    "completionPercentage": 65,
    "description": "Aguardando sentença",
    "action": "Status alterado manualmente"
  }'
```

**Destino:** `N8N_WEBHOOK_URL/webhook/case-update`

---

### 3. POST /api/webhooks/document-signed
**Disparar quando documento é assinado**

```bash
curl -X POST https://localhost:3000/api/webhooks/document-signed \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "documentId": 123,
    "caseId": 1
  }'
```

---

### 4. POST /api/webhooks/client-created
**Disparar quando novo cliente é criado**

```bash
curl -X POST https://localhost:3000/api/webhooks/client-created \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "clientId": 42
  }'
```

---

### 5. GET /api/webhooks/workflows
**Obter exemplos de workflows**

```bash
curl https://localhost:3000/api/webhooks/workflows?type=case-update \
  -H "Authorization: Bearer TOKEN"
```

**Types:** `case-update` | `deadline-alert` | `new-client`

---

### 6. GET /api/webhooks/health
**Health check (sem autenticação)**

```bash
curl https://localhost:3000/api/webhooks/health
```

**Resposta:**
```json
{
  "success": true,
  "message": "Webhook service is running",
  "endpoints": {
    "POST /api/webhooks/n8n-action": "Process action from n8n",
    ...
  }
}
```

---

## 📝 Exemplos de Workflow n8n

### Workflow 1: Enviar Email Quando Caso é Atualizado

```json
{
  "name": "Case Update Email",
  "nodes": [
    {
      "name": "Webhook: Case Update",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhook": {
        "path": "case-update",
        "method": "POST"
      }
    },
    {
      "name": "Send Email via Legal Hub",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "method": "POST",
        "url": "https://localhost:3000/api/webhooks/n8n-action",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "action": "send-email",
          "payload": {
            "to": "{{$node[\"Webhook: Case Update\"].json.body.data.clientEmail}}",
            "subject": "Caso {{$node[\"Webhook: Case Update\"].json.body.data.title}} atualizado",
            "message": "Status: {{$node[\"Webhook: Case Update\"].json.body.data.status}}"
          }
        }
      }
    }
  ]
}
```

### Workflow 2: Alerta Diário de Prazos

```json
{
  "name": "Daily Deadline Alert",
  "nodes": [
    {
      "name": "Trigger Daily 8AM",
      "type": "n8n-nodes-base.interval",
      "parameters": {
        "interval": [1, "days"],
        "triggerAtTime": "08:00"
      }
    },
    {
      "name": "Get Upcoming Deadlines",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "https://localhost:3000/api/cases?deadline=next7days",
        "headers": {
          "Authorization": "Bearer YOUR_JWT_TOKEN"
        }
      }
    },
    {
      "name": "Loop Each Case",
      "type": "n8n-nodes-base.loop",
      "iterableProperty": "data"
    },
    {
      "name": "Send Deadline Alert",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://localhost:3000/api/webhooks/n8n-action",
        "body": {
          "action": "send-email",
          "payload": {
            "to": "{{$node[\"Loop Each Case\"].json.client.email}}",
            "subject": "⚠️ Prazo próximo: {{$node[\"Loop Each Case\"].json.title}}",
            "message": "Seu caso tem prazo em {{$node[\"Loop Each Case\"].json.deadline}}"
          }
        }
      }
    }
  ]
}
```

### Workflow 3: Atualizar Status via Slack

```json
{
  "name": "Update Case Status from Slack",
  "nodes": [
    {
      "name": "Slack Button Click",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "action": "on_event"
      }
    },
    {
      "name": "Update Case in Legal Hub",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://localhost:3000/api/webhooks/n8n-action",
        "body": {
          "action": "update-case-status",
          "payload": {
            "caseId": "{{$node[\"Slack Button Click\"].json.case_id}}",
            "status": "{{$node[\"Slack Button Click\"].json.new_status}}"
          }
        }
      }
    },
    {
      "name": "Confirm in Slack",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "message": "✅ Caso atualizado para {{$node[\"Update Case in Legal Hub\"].json.result.newStatus}}"
      }
    }
  ]
}
```

---

## 🔐 Segurança

### Webhook sem autenticação
`POST /api/webhooks/n8n-action` - Pode ser público (n8n chama)

### Triggers com autenticação
Todos os `POST /api/webhooks/*` - Requerem JWT token

**Por que?** 
- n8n não pode autenticar (usa url pública)
- Mas triggers de Legal Hub → n8n devem ser autenticados

---

## 🧪 Testar

### 1. Health Check
```bash
curl https://localhost:3000/api/webhooks/health
```

### 2. Enviar Email via Webhook
```bash
curl -X POST https://localhost:3000/api/webhooks/n8n-action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send-email",
    "payload": {
      "to": "seu@email.com",
      "subject": "Teste n8n",
      "message": "Teste de integração"
    }
  }'
```

### 3. Disparar Caso Atualizado
```bash
curl -X POST https://localhost:3000/api/webhooks/case-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "caseId": 1,
    "title": "Teste",
    "status": "active",
    "completionPercentage": 50,
    "action": "Teste de webhook"
  }'
```

---

## 📊 Fluxo de Dados

```
┌─────────────────┐
│   Legal Hub     │
│                 │
│  Caso atualiza  │
│        │        │
│        ↓        │
│   Webhook POST  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│      n8n        │
│                 │
│  Recebe evento  │
│        │        │
│        ↓        │
│  Executa action │
│        │        │
│        ↓        │
│  POST back      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Legal Hub     │
│                 │
│  Processa ação  │
│  (enviar email) │
│        │        │
│        ↓        │
│    Resultado    │
└─────────────────┘
```

---

## 📚 Integração com Componentes Existentes

### Com Email Service (Fase 11)
```
Webhook recebe: send-email
→ Chama emailService.sendSimpleEmail()
→ Resend envia email
```

### Com Scheduling (Fase 12)
```
Webhook recebe: case-update
→ Dispara para n8n
→ n8n webhook atualiza scheduling
```

### Com Notificações (Fase 9)
```
Webhook recebe: send-notification
→ Chama pushNotificationService
→ PWA recebe notificação
```

---

## ✅ Checklist

- [ ] Backend reiniciado
- [ ] GET /api/webhooks/health retorna 200
- [ ] n8n instalado/cloud (opcional)
- [ ] Workflow criado no n8n
- [ ] Webhook path configurado em n8n
- [ ] Teste email via webhook
- [ ] Teste disparo de caso
- [ ] Logs mostram webhooks sendo processados

---

**Data:** Abril 2026  
**Status:** ✅ Webhook Integration Pronto  
**Próximo:** Fase 14 - Dashboard de Monitoramento
