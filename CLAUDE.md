# Legal Hub - Automação de Escritório de Advocacia

## Visão Geral
Plataforma 100% gratuita de automação para escritório de advocacia com:
- CRM próprio para gestão de leads e clientes
- Agentes IA 24/7 para triagem e atendimento
- Geração automática de documentos jurídicos
- Orquestração via n8n (self-hosted)
- Integração WhatsApp → Assinatura Digital → Trello

**Objetivo**: Substituir Chat Juridico, Atende Direito e JusLead mantendo custo zero.

---

## Stack Tecnológico

### Backend
- **Node.js + Express** - API REST
- **PostgreSQL** - Banco de dados (grátis, open-source)
- **Sequelize/TypeORM** - ORM
- **JWT** - Autenticação

### Frontend
- **React 18** - Interface web
- **TailwindCSS** - Styling
- **Axios** - HTTP client

### Automação & Orquestração
- **n8n self-hosted** - Workflows de automação
- **Docker** - Containerização
- **Baileys** - Integração WhatsApp (alternativa gratuita ao Twilio)

### IA & Processamento
- **Claude API** (via Anthropic) - Agentes inteligentes
- **Llama 2 self-hosted** - Fallback gratuito
- **node-docx** - Geração de documentos .docx
- **pdf-lib** - Manipulação de PDFs

### Integrações Externas (Gratuitas)
- **ZapSign** - Assinatura digital (plano free: 5 docs/mês)
- **Trello API** - Gestão de tasks
- **Gmail/SMTP** - Notificações por email
- **WhatsApp Business API** - Mensageria

---

## Arquitetura

```
legal-hub/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── services/        # Serviços (IA, docs, integrações)
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Endpoints
│   │   ├── middleware/      # Auth, validação
│   │   └── utils/           # Helpers
│   ├── docker-compose.yml   # PostgreSQL + Redis
│   └── package.json
│
├── frontend/                # Interface React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Telas (Dashboard, CRM, Leads, Clientes)
│   │   ├── services/        # Chamadas à API
│   │   └── assets/          # Imagens, ícones
│   └── package.json
│
├── n8n-workflows/           # Workflows de automação
│   ├── 01-whatsapp-triagem.json
│   ├── 02-gerar-documentos.json
│   ├── 03-enviar-zapsign.json
│   └── 04-criar-trello.json
│
├── templates/               # Modelos de documentos
│   ├── contrato-servicos.docx
│   ├── procuracao.docx
│   ├── declaracao-hipossuficiencia.docx
│   └── proposta-honorarios.docx
│
└── docker-compose.yml       # Orquestra tudo (PostgreSQL, Redis, n8n)
```

---

## Fluxo de Automação Completo

### 1️⃣ **Primeiro Contato via WhatsApp**
- Cliente envia msg no WhatsApp do escritório
- Baileys captura a mensagem
- Webhook enviado ao n8n

### 2️⃣ **Triagem Automática (IA)**
- Agente Claude qualifica o lead:
  - Área jurídica (trabalhista, família, civil, etc)
  - Urgência (alta, média, baixa)
  - Capacidade financeira (estimada)
- Lead criado no CRM com status "Novo"
- Resposta automática enviada ao cliente

### 3️⃣ **Agendamento de Consulta**
- Sistema oferece slots disponíveis
- Cliente confirma horário
- Aviso enviado ao advogado
- Calendário atualizado

### 4️⃣ **Atendimento & Preenchimento de Ficha**
- Advogado realiza atendimento
- CRM auto-preenche dados via IA (resumo da conversa)
- Ficha de atendimento completa

### 5️⃣ **Geração Automática de Documentos**
Após atendimento, sistema gera automaticamente:
- **Proposta de Honorários** (com valor negociado)
- **Contrato de Prestação de Serviços** (claúsulas customizáveis)
- **Procuração** (poderes gerais ou especiais)
- **Declaração de Hipossuficiência** (se aplicável)

### 6️⃣ **Envio para Assinatura Digital**
- Documentos enviados ao ZapSign via API
- Link gerado automaticamente
- Enviado ao cliente via WhatsApp
- Cliente assina online

### 7️⃣ **Acompanhamento & Trello**
- Webhook do ZapSign confirma assinatura
- Card criado no Trello:
  - Nome do cliente
  - Checklist com documentos
  - Labels (área, status)
  - Descrição com dados do caso
- Card movido para "Em Andamento"
- Documento salvo no servidor

---

## Modelos de Documentos

### 📋 Ficha de Atendimento (CRM)
```
IDENTIFICAÇÃO
├─ Nome completo
├─ CPF/CNPJ
├─ RG
├─ Estado civil
├─ Profissão
├─ Endereço
├─ Telefone
└─ Email

DADOS DO CASO
├─ Área jurídica
├─ Descrição breve
├─ Partes envolvidas
├─ Valor da causa
└─ Documentos importantes

FINANCEIRO
├─ Forma de pagamento
├─ Valor dos honorários
└─ Hipossuficiência (sim/não)
```

### 📄 Documentos Gerados Automaticamente
1. **Proposta de Honorários** - Template customizável
2. **Contrato de Prestação de Serviços** - Com proteção legal
3. **Procuração** - Poderes gerais/especiais
4. **Declaração de Hipossuficiência** - Modelo padrão

---

## Integrações Técnicas

### WhatsApp → n8n
```
Baileys (Node.js) 
  ↓ (webhook)
n8n WhatsApp Trigger
  ↓
Claude AI (triagem)
  ↓
CRM Backend (criar lead)
  ↓
Resposta automática
```

### Geração de Documentos
```
Dados do cliente (CRM)
  ↓
Claude API (preenche template)
  ↓
node-docx (gera .docx)
  ↓
pdf-lib (converte para PDF)
  ↓
ZapSign (upload)
```

### Assinatura Digital
```
ZapSign API
  ↓ (webhook assinado)
n8n Trigger
  ↓
Arquivo salvo no servidor
  ↓
Trello card atualizado
  ↓
Email notificação
```

---

## Custos (Estimado)

| Ferramenta | Custo | Notas |
|-----------|-------|-------|
| Node.js + React | R$ 0 | Open-source |
| PostgreSQL | R$ 0 | Open-source |
| n8n self-hosted | R$ 0 | Open-source, Docker |
| ZapSign | R$ 0 | Plan free: 5 docs/mês |
| Trello | R$ 0 | Plan free |
| Claude API | ~R$ 20-50 | Conforme uso (triagem) |
| VPS (Hetzner/DigitalOcean) | R$ 15-30 | Para host n8n + CRM |
| **TOTAL** | **~R$ 35-80/mês** | Muito abaixo dos R$ 290+ de Chat Juridico |

---

## Roadmap de Implementação

### **Fase 1: CRM Básico + API** (Semana 1-2)
- [ ] Estrutura Node.js + Express
- [ ] Banco PostgreSQL
- [ ] Autenticação JWT
- [ ] Modelos: Cliente, Lead, Case, Documento
- [ ] Endpoints CRUD básicos

### **Fase 2: Frontend - Dashboard** (Semana 3)
- [ ] Login/Logout
- [ ] Dashboard principal
- [ ] Listagem de leads (Kanban)
- [ ] Ficha de atendimento
- [ ] Perfil do cliente

### **Fase 3: Integração WhatsApp + IA** (Semana 4)
- [ ] Baileys webhook setup
- [ ] Agente Claude (triagem)
- [ ] Criar lead automaticamente
- [ ] Respostas automáticas

### **Fase 4: Geração de Documentos** (Semana 5)
- [ ] Templates .docx
- [ ] API gerar proposta
- [ ] API gerar contrato
- [ ] API gerar procuração
- [ ] Conversão para PDF

### **Fase 5: ZapSign + Assinatura** (Semana 6)
- [ ] Integração ZapSign API
- [ ] Enviar documentos para assinatura
- [ ] Webhook assinatura
- [ ] Salvar documentos assinados

### **Fase 6: n8n Workflows** (Semana 7)
- [ ] Setup n8n self-hosted
- [ ] Workflow: WhatsApp → CRM
- [ ] Workflow: Gerar docs → ZapSign
- [ ] Workflow: ZapSign → Trello

### **Fase 7: Trello + Email Notifications** (Semana 8)
- [ ] Integração Trello API
- [ ] Criar cards automaticamente
- [ ] Notificações por email
- [ ] Dashboard atualizado em tempo real

---

## Próximos Passos
1. ✅ Estrutura do projeto criada
2. ⏳ Iniciando Fase 1: CRM Básico
3. ⏳ Docker Compose para ambiente local
4. ⏳ Primeiros endpoints da API

**Pronto para começar a codar!** 🚀
