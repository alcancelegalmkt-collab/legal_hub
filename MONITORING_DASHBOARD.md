# 📊 Dashboard de Monitoramento

**Status:** ✅ Dashboard criado e pronto para usar

---

## 📋 O que foi feito

✅ **Backend Monitoring Service** (`monitoringService.ts`)
- Rastrear atividades (emails, webhooks, casos)
- Métricas do sistema (memória, uptime)
- Estatísticas por hora
- Health checks automáticos

✅ **API Endpoints**
- `GET /api/monitoring/dashboard` - Métricas principais
- `GET /api/monitoring/health` - Status de saúde
- `GET /api/monitoring/logs` - Activity logs
- `GET /api/monitoring/emails` - Estatísticas de email
- `GET /api/monitoring/hourly` - Dados por hora

✅ **Frontend Dashboard** (`Monitoring.tsx`)
- KPI cards (casos, clientes, emails, jobs)
- Gráficos de atividade (últimas 24h)
- Status de saúde do sistema
- Memory usage
- Uptime
- Distribuição de casos

---

## 🎨 Dashboard Visual

### Seção 1: Status do Sistema
```
┌─────────────────────────────────┐
│ ✅ Sistema Saudável              │
├─────────────────────────────────┤
│ Database:  OK                   │
│ Jobs:      OK                   │
│ Memory:    OK (45%)             │
│ Error Rate: OK (2%)             │
└─────────────────────────────────┘
```

### Seção 2: KPI Cards
```
┌──────────┬──────────┬──────────┬──────────┐
│ 📋 45    │ 👥 12    │ 📧 234   │ ⏰ 3     │
│ Casos    │ Clientes │ Emails   │ Jobs     │
│ 38 Ativos│ 10 Ativos│ 5 Falhas │ Rodando  │
└──────────┴──────────┴──────────┴──────────┘
```

### Seção 3: Gráficos
```
Atividade (últimas 24h)          Distribuição de Casos
 250 |    ╱╲        ╱             
 200 |   ╱  ╲      ╱   Ativos (38)
 150 |  ╱    ╲    ╱    Novos (4)
 100 | ╱      ╲  ╱     Concluídos (3)
  50 |╱        ╲╱
   0 └─────────────     
     00:00  12:00 23:00
```

---

## 🚀 Acessar Dashboard

### URL
```
https://localhost:3001/monitoring
```

### Autenticação
Login no app → Automaticamente tem acesso ao dashboard

---

## 📡 API Endpoints

### 1. GET /api/monitoring/dashboard
**Obter todas as métricas**

```bash
curl https://localhost:3000/api/monitoring/dashboard \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2026-04-20T10:30:00Z",
  "metrics": {
    "jobs": {
      "active": 3,
      "jobNames": ["weeklyClientUpdates", "deadlineAlerts", "completedCaseSummary"]
    },
    "cases": {
      "total": 45,
      "active": 38,
      "completed": 3,
      "new": 4
    },
    "clients": {
      "total": 12,
      "active": 10
    },
    "emails": {
      "sent": 234,
      "failed": 5,
      "pending": 0
    },
    "webhooks": {
      "triggered": 45,
      "processed": 43
    },
    "system": {
      "uptime": 3600000,
      "memoryUsage": {
        "rss": 145,
        "heapUsed": 65,
        "heapTotal": 120
      },
      "timestamp": "2026-04-20T10:30:00Z"
    }
  }
}
```

---

### 2. GET /api/monitoring/health
**Status de saúde**

```bash
curl https://localhost:3000/api/monitoring/health \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "health": {
    "status": "healthy",
    "checks": {
      "database": "ok",
      "jobs": "ok",
      "memoryUsage": "ok",
      "errorRate": "ok"
    },
    "message": "✅ Sistema saudável"
  }
}
```

**Status Possíveis:**
- `healthy` (✅) - Tudo OK
- `warning` (⚠️) - Atenção recomendada
- `critical` (❌) - Problemas graves

---

### 3. GET /api/monitoring/logs
**Activity logs**

```bash
curl "https://localhost:3000/api/monitoring/logs?limit=50&type=email" \
  -H "Authorization: Bearer TOKEN"
```

**Query params:**
- `limit` (default: 50, max: 500)
- `type` (opcional: email, case-update, webhook, job)

**Resposta:**
```json
{
  "success": true,
  "count": 3,
  "logs": [
    {
      "id": "1713607800000-0.123",
      "type": "email",
      "action": "Email enviado",
      "status": "success",
      "timestamp": "2026-04-20T10:30:00Z",
      "details": "to: joao@example.com"
    }
  ]
}
```

---

### 4. GET /api/monitoring/emails
**Estatísticas de email**

```bash
curl https://localhost:3000/api/monitoring/emails \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "sent": 234,
    "failed": 5,
    "today": 45,
    "last7Days": 234
  }
}
```

---

### 5. GET /api/monitoring/hourly
**Dados por hora (para gráficos)**

```bash
curl https://localhost:3000/api/monitoring/hourly \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "hour": "00:00",
      "emails": 0,
      "webhooks": 0,
      "cases": 0
    },
    {
      "hour": "09:00",
      "emails": 45,
      "webhooks": 12,
      "cases": 8
    },
    ...
  ]
}
```

---

## 🔧 Customizar Dashboard

### Adicionar novo widget

Editar `frontend/src/pages/Monitoring.tsx`:

```typescript
// Exemplo: Adicionar widget de Documentos

<div className="bg-white p-6 rounded-lg shadow">
  <p className="text-gray-600 text-sm mb-2">📄 Documentos</p>
  <p className="text-3xl font-bold text-indigo-600 mb-2">
    {metrics.documents.total}
  </p>
  <div className="text-xs text-gray-500">
    Assinados: {metrics.documents.signed}
  </div>
</div>
```

### Mudar refresh rate

Editar linha 43 em `Monitoring.tsx`:

```typescript
// De:
const interval = setInterval(loadDashboardData, 10000); // 10 segundos

// Para:
const interval = setInterval(loadDashboardData, 5000); // 5 segundos
```

---

## 📊 Métricas Monitoradas

| Métrica | O que significa | Normal |
|---------|---|---|
| **Casos Ativos** | Casos em progresso | > 0 |
| **Emails Enviados** | Total de emails | Aumenta |
| **Taxa de Erro** | % de falhas | < 5% |
| **Heap Memory** | Uso de memória | < 60% |
| **Jobs Ativos** | Agendadores rodando | 3 |
| **Uptime** | Tempo desde startup | > 1h |

---

## 🚨 Alertas e Limites

Sistema gera aviso quando:

| Condição | Ação | Status |
|----------|------|--------|
| Heap > 80% | ⚠️ Aviso | CRITICAL |
| Taxa erro > 10% | ⚠️ Aviso | CRITICAL |
| Jobs = 0 | ❌ Erro | ERROR |
| Database offline | ❌ Erro | ERROR |

---

## 📈 Interpretar Gráficos

### Atividade por Hora
- **Barra alta** = Muita atividade naquele horário
- **Padrão esperado** = Pico às 9:00 (job de atualizações)
- **Problema** = Nenhuma atividade por > 1 hora

### Distribuição de Casos
- **Gráfico balanceado** = Casos distribuídos
- **Problema** = Muitos casos concluídos com poucos novos

### Memory Usage
- **Linha reta** = Memória estável
- **Subindo continuamente** = Possível memory leak

---

## 🧹 Limpeza de Logs

Logs são automaticamente limitados a:
- Máximo: 500 entradas
- Tempo: 7 dias (configurável)

Limpar logs antigos:
```bash
# Via API (não implementado ainda)
# POST /api/monitoring/cleanup
```

---

## 📱 Responsivo

Dashboard funciona em:
- ✅ Desktop (100%)
- ✅ Tablet (90%)
- ✅ Mobile (80%)

---

## 🔐 Autenticação

Todos os endpoints requerem JWT token:

```bash
curl https://localhost:3000/api/monitoring/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## ✅ Checklist

- [ ] Backend reiniciado
- [ ] GET /api/monitoring/dashboard retorna dados
- [ ] Frontend página `/monitoring` carrega
- [ ] Gráficos aparecem
- [ ] Auto-refresh funciona (10 em 10 segundos)
- [ ] Status do sistema mostra
- [ ] KPI cards atualizam em tempo real

---

## 📚 Integração com Fases Anteriores

### Com Email Service (Fase 11)
```
Email enviado → Registra em monitoringService
→ Aparece em "Emails Enviados" + gráfico
```

### Com Scheduling (Fase 12)
```
Job executa → Registra atividade
→ Aparece em "Jobs Ativos"
```

### Com Webhooks (Fase 13)
```
Webhook processado → Registra
→ Aparece em "Webhooks Processados"
```

---

## 🚀 Próximas Melhorias

1. **Alertas em tempo real** - Email quando erro crítico
2. **Export de relatórios** - PDF, CSV
3. **Histórico** - Dados arquivados por dia
4. **Custom thresholds** - Admin pode mudar limites
5. **Webhooks de monitoramento** - Enviar dados para Slack/Discord

---

**Data:** Abril 2026  
**Status:** ✅ Dashboard Pronto  
**Atualização:** A cada 10 segundos
