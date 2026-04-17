# Legal Hub 🏛️

**Automação 100% gratuita de escritório de advocacia**

Plataforma completa para gerenciar leads, clientes, geração de documentos e automação de processos jurídicos.

---

## 🚀 Quick Start

### Pré-requisitos
- Docker & Docker Compose
- Node.js 18+
- Git

### 1️⃣ Clonar e inicializar
```bash
git clone <repo>
cd legal-hub
```

### 2️⃣ Subir infraestrutura (PostgreSQL, Redis, n8n)
```bash
docker-compose up -d
```

Verificar se tudo subiu:
```bash
docker-compose ps
```

### 3️⃣ Acessar serviços
- **n8n**: http://localhost:5678 (admin/admin_password_dev)
- **PgAdmin**: http://localhost:5050 (admin@legal-hub.local/admin_password_dev)
- **Backend**: http://localhost:3000 (será criado)
- **Frontend**: http://localhost:3001 (será criado)

### 4️⃣ Setup do Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 5️⃣ Setup do Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📁 Estrutura do Projeto

```
legal-hub/
├── backend/              # API Node.js + Express
├── frontend/             # Interface React
├── n8n-workflows/        # Automações (n8n)
├── templates/            # Modelos de documentos
├── docker-compose.yml    # Infraestrutura
└── CLAUDE.md            # Documentação completa
```

---

## 🔧 Variáveis de Ambiente

Criar `.env` na raiz e em `backend/`:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=legal_user
DB_PASSWORD=legal_password_dev
DB_NAME=legal_hub

# Redis
REDIS_URL=redis://redis:6379

# API
API_PORT=3000
API_URL=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:3000

# Claude API
ANTHROPIC_API_KEY=your_key_here

# n8n
N8N_URL=http://localhost:5678
```

---

## 📚 Documentação

Veja [CLAUDE.md](./CLAUDE.md) para:
- Stack tecnológico completo
- Fluxo de automação detalhado
- Modelos de documentos
- Roadmap de implementação
- Custos e integrações

---

## 🛠️ Desenvolvimento

### Parar serviços
```bash
docker-compose down
```

### Logs
```bash
docker-compose logs -f n8n
docker-compose logs -f postgres
```

### Reset (limpar dados)
⚠️ **Cuidado - deleta tudo!**
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📝 Fases de Desenvolvimento

- **Fase 1-2**: CRM Básico + API
- **Fase 3**: WhatsApp + IA
- **Fase 4**: Geração de Documentos
- **Fase 5**: ZapSign + Assinatura
- **Fase 6-7**: n8n Workflows + Trello

Ver [CLAUDE.md](./CLAUDE.md) para mais detalhes.

---

## 📞 Support

- Issues: GitHub Issues
- Docs: [CLAUDE.md](./CLAUDE.md)
- Stack: Node.js, React, PostgreSQL, n8n, Claude API

---

## 📄 Licença

Gratuito para uso pessoal e comercial.

---

**Vamos automatizar! 🚀**
