# 📧 Email Service - Resend Integration

**Status:** ✅ Resend configurado e pronto

---

## 📋 O que foi feito

✅ **Service instalado:**
- `resend@6.12.0` npm package
- Email templates HTML profissionais
- Suporte a eventos de caso (novo, ativo, concluído)
- Urgency levels (verde, orange, vermelho)

✅ **Endpoints criados:**
- `POST /api/emails/send-case-update` - Enviar atualização de caso
- `POST /api/emails/test` - Testar email (desenvolvimento)
- `GET /api/emails/preview` - Preview visual do email

---

## 🚀 Configurar Resend

### 1️⃣ Obter API Key (2 minutos)

1. Ir para https://resend.com
2. Click **Sign Up** (grátis)
3. Verificar email
4. Dashboard → **API Keys**
5. Copiar chave que começa com `re_`

### 2️⃣ Adicionar ao .env

```bash
# backend/.env

RESEND_API_KEY=re_seu_codigo_aqui
EMAIL_FROM=noreply@legal-hub.com
EMAIL_REPLY_TO=suporte@legal-hub.com
```

### 3️⃣ Verificar domínio em produção

No Resend dashboard:
- Ir para **Domains**
- Adicionar seu domínio (ex: legal-hub.com)
- Resend dá instruções DNS (5 minutos)

**Em desenvolvimento:** Não precisa verificar domínio

---

## 🧪 Testar Email

### Test Email (Simples)

```bash
curl -X POST https://localhost:3000/api/emails/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -d '{
    "to": "seu-email@example.com",
    "subject": "Teste do Legal Hub",
    "message": "Email de teste funcionando!"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "email_abc123xyz"
}
```

### Preview do Email

Visualizar como o email vai parecer:

```bash
curl -X GET https://localhost:3000/api/emails/preview \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

Retorna o HTML completo do email. Cole no navegador para ver.

---

## 📧 Enviar Atualização de Caso

### Request completo:

```bash
curl -X POST https://localhost:3000/api/emails/send-case-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -d '{
    "clientName": "João Silva",
    "clientEmail": "joao@example.com",
    "caseName": "Silva vs. Empresa XYZ",
    "caseNumber": "PROC-2024-001234",
    "description": "Ação trabalhista. Aguardando sentença.",
    "status": "active",
    "completionPercentage": 65,
    "nextDeadline": {
      "date": "2026-04-27T00:00:00Z",
      "description": "Entrega de documentos",
      "type": "document"
    },
    "recentActivities": [
      {
        "date": "2026-04-18T10:30:00Z",
        "action": "Audiência realizada",
        "details": "Audiência com o juiz realizada com sucesso."
      },
      {
        "date": "2026-04-15T14:00:00Z",
        "action": "Documentos enviados",
        "details": "Todos os documentos foram enviados ao tribunal."
      }
    ],
    "requiredDocuments": [
      "Cópia da identidade",
      "Comprovante de residência"
    ],
    "urgencyLevel": "orange"
  }'
```

### Campos obrigatórios:
- `clientEmail` ✅ Email do cliente
- `caseName` ✅ Nome do caso
- `caseNumber` ✅ Número do processo

### Campos opcionais:
- `clientName` - Nome do cliente (padrão: "Cliente")
- `description` - Descrição do caso
- `status` - `new` | `active` | `completed` (padrão: active)
- `completionPercentage` - 0-100 (padrão: 50)
- `nextDeadline` - Próximo prazo importante
- `recentActivities` - Histórico de ações
- `requiredDocuments` - Documentos pendentes
- `urgencyLevel` - `green` | `orange` | `red` (padrão: green)

---

## 🎨 Email Template

O email inclui:

✅ **Header** com brand colors  
✅ **Case Info** com nome, número, status  
✅ **Progress Bar** visual do progresso  
✅ **Next Deadline** destacado por urgência  
✅ **Recent Activities** últimas 3 ações  
✅ **Required Documents** lista de documentos  
✅ **Call to Action** botão para acessar caso  
✅ **Footer** com info de contato  

**Urgency Colors:**
- 🟢 **Green** (Normal) - Mais de 14 dias
- 🟡 **Orange** (Atenção) - 7-14 dias
- 🔴 **Red** (Urgente) - Menos de 7 dias

---

## 📊 Status Badges

| Status | Badge |
|--------|-------|
| `new` | 🆕 Novo |
| `active` | ⚙️ Em Andamento |
| `completed` | ✅ Concluído |

---

## 🔧 Integração com Webhook (n8n)

Quando um caso é atualizado:

```yaml
Webhook (n8n):
  1. Detecta mudança de caso
  2. Formata dados
  3. Chama /api/emails/send-case-update
  4. Email enviado automaticamente
```

Exemplo n8n:
```json
{
  "to": "{{$node.Database.json.client.email}}",
  "caseName": "{{$node.Database.json.case.name}}",
  "caseNumber": "{{$node.Database.json.case.number}}",
  "completionPercentage": "{{$node.Database.json.case.progress}}"
}
```

---

## 📈 Limites Resend (Gratuito)

| Limite | Valor |
|--------|-------|
| Emails/dia | **100** |
| Emails/mês | **300** |
| Domínios | 1 (pago = ilimitado) |
| Support | Community |

**Plano Pro:** $20/mês para ilimitado

---

## ❌ Troubleshooting

### "RESEND_API_KEY not configured"

**Solução:**
```bash
# Verificar .env
echo $RESEND_API_KEY

# Se vazio, adicionar:
RESEND_API_KEY=re_seu_codigo
```

### "Email not sent - Auth failed"

**Causa:** API Key inválida ou expirada

**Solução:**
1. Ir para https://resend.com/api-keys
2. Gerar nova chave
3. Atualizar .env
4. Reiniciar servidor: `npm run dev`

### "Email sent but not received"

**Causa:** Pode ser spam filter

**Verificar:**
1. Pasta Spam/Junk
2. Verificar domínio em Resend
3. SPF/DKIM configurado

---

## 🚀 Próximos Passos

### Fase 12: Agendar Email Automático

1. Instalar `node-cron` ou `bull`
2. Criar job que envia email toda segunda (ex)
3. Buscar casos com prazos próximos
4. Enviar atualização automática

Exemplo:
```typescript
// Toda segunda-feira às 9:00 AM
cron.schedule('0 9 * * 1', async () => {
  const cases = await getCasesWithNearbyDeadlines();
  
  for (const caseItem of cases) {
    await emailService.sendCaseUpdate({
      ...caseItem.data,
      urgencyLevel: calculateUrgency(caseItem.deadline)
    });
  }
});
```

---

## 📞 Suporte Resend

- Docs: https://resend.com/docs
- API Reference: https://resend.com/docs/api-reference
- Status: https://resend.status.page

---

## ✅ Checklist

- [ ] Resend account criado
- [ ] API Key copiada
- [ ] .env atualizado com RESEND_API_KEY
- [ ] Backend reiniciado
- [ ] Teste de email enviado com sucesso
- [ ] Email recebido na caixa de entrada
- [ ] Template HTML visualizado
- [ ] Integração com casos pronta

---

**Data:** Abril 2026  
**Status:** ✅ Email Service Ativo  
**Próximo:** Agendar emails automáticos (Fase 12)
