# API Endpoints - Legal Hub

**Documentação completa de todos os endpoints REST**

---

## 🔐 Autenticação

Todos os endpoints (exceto `/auth/login` e `/auth/register`) requerem:

```
Authorization: Bearer <token_jwt>
```

---

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Leads](#leads)
3. [Clientes](#clientes)
4. [Casos](#casos)
5. [Documentos](#documentos)
6. [WhatsApp](#whatsapp)

---

## 🔑 Autenticação

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "usuario@example.com",
    "role": "lawyer",
    "oabNumber": "123456/SP"
  }
}
```

### Registrar

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "oabNumber": "123456/SP",
  "role": "lawyer"
}
```

**Resposta (201):** Mesmo que Login

### Obter Perfil

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "usuario@example.com",
  "role": "lawyer",
  "oabNumber": "123456/SP"
}
```

---

## 📞 Leads

### Criar Lead

```http
POST /api/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "1133334444",
  "whatsapp": "11999999999",
  "legalArea": "trabalhista",
  "description": "Preciso de ajuda com demissão injusta",
  "urgency": "high",
  "source": "whatsapp",
  "estimatedBudget": 5000
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "name": "Maria Santos",
  "email": "maria@example.com",
  "status": "new",
  "aiQualificationScore": 85,
  "createdAt": "2024-01-15T10:30:00Z",
  ...
}
```

### Listar Leads

```http
GET /api/leads?page=1&limit=20&status=new&legalArea=trabalhista
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "leads": [...],
  "total": 45,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

### Obter Lead

```http
GET /api/leads/:id
Authorization: Bearer <token>
```

### Atualizar Lead

```http
PUT /api/leads/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "qualified",
  "aiQualificationScore": 92
}
```

### Converter Lead em Cliente

```http
POST /api/leads/:id/convert-to-client
Authorization: Bearer <token>
Content-Type: application/json

{
  "cpfCnpj": "12345678900",
  "phone": "1133334444",
  "maritalStatus": "married",
  "profession": "Engenheiro",
  "address": "Rua A, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01000-000",
  "rg": "12345678",
  "nationality": "Brasileira"
}
```

---

## 👥 Clientes

### Criar Cliente

```http
POST /api/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "João Silva",
  "cpfCnpj": "12345678900",
  "email": "joao@example.com",
  "phone": "1133334444",
  "whatsapp": "11999999999",
  "maritalStatus": "married",
  "profession": "Engenheiro",
  "address": "Rua A, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01000-000",
  "rg": "12345678",
  "nationality": "Brasileira",
  "needsFinancialAid": false,
  "primaryLawyerId": 1
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "name": "João Silva",
  "cpfCnpj": "12345678900",
  "email": "joao@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  ...
}
```

### Listar Clientes

```http
GET /api/clients?page=1&limit=20&search=joao
Authorization: Bearer <token>
```

### Obter Cliente

```http
GET /api/clients/:id
Authorization: Bearer <token>
```

### Obter Cliente com Casos

```http
GET /api/clients/:id/with-cases
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "id": 1,
  "name": "João Silva",
  "cases": [
    {
      "id": 1,
      "title": "Ação Trabalhista",
      "legalArea": "trabalhista",
      "status": "active"
    }
  ],
  ...
}
```

### Atualizar Cliente

```http
PUT /api/clients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "1133335555",
  "needsFinancialAid": true
}
```

### Deletar Cliente

```http
DELETE /api/clients/:id
Authorization: Bearer <token>
```

---

## ⚖️ Casos

### Criar Caso

```http
POST /api/cases
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": 1,
  "primaryLawyerId": 1,
  "title": "Ação Trabalhista",
  "legalArea": "trabalhista",
  "description": "Reclamação por demissão injusta",
  "caseNumber": "0001234567-89.2024.1.01.0000",
  "court": "1ª Vara do Trabalho de São Paulo",
  "caseValue": 50000,
  "honorariesFee": 15000,
  "honorariesFeeType": "fixed",
  "opposingParties": "Empresa XYZ Ltda"
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "clientId": 1,
  "title": "Ação Trabalhista",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  ...
}
```

### Listar Casos

```http
GET /api/cases?page=1&limit=20&status=active&legalArea=trabalhista&clientId=1
Authorization: Bearer <token>
```

### Obter Caso

```http
GET /api/cases/:id
Authorization: Bearer <token>
```

### Atualizar Caso

```http
PUT /api/cases/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "closed",
  "description": "Caso finalizado com sucesso"
}
```

### Fechar Caso

```http
POST /api/cases/:id/close
Authorization: Bearer <token>
Content-Type: application/json

{
  "endDate": "2024-01-15"
}
```

### Estatísticas de Casos

```http
GET /api/cases/stats
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "stats": [
    { "status": "active", "count": 5 },
    { "status": "closed", "count": 3 }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Deletar Caso

```http
DELETE /api/cases/:id
Authorization: Bearer <token>
```

---

## 📄 Documentos

### Gerar Documento (IA)

```http
POST /api/documents/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": 1,
  "caseId": 1,
  "documentType": "contract"
}
```

**Resposta (201):**
```json
{
  "message": "Documento gerado com sucesso",
  "document": {
    "id": 1,
    "clientId": 1,
    "type": "contract",
    "title": "Contrato de Prestação de Serviços Jurídicos",
    "fileName": "contract_1_1705328400000.docx",
    "filePath": "/uploads/documents/contract_1_1705328400000.docx",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "content": {
    "title": "CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS",
    "sections": [...]
  }
}
```

### Criar Documento (Manual)

```http
POST /api/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": 1,
  "caseId": 1,
  "type": "contract",
  "title": "Contrato de Prestação de Serviços",
  "fileName": "contrato_joao_silva.docx",
  "filePath": "/documents/contracts/contrato_joao_silva.docx",
  "fileUrl": "https://example.com/documents/contrato.pdf"
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "clientId": 1,
  "type": "contract",
  "title": "Contrato de Prestação de Serviços",
  "status": "draft",
  "createdAt": "2024-01-15T10:30:00Z",
  ...
}
```

### Listar Documentos

```http
GET /api/documents?page=1&limit=20&clientId=1&type=contract&status=draft
Authorization: Bearer <token>
```

### Obter Documento

```http
GET /api/documents/:id
Authorization: Bearer <token>
```

### Documentos por Cliente

```http
GET /api/documents/client/:clientId
Authorization: Bearer <token>
```

### Atualizar Documento

```http
PUT /api/documents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileUrl": "https://example.com/documents/novo-url.pdf"
}
```

### Enviar para ZapSign (Assinatura Digital)

```http
POST /api/documents/:id/send-to-zapsign
Authorization: Bearer <token>
Content-Type: application/json

{
  "signerEmail": "cliente@example.com",
  "signerName": "João Silva"
}
```

**Resposta (200):**
```json
{
  "message": "Documento enviado para assinatura",
  "zapsignId": "uuid-123456",
  "signLink": "https://zapsign.com.br/sign/...",
  "document": {
    "id": 1,
    "status": "pending_signature",
    "zapsignId": "uuid-123456"
  }
}
```

### Verificar Status ZapSign

```http
GET /api/documents/:id/zapsign-status
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "documentId": 1,
  "zapsignId": "uuid-123456",
  "status": "pending|completed|expired|declined"
}
```

### Enviar para Assinatura (Legacy)

```http
POST /api/documents/:id/send-to-signature
Authorization: Bearer <token>
Content-Type: application/json

{
  "zapsignId": "zap-123456",
  "zapsignSignLink": "https://zapsign.com/sign/..."
}
```

### Marcar como Assinado

```http
POST /api/documents/:id/mark-as-signed
Authorization: Bearer <token>
Content-Type: application/json

{
  "signedBy": "João Silva"
}
```

### Estatísticas de Documentos

```http
GET /api/documents/stats
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "byType": [
    { "type": "contract", "status": "signed", "count": 5 },
    { "type": "proposal", "status": "draft", "count": 2 }
  ],
  "byStatus": [
    { "status": "draft", "count": 10 },
    { "status": "signed", "count": 5 }
  ]
}
```

### Deletar Documento

```http
DELETE /api/documents/:id
Authorization: Bearer <token>
```

---

## 💬 WhatsApp

### Enviar Mensagem

```http
POST /api/whatsapp/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "5511999999999",
  "message": "Olá João! Seu contrato está pronto para assinatura."
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "result": {...}
}
```

### Enviar em Massa

```http
POST /api/whatsapp/send-bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumbers": [
    "5511999999999",
    "5511988888888",
    "5511977777777"
  ],
  "message": "Atualização importante sobre seus casos!"
}
```

### Verificar Status

```http
GET /api/whatsapp/status
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "isConnected": true,
  "user": {
    "id": "5511999999999@s.whatsapp.net",
    "name": "Bot Legal Hub",
    "short": "Bot"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🔍 Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 404 | Not Found - Recurso não encontrado |
| 500 | Server Error - Erro interno |

---

## 📝 Tipos de Documentos

- `proposal` - Proposta de Honorários
- `contract` - Contrato de Prestação de Serviços
- `power_of_attorney` - Procuração
- `financial_aid_declaration` - Declaração de Hipossuficiência
- `other` - Outro

---

## 🔄 Status de Documentos

- `draft` - Rascunho
- `pending_signature` - Aguardando Assinatura
- `signed` - Assinado
- `rejected` - Rejeitado

---

## ⚠️ Status de Casos

- `active` - Ativo
- `closed` - Fechado
- `suspended` - Suspenso
- `archived` - Arquivado

---

## 📚 Exemplo de Fluxo Completo

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legal-hub.com","password":"admin123"}'

# Copiar o token da resposta

# 2. Criar Lead
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "legalArea": "trabalhista",
    "description": "Demissão injusta"
  }'

# Copiar o ID do lead (1)

# 3. Converter em Cliente
curl -X POST http://localhost:3000/api/leads/1/convert-to-client \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cpfCnpj": "12345678900",
    "phone": "1133334444"
  }'

# 4. Criar Caso
curl -X POST http://localhost:3000/api/cases \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "title": "Ação Trabalhista",
    "legalArea": "trabalhista",
    "honorariesFee": 15000
  }'

# 5. Enviar Mensagem WhatsApp
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511999999999",
    "message": "Seu caso foi registrado!"
  }'
```

---

**API completa e pronta para produção!** 🚀
