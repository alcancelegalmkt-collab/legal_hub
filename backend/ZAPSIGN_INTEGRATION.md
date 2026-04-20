# ZapSign Integration - Legal Hub

## Overview

ZapSign is a digital signature platform that integrates with Legal Hub to enable secure document signing. This implementation provides:

- Automatic document upload to ZapSign
- Signature request generation
- Webhook handling for signature completion
- Signed document download and storage
- Status tracking for all documents

---

## Setup

### 1. ZapSign Account

1. Create account at [zapsign.com.br](https://zapsign.com.br)
2. Navigate to **Settings → API Keys**
3. Generate a new API key

### 2. Environment Configuration

Add to `.env`:
```
ZAPSIGN_API_KEY=your_zapsign_api_key_here
```

### 3. Webhook Configuration (Optional)

In ZapSign settings, configure webhook:
- **URL**: `https://seu-dominio.com/api/documents/webhook/zapsign`
- **Events**: Document signed, Document declined

---

## API Endpoints

### Send Document to ZapSign

**Endpoint:**
```
POST /api/documents/:id/send-to-zapsign
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "signerEmail": "cliente@example.com",
  "signerName": "João Silva"
}
```

**Response:**
```json
{
  "message": "Documento enviado para assinatura",
  "zapsignId": "uuid-123456",
  "signLink": "https://zapsign.com.br/sign/...",
  "document": {
    "id": 1,
    "status": "pending_signature",
    "zapsignId": "uuid-123456",
    "zapsignSignLink": "https://zapsign.com.br/sign/..."
  }
}
```

### Check ZapSign Status

**Endpoint:**
```
GET /api/documents/:id/zapsign-status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "documentId": 1,
  "zapsignId": "uuid-123456",
  "status": "pending|completed|expired|declined",
  "document": {...}
}
```

### Check All Pending Signatures

**Endpoint:**
```
POST /api/documents/check-signatures
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Status de assinaturas verificado",
  "updatedCount": 3
}
```

### Webhook Handler

**Endpoint:**
```
POST /api/documents/webhook/zapsign
Content-Type: application/json
```

**Payload (from ZapSign):**
```json
{
  "uuid": "zapsign-id",
  "status": "completed",
  "name": "Document Name",
  "signers": [...]
}
```

---

## Workflow

### 1. Generate Document (Draft)
```
POST /api/documents/generate
↓
Document created with status = "draft"
```

### 2. Send to ZapSign
```
POST /api/documents/:id/send-to-zapsign
Body: { signerEmail, signerName }
↓
Document uploaded to ZapSign
↓
Status changed to "pending_signature"
↓
Email sent to signer with signing link
```

### 3. Signer Signs Document
```
Client receives email
↓
Opens signing link
↓
Signs document on ZapSign
↓
Webhook triggered (optional)
```

### 4. Check Status
```
POST /api/documents/check-signatures
OR
GET /api/documents/:id/zapsign-status
↓
If signed:
  - Document downloaded from ZapSign
  - Saved to uploads/documents/signed/
  - Status changed to "signed"
  - File URL updated
```

---

## Frontend Usage

### React Integration

```typescript
// Send document to ZapSign
const sendToZapSign = async (documentId: number) => {
  try {
    const result = await api.sendDocumentToZapSign(
      documentId,
      'cliente@example.com',
      'João Silva'
    );
    console.log('Sign link:', result.signLink);
    // Share signLink with client
  } catch (error) {
    console.error('Failed to send to ZapSign:', error);
  }
};

// Check document status
const checkStatus = async (documentId: number) => {
  try {
    const result = await api.checkZapSignStatus(documentId);
    console.log('Document status:', result.status);
  } catch (error) {
    console.error('Failed to check status:', error);
  }
};
```

### UI Integration

The Documents page includes:

1. **Send to ZapSign Button**
   - Opens modal for signer info
   - Sends document with signer details
   - Displays signing link

2. **Check Status Button**
   - Available for pending documents
   - Shows current ZapSign status
   - Updates document record

---

## Document Statuses

| Status | Description | Action |
|--------|-------------|--------|
| `draft` | Created, not yet signed | Send to ZapSign |
| `pending_signature` | Waiting for signer | Check status |
| `signed` | Signature completed | Download |
| `rejected` | Signer declined | Resend or delete |

---

## File Storage

Signed documents are saved to:
```
uploads/documents/signed/
├── 1_signed_1705328400000.pdf
├── 2_signed_1705328400001.pdf
└── ...
```

Original documents remain in:
```
uploads/documents/
├── proposal_1_1705328400000.docx
├── contract_1_1705328400001.docx
└── ...
```

---

## Error Handling

### Common Errors

**"signerEmail e signerName são obrigatórios"**
- Ensure both fields are provided

**"Apenas documentos em rascunho podem ser enviados"**
- Document is already pending/signed/rejected
- Create a new document instead

**"Arquivo não encontrado"**
- Document file was deleted from disk
- Regenerate the document

**"ZAPSIGN_API_KEY inválida"**
- Check `.env` file configuration
- Verify API key is correct in ZapSign dashboard

---

## Webhook Configuration

### Enable Automatic Status Updates

Add webhook URL in ZapSign Dashboard:
1. Settings → API → Webhooks
2. Add new webhook with URL: `https://seu-servidor.com/api/documents/webhook/zapsign`
3. Enable events: "document_signed", "document_declined"

When signer completes, ZapSign sends webhook → System automatically:
- Downloads signed document
- Updates document status
- Stores file locally
- Triggers n8n notifications (optional)

---

## Integration with n8n

### Automatic Workflow on Signature

```json
{
  "name": "Document Signed → Notify + Trello",
  "trigger": "document.signed (webhook)",
  "steps": [
    {
      "name": "Get Document Details",
      "action": "fetch_document"
    },
    {
      "name": "Send Email Notification",
      "action": "send_email",
      "to": "client_email",
      "subject": "Documento assinado com sucesso"
    },
    {
      "name": "Create Trello Card",
      "action": "create_trello_card",
      "board": "Assinado",
      "labels": ["signed", "completed"]
    }
  ]
}
```

---

## Testing

### Manual Testing

```bash
# 1. Generate document
curl -X POST http://localhost:3000/api/documents/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "documentType": "contract"
  }'

# 2. Send to ZapSign
curl -X POST http://localhost:3000/api/documents/1/send-to-zapsign \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "signerEmail": "teste@example.com",
    "signerName": "Teste User"
  }'

# 3. Check status
curl -X GET http://localhost:3000/api/documents/1/zapsign-status \
  -H "Authorization: Bearer <token>"
```

### Test Webhook

```bash
curl -X POST http://localhost:3000/api/documents/webhook/zapsign \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "test-zapsign-id",
    "status": "completed",
    "name": "Test Document"
  }'
```

---

## Troubleshooting

### Documents not updating after signing

**Check:**
1. Webhook is configured in ZapSign
2. `ZAPSIGN_API_KEY` is correct
3. Network connectivity to ZapSign API
4. Server logs for errors

**Solution:**
```bash
# Manually check status
curl -X POST http://localhost:3000/api/documents/check-signatures \
  -H "Authorization: Bearer <token>"
```

### Signing link not working

**Check:**
1. Email address is correct
2. Document was successfully uploaded
3. Check ZapSign dashboard for document

**Solution:**
- Resend to ZapSign (create new document)
- Verify signer email is valid

### File not saving after signature

**Check:**
1. `uploads/documents/signed/` directory exists
2. Write permissions on directory
3. Sufficient disk space

**Solution:**
```bash
mkdir -p uploads/documents/signed
chmod 755 uploads/documents/signed
```

---

## Costs

ZapSign free plan includes:
- 5 documents/month
- Up to 3 signers per document
- Standard features

For higher volume, upgrade to paid plans.

---

## Security Notes

1. **API Key**: Keep `ZAPSIGN_API_KEY` private in `.env`
2. **Webhook**: Verify webhook origin if possible
3. **File Storage**: Use HTTPS for production
4. **Access Control**: Ensure users can only sign their own documents

---

## Future Enhancements

- [ ] Multiple signers per document
- [ ] Signature templates
- [ ] Batch signature requests
- [ ] Advanced audit logs
- [ ] Integration with DocuSign (alternative provider)
- [ ] Biometric signature support

---

**Last Updated:** January 2024  
**Version:** 1.0.0
