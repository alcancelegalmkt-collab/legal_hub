# 🚀 Deploy em Hostinger - Legal Hub PWA

**Tempo estimado:** 20 minutos

---

## 📋 Pré-requisitos

- [ ] Conta Hostinger ativa
- [ ] Domínio configurado (seu-dominio.com)
- [ ] Git instalado localmente
- [ ] Código com HTTPS já configurado ✅

---

## PASSO 1️⃣: Preparar código para produção

### 1. Atualizar backend/.env para produção

```bash
# Abrir backend/.env e modificar:

NODE_ENV=production
API_PORT=3000
API_URL=https://seu-dominio.com
HTTPS_ENABLED=true

CORS_ORIGIN=https://seu-dominio.com

# Preenchher seus dados reais:
VAPID_EMAIL=seu-email@example.com

# Google Calendar (se usar)
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URL=https://seu-dominio.com/api/case-progress/calendar/callback
```

### 2. Atualizar frontend/.env para produção

```bash
# Abrir frontend/.env e modificar:

REACT_APP_API_URL=https://seu-dominio.com/api
REACT_APP_VAPID_PUBLIC_KEY=BOKXHaSaVr5PcTrSE7w9EF1bX9bVvc_dHB45XqOsUHJtlVHvDDNTlE2dQ6qx7bWShrqZQLTMBVRAYcbnJTetlBw
```

### 3. Adicionar script de build se não existir

Verificar `package.json` na raiz:

```json
{
  "scripts": {
    "build": "npm run build --workspaces",
    "start": "npm start --workspace=backend"
  }
}
```

---

## PASSO 2️⃣: Criar repositório Git (se ainda não tiver)

```bash
# Na raiz do projeto
git init
git remote add origin https://github.com/seu-usuario/legal-hub.git
git add .
git commit -m "feat: Initial commit with HTTPS and PWA"
git push -u origin main
```

---

## PASSO 3️⃣: Conectar Hostinger ao GitHub

1. **Acessar Hostinger Dashboard**
2. **Ir para:** Websites → seu-dominio.com
3. **Clicar:** Manage
4. **Menu lateral:** Git Repository
5. **Clicar:** Connect GitHub
6. **Autorizar** Hostinger acessar seu GitHub
7. **Selecionar:** seu repositório `legal-hub`
8. **Branch:** main
9. **Clicar:** Connect

---

## PASSO 4️⃣: Configurar ambiente em produção

### No painel Hostinger:

1. **Websites** → seu-dominio.com → **Manage**
2. **Código Source** (ou Git Repository)
3. **Environment Variables**
4. **Adicionar cada variável:**

```
NODE_ENV=production
API_PORT=3000
API_URL=https://seu-dominio.com
HTTPS_ENABLED=true
CORS_ORIGIN=https://seu-dominio.com

DB_HOST=seu-db-host (Hostinger fornece)
DB_PORT=5432
DB_USER=seu-db-user
DB_PASSWORD=seu-db-password
DB_NAME=legal_hub

JWT_SECRET=mude_para_algo_muito_secreto_em_producao
JWT_EXPIRATION=7d

VAPID_PUBLIC_KEY=BOKXHaSaVr5PcTrSE7w9EF1bX9bVvc_dHB45XqOsUHJtlVHvDDNTlE2dQ6qx7bWShrqZQLTMBVRAYcbnJTetlBw
VAPID_PRIVATE_KEY=LVnaZhXeC8ex7tJNSIFqvFxlKdmMqOO16wv4QlkckOQ
VAPID_EMAIL=seu-email@example.com

ANTHROPIC_API_KEY=sua-chave-aqui (se usar)
```

---

## PASSO 5️⃣: Ativar Node.js

1. **No painel Hostinger**
2. **Websites** → seu-dominio.com
3. **Manage** → **App Manager** (ou Node.js)
4. **Selecionar Node.js versão:** 18+ ou 20+
5. **Application Startup File:** `backend/dist/index.js`
6. **Node.js Package Manager:** npm
7. **Salvar**

Hostinger vai:
- ✅ Executar `npm install` automaticamente
- ✅ Executar `npm run build` automaticamente
- ✅ Iniciar seu servidor em `https://seu-dominio.com`

---

## PASSO 6️⃣: Configurar SSL (Let's Encrypt)

### Hostinger oferece GRÁTIS!

1. **Websites** → seu-dominio.com
2. **Manage**
3. **Segurança** ou **SSL/TLS Certificates**
4. **Let's Encrypt**
5. **Ativar** (botão verde)

**Aguarde 5 minutos** e seu site estará com:
- ✅ HTTPS automático
- ✅ Certificado renovado automaticamente
- ✅ PWA funcionando

---

## PASSO 7️⃣: Configurar Database (PostgreSQL)

### Se Hostinger hospeda seu banco:

1. **Painel Hostinger**
2. **Databases** (ou MySQL/PostgreSQL)
3. **Criar nova database PostgreSQL**
4. **Hostinger fornecerá:**
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

5. **Adicionar no Environment Variables** (Passo 4)

### Se usar banco remoto (ex: Railway, Render):

```
DB_HOST=seu-db-externo.railway.app
```

---

## PASSO 8️⃣: Deploy

### Automático:

```bash
# Seu código já está no GitHub
# Quando você faz push, Hostinger atualiza automaticamente:

git push origin main

# ✅ Hostinger detecta novo push
# ✅ Baixa código
# ✅ Executa npm install
# ✅ Executa npm run build
# ✅ Reinicia Node.js
```

### Manual (se preferir):

1. **Painel Hostinger**
2. **Websites** → seu-dominio.com
3. **Git Repository**
4. **Pull Latest Changes** (ou similar)

---

## PASSO 9️⃣: Verificar deploy

### 1. Health Check

```bash
curl https://seu-dominio.com/api/health

# Resposta esperada:
# {
#   "status": "ok",
#   "timestamp": "2026-04-17T...",
#   "environment": "production"
# }
```

### 2. Service Worker

No navegador:
1. DevTools → F12
2. Application → Service Workers
3. Deve aparecer: "activated and running" ✅

### 3. PWA Instalação

1. Ícone de instalação (canto superior direito)
2. Clicar em "Instalar"
3. App instalado como PWA ✅

### 4. Push Notifications

1. DevTools → Console
2. Procurar: "Push notification ready"
3. Se aparecer → ✅ Funcionando

---

## 🔧 Troubleshooting

### "502 Bad Gateway"

**Causa:** Node.js ainda iniciando ou erro na aplicação

**Solução:**
```bash
# Verificar logs em Hostinger
# Painel → Websites → seu-dominio.com → Logs

# Se erro em logs, verificar:
# 1. Variáveis de ambiente corretas?
# 2. Database conecta?
# 3. Certificados SSL?
```

### "CORS Error"

**Causa:** Frontend tentando acessar API bloqueada

**Solução:**
```bash
# Verificar backend/.env:
CORS_ORIGIN=https://seu-dominio.com  # ✅ Correto

# NÃO:
CORS_ORIGIN=http://localhost:3001   # ❌ Errado em produção
```

### "Service Worker not registering"

**Causa:** Não está em HTTPS

**Verificar:**
- URL do navegador começa com `https://`?
- Certificado SSL ativado?

**Solução:** Verificar passo 6 (SSL)

### "Database connection error"

**Causa:** Credenciais erradas ou servidor offline

**Solução:**
1. Verificar credenciais no Environment Variables
2. Verificar se database está ativa
3. Testar conexão localmente

---

## 📊 Monitoramento

### Hostinger oferece:

1. **Logs** → Ver erros em tempo real
2. **Recursos** → CPU, RAM, Banco de dados
3. **Uptime** → Histórico de disponibilidade

---

## 🔄 Deploy Contínuo

### Workflow com GitHub Actions (Opcional)

```yaml
# .github/workflows/deploy.yml

name: Deploy to Hostinger

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Hostinger
        run: |
          git push https://${{ secrets.HOSTINGER_GIT }}@git.hostinger.com/seu-repo.git main
```

---

## ✅ Checklist Final

- [ ] Código em GitHub
- [ ] Hostinger conectado ao GitHub
- [ ] Environment variables configuradas
- [ ] Node.js ativado em Hostinger
- [ ] Database criado/configurado
- [ ] SSL Let's Encrypt ativado
- [ ] `npm run build` executado com sucesso
- [ ] Health check (`/api/health`) respondendo
- [ ] Service Worker ativado
- [ ] PWA instalável
- [ ] Push notifications funcionando

---

## 🚀 Próximos Passos

Seu Legal Hub agora está:
- ✅ Em produção com HTTPS
- ✅ PWA instalável
- ✅ Push notifications ativas
- ✅ Escalável com Hostinger

Próximo:
1. Configurar email (SendGrid/Hostinger SMTP)
2. Agendar notificações automáticas (node-cron)
3. Monitorar performance (Hostinger Dashboard)

---

**Suporte Hostinger:** https://support.hostinger.com  
**Seu Legal Hub:** https://seu-dominio.com ✅
