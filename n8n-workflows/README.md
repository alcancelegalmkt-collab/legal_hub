# n8n Workflows - Legal Hub

**Orquestração central de automações jurídicas**

Workflows que conectam WhatsApp, IA, CRM, ZapSign, Trello e Email.

---

## 🚀 Setup n8n

### 1️⃣ Acessar n8n
```bash
# n8n está rodando em
http://localhost:5678

# Login
User: admin
Password: admin_password_dev
```

### 2️⃣ Configurar Credenciais

Antes de importar workflows, configure as credenciais em n8n:

#### API Token (Legal Hub Backend)
- Tipo: **HTTP Header Auth**
- Nome: `API_TOKEN`
- Header: `Authorization`
- Valor: `Bearer <seu_token_jwt_do_backend>`

#### Anthropic (Claude API)
- Tipo: **HTTP Header Auth**
- Nome: `ANTHROPIC_API_KEY`
- Header: `x-api-key`
- Valor: `sk-ant-...` (sua chave Anthropic)

#### ZapSign
- Tipo: **API Key**
- Nome: `ZAPSIGN_API_KEY`
- Valor: (Gerar em https://app.zapsign.com.br/settings/api)

#### Trello
- Tipo: **Credentials**
- Nome: `TRELLO_API_KEY` e `TRELLO_TOKEN`
- Gerar em: https://trello.com/app-key

#### SMTP (Email)
- Tipo: **SMTP**
- Host: `smtp.gmail.com`
- Port: `587`
- User: seu_email@gmail.com
- Password: app_password (gerar em Google Account)

#### Twilio (WhatsApp - Opcional)
- Tipo: **Basic Auth**
- Account SID: (Twilio Console)
- Auth Token: (Twilio Console)

---

## 📋 Workflows

### 01 - WhatsApp → Triagem Automática → CRM

**O que faz:**
1. Recebe mensagem WhatsApp (via webhook)
2. Extrai dados do contato
3. Usa Claude IA para triagem automática
4. Classifica: área jurídica, urgência, score qualificação
5. Cria lead no CRM
6. Envia resposta automática via WhatsApp

**Fluxo:**
```
WhatsApp Message
    ↓
Extract Contact Data
    ↓
Claude AI Triage
    ↓
Create Lead in CRM
    ↓
Send WhatsApp Response
```

**Ambiente Variables:**
- `API_TOKEN` - Backend JWT token
- `ANTHROPIC_API_KEY` - Claude API key

**Ativa quando:**
- Mensagem recebida em webhook `/webhook/whatsapp`

---

### 02 - Gerar Documentos → ZapSign

**O que faz:**
1. Recebe solicitação para gerar documentos
2. Busca dados do cliente no CRM
3. Usa Claude para gerar:
   - Contrato de prestação de serviços
   - Proposta de honorários
4. Salva documentos no CRM
5. Envia para ZapSign para assinatura

**Fluxo:**
```
Generate Request
    ↓
Fetch Client Data
    ↓
Generate Contract (Claude) + Generate Proposal (Claude)
    ↓
Save to CRM + Upload to ZapSign
```

**Ambiente Variables:**
- `API_TOKEN` - Backend
- `ANTHROPIC_API_KEY` - Claude
- `ZAPSIGN_API_KEY` - ZapSign

**Ativa quando:**
- Webhook `/webhook/gerar-docs` recebe POST com:
  ```json
  {
    "clientId": 1,
    "caseId": 1,
    "honorariesFee": 5000,
    "honorariesFeeType": "fixed"
  }
  ```

---

### 03 - ZapSign Assinado → CRM + Trello

**O que faz:**
1. Recebe notificação de documento assinado
2. Atualiza status no CRM
3. Busca dados do cliente
4. Cria card no Trello com checklist
5. Envia email de confirmação

**Fluxo:**
```
ZapSign Webhook (signed)
    ↓
Update CRM Status
    ↓
Fetch Client Data
    ↓
Create Trello Card + Send Email
```

**Ambiente Variables:**
- `API_TOKEN` - Backend
- `ZAPSIGN_API_KEY` - ZapSign
- `TRELLO_API_KEY` + `TRELLO_TOKEN` - Trello
- `TRELLO_LIST_ID` - ID da lista (buscar em Trello API)
- `SMTP_FROM` - Email sender

**Ativa quando:**
- Webhook `/webhook/zapsign-signed` recebe POST com:
  ```json
  {
    "documentId": 1,
    "clientId": 1,
    "zapsignId": "...",
    "signedBy": "João Silva",
    "documentType": "Contrato",
    "legalArea": "Trabalhista"
  }
  ```

---

### 04 - Sistema de Notificações Email + WhatsApp

**O que faz:**
1. Recebe requisição de notificação
2. Roteia para Email ou WhatsApp
3. Envia mensagem ao cliente/advogado

**Fluxo:**
```
Notification Request
    ↓
If Email → Send Email
If WhatsApp → Send WhatsApp
```

**Ambiente Variables:**
- `SMTP_FROM` - Email sender
- `TWILIO_ACCOUNT_SID` - Twilio (se usando WhatsApp)
- `TWILIO_AUTH_TOKEN` - Twilio
- `TWILIO_WHATSAPP_FROM` - WhatsApp number

**Ativa quando:**
- Webhook `/webhook/notify` recebe POST com:
  ```json
  {
    "type": "email|whatsapp",
    "recipientEmail": "...",
    "recipientWhatsApp": "...",
    "subject": "...",
    "htmlContent": "...",
    "textContent": "..."
  }
  ```

---

## 📥 Importar Workflows

### Via UI n8n

1. Abrir n8n (http://localhost:5678)
2. Clique em "+" (New)
3. "Import from file"
4. Selecione o arquivo JSON
5. Clique em "Import"

### Via Docker

```bash
# Copiar arquivos para container
docker cp 01-whatsapp-webhook-to-crm.json legal-hub-n8n:/home/node/.n8n/workflows/

# Reiniciar n8n
docker restart legal-hub-n8n
```

---

## 🧪 Testar Workflows

### Test Webhook WhatsApp
```bash
curl -X POST http://localhost:5678/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "from": "5511999999999",
      "body": "Olá, preciso de ajuda com um caso trabalhista"
    }
  }'
```

### Test Webhook Gerar Docs
```bash
curl -X POST http://localhost:5678/webhook/gerar-docs \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "caseId": 1,
    "honorariesFee": 5000,
    "honorariesFeeType": "fixed"
  }'
```

### Test Webhook ZapSign
```bash
curl -X POST http://localhost:5678/webhook/zapsign-signed \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 1,
    "clientId": 1,
    "zapsignId": "zap-123",
    "signedBy": "João Silva",
    "documentType": "Contrato",
    "legalArea": "Trabalhista"
  }'
```

---

## 🔌 Webhooks Disponíveis

| Webhook | Método | Descrição |
|---------|--------|-----------|
| `/webhook/whatsapp` | POST | Mensagem WhatsApp recebida |
| `/webhook/gerar-docs` | POST | Gerar documentos |
| `/webhook/zapsign-signed` | POST | Documento assinado |
| `/webhook/notify` | POST | Enviar notificação |

---

## 🔐 Variáveis de Ambiente

Adicionar em `.env` do docker-compose ou em n8n Environment:

```env
API_TOKEN=seu_jwt_token
ANTHROPIC_API_KEY=sk-ant-...
ZAPSIGN_API_KEY=...
TRELLO_API_KEY=...
TRELLO_TOKEN=...
TRELLO_LIST_ID=...
SMTP_FROM=noreply@legal-hub.com
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+55...
```

---

## ✅ Fluxo Completo Exemplo

**Cliente entra em contato via WhatsApp:**

1. **WhatsApp** → `01-whatsapp-webhook-to-crm`
   - Lead criado no CRM
   - Resposta automática enviada

2. **Advogado revisa caso** → Gera documentos via frontend
   - Trigger: `/webhook/gerar-docs`
   - Workflow: `02-gerar-documentos-zapsign`
   - Contrato + Proposta gerados
   - Enviados para ZapSign

3. **Cliente assina documentos** → Notificações
   - ZapSign envia webhook
   - Workflow: `03-zapsign-assinado-trello`
   - CRM atualizado
   - Card criado no Trello
   - Email enviado

4. **Advogado recebe notificações** → Próximos passos
   - Via Trello, email, ou WhatsApp

---

## 🐛 Troubleshooting

### Workflow não executa
- Verificar se webhook está ativo (toogle verde)
- Verificar credenciais (rojo = erro)
- Ver logs em "Execution history"

### Erro 401 no Backend
- Verificar `API_TOKEN` está correto
- Token pode estar expirado, gerar novo

### ZapSign upload falha
- Verificar `ZAPSIGN_API_KEY`
- Confirmar plano permite upload

### Trello card não criado
- Verificar `TRELLO_LIST_ID`
- Verificar credenciais Trello

---

## 📚 Recursos

- [n8n Docs](https://docs.n8n.io/)
- [Claude API](https://claude.ai/api)
- [ZapSign API](https://zapsign.com.br/api)
- [Trello API](https://developer.atlassian.com/cloud/trello/)

---

**Tudo pronto! Workflows automáticos rodando.** 🚀
