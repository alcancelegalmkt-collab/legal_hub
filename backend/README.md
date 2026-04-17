# Legal Hub Backend

**Node.js + Express + PostgreSQL API**

API REST para gerenciar leads, clientes, casos jurídicos e documentos.

---

## 🚀 Setup

### 1️⃣ Instalar dependências
```bash
npm install
```

### 2️⃣ Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env conforme necessário
```

### 3️⃣ Iniciar o servidor
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

---

## 📋 Estrutura

```
src/
├── config/          # Configurações (database, etc)
├── models/          # Modelos Sequelize (User, Lead, Client, Case, Document)
├── controllers/     # Controllers (lógica de negócio)
├── routes/          # Rotas da API
├── services/        # Serviços (autenticação, integrações)
├── middleware/      # Middlewares (autenticação, validação)
├── utils/           # Utilidades
├── types/           # Tipos TypeScript
└── index.ts         # Arquivo principal
```

---

## 📚 Modelos de Dados

### User (Advogados/Funcionários)
- `id` - PK
- `name` - Nome completo
- `email` - Email único
- `password` - Hash bcrypt
- `oabNumber` - Número OAB (único)
- `role` - admin | lawyer | assistant
- `active` - Status ativo/inativo

### Lead (Potenciais Clientes)
- `id` - PK
- `name` - Nome
- `email` - Email
- `phone` - Telefone
- `whatsapp` - WhatsApp
- `legalArea` - Área jurídica
- `description` - Descrição do caso
- `urgency` - low | medium | high
- `estimatedBudget` - Orçamento estimado
- `source` - whatsapp | phone | email | website | referral
- `status` - new | contacted | qualified | lost | converted
- `aiQualificationScore` - Score IA (0-100)
- `assignedToId` - FK User (advogado responsável)
- `notes` - Anotações

### Client (Clientes Confirmados)
- `id` - PK
- `name` - Nome completo
- `cpfCnpj` - CPF/CNPJ único
- `email` - Email
- `phone` - Telefone
- `whatsapp` - WhatsApp
- `maritalStatus` - Estado civil
- `profession` - Profissão
- `address` - Endereço completo
- `city` - Cidade
- `state` - Estado (UF)
- `zipCode` - CEP
- `rg` - RG
- `nationality` - Nacionalidade
- `needsFinancialAid` - Necessita gratuidade
- `primaryLawyerId` - FK User (advogado responsável)

### Case (Casos Jurídicos)
- `id` - PK
- `clientId` - FK Client
- `primaryLawyerId` - FK User
- `title` - Título do caso
- `legalArea` - Área jurídica
- `description` - Descrição
- `caseNumber` - Número do processo
- `court` - Tribunal
- `caseValue` - Valor da causa
- `honorariesFee` - Valor dos honorários
- `honorariesFeeType` - fixed | percentage | hourly
- `status` - active | closed | suspended | archived
- `opposingParties` - Partes opostas
- `startDate` - Data início
- `endDate` - Data término

### Document (Documentos)
- `id` - PK
- `clientId` - FK Client
- `caseId` - FK Case (opcional)
- `type` - proposal | contract | power_of_attorney | financial_aid_declaration | other
- `title` - Título
- `fileName` - Nome do arquivo
- `filePath` - Caminho local
- `fileUrl` - URL pública
- `status` - draft | pending_signature | signed | rejected
- `zapsignId` - ID ZapSign
- `zapsignSignLink` - Link assinatura ZapSign
- `signedAt` - Data assinatura
- `signedBy` - Quem assinou

---

## 🔌 Endpoints Implementados

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (requer token)

### Leads
- `POST /api/leads` - Criar novo lead
- `GET /api/leads` - Listar leads (com filtros)
- `GET /api/leads/:id` - Get lead por ID
- `PUT /api/leads/:id` - Atualizar lead
- `POST /api/leads/:id/convert-to-client` - Converter lead em cliente

---

## 🔐 Autenticação

Usar JWT Bearer Token:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/profile
```

Token gerado ao registrar ou fazer login.

---

## 📦 Build

```bash
npm run build
```

Gera os arquivos compilados em `dist/`

---

## ✅ Próximas Fases

- [ ] Controllers: Client, Case, Document
- [ ] Rotas completas CRUD
- [ ] Validação de dados
- [ ] Geração de documentos (node-docx)
- [ ] Integração ZapSign
- [ ] Integração Claude IA
- [ ] Testes unitários
