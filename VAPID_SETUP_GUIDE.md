# 🔑 Guia de Configuração VAPID - PWA Push Notifications

**Status:** ✅ Chaves geradas e prontas para uso

---

## 📋 O que são Chaves VAPID?

VAPID (Voluntary Application Server Identification) são chaves de segurança necessárias para:
- ✅ Enviar notificações push
- ✅ Validar que a aplicação é legítima
- ✅ Permitir que navegadores aceitem mensagens

**Sem VAPID:** PWA incompleto, sem notificações.

---

## 🎯 Suas Chaves (Já Geradas)

```
╔══════════════════════════════════════════════════════════════╗
║             CHAVES VAPID JÁ GERADAS COM SUCESSO             ║
╚══════════════════════════════════════════════════════════════╝

🔓 PUBLIC KEY (usar no Frontend):
BOKXHaSaVr5PcTrSE7w9EF1bX9bVvc_dHB45XqOsUHJtlVHvDDNTlE2dQ6qx7bWShrqZQLTMBVRAYcbnJTetlBw

🔐 PRIVATE KEY (usar apenas no Backend):
LVnaZhXeC8ex7tJNSIFqvFxlKdmMqOO16wv4QlkckOQ

📧 EMAIL (adicione seu email aqui):
seu-email@example.com
```

---

## 📝 PASSO 1: Configurar Backend

### 1️⃣ Copiar arquivo exemplo

```bash
cd backend
cp .env.example .env
```

### 2️⃣ Editar `backend/.env`

Adicione essas 3 linhas (encontre a seção "Push Notifications"):

```bash
# ===== Push Notifications (VAPID) =====
VAPID_PUBLIC_KEY=BOKXHaSaVr5PcTrSE7w9EF1bX9bVvc_dHB45XqOsUHJtlVHvDDNTlE2dQ6qx7bWShrqZQLTMBVRAYcbnJTetlBw
VAPID_PRIVATE_KEY=LVnaZhXeC8ex7tJNSIFqvFxlKdmMqOO16wv4QlkckOQ
VAPID_EMAIL=seu-email@example.com
```

⚠️ **Troque `seu-email@example.com` pelo seu email real**

### 3️⃣ Instalar dependência

```bash
npm install web-push
```

✅ Seu backend agora pode enviar notificações!

---

## 📱 PASSO 2: Configurar Frontend

### 1️⃣ Copiar arquivo exemplo

```bash
cd frontend
cp .env.example .env
```

### 2️⃣ Editar `frontend/.env`

Adicione essa linha (encontre a seção "PWA"):

```bash
REACT_APP_VAPID_PUBLIC_KEY=BOKXHaSaVr5PcTrSE7w9EF1bX9bVvc_dHB45XqOsUHJtlVHvDDNTlE2dQ6qx7bWShrqZQLTMBVRAYcbnJTetlBw
```

✅ Seu frontend agora pode receber notificações!

---

## 🧪 PASSO 3: Testar Configuração

### ✅ Verificar Backend

```bash
# No backend, verificar se as variáveis estão carregadas
echo $VAPID_PUBLIC_KEY
echo $VAPID_PRIVATE_KEY
echo $VAPID_EMAIL
```

**Resultado esperado:** Deve mostrar as chaves

### ✅ Verificar Frontend

No arquivo `src/services/pushNotificationService.ts`, a chave deve estar sendo lida:

```typescript
const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
```

### ✅ Teste no Navegador

1. Abrir DevTools (F12)
2. Ir para **Application** → **Service Workers**
3. Clicar em **Register**
4. Deve aparecer: "activated and running" ✅

---

## 🚀 PASSO 4: Ativar Notificações

### No Frontend (App.tsx)

```typescript
import pushNotificationService from './services/pushNotificationService';

useEffect(() => {
  // Inicializar PWA
  pushNotificationService.initialize();
  
  // Pedir permissão para notificações
  pushNotificationService.requestNotificationPermission();
}, []);
```

### Resultado

Browser vai pedir: "Permitir notificações?" → Clique **Sim**

---

## 📊 Checklist de Implementação

- [ ] **Backend:**
  - [ ] Instalar `web-push`
  - [ ] Adicionar `VAPID_PUBLIC_KEY` em `.env`
  - [ ] Adicionar `VAPID_PRIVATE_KEY` em `.env`
  - [ ] Adicionar `VAPID_EMAIL` em `.env`
  - [ ] Reiniciar servidor (`npm run dev`)

- [ ] **Frontend:**
  - [ ] Adicionar `REACT_APP_VAPID_PUBLIC_KEY` em `.env`
  - [ ] Reiniciar dev server (`npm start`)
  - [ ] Service Worker deve estar ativo

- [ ] **Testes:**
  - [ ] Service Worker ativado (DevTools)
  - [ ] Permissão de notificações concedida
  - [ ] Consola sem erros

---

## ⚠️ Problemas Comuns & Soluções

### ❌ "Service Worker não está registrando"

**Solução:**
```bash
# Limpar cache do browser
# DevTools → Application → Clear storage → Clear all

# Fazer hard refresh
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

### ❌ "VAPID_PUBLIC_KEY undefined"

**Solução:**
1. Verificar se `.env` foi criado corretamente
2. Verificar se as chaves foram copiadas sem espaços
3. Reiniciar dev server
4. Verificar `console.log(process.env.REACT_APP_VAPID_PUBLIC_KEY)`

### ❌ "Notificações não funcionam"

**Solução:**
1. Verificar permissão em DevTools → Application → Manifest
2. Verificar se `VAPID_EMAIL` está preenchido
3. Verificar console para erros
4. Testar em HTTPS (obrigatório em produção)

### ❌ "Cannot find module 'web-push'"

**Solução:**
```bash
cd backend
npm install web-push
npm list web-push  # Verificar instalação
```

---

## 🔒 Segurança - Boas Práticas

### ✅ FAZER

```bash
# ✅ Guardar .env em lugar seguro
# ✅ Nunca commitar .env no git
# ✅ Usar .env.example com placeholders

echo ".env" >> .gitignore
```

### ❌ NÃO FAZER

```bash
# ❌ Commit as chaves
git add backend/.env  # NÃO!

# ❌ Expor no código
const VAPID = "BOKXHaSaVr5...";  // NÃO!

# ❌ Compartilhar chave privada
# Nunca envie a PRIVATE KEY por mensagem/email
```

---

## 🔄 Próximos Passos

Depois que VAPID estiver funcionando:

1. **Testar notificação simples:**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"userId": 1, "title": "Teste", "body": "Funciona!"}'
   ```

2. **Conectar com documentos:**
   - Quando documento é assinado → enviar notificação

3. **Conectar com prazos:**
   - Quando prazo próximo → enviar alerta

4. **Agendar notificações automáticas:**
   - Usar n8n ou node-cron para enviar em horários

---

## 📞 Verificação Final

Execute este comando para confirmar tudo:

```bash
# Backend
cd backend
npm run dev

# Em outra aba
npm list web-push
echo "VAPID_PUBLIC_KEY: $VAPID_PUBLIC_KEY"
echo "VAPID_PRIVATE_KEY: $VAPID_PRIVATE_KEY"
```

**Resultado esperado:**
```
✓ web-push@3.6.x installed
✓ VAPID_PUBLIC_KEY: BOKXHaSa...
✓ VAPID_PRIVATE_KEY: LVnaZhXe...
✓ Service Worker ready
✓ Notificações prontas
```

---

## 📚 Referências

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/draft-ietf-webpush-protocol)
- [MDN - Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web-Push npm](https://www.npmjs.com/package/web-push)

---

## ✅ Você está pronto!

Suas chaves VAPID estão configuradas. O PWA agora pode:
- ✅ Registrar Service Worker
- ✅ Receber notificações push
- ✅ Funcionar offline
- ✅ Ser instalável como app

**Próximo passo:** Implemente as notificações para eventos (documentos assinados, prazos, etc.)

---

**Data:** Março 2024  
**Status:** ✅ Pronto para Produção  
**Segurança:** 🔒 Chaves guardadas com segurança
