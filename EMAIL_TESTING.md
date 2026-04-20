# 🧪 Testar Email Service

**Tempo:** 10 minutos

---

## PASSO 1: Configurar Resend

### 1. Ir para https://resend.com
### 2. Click **Sign Up** (conta gratuita)
### 3. Completar registro e verificar email
### 4. Dashboard → **API Keys**
### 5. Copiar chave (começa com `re_`)

---

## PASSO 2: Atualizar .env

Abrir `backend/.env`:

```bash
RESEND_API_KEY=re_cole_sua_chave_aqui
EMAIL_FROM=noreply@legal-hub.com
EMAIL_REPLY_TO=suporte@legal-hub.com
```

**Salvar arquivo.**

---

## PASSO 3: Reiniciar Backend

No terminal (Terminal 1):

```bash
cd /c/Users/prosy/legal-hub/backend
npm run dev
```

Espera aparecer:
```
✅ Database connected successfully
🔒 HTTPS Server running on https://localhost:3000
```

---

## PASSO 4: Testar Email (Simples)

### Abrir Insomnia ou Postman

**Request tipo:** POST

**URL:** `https://localhost:3000/api/emails/test`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_JWT_TOKEN_AQUI
```

**Body (JSON):**
```json
{
  "to": "seu-email-pessoal@gmail.com",
  "subject": "Teste Legal Hub",
  "message": "Email de teste funcionando!"
}
```

**Clicar Send**

---

### ⚠️ Problema: "No JWT token"?

Se não tiver token JWT, primeiro fazer login:

**1. POST /api/auth/login**

```json
{
  "email": "admin@legal-hub.com",
  "password": "sua-senha"
}
```

Recebe resposta com `token`. Copiar valor do `token`.

**2. Usar esse token no Authorization header:**

```
Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## PASSO 5: Testar Email Completo (Case Update)

**Request tipo:** POST

**URL:** `https://localhost:3000/api/emails/send-case-update`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_JWT_TOKEN
```

**Body (JSON):**
```json
{
  "clientName": "Maria Silva",
  "clientEmail": "seu-email-pessoal@gmail.com",
  "caseName": "Silva vs. Empresa ABC",
  "caseNumber": "PROC-2024-001234",
  "description": "Ação trabalhista. Aguardando sentença do juiz sobre indenização.",
  "status": "active",
  "completionPercentage": 65,
  "nextDeadline": {
    "date": "2026-04-27T00:00:00Z",
    "description": "Entrega de documentos de defesa",
    "type": "document"
  },
  "recentActivities": [
    {
      "date": "2026-04-18T10:30:00Z",
      "action": "Audiência realizada",
      "details": "Audiência com o juiz realizada com sucesso. Argumentos bem recebidos."
    },
    {
      "date": "2026-04-15T14:00:00Z",
      "action": "Documentos enviados",
      "details": "Todos os documentos de petição inicial foram enviados ao tribunal."
    },
    {
      "date": "2026-04-10T09:00:00Z",
      "action": "Caso aberto",
      "details": "Seu caso foi aberto no sistema jurídico e registrado."
    }
  ],
  "requiredDocuments": [
    "Cópia da identidade",
    "Comprovante de residência",
    "Contracheques dos últimos 3 meses",
    "Documentos do contrato de trabalho"
  ],
  "urgencyLevel": "orange"
}
```

**Clicar Send**

---

## PASSO 6: Verificar Email Recebido

1. **Abrir seu email (Gmail, Outlook, etc)**
2. **Procurar email de `noreply@legal-hub.com`**
3. **Verificar:**
   - ✅ Assunto está correto?
   - ✅ Nome do cliente aparece?
   - ✅ Progresso (65%) aparece?
   - ✅ Próximo prazo aparece destacado?
   - ✅ Atividades recentes estão lá?
   - ✅ Documentos pendentes listados?
   - ✅ Urgência (orange) visível?

---

## PASSO 7: Testar Preview do Email

Ver como email vai parecer antes de enviar:

**Request tipo:** GET

**URL:** `https://localhost:3000/api/emails/preview`

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN
```

**Resposta:**
```json
{
  "success": true,
  "preview": {
    "subject": "Silva vs. Empresa ABC - ⚙️ Em Andamento (65% concluído)",
    "to": "maria@example.com",
    "htmlPreview": "<html>...</html>"
  }
}
```

Copiar o `htmlPreview` e colar num arquivo `.html`, depois abrir no navegador.

---

## 📊 Respostas Esperadas

### ✅ Sucesso

```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "email_abc123xyz"
}
```

### ❌ Erro: API Key não configurada

```json
{
  "error": "Failed to send email",
  "details": "Could not find API key"
}
```

**Solução:**
- Verificar `RESEND_API_KEY` em `.env`
- Reiniciar backend
- Checar se chave começa com `re_`

### ❌ Erro: Missing required fields

```json
{
  "error": "Missing required fields: clientEmail, caseName, caseNumber"
}
```

**Solução:** Adicionar campos obrigatórios no JSON

---

## 🎯 Checklist de Sucesso

- [ ] Resend account criado
- [ ] API Key copiada para .env
- [ ] Backend reiniciado
- [ ] Test email enviado
- [ ] Test email recebido
- [ ] Case update email enviado
- [ ] Email recebido com template bonito
- [ ] Todos os dados aparecem corretamente
- [ ] Urgency level visível (cores)
- [ ] Progress bar funciona

---

## 🚀 Próximo: Agendar Emails Automáticos

Depois que testar, podemos:

1. Criar job que roda toda segunda-feira
2. Buscar casos com prazos próximos
3. Enviar email automático para cada cliente
4. Integrar com n8n webhooks

---

## 💡 Dicas

**Testando com diferentes urgencies:**
- `"urgencyLevel": "green"` - Email com tom normal
- `"urgencyLevel": "orange"` - Email com aviso (7-14 dias)
- `"urgencyLevel": "red"` - Email urgente (menos de 7 dias)

**Testando com diferentes statuses:**
- `"status": "new"` - Novo caso (🆕)
- `"status": "active"` - Em andamento (⚙️)
- `"status": "completed"` - Concluído (✅)

---

**Status:** ✅ Pronto para testar!  
**Tempo total:** ~10 minutos
