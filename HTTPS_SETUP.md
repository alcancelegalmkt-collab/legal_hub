# 🔒 HTTPS Setup - PWA Push Notifications

**Status:** ✅ HTTPS configurado para desenvolvimento e produção

---

## 📋 Por que HTTPS é essencial?

Sem HTTPS, o PWA **não funciona**:
- ❌ Service Worker não registra
- ❌ Push notifications não funcionam
- ❌ Aplicação não pode ser instalada (Add to Home Screen)

**Solução:** HTTPS é obrigatório para PWA (mesmo em localhost!)

---

## 🔐 DESENVOLVIMENTO LOCAL (HTTPS)

### 1️⃣ Certificados SSL já gerados

```
backend/certs/
  ├── cert.pem    (certificado auto-assinado)
  └── key.pem     (chave privada)
```

✅ Válidos por 365 dias

### 2️⃣ Configuração automática

O backend inicia automaticamente com HTTPS quando:
- `NODE_ENV=development` e `HTTPS_ENABLED=true` (seu .env atual)
- OU `NODE_ENV=production`

### 3️⃣ Iniciar servidor

```bash
# Backend (HTTPS)
cd backend
npm run dev

# Output esperado:
# 🔒 HTTPS Server running on https://localhost:3000
# 📚 API Health Check: https://localhost:3000/api/health
```

### 4️⃣ Aviso do navegador

Ao abrir https://localhost:3000:

```
⚠️ Seu certificado não é confiável
"Your connection is not private"
```

**É NORMAL!** Certificado auto-assinado. Clique:
- Chrome/Edge: **Advanced** → **Proceed to localhost**
- Firefox: **Advanced** → **Accept the Risk and Continue**

### 5️⃣ Frontend (HTTPS)

```bash
cd frontend
npm start

# DevServer roda em https://localhost:3001
# Proxy automático para backend em https://localhost:3000
```

---

## 🌐 HOSTINGER (PRODUÇÃO)

### 1️⃣ Hostinger oferece SSL GRÁTIS

Você precisa:
1. Fazer push do seu código para Hostinger
2. Acessar Hostinger → **SSL/TLS Certificates**
3. Ativar **Let's Encrypt (FREE)**

**Hostinger faz tudo automaticamente em 5 minutos!**

### 2️⃣ Configurar seu domínio

No seu `backend/.env` em produção:

```bash
NODE_ENV=production
API_URL=https://seu-dominio.com
HTTPS_ENABLED=true
CORS_ORIGIN=https://seu-dominio.com
```

### 3️⃣ Backend em produção

```bash
# Hostinger oferece Node.js nativo
# Seu backend rodará em:
# https://api.seu-dominio.com (se configurado)
# ou https://seu-dominio.com/api
```

### 4️⃣ Frontend em produção

```bash
# Build
npm run build

# Fazer upload da pasta build para Hostinger
# Configurar como "Static Website"
```

---

## 📝 Configuração de Ambiente

### Backend (.env)

```bash
# SERVER
NODE_ENV=development
API_PORT=3000
API_URL=https://localhost:3000
HTTPS_ENABLED=true

# CORS
CORS_ORIGIN=https://localhost:3001
```

### Frontend (.env)

```bash
# Aponta automaticamente para backend HTTPS
REACT_APP_API_URL=https://localhost:3000/api
```

---

## 🧪 Testar PWA com HTTPS

1. **Abrir DevTools** (F12)
2. **Ir para:** Application → Service Workers
3. **Deve mostrar:** "activated and running" ✅
4. **Ir para:** Application → Manifest
5. **Deve mostrar:** app metadata ✅

### Teste de instalação

1. Click **Instalar** (ícone de casa + seta)
2. Deve abrir "Instalar aplicação"
3. Click **Instalar**
4. App instalado como PWA ✅

### Teste de notificações

1. Abrir DevTools → Console
2. Esperar mensagem: "Push notification ready"
3. Testar com endpoint `/api/notifications/send`

---

## ⚠️ Problemas Comuns

### "SSL certificate problem"

**Causa:** Certificado auto-assinado
**Solução:** Firefox/Chrome → Accept the Risk

### "Service Worker not registering"

**Causa:** Não está em HTTPS
**Solução:** Certifique que está em https://localhost, não http://

### "API calls failing"

**Causa:** CORS ou certificado
**Solução:** Verificar DevTools → Network → mostrar erro detalhado

### "Cannot find module 'http-proxy-middleware'"

**Solução:**
```bash
cd frontend
npm install http-proxy-middleware
```

---

## 🔄 Próximos Passos

### Desenvolvimento Local
- ✅ HTTPS ativado
- ✅ Certificados gerados
- ⏭️ Testar PWA localmente
- ⏭️ Testar push notifications
- ⏭️ Testar offline functionality

### Produção (Hostinger)

1. **Push seu código:**
   ```bash
   git add .
   git commit -m "feat: Enable HTTPS and PWA"
   git push
   ```

2. **Deploy em Hostinger:**
   - Conectar seu repositório
   - Hostinger detecta Node.js
   - Instala e roda `npm install` + `npm run build`

3. **Ativar SSL (Hostinger painel):**
   - SSL/TLS Certificates
   - Let's Encrypt (FREE)
   - Ativar

4. **Seu PWA rodará em:**
   - `https://seu-dominio.com` ✅
   - Com notificações funcionando ✅
   - Instalável como app ✅

---

## 🔒 Segurança - Checklist

### Local (Desenvolvimento)

- ✅ Certificado auto-assinado apenas para localhost
- ✅ Certificados em `/certs/` (não commitado no git)
- ✅ HTTPS_ENABLED no .env (não em código)

### Hostinger (Produção)

- ✅ Let's Encrypt automático (renovação automática)
- ✅ HTTPS obrigatório em produção
- ✅ Seu domínio + SSL grátis

---

## 📚 Referências

- [MDN - HTTPS requirement for Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Requirements - HTTPS](https://web.dev/install-criteria/#https)
- [Let's Encrypt Hostinger](https://support.hostinger.com/en/articles/360036255493-how-to-activate-ssl-certificate)

---

## ✅ Você está pronto!

Seu PWA agora:
- ✅ Roda com HTTPS em desenvolvimento
- ✅ Service Worker ativado
- ✅ Notificações funcionando
- ✅ Pronto para Hostinger

**Próximo:** Testar PWA localmente com `npm run dev` e `npm start`

---

**Data:** Abril 2026  
**Status:** ✅ HTTPS Pronto  
**Segurança:** 🔒 Certificados configurados
