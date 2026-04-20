# 📅 Monitoramento Avançado de Prazos

**Status:** ✅ Sistema completo de monitoramento em tempo real

---

## 🎯 O que você tem agora

### Automação em 3 Camadas:

**1️⃣ REAL-TIME (a cada 6 horas)**
```
⏰ 00:00, 06:00, 12:00, 18:00
  ├─ Busca prazos críticos (próximas 48h)
  ├─ Busca prazos vencidos
  └─ Envia alertas automáticos
```

**2️⃣ DIÁRIA (8:00 AM)**
```
Busca todos os prazos dos próximos 7 dias
Envia alertas por email
```

**3️⃣ DASHBOARD (tempo real)**
```
GET /api/deadlines
Visualizar todos os prazos com filtros
```

---

## 📡 API Endpoints

### 1. GET /api/deadlines
**Prazos próximos (padrão: 30 dias)**

```bash
curl "https://localhost:3000/api/deadlines?days=30" \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "count": 5,
  "deadlines": [
    {
      "caseId": 1,
      "caseName": "Silva vs. ABC",
      "caseNumber": "PROC-2024-001",
      "deadline": "2026-04-25T00:00:00Z",
      "daysRemaining": 8,
      "urgencyLevel": "orange",
      "clientName": "João Silva",
      "clientEmail": "joao@example.com",
      "actionRequired": "Vence em 8 dias",
      "requiresAction": true
    }
  ]
}
```

**urgencyLevel:**
- 🟢 `green` - Normal (> 7 dias)
- 🟡 `orange` - Atenção (7-3 dias)
- 🔴 `red` - Urgente (3-1 dias)
- 🚨 `critical` - Crítico (< 1 dia ou vencido)

---

### 2. GET /api/deadlines/critical
**Prazos críticos (próximas 48 horas)**

```bash
curl "https://localhost:3000/api/deadlines/critical" \
  -H "Authorization: Bearer TOKEN"
```

⚠️ **Use para alertas urgentes**

---

### 3. GET /api/deadlines/overdue
**Prazos vencidos**

```bash
curl "https://localhost:3000/api/deadlines/overdue" \
  -H "Authorization: Bearer TOKEN"
```

🚨 **Use para ações corretivas**

---

### 4. GET /api/deadlines/stats
**Estatísticas gerais**

```bash
curl "https://localhost:3000/api/deadlines/stats" \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "total": 45,
    "overdue": 2,
    "critical": 3,
    "warning": 8,
    "normal": 32,
    "completionRate": 78
  }
}
```

---

### 5. GET /api/deadlines/timeline
**Timeline para gráfico (3 meses)**

```bash
curl "https://localhost:3000/api/deadlines/timeline?months=3" \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-04-25",
      "count": 2,
      "cases": [
        { "id": 1, "name": "Silva vs. ABC" },
        { "id": 2, "name": "Processo Trabalhista" }
      ]
    }
  ]
}
```

---

### 6. POST /api/deadlines/send-alerts
**Enviar alertas manualmente**

```bash
curl -X POST "https://localhost:3000/api/deadlines/send-alerts" \
  -H "Authorization: Bearer TOKEN"
```

📧 **Dispara alertas de email imediatamente**

---

## 🔴 Sistema de Cores por Urgência

| Dias | Cor | Ação | Email |
|-----|-----|------|-------|
| < 0 | 🚨 Critical | IMEDIATO | Cada 6h |
| 0 | 🚨 Critical | IMEDIATO | Cada 6h |
| 1 | 🔴 Red | HOJE | Cada 6h |
| 2-3 | 🔴 Red | HOJE | Cada 6h |
| 4-7 | 🟡 Orange | Esta semana | 1x por dia |
| 8-14 | 🟡 Orange | Esta semana | 1x por semana |
| > 14 | 🟢 Green | Monitorar | Sob demanda |

---

## ⏰ Automação de Alertas

### Job 1: Real-Time Deadline Monitoring
**Rodando:** A cada 6 horas (00:00, 06:00, 12:00, 18:00)

```
Se prazos críticos encontrados → Email imediato
Se prazos vencidos encontrados → Alerta urgente
```

### Job 2: Daily Deadline Alerts
**Rodando:** Diariamente às 8:00 AM

```
Busca prazos dos próximos 7 dias
Envia email com resumo
```

### Job 3: Email Customizado
```
Subject: ⚠️ ALERTA: Prazo próximo - {caseName}
Body: 
  - Caso e número do processo
  - Prazo exato
  - Dias restantes
  - Ação recomendada
  - Link para acessar caso
```

---

## 📊 Exemplo: Como Funciona

**Cenário: Prazo com 3 dias restantes**

```
Sexta 8:00 AM (Job diário):
  → Detecta prazo com 3 dias
  → Envia email: "Atenção! Prazo em 3 dias"
  
Sábado 6:00 AM (Job real-time):
  → Detecta prazo com 2 dias
  → Envia email: "Urgente! Prazo em 2 dias"
  
Domingo 00:00 (Job real-time):
  → Detecta prazo com 1 dia
  → Envia email: "CRÍTICO! Prazo amanhã"
  
Segunda 6:00 AM (ÚLTIMA):
  → Detecta: "Vence HOJE"
  → Email com ações recomendadas
```

---

## 🔧 Integração com Componentes

### Com Email Service (Fase 11)
```
Prazos detectados → emailService.sendSimpleEmail()
```

### Com Monitoring Dashboard (Fase 14)
```
GET /api/deadlines/stats → KPI cards
GET /api/deadlines/timeline → Gráfico
```

### Com Google Calendar (Fase 9)
```
Prazos → Google Calendar events
Reminders sincronizados
```

### Com n8n Webhooks (Fase 13)
```
POST /api/webhooks/n8n-action
{
  "action": "update-case-status",
  "payload": { "caseId": 1, "status": "completed" }
}
```

---

## 💡 Best Practices

### 1. Revisar Prazos Diariamente
```bash
curl "https://localhost:3000/api/deadlines/critical"
```

### 2. Usar Cores para Prioridade
- 🟢 Green: Revisar quando tiver tempo
- 🟡 Orange: Iniciar ações esta semana
- 🔴 Red: Ações hoje
- 🚨 Critical: Máxima prioridade

### 3. Criar Alertas Customizados
No n8n:
```
Se prazo < 3 dias → Notificar no Slack
Se prazo < 1 dia → SMS (opcional)
Se prazo vencido → Escalate manager
```

### 4. Manter Atualizado
```
Sempre atualizar prazo quando:
  - Juiz marcou nova audiência
  - Cliente pediu extensão
  - Processo foi resolvido
```

---

## 📈 Métricas Úteis

### Via Dashboard
```
GET /api/deadlines/stats
```

Mostra:
- Total de prazos
- Quantos vencidos
- Quantos críticos
- Taxa de conclusão

### Criar Relatório
```bash
# Prazos próximos 60 dias
curl "https://localhost:3000/api/deadlines?days=60"

# Exportar para Excel/CSV
# (Implementar em Fase 16)
```

---

## 🚨 Ações Recomendadas por Urgência

### 🟢 Green (> 7 dias)
- [ ] Revisar documentação
- [ ] Validar com cliente
- [ ] Planejar próximos passos

### 🟡 Orange (4-7 dias)
- [ ] Preparar documentos
- [ ] Contatar cliente
- [ ] Revisar com advogado

### 🔴 Red (1-3 dias)
- [ ] AÇÃO IMEDIATA
- [ ] Contato direto cliente
- [ ] Finalizar documentação

### 🚨 Critical (< 1 dia)
- [ ] MÁXIMA PRIORIDADE
- [ ] Contato urgente cliente
- [ ] Escalate supervisão
- [ ] Documentar cada passo

---

## ✅ Checklist

- [ ] Backend reiniciado
- [ ] GET /api/deadlines retorna dados
- [ ] GET /api/deadlines/critical funciona
- [ ] GET /api/deadlines/stats mostra métricas
- [ ] Jobs aparecendo nos logs (6h, 8h, 12h, 18h, 00h)
- [ ] Emails sendo enviados quando crítico
- [ ] Dashboard mostrando prazos

---

## 📚 Próximos Passos

### Integração Completa
1. ✅ Monitoramento de prazos
2. ⏭️ Alertas SMS (opcional)
3. ⏭️ Integração Slack (opcional)
4. ⏭️ Dashboard visual (criar página)

### Automação Avançada
1. Webhook para n8n quando prazo vence
2. Criação automática de tarefas
3. Lembretes no Google Calendar
4. Relatórios semanais

---

**Status:** 🟢 Sistema Pronto  
**Atualização:** Real-time (a cada 6h) + diária (8h)  
**Alertas:** Via Email + Dashboard + API
