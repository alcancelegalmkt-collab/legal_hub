# ⏰ Email Scheduling - Node-Cron

**Status:** ✅ Agendamentos configurados e prontos

---

## 📋 O que foi feito

✅ **3 Jobs agendados automaticamente:**

### 1️⃣ Atualizações Semanais (segunda 9:00 AM)
- Envia email para todos os clientes ativos
- Mostra progresso de cada caso em andamento
- Calcula urgência baseado em prazos
- Status: Cases novo/ativo/concluído

### 2️⃣ Alertas de Prazos (diariamente 8:00 AM)
- Busca casos com prazos nos próximos 7 dias
- Envia alerta destacado
- Urgência automática: Verde/Orange/Red
- Não repete emails

### 3️⃣ Resumo de Concluídos (sexta 5:00 PM)
- Encontra cases concluídos na última semana
- Agrupa por cliente
- Envia parabéns com lista de sucesso
- Integra com Resend

---

## 🚀 Como funciona

### Startup
Quando o backend inicia:
```
✅ Database connected
✅ HTTPS Server running
📱 Iniciando WhatsApp
⏰ Iniciando agendador de emails
  📅 JOB: Atualizações semanais (segunda-feira 9:00)
  📅 JOB: Alertas de prazos (diariamente 8:00)
  📅 JOB: Resumo de casos (sexta-feira 17:00)
✅ Todos os agendamentos ativados
```

### Execução
Cada job roda **automaticamente** no horário agendado.

**Exemplo (segunda-feira 9:00 AM):**
```
📧 [JOB] Iniciando envio de atualizações semanais...
✅ Email enviado para joao@example.com - Silva vs. Empresa ABC
✅ Email enviado para maria@example.com - Processo Trabalhista
✅ [JOB] Atualizações semanais completa
```

---

## 📊 Endpoints de Gerenciamento

### 1. Listar jobs ativos
```bash
GET /api/scheduling/jobs
```

**Resposta:**
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

### 2. Ver informações sobre agendamentos
```bash
GET /api/scheduling/info
```

**Resposta:**
```json
{
  "success": true,
  "schedule": {
    "jobs": [
      {
        "name": "weeklyClientUpdates",
        "schedule": "0 9 * * 1",
        "description": "Envio semanal de atualizações para clientes",
        "frequency": "Toda segunda-feira às 9:00 AM",
        "actions": [...]
      },
      ...
    ],
    "cronFormat": "minute hour day-of-month month day-of-week"
  }
}
```

### 3. Parar um job específico
```bash
DELETE /api/scheduling/jobs/weeklyClientUpdates
```

**Resposta:**
```json
{
  "success": true,
  "message": "Job \"weeklyClientUpdates\" stopped successfully"
}
```

### 4. Parar todos os jobs
```bash
DELETE /api/scheduling/jobs
```

**Resposta:**
```json
{
  "success": true,
  "message": "All scheduling jobs stopped successfully"
}
```

---

## 📅 Schedule Format (CRON)

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6) (0=Sunday)
│ │ │ │ │
│ │ │ │ │
0 9 * * 1  = Segunda-feira às 9:00 AM
0 8 * * *  = Todos os dias às 8:00 AM
0 17 * * 5 = Sexta-feira às 5:00 PM
```

**Exemplos personalizados:**

| Schedule | Significado |
|----------|------------|
| `0 9 * * 1` | Segunda às 9:00 |
| `0 8 * * *` | Diariamente às 8:00 |
| `0 17 * * 5` | Sexta às 17:00 |
| `*/30 * * * *` | A cada 30 minutos |
| `0 0 * * 0` | Domingo à meia-noite |
| `0 12 15 * *` | Dia 15 de cada mês ao meio-dia |

---

## 🌍 Timezone

Por padrão, usa o timezone do servidor.

**Para horário brasileiro (São Paulo):**

```bash
# No .env
TZ=America/Sao_Paulo

# Ou no systemd (produção)
[Service]
Environment="TZ=America/Sao_Paulo"
```

**Verificar timezone atual:**
```bash
node -e "console.log(new Date().toString())"
```

---

## 🔍 Monitoramento

### Verificar logs em tempo real
```bash
# Backend rodando
npm run dev

# Veja os [JOB] logs aparecendo no console
```

### Exemplos de logs
```
⏰ [JOB] Verificando prazos próximos...
⚠️ Alerta enviado para joao@example.com - 5 dias
✅ [JOB] Verificação de prazos completa (3 alertas)
```

### Verificar via API
```bash
curl https://localhost:3000/api/scheduling/jobs \
  -H "Authorization: Bearer TOKEN"
```

---

## ⚙️ Customizar Jobs

### Mudar horário de um job

Editar `backend/src/services/schedulingService.ts`:

```typescript
// Mudar segunda 9:00 para terça 10:00
cron.schedule('0 10 * * 2', async () => {
  // ... código do job
});
```

### Desabilitar um job

```typescript
// Comentar a função
// this.scheduleWeeklyClientUpdates();
```

### Adicionar novo job

```typescript
private scheduleMyCustomJob() {
  const job = cron.schedule('0 12 * * *', async () => {
    console.log('[JOB] Meu job personalizado...');
    // Seu código aqui
  });
  this.jobs.set('myCustomJob', job);
}

// Chamar em startAllJobs()
startAllJobs() {
  this.scheduleWeeklyClientUpdates();
  this.scheduleMyCustomJob(); // Novo job
}
```

---

## 🐛 Troubleshooting

### "Job não está rodando"

**Verificar:**
1. Backend está rodando? (`npm run dev`)
2. Você vê os logs `[JOB]` no console?
3. Horário correto do servidor?

**Solução:**
```bash
# Reiniciar backend
npm run dev

# Verificar logs
curl https://localhost:3000/api/scheduling/jobs -H "Authorization: Bearer TOKEN"
```

### "Email não está sendo enviado"

**Verificar:**
1. RESEND_API_KEY está em .env?
2. Email do cliente é válido?
3. Database tem dados reais?

**Debug:**
```bash
# Teste manualmente
curl -X POST https://localhost:3000/api/emails/test \
  -H "Authorization: Bearer TOKEN" \
  -d '{"to": "seu@email.com", "subject": "Teste", "message": "Test"}'
```

### "Timezone errado"

**Verificar:**
```bash
node -e "console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)"
```

**Corrigir:**
```bash
# .env
TZ=America/Sao_Paulo
```

---

## 📊 Exemplo de fluxo completo

**Segunda-feira às 9:00 AM:**

```
1. Backend detecta: hora do job
2. Busca todos os clientes ativos
3. Para cada cliente:
   - Busca cases em progresso
   - Calcula urgência
   - Formata email
   - Envia via Resend
4. Log: "✅ Email enviado para joao@example.com"
5. Job completa
```

**Resultado:**
- Cliente recebe email com status atualizado
- Email tem design profissional
- Progress bar visual
- Urgência destacada
- Próximos prazos em evidência

---

## 📈 Escalabilidade

### Para múltiplos servidores

Use **Redis** para sincronizar jobs:

```typescript
// Usar Bull queue em vez de node-cron
import Bull from 'bull';

const emailQueue = new Bull('emails', {
  redis: { host: 'redis-server', port: 6379 }
});

emailQueue.process(async (job) => {
  // Processa job
});
```

### Monitoramento avançado

Integrar com **Sentry** ou **DataDog**:

```typescript
Sentry.captureMessage('[JOB] Enviando emails', 'info');
Sentry.captureException(error);
```

---

## ✅ Checklist

- [ ] `npm install node-cron` executado
- [ ] `schedulingService.ts` criado
- [ ] `schedulingController.ts` criado
- [ ] `schedulingRoutes.ts` criado
- [ ] Rotas adicionadas ao index.ts
- [ ] Backend reiniciado
- [ ] Logs mostram `✅ Todos os agendamentos ativados`
- [ ] Teste de API: `GET /api/scheduling/jobs`
- [ ] Mais de 1 job aparecendo

---

## 🚀 Próximos Passos

### Fase 13: Integração com n8n

Conectar webhooks n8n com jobs:
```
Caso atualizado → n8n webhook → Aciona job → Email enviado
```

### Fase 14: Dashboard de Monitoramento

Criar página visual com:
- Status dos jobs
- Logs das execuções
- Estatísticas de emails
- Histórico de envios

---

**Data:** Abril 2026  
**Status:** ✅ Scheduling Ativo  
**Próximo:** Integração com n8n
