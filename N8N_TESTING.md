# 🧪 Testar n8n Webhooks

**Tempo:** 10 minutos

---

## PASSO 1: Verificar Webhook Service

Abrir Insomnia/Postman

**Request tipo:** GET

**URL:** `https://localhost:3000/api/webhooks/health`

**Esperado:**
```json
{
  "success": true,
  "message": "Webhook service is running",
  "endpoints": {
    "POST /api/webhooks/n8n-action": "Process action from n8n",
    ...
  }
}
```

✅ Se retornar = Webhooks estão prontos

---

## PASSO 2: Testar Ação - Enviar Email

**Request tipo:** POST

**URL:** `https://localhost:3000/api/webhooks/n8n-action`

**Headers:**
```
Content-Type: application/json
```

**Body (SEM autenticação):**
```json
{
  "action": "send-email",
  "payload": {
    "to": "seu-email@gmail.com",
    "subject": "Teste n8n Webhook",
    "message": "Se viu este email, webhooks estão funcionando!"
  }
}
```

**Clicar Send**

**Esperado:**
```json
{
  "success": true,
  "message": "Action \"send-email\" processed",
  "result": {
    "success": true,
    "message": "Email sent successfully"
  }
}
```

✅ Se receber email = Ação funcionou!

---

## PASSO 3: Testar Trigger - Caso Atualizado

**Request tipo:** POST

**URL:** `https://localhost:3000/api/webhooks/case-update`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_JWT_TOKEN
```

**Body:**
```json
{
  "caseId": 1,
  "title": "Teste vs. Empresa XYZ",
  "status": "active",
  "completionPercentage": 75,
  "description": "Caso de teste para webhook",
  "action": "Atualizado via webhook test"
}
```

**Clicar Send**

**Esperado:**
```json
{
  "success": true,
  "message": "Case update webhook triggered",
  "caseId": 1
}
```

✅ Se retornar = Webhook disparado com sucesso!

**Verificar logs do backend:**
Procurar por:
```
🔗 Enviando webhook para n8n: ...
✅ Webhook enviado com sucesso para n8n
```

---

## PASSO 4: Testar Webhook do Documento

**Request tipo:** POST

**URL:** `https://localhost:3000/api/webhooks/document-signed`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_JWT_TOKEN
```

**Body:**
```json
{
  "documentId": 123,
  "caseId": 1
}
```

---

## PASSO 5: Testar Novo Cliente

**Request tipo:** POST

**URL:** `https://localhost:3000/api/webhooks/client-created`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_JWT_TOKEN
```

**Body:**
```json
{
  "clientId": 42
}
```

---

## PASSO 6: Obter Exemplos de Workflow

**Request tipo:** GET

**URL:** `https://localhost:3000/api/webhooks/workflows?type=case-update`

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN
```

**Resposta:** JSON completo de um workflow n8n pronto para usar

**Tipos disponíveis:**
- `case-update` - Enviar email quando caso atualiza
- `deadline-alert` - Alerta diário de prazos
- `new-client` - Boas-vindas para novo cliente

---

## PASSO 7: Configurar n8n (Opcional)

Se quiser testar integration completa:

### 7.1 Instalar n8n

```bash
# Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  n8nio/n8n

# Cloud (recomendado)
# https://n8n.cloud → Sign up
```

### 7.2 Criar Webhook em n8n

1. Abrir n8n → New Workflow
2. Adicionar: **Webhook** node
3. Configurar path: `case-update`
4. Copy webhook URL: `http://localhost:5678/webhook/case-update`
5. Adicionar node: **Send Email** ou **HTTP Request**

### 7.3 Configurar n8n para chamar Legal Hub

Adicionar node **HTTP Request**:

```
Method: POST
URL: https://localhost:3000/api/webhooks/n8n-action
Headers:
  Content-Type: application/json
Body:
{
  "action": "send-email",
  "payload": {
    "to": "{{$node.Webhook.json.body.clientEmail}}",
    "subject": "Seu caso foi atualizado",
    "message": "Caso: {{$node.Webhook.json.body.title}}"
  }
}
```

### 7.4 Ativar Workflow

Click no toggle (canto superior direito) → Workflow ativo

---

## 🎯 Checklist de Sucesso

- [ ] GET /api/webhooks/health retorna 200 ✅
- [ ] POST /api/webhooks/n8n-action envia email ✅
- [ ] POST /api/webhooks/case-update dispara webhook ✅
- [ ] Logs mostram "✅ Webhook enviado com sucesso" ✅
- [ ] Backend não crashou ✅
- [ ] n8n instalado (opcional) ✅
- [ ] Workflow criado (opcional) ✅

---

## 📊 Resultado Visual

Quando tudo funciona:

```
Terminal 1 (Backend logs):
  🔗 Enviando webhook para n8n: {...}
  ✅ Webhook enviado com sucesso para n8n

Insomnia/Postman:
  Response: 200 OK
  {
    "success": true,
    "message": "Case update webhook triggered",
    "caseId": 1
  }

n8n (se configurado):
  Webhook recebido
  Email enviado
  Workflow completo
```

---

## ❌ Troubleshooting

### "N8N_WEBHOOK_URL not configured"

**Solução:**
```bash
# backend/.env
N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

Reiniciar backend: `npm run dev`

### "Webhook service is not running"

**Solução:**
```bash
# Verificar se backend reiniciou com webhook routes
npm run dev

# Procurar por: "Webhook service is running"
```

### "Email não foi enviado"

**Verificar:**
1. RESEND_API_KEY em .env?
2. Body tem "action" e "payload"?

**Debug:**
```bash
curl -X POST https://localhost:3000/api/emails/test \
  -H "Authorization: Bearer TOKEN" \
  -d '{"to": "seu@email.com", "subject": "Test", "message": "Test"}'
```

### "Authorization header missing"

**Solução:**
```
Triggers POST /api/webhooks/* precisam de JWT token

Mas POST /api/webhooks/n8n-action NÃO precisa (n8n chama)
```

---

## 📈 Próximos Passos

1. **Webhook funcionando:** ✅
2. **n8n configurado:** ⏭️ Opcional
3. **Integração completa:** Testar fluxo ponta-a-ponta
4. **Monitoramento:** Dashboard (Fase 14)

---

**Status:** ✅ Webhooks testados e funcionando!  
**Tempo:** ~10 minutos
