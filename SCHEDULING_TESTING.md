# 🧪 Testar Email Scheduling

**Tempo:** 5 minutos

---

## PASSO 1: Reiniciar Backend

Certificar que o backend foi reiniciado para carregar os jobs:

```bash
cd /c/Users/prosy/legal-hub/backend
npm run dev
```

**Procurar no console:**
```
✅ Database connected successfully
🔒 HTTPS Server running on https://localhost:3000

⏰ Iniciando agendador de emails...
  📅 JOB: Atualizações semanais (segunda-feira 9:00)
  📅 JOB: Alertas de prazos (diariamente 8:00)
  📅 JOB: Resumo de casos (sexta-feira 17:00)
✅ Todos os agendamentos ativados
```

Se ver isso = ✅ Jobs estão rodando!

---

## PASSO 2: Verificar Jobs Ativos

### No Insomnia/Postman

**Request tipo:** GET

**URL:** `https://localhost:3000/api/scheduling/jobs`

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Active scheduling jobs",
  "jobs": [
    "weeklyClientUpdates",
    "deadlineAlerts",
    "completedCaseSummary"
  ],
  "totalJobs": 3
}
```

✅ Se aparecer 3 jobs = Agendamentos estão ativos!

---

## PASSO 3: Ver Informações dos Jobs

**Request tipo:** GET

**URL:** `https://localhost:3000/api/scheduling/info`

**Headers:**
```
Authorization: Bearer SEU_JWT_TOKEN
```

**Resposta:**
- Lista todos os 3 jobs
- Horários
- O que cada um faz
- Formato CRON

---

## PASSO 4: Testar Job Manualmente (Simular)

### Adicionar dados de teste ao banco

Você precisa ter:
- ✅ Um cliente ativo
- ✅ Um caso em progresso
- ✅ Email real do cliente

**Se não tiver:**

1. Criar cliente via API
2. Criar caso para esse cliente
3. Usar email de teste (seu próprio email)

---

## PASSO 5: Forçar Execução de Job (Desenvolvimento)

Para testar SEM esperar até segunda-feira:

### Opção A: Editar tempo do job temporariamente

**Editar:** `backend/src/services/schedulingService.ts`

Mudar:
```typescript
// De:
cron.schedule('0 9 * * 1', async () => {

// Para (roda em 2 minutos):
cron.schedule('0/2 * * * *', async () => {
```

Salvar e reiniciar backend.

Esperar 2 minutos → Job executa → Email enviado

### Opção B: Criar endpoint de teste

Adicionar ao `schedulingController.ts`:

```typescript
export const runJobNow = async (req: Request, res: Response) => {
  try {
    const { jobName } = req.body;

    if (jobName === 'weeklyClientUpdates') {
      // Executar job agora
      await emailService.sendCaseUpdate({...});
      return res.json({ success: true, message: 'Job executed' });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
```

---

## PASSO 6: Monitorar Logs

### Console do Backend

Quando um job executa, vê:

```
⏰ [JOB] Iniciando envio de atualizações semanais...
✅ Email enviado para joao@example.com - Silva vs. ABC
✅ Email enviado para maria@example.com - Processo Trabalhista
✅ [JOB] Atualizações semanais completa
```

### Ou via API

```bash
curl https://localhost:3000/api/scheduling/jobs \
  -H "Authorization: Bearer TOKEN"

# Resposta com jobs ativos
```

---

## 🎯 Checklist de Sucesso

- [ ] Backend mostra "✅ Todos os agendamentos ativados"
- [ ] GET /api/scheduling/jobs retorna 3 jobs
- [ ] GET /api/scheduling/info mostra detalhes
- [ ] Banco tem cliente + caso + email real
- [ ] Modificar cron para testar em 2 minutos
- [ ] Email chega na caixa de entrada
- [ ] Email tem design profissional
- [ ] Todos os dados aparecem corretos

---

## ❌ Problemas Comuns

### "Jobs não aparecem em GET /api/scheduling/jobs"

**Solução:**
```bash
# Verificar se backend reiniciou
# Procurar por "✅ Todos os agendamentos ativados" no console

# Se não aparecer: npm run dev novamente
npm run dev
```

### "Email não foi enviado"

**Verificar:**
1. RESEND_API_KEY está em .env?
2. Cliente + caso existem no banco?
3. Email do cliente é válido?

**Teste:**
```bash
POST /api/emails/test
{
  "to": "seu@email.com",
  "subject": "Teste",
  "message": "Testando"
}
```

### "Job roda mas email não é enviado"

**Logs:**
```
❌ [JOB] Erro em Weekly Updates: Error: RESEND_API_KEY not found
```

**Solução:** Adicionar `RESEND_API_KEY=re_...` ao `.env`

---

## 📊 Cronograma Real vs Teste

### Real (Produção)
- Segunda 9:00 AM: Email semanal
- Diariamente 8:00 AM: Alertas de prazos
- Sexta 5:00 PM: Resumo

### Teste (Desenvolvimento)
- `*/2 * * * *` = A cada 2 minutos
- `*/5 * * * *` = A cada 5 minutos

---

## 🚀 Próximos Passos

1. **Confirmar funcionamento:** Jobs rodando ✅
2. **Ajustar horários:** Mudar para seu fuso horário
3. **Personalizar templates:** Adicionar logo/branding
4. **Integrar com n8n:** Webhooks para ações manuais

---

**Status:** ✅ Pronto para testar!  
**Tempo:** ~5 minutos
