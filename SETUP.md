# Legal Hub - Guia de Setup Completo

**Automação 100% Gratuita de Escritório de Advocacia**

Siga este guia para ter todo o Legal Hub rodando localmente em 15 minutos.

---

## 📋 Pré-requisitos

- Docker & Docker Compose
- Node.js 18+
- Git
- Chave Anthropic (Claude API) - [Grátis com créditos](https://console.anthropic.com)

---

## 🚀 Instalação Rápida

### 1️⃣ Infraestrutura (2 min)

```bash
cd ~/legal-hub

# Subir PostgreSQL, Redis, n8n
docker-compose up -d

# Verificar se está tudo subindo
docker-compose ps
```

Espere até ver status `healthy` em todos os serviços.

### 2️⃣ Backend (3 min)

```bash
cd backend

# Instalar dependências
npm install

# Criar .env (já existe com valores default)
# Se precisar ajustar:
cp .env.example .env
# nano .env (editar se necessário)

# Iniciar servidor
npm run dev
```

Deve aparecer:
```
✅ Database connected successfully
✅ Database tables synced
🚀 Server running on http://localhost:3000
```

### 3️⃣ Frontend (3 min)

Em outro terminal:

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar aplicação
npm start
```

Abre automaticamente em `http://localhost:3001`

### 4️⃣ n8n Workflows (2 min)

1. Abrir n8n: http://localhost:5678
2. Login: `admin` / `admin_password_dev`
3. Configurar credenciais (ver abaixo)
4. Importar workflows (ver [n8n-workflows/README.md](./n8n-workflows/README.md))

---

## 🔑 Configurar Credenciais n8n

**⚠️ IMPORTANTE: Fazer antes de importar workflows**

### Anthropic (Claude API)

1. Ir em n8n → Credentials
2. New → HTTP Header Auth
3. Preencher:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Header**: `x-api-key`
   - **Value**: `sk-ant-...` (sua chave)

### Backend API

1. No backend, gerar um JWT token:

```bash
# Terminal backend já rodando
# Ou via curl:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legal-hub.com","password":"admin123"}'
```

2. Copiar o token
3. Em n8n → Credentials → New → HTTP Header Auth
   - **Name**: `API_TOKEN`
   - **Header**: `Authorization`
   - **Value**: `Bearer <token_copiado>`

### ZapSign (Opcional - para assinatura digital)

1. Ir em https://app.zapsign.com.br/settings/api
2. Gerar API Key
3. Em n8n → Credentials → New → API Key
   - **Name**: `ZAPSIGN_API_KEY`
   - **Value**: (API Key do ZapSign)

### Trello (Opcional - para gestão de tasks)

1. Ir em https://trello.com/app-key
2. Copiar Key e gerar Token
3. Em n8n → New Credential (2x):
   - **Name**: `TRELLO_API_KEY` → **Value**: (sua key)
   - **Name**: `TRELLO_TOKEN` → **Value**: (seu token)

---

## 🧪 Testar Tudo Funcionando

### 1️⃣ Testar Backend

```bash
curl http://localhost:3000/api/health

# Resposta esperada:
# {"status":"ok","timestamp":"...","environment":"development"}
```

### 2️⃣ Testar Frontend

Abrir http://localhost:3001 no navegador.

Deve ver página de **Login** com demo credentials.

### 3️⃣ Testar Banco de Dados

```bash
# Acessar PgAdmin
http://localhost:5050
# Email: admin@legal-hub.local
# Password: admin_password_dev
```

Verificar tabelas em: Database → legal_hub

### 4️⃣ Testar n8n

```bash
curl http://localhost:5678/api/v1/health

# Resposta esperada:
# {"database":{"connected":true},...}
```

---

## 📊 Portas e Serviços

| Serviço | URL | Credenciais |
|---------|-----|------------|
| Frontend | http://localhost:3001 | Login com demo |
| Backend | http://localhost:3000 | - |
| n8n | http://localhost:5678 | admin / admin_password_dev |
| PgAdmin | http://localhost:5050 | admin@legal-hub.local / admin_password_dev |
| PostgreSQL | localhost:5432 | legal_user / legal_password_dev |
| Redis | localhost:6379 | - |

---

## 🔐 Demo User

Para testar o frontend:

**Email**: admin@legal-hub.com  
**Password**: admin123

Se não existir, registre um novo usuário na página de Login.

---

## 📝 Fluxo Completo de Teste

### 1️⃣ Criar um Lead

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "whatsapp": "5511999999999",
    "legalArea": "trabalhista",
    "description": "Preciso ajuda com demissão injusta",
    "urgency": "high",
    "source": "whatsapp"
  }'
```

### 2️⃣ Ver no Dashboard

Frontend → Dashboard → Deve aparecer o novo lead

### 3️⃣ Triggar Workflow WhatsApp (Opcional)

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

---

## 🛠️ Comandos Úteis

### Parar Serviços

```bash
docker-compose down
```

### Logs

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Apenas um serviço
docker-compose logs -f postgres
docker-compose logs -f n8n
```

### Reset Completo (⚠️ CUIDADO!)

```bash
# Deleta todos os dados
docker-compose down -v
docker-compose up -d
```

### Backend

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar build
npm start
```

### Frontend

```bash
# Desenvolvimento
npm start

# Build para produção
npm run build

# Servir build
npx serve -s build
```

---

## 🐛 Troubleshooting

### "Connection refused" ao backend

Esperar 5-10 segundos para banco iniciar. Backend tentará se reconectar automaticamente.

### n8n não abre

Aguardar container initializar:
```bash
docker-compose logs -f n8n
```

### Webpack error no frontend

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### PgAdmin não conecta

1. Aguardar postgres iniciar
2. Em PgAdmin: Add new server
   - Host: `postgres`
   - Port: `5432`
   - User: `legal_user`
   - Password: `legal_password_dev`

### Token JWT inválido

Fazer login novamente no backend para gerar novo token.

---

## 📚 Documentação Específica

- **Backend**: [backend/README.md](./backend/README.md)
- **Frontend**: [frontend/README.md](./frontend/README.md)
- **n8n**: [n8n-workflows/README.md](./n8n-workflows/README.md)
- **Arquitetura**: [CLAUDE.md](./CLAUDE.md)

---

## 🚀 Próximos Passos

Depois que tudo estiver rodando:

1. **Criar alguns leads** via interface
2. **Configurar webhooks n8n** (credenciais)
3. **Testar workflows** com dados reais
4. **Integrar WhatsApp** (usar Baileys ou Twilio)
5. **Customizar templates** de documentos

---

## 💡 Dicas

- Manter terminal aberto com `docker-compose logs -f` para diagnosticar problemas
- Usar PgAdmin para explorar dados do banco
- Usar n8n web UI para debugar workflows
- Claude API: primeiros $5 são grátis

---

## ✅ Checklist Final

- [ ] Docker rodando (docker-compose ps)
- [ ] Backend respondendo (curl localhost:3000/api/health)
- [ ] Frontend abre (localhost:3001)
- [ ] n8n abre (localhost:5678)
- [ ] Consigo fazer login no frontend
- [ ] Consigo criar um lead
- [ ] Banco de dados tem dados

**Se tudo acima passou, você tem um Legal Hub funcional!** 🎉

---

## 📞 Suporte

Problemas? Verificar:
- Logs: `docker-compose logs -f`
- CLAUDE.md para arquitetura
- Readme específico de cada serviço

---

**Boa automação!** ⚖️🚀
