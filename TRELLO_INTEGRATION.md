# Trello Integration - Legal Hub

Complete Trello integration for task management and document workflow tracking.

---

## Overview

Integrate Trello with Legal Hub to:
- Create cards automatically when documents are signed
- Track case progress with checklists
- Assign team members to documents
- Maintain audit trail with comments
- Visualize workflow on Trello boards

---

## Setup

### Step 1: Get Trello API Credentials

1. Go to [trello.com/app-key](https://trello.com/app-key)
2. Copy your **API Key**
3. Click **Token** link
4. Generate and copy the **Token**
5. Keep both secure

### Step 2: Configure Environment

Add to `.env`:
```bash
TRELLO_API_KEY=your_api_key_here
TRELLO_TOKEN=your_token_here
```

### Step 3: Create Boards in Trello

Create these boards:

1. **Documentos Assinados**
   - Lists:
     - Aguardando Assinatura
     - Em Assinatura
     - Concluído
     - Arquivado

2. **Casos em Andamento**
   - Lists:
     - Novo
     - Em Andamento
     - Aguardando Cliente
     - Concluído

3. **Equipe - Tarefas**
   - Lists:
     - A Fazer
     - Em Progresso
     - Revisão
     - Pronto

---

## API Endpoints

### Get Boards

```http
GET /api/trello/boards
Authorization: Bearer <token>
```

**Response:**
```json
{
  "boards": [
    {
      "id": "board-123",
      "name": "Documentos Assinados"
    }
  ],
  "count": 3
}
```

### Get Lists in Board

```http
GET /api/trello/boards/:boardId/lists
Authorization: Bearer <token>
```

**Response:**
```json
{
  "boardId": "board-123",
  "lists": [
    {
      "id": "list-456",
      "name": "Concluído",
      "boardId": "board-123"
    }
  ],
  "count": 4
}
```

### Create Document Card

```http
POST /api/trello/documents/card
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentId": 1,
  "boardName": "Documentos Assinados",
  "listName": "Concluído"
}
```

**Response:**
```json
{
  "message": "Card criado no Trello com sucesso",
  "card": {
    "id": "card-789",
    "name": "📄 Contrato de Prestação - João Silva",
    "url": "https://trello.com/c/card-789",
    "idList": "list-456",
    "desc": "**Cliente:** João Silva...",
    "idLabels": ["label-blue"]
  },
  "trelloUrl": "https://trello.com/c/card-789"
}
```

### Create Case Card

```http
POST /api/trello/cases/card
Authorization: Bearer <token>
Content-Type: application/json

{
  "caseId": 1,
  "listId": "list-123"
}
```

### Add Comment to Card

```http
POST /api/trello/cards/:cardId/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "Documento assinado com sucesso!"
}
```

### Add Member to Card

```http
POST /api/trello/cards/:cardId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "memberId": "member-id-from-trello"
}
```

### Add Checklist to Card

```http
POST /api/trello/cards/:cardId/checklists
Authorization: Bearer <token>
Content-Type: application/json

{
  "checklistName": "Documentos Necessários",
  "items": [
    "Contrato assinado",
    "Procuração",
    "Declaração de hipossuficiência"
  ]
}
```

---

## Workflow Integration

### Workflow 08: Document Card Creation

**Trigger:** Document signed  
**Action:** Create Trello card in "Documentos Assinados" board

**Flow:**
```
Document Signed
    ↓
Fetch document data
    ↓
Fetch client data
    ↓
Create Trello card
    ├─ Name: 📄 [Document Type] - [Client Name]
    ├─ Description: Client info + case details
    ├─ Label: Color coded by document type
    └─ Due Date: 7 days
    ↓
Add comment with signature timestamp
    ↓
Slack notification
```

---

## Card Structure

### Document Card Example

```
Title: 📄 Contrato de Prestação - João Silva

Description:
Cliente: João Silva
CPF/CNPJ: 123.456.789-00
Email: joao@example.com
Tipo: contract
Status: Assinado

Caso:
- Título: Ação Trabalhista
- Área: Trabalhista
- Número: 0001234567-89.2024.1.01.0000

Link: https://seu-app.com/documents/1

Labels: Blue (Contract)
Due: 7 days from signing
Checklists:
  - Contrato assinado ✓
  - Documentação salva ✓
  - Cliente notificado ✓
```

### Case Card Example

```
Title: ⚖️ Ação Trabalhista - João Silva

Description:
Cliente: João Silva
Área: Trabalhista
Status: Em Andamento

Checklists:
  - Contrato assinado
  - Procuração
  - Declaração de hipossuficiência
  - Documentos do cliente
```

---

## Label System

| Document Type | Color | Label |
|---------------|-------|-------|
| Proposal | Green | proposal |
| Contract | Blue | contract |
| Power of Attorney | Purple | power_of_attorney |
| Financial Aid Declaration | Yellow | financial_aid_declaration |
| Other | Grey | other |

---

## Automation Examples

### Auto-Create Cards on Signature

```typescript
// When document is signed
const result = await api.post('/trello/documents/card', {
  documentId: signedDoc.id,
  boardName: 'Documentos Assinados',
  listName: 'Concluído'
});

console.log('Card created:', result.trelloUrl);
```

### Track Cases with Checklists

```typescript
// Create case card with checklist
const caseCard = await api.post('/trello/cases/card', {
  caseId: 123,
  listId: 'list-in-progress'
});

// Add document checklist
await api.post(`/trello/cards/${caseCard.card.id}/checklists`, {
  checklistName: 'Documentos Necessários',
  items: [
    'Contrato assinado',
    'Procuração',
    'Declaração de hipossuficiência'
  ]
});
```

### Assign Team Members

```typescript
// Add lawyer to document card
await api.post(`/trello/cards/${cardId}/members`, {
  memberId: 'trello-member-id-of-lawyer'
});

// Add comment
await api.post(`/trello/cards/${cardId}/comments`, {
  comment: '@lawyer-name Please review this document'
});
```

---

## Board Setup Guide

### Board 1: Documentos Assinados

**Purpose:** Track signed documents and their archival

**Lists:**
1. **Aguardando Assinatura** - Sent to ZapSign, waiting for signature
2. **Em Assinatura** - Signer is reviewing
3. **Concluído** - Document signed and archived
4. **Arquivado** - Old documents

**Automation:**
- Card created when document sent to ZapSign
- Moved to "Em Assinatura" when signer opens link
- Moved to "Concluído" when signed
- Archived after 90 days

---

### Board 2: Casos em Andamento

**Purpose:** Track case progress and deadlines

**Lists:**
1. **Novo** - New case created
2. **Em Andamento** - Currently being worked on
3. **Aguardando Cliente** - Waiting for client response
4. **Concluído** - Case closed

**Features:**
- Checklist for required documents
- Due dates for key milestones
- Members assigned to case
- Comments for notes and updates

---

### Board 3: Equipe - Tarefas

**Purpose:** Team task management

**Lists:**
1. **A Fazer** - New tasks
2. **Em Progresso** - Currently assigned
3. **Revisão** - Pending review
4. **Pronto** - Completed

**Features:**
- Assign to team members
- Set priorities with labels
- Add checklists for subtasks
- Comments for discussion

---

## Advanced Features

### Custom Fields

```typescript
// Add custom field value to card
await axios.put(`https://api.trello.com/1/cards/${cardId}`, {
  customFieldValues: {
    'custom-field-id': 'value'
  }
});
```

### Power-Ups Integration

- **Butler:** Automate card movement based on rules
- **Calendar:** Visualize due dates
- **Slack:** Send card updates to Slack
- **Google Drive:** Attach files to cards

### Board Templates

Create templates for:
- Standard document workflow
- Case management
- Team onboarding
- Project delivery

---

## Monitoring & Reporting

### Get Board Statistics

```bash
# View cards in each list
GET /api/trello/boards/:boardId/lists

# Cards per document type
# Cards past due date
# Cards without assignments
```

### Trello Reports

1. **Productivity Report**
   - Cards completed per week
   - Average time to sign
   - Documents per client

2. **Team Report**
   - Assignments per member
   - Completion rate
   - Performance metrics

3. **Process Report**
   - Bottlenecks in workflow
   - Average processing time
   - Success rate

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "API Key invalid" | Verify key in trello.com/app-key |
| "Token expired" | Generate new token in Trello |
| "Board not found" | Check board name matches exactly |
| "List not found" | Verify list exists in board |
| "Card creation fails" | Check Trello API quota |

---

## Best Practices

1. **Naming Conventions**
   - Use emojis for quick visual identification
   - Include client name in card title
   - Keep descriptions concise but detailed

2. **Due Dates**
   - Set for 7 days after document signature
   - 14 days for case completion
   - Color-code by priority

3. **Team Collaboration**
   - Assign to responsible lawyer
   - Add comments for important updates
   - Use mentions (@username) for assignments

4. **Automation**
   - Auto-move cards on status change
   - Auto-archive completed cards after 90 days
   - Auto-notify team on updates

---

## Integration with n8n

### Workflow 08: Document Signed → Trello Card

```json
{
  "trigger": "document_signed",
  "steps": [
    "POST /api/trello/documents/card",
    "POST /api/trello/cards/:id/comments",
    "Slack notification"
  ]
}
```

### Trigger from Frontend

```typescript
// When document is signed (from ZapSign webhook)
await axios.post('http://localhost:5678/webhook/document_signed', {
  documentId: 1,
  clientId: 1,
  signedAt: new Date()
});
```

---

## Cost & Limits

### Trello Free Plan
- Unlimited cards
- Unlimited lists
- Unlimited boards
- Basic power-ups
- Perfect for small firms

### Trello Premium
- Advanced power-ups
- Custom fields
- Priority support
- Team management
- ~$100/month for team

---

## Security Notes

1. **API Credentials**
   - Never commit API key to git
   - Use environment variables
   - Rotate tokens quarterly

2. **Board Access**
   - Share boards with team only
   - Use workspace roles
   - Monitor access logs

3. **Data Privacy**
   - Don't expose client data in card titles
   - Use descriptions for sensitive info
   - Archive old boards annually

---

## Future Enhancements

- [ ] Butler automations for workflow
- [ ] Custom fields for metadata
- [ ] Bulk operations API
- [ ] Advanced analytics
- [ ] Integration with accounting software
- [ ] Mobile app notifications
- [ ] Timeline view for deadlines
- [ ] Dependency tracking between cases

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** Production Ready
