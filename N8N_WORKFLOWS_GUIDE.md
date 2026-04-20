# n8n Workflows Guide - Legal Hub

Complete automation workflows for Legal Hub using n8n self-hosted.

---

## 📋 Workflow Overview

| # | Name | Trigger | Action | Status |
|---|------|---------|--------|--------|
| 05 | Gerar Documentos Automaticamente | Lead Convertido | Gera 4 documentos | New ✨ |
| 06 | Enviar para ZapSign Automaticamente | Documento Gerado | Envia ZapSign + Email | New ✨ |
| 07 | Webhook: Documento Assinado | ZapSign Webhook | Notifica Cliente | New ✨ |
| 01 | WhatsApp → CRM | WhatsApp Message | Cria Lead + IA Triage | Existing |
| 02 | Gerar Documentos | Manual Trigger | Gera Docs via Claude | Existing |
| 03 | ZapSign Assinado → Trello | ZapSign Webhook | Cria Card Trello | Existing |
| 04 | Notificações Email/WhatsApp | Manual Trigger | Envia Mensagem | Existing |

---

## 🚀 Workflow 05: Gerar Documentos Automaticamente

### Purpose
Automatically generates 4 documents (proposal, contract, power of attorney, financial aid declaration) when a lead is converted to a client.

### Trigger
```
Webhook: lead_converted_to_client
Body: { clientId: number }
```

### Flow
```
Lead Converted
    ↓
Fetch Client Data
    ↓
[Parallel] Generate 4 Documents
  ├→ Proposal
  ├→ Contract
  ├→ Power of Attorney
  └→ Financial Aid Declaration
    ↓
Email Notification (Admin)
```

### Setup

1. **Create Webhook Trigger**
   - URL: `https://your-n8n.com/webhook/lead_converted_to_client`
   - Method: POST
   - Save the webhook URL

2. **Add HTTP Nodes** (for each document type)
   - Method: POST
   - URL: `{{ $env.API_BASE_URL }}/documents/generate`
   - Auth: Bearer Token
   - Body:
     ```json
     {
       "clientId": "{{ $json.clientId }}",
       "documentType": "proposal"
     }
     ```

3. **Add Email Node**
   - SendGrid integration
   - Recipients: Admin emails
   - Subject: "4 Documentos Gerados para {{ $json.name }}"

### Testing

```bash
curl -X POST https://your-n8n.com/webhook/lead_converted_to_client \
  -H "Content-Type: application/json" \
  -d '{"clientId": 1}'
```

---

## 🚀 Workflow 06: Enviar para ZapSign Automaticamente

### Purpose
Automatically sends generated documents to ZapSign for signature and notifies client via email.

### Trigger
```
Webhook: document_generated
Body: { 
  clientId: number,
  document: { id, type, title }
}
```

### Flow
```
Document Generated
    ↓
Fetch Client Email
    ↓
IF Document Type = Proposal?
    ↓
Send to ZapSign
    ↓
[Parallel] Notify
  ├→ Email: Signing Link
  └→ Slack: Notification
```

### Setup

1. **Webhook Trigger**
   - URL: `https://your-n8n.com/webhook/document_generated`
   - Save for later use

2. **HTTP: Fetch Client**
   - URL: `{{ $env.API_BASE_URL }}/clients/{{ $json.clientId }}`

3. **IF Node: Check Document Type**
   - Condition: `body.document.type == "proposal"`

4. **HTTP: Send to ZapSign**
   - Method: POST
   - URL: `{{ $env.API_BASE_URL }}/documents/{{ $json.body.document.id }}/send-to-zapsign`
   - Body:
     ```json
     {
       "signerEmail": "{{ $json.email }}",
       "signerName": "{{ $json.name }}"
     }
     ```

5. **Email Node**
   - Template: Document Signature Invitation
   - Include sign link in email

6. **Slack Node**
   - Channel: #legal-hub
   - Message: Document sent to ZapSign

### Testing

```bash
curl -X POST https://your-n8n.com/webhook/document_generated \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "document": { 
      "id": 1, 
      "type": "proposal",
      "title": "Proposta"
    }
  }'
```

---

## 🚀 Workflow 07: Webhook - Documento Assinado

### Purpose
Handles ZapSign webhook when document is signed and notifies all stakeholders.

### Trigger
```
Webhook (Incoming): /webhook/zapsign
Payload from ZapSign:
{
  "uuid": "zapsign-id",
  "status": "completed",
  "name": "Document Name"
}
```

### Flow
```
ZapSign Webhook Received
    ↓
Fetch Document by ZapSign ID
    ↓
IF Status = "completed"?
    ↓
Fetch Client Data
    ↓
Mark Document as Signed
    ↓
[Parallel] Notify
  ├→ Email: Signature Confirmation
  ├→ Slack: Notification
  └→ WhatsApp: Confirmation
```

### Setup

1. **Webhook Trigger (No Auth)**
   - Path: `/webhook/zapsign`
   - Method: POST
   - This is called by ZapSign automatically

2. **HTTP: Fetch Document**
   - URL: `{{ $env.API_BASE_URL }}/documents?zapsignId={{ $json.uuid }}`

3. **IF Node: Check Status**
   - Condition: `body.status == "completed"`

4. **HTTP: Fetch Client**
   - URL: `{{ $env.API_BASE_URL }}/clients/{{ $json.body.documents[0].clientId }}`

5. **HTTP: Update Document Status**
   - Method: PUT
   - URL: `{{ $env.API_BASE_URL }}/documents/{{ $json.body.documents[0].id }}`
   - Body:
     ```json
     {
       "status": "signed",
       "signedAt": "{{ now }}"
     }
     ```

6. **Email, Slack, WhatsApp Nodes**
   - Send notifications to respective channels

### Testing

```bash
curl -X POST https://your-n8n.com/webhook/zapsign \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "test-zapsign-123",
    "status": "completed",
    "name": "Test Document"
  }'
```

---

## 🔧 Configuration

### Environment Variables (in n8n)

Set these in n8n environment:

```bash
# API Configuration
API_BASE_URL=http://localhost:3000/api
FIRM_NAME=Seu Escritório de Advocacia
APP_URL=http://localhost:3000

# Optional
SLACK_CHANNEL=#legal-hub
WEBHOOK_BASE_URL=https://your-n8n-domain.com
```

### Credentials Required

1. **HTTP Header Auth (JWT)**
   - Name: `legal_hub_jwt_token`
   - Header: `Authorization`
   - Value: `Bearer <JWT_TOKEN>`
   - Get token from: `POST /api/auth/login`

2. **SendGrid API**
   - Name: `sendgrid_api`
   - API Key: From SendGrid dashboard

3. **Slack Webhook**
   - Name: `slack_webhook`
   - Webhook URL: From Slack app config

4. **Twilio** (Optional for WhatsApp)
   - Name: `twilio_api`
   - Account SID, Auth Token

---

## 🔗 Webhook Integration

### In Your Backend Code

To trigger workflows from API:

```typescript
// After creating client from lead
const webhookUrl = `${process.env.N8N_WEBHOOK_URL}/webhook/lead_converted_to_client`;

await axios.post(webhookUrl, {
  clientId: newClient.id,
  name: newClient.name,
  email: newClient.email
});
```

Or from CRM UI:
```typescript
// When clicking "Gerar Documentos"
const response = await fetch(
  'http://your-n8n-domain.com/webhook/document_generated',
  {
    method: 'POST',
    body: JSON.stringify({
      clientId: selectedClient.id,
      document: { id, type, title }
    })
  }
);
```

---

## 📊 Complete Automation Chain

```
LEAD ARRIVES (WhatsApp)
    ↓
Workflow 01: Triage + Create Lead
    ↓
LEAD CONVERTED TO CLIENT
    ↓
Workflow 05: Auto Generate 4 Docs
    ↓
Workflow 06: Send to ZapSign + Email
    ↓
SIGNER OPENS EMAIL → SIGNS IN ZAPSIGN
    ↓
ZapSign Webhook Triggered
    ↓
Workflow 07: Auto Update Status + Notify
    ↓
✅ DOCUMENT SIGNED (Archived)
```

---

## 🎯 Common Triggers

### From Frontend

1. **Button Click: "Gerar Documentos"**
   ```javascript
   // POST to n8n webhook
   const response = await fetch('n8n-webhook-url/lead_converted', {
     method: 'POST',
     body: JSON.stringify({ clientId })
   });
   ```

2. **After Document Created**
   ```javascript
   // Auto-trigger ZapSign workflow
   // (Can be automatic in backend)
   ```

### From Backend (Node.js)

```typescript
import axios from 'axios';

// Trigger document generation
await axios.post(
  `${process.env.N8N_WEBHOOK}/webhook/lead_converted_to_client`,
  {
    clientId: 123,
    name: 'João Silva',
    email: 'joao@example.com'
  }
);
```

---

## 📋 Monitoring & Logs

### View Workflow Executions

In n8n Dashboard:
1. Go to Workflows
2. Select workflow
3. Click "Executions"
4. View logs and errors

### Debug Mode

To see workflow details:
1. Enable "Save Data" in workflow settings
2. Save all executions
3. Monitor for errors

### Error Handling

Each workflow should have:
- Try/catch error nodes
- Slack notification on failure
- Fallback email to admin

---

## 🔐 Security Best Practices

1. **API Keys**
   - Store in n8n Credentials (never in workflow)
   - Use environment variables
   - Rotate keys regularly

2. **Webhooks**
   - Use HTTPS only
   - Verify webhook signature if possible
   - Limit to trusted IPs for sensitive workflows

3. **Data Access**
   - Ensure JWT token has proper scopes
   - Don't log sensitive data
   - Archive old executions

---

## 🚀 Deployment

### Local Testing

1. Start n8n: `docker-compose up n8n`
2. Access: `http://localhost:5678`
3. Create workflows from JSON files
4. Test with curl commands

### Production Deployment

1. Use dedicated n8n server
2. Configure persistent storage
3. Enable SSL/HTTPS
4. Set up monitoring & alerts
5. Schedule backup of workflows

---

## 📈 Performance Tips

### Reduce API Calls
- Cache client data in workflow
- Batch document generation
- Use conditional logic to skip unnecessary steps

### Parallel Processing
- Generate all 4 documents in parallel
- Send notifications in parallel
- Reduces total execution time

### Optimization
```
Sequential: Gen1 (3s) + Gen2 (3s) + Gen3 (3s) + Gen4 (3s) = 12s
Parallel:   Gen1,2,3,4 (3s) = 3s total ⏱️
```

---

## 🔄 Workflow Versioning

### Before Modifying
1. Export current workflow as JSON
2. Create backup
3. Create new version with timestamp
4. Test in staging first

### Export Workflow
```bash
# In n8n UI
Workflow → Menu → Download
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook not triggering | Check URL in trigger config |
| API auth failing | Verify JWT token is valid |
| Email not sending | Check SendGrid API key |
| Document not generating | Check API logs and client ID |
| ZapSign not receiving | Verify document file exists |

---

## 📞 Support

For workflow issues:
1. Check n8n logs in UI
2. Verify API responses
3. Test webhook URL with curl
4. Check credential configuration

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** Production Ready
