# Document Generation - Legal Hub

## Overview

The Legal Hub document generation system uses **Claude AI** to automatically generate professional legal documents based on client information. This eliminates the need for manual document creation and ensures consistency across all documents.

---

## Supported Documents

1. **Proposta de Honorários** (Proposal)
   - Professional fee proposal
   - Customizable rates and payment terms
   - Legally compliant format

2. **Contrato de Prestação de Serviços** (Service Agreement)
   - Complete legal service contract
   - Includes confidentiality clauses
   - Payment and termination terms

3. **Procuração** (Power of Attorney)
   - General or special powers
   - Client identification
   - Lawyer authorization

4. **Declaração de Hipossuficiência** (Financial Aid Declaration)
   - Proves inability to pay court fees
   - Required for legal aid cases
   - Standard format for courts

---

## How It Works

### 1. Document Generation Flow

```
Client Data (Name, CPF, Address, etc.)
         ↓
Claude API (Gera conteúdo profissional)
         ↓
node-docx (Cria arquivo .docx formatado)
         ↓
Sistema salva arquivo em uploads/documents/
         ↓
Documento criado no banco de dados com status "draft"
```

### 2. Data Used for Generation

The system automatically uses:
- **Client Information**
  - Name, CPF/CNPJ, RG
  - Address, city, state
  - Profession, marital status
  - Nationality

- **Case Information** (if applicable)
  - Legal area
  - Case value
  - Honoraries fee
  - Court information

---

## API Usage

### Generate Document

**Endpoint:**
```
POST /api/documents/generate
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "clientId": 1,
  "caseId": 1,
  "documentType": "contract"
}
```

**Parameters:**
- `clientId` (required): Client ID
- `caseId` (optional): Associated case ID
- `documentType` (required): One of:
  - `proposal` - Fee proposal
  - `contract` - Service agreement
  - `power_of_attorney` - Power of attorney
  - `financial_aid_declaration` - Financial aid declaration

**Response (201):**
```json
{
  "message": "Documento gerado com sucesso",
  "document": {
    "id": 1,
    "clientId": 1,
    "caseId": 1,
    "type": "contract",
    "title": "Contrato de Prestação de Serviços Jurídicos",
    "fileName": "contract_1_1705328400000.docx",
    "filePath": "/uploads/documents/contract_1_1705328400000.docx",
    "fileUrl": "/api/documents/download/contract_1_1705328400000.docx",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "content": {
    "title": "CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS",
    "sections": [
      {
        "heading": "PARTES CONTRATANTES",
        "content": "De um lado JOÃO SILVA..."
      },
      ...
    ]
  }
}
```

---

## Frontend Usage

### React Component Integration

```typescript
// Generate document for a client
const generateClientDocument = async (clientId: number, type: string) => {
  try {
    const result = await api.generateDocumentAI(clientId, type);
    console.log('Document generated:', result.document);
  } catch (error) {
    console.error('Failed to generate document:', error);
  }
};

// With case context
const generateCaseDocument = async (clientId: number, caseId: number, type: string) => {
  try {
    const result = await api.generateDocumentAI(clientId, type, caseId);
    console.log('Document generated:', result.document);
  } catch (error) {
    console.error('Failed to generate document:', error);
  }
};
```

### UI Example (Clients Page)

The Clients page includes a "Gerar Documento" button that:
1. Opens a modal with document type selection
2. Calls the API to generate the document
3. Saves the document to the database
4. Displays success/error message

---

## Configuration

### Environment Variables

Add to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx...
```

### Document Storage

Documents are saved in:
```
uploads/documents/
├── proposal_1_1705328400000.docx
├── contract_1_1705328400001.docx
├── power_of_attorney_1_1705328400002.docx
└── financial_aid_declaration_1_1705328400003.docx
```

---

## Document Workflow

### 1. Generate (Draft)
```
POST /api/documents/generate
↓
Document created with status = "draft"
```

### 2. Send to Signature
```
POST /api/documents/:id/send-to-signature
↓
Integrates with ZapSign
↓
Document status = "pending_signature"
```

### 3. Mark as Signed
```
POST /api/documents/:id/mark-as-signed
↓
Document status = "signed"
↓
Webhook triggers Trello card creation
```

---

## Quality & Customization

### What Claude AI Generates
✅ Professional legal language  
✅ Proper formatting and structure  
✅ Legally compliant clauses  
✅ Portuguese language (pt-BR)  
✅ Complete document sections  

### Customization Options
- Edit generated documents before sending
- Create custom templates for specific use cases
- Adjust prompts for different legal areas
- Add client-specific clauses

---

## Limitations & Notes

1. **AI Accuracy**: While Claude AI generates professional documents, always review before sending
2. **Legal Compliance**: Documents follow standard PT-BR legal format
3. **ZapSign Integration**: To send for signature, ensure ZapSign API is configured
4. **Storage**: Ensure adequate disk space in `uploads/documents/`
5. **API Costs**: Each document generation uses ~500-2000 tokens (~0.01-0.05 USD)

---

## Troubleshooting

### Error: "Cliente não encontrado"
- Verify client exists in database
- Check clientId is correct

### Error: "Falha ao processar resposta da IA"
- Ensure ANTHROPIC_API_KEY is valid
- Check API key has sufficient credits
- Review Claude API documentation

### Document Not Saving
- Verify uploads/documents/ directory exists
- Check write permissions on directory
- Ensure sufficient disk space

---

## Integration with n8n

### Automatic Document Generation Workflow

```json
{
  "name": "Generate Documents on Lead Conversion",
  "trigger": "lead.converted_to_client",
  "steps": [
    {
      "name": "Get Client Info",
      "action": "fetch_client_data"
    },
    {
      "name": "Generate Proposal",
      "action": "generate_document",
      "params": {
        "documentType": "proposal"
      }
    },
    {
      "name": "Generate Contract",
      "action": "generate_document",
      "params": {
        "documentType": "contract"
      }
    },
    {
      "name": "Send to ZapSign",
      "action": "send_to_signature"
    }
  ]
}
```

---

## Performance

### Typical Response Times
- Simple documents (proposal): 2-3 seconds
- Complex documents (contract): 3-5 seconds
- Multi-section documents: 5-8 seconds

### Batch Generation
For generating multiple documents, use:
```typescript
const documents = ['proposal', 'contract', 'power_of_attorney'];
const results = await Promise.all(
  documents.map(type => api.generateDocumentAI(clientId, type))
);
```

---

## Future Enhancements

- [ ] Custom templates per legal area
- [ ] Document versioning and history
- [ ] A/B testing different document styles
- [ ] Multi-language support
- [ ] Batch document generation
- [ ] Document OCR for scanned contracts
- [ ] Smart clause suggestions
- [ ] Document comparison/diff tool

---

**Last Updated:** January 2024  
**Version:** 1.0.0
