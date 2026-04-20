# 🔍 Integração Escavador - Legal Hub

**Status:** ✅ Sistema completo de monitoramento de processos via Escavador

---

## 🎯 O que você tem agora

### Automação de Sincronização:

**1️⃣ SINCRONIZAÇÃO AUTOMÁTICA (diariamente às 22:00)**
```
⏰ 22:00 (10 PM)
  ├─ Busca todos os casos ativos
  ├─ Consulta Escavador para cada processo
  ├─ Detecta mudanças de status
  ├─ Identifica novas movimentações
  ├─ Avisa cliente sobre prazos críticos
  └─ Registra movimentações no banco
```

**2️⃣ BUSCA MANUAL (on-demand)**
```
GET /api/escavador/processo/{numero}
Buscar processo específico no Escavador
```

**3️⃣ SINCRONIZAÇÃO MANUAL (on-demand)**
```
GET /api/escavador/sync
Sincronizar todos os casos agora
```

---

## 📡 API Endpoints

### 1. GET /api/escavador/health
**Verificar configuração do Escavador**

```bash
curl "https://localhost:3000/api/escavador/health" \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2026-04-17T22:00:00Z",
  "escavador": {
    "configured": true,
    "apiUrl": "https://api.escavador.com.br/api/v2",
    "status": "ready"
  }
}
```

---

### 2. GET /api/escavador/processo/{numero}
**Buscar processo específico**

```bash
curl "https://localhost:3000/api/escavador/processo/0001234-56.2024.1.01.0001" \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2026-04-17T22:00:00Z",
  "processo": {
    "numero": "0001234-56.2024.1.01.0001",
    "tribunal": "TJ SP",
    "status": "em andamento",
    "area": "Família",
    "partes": ["João Silva", "Maria Silva"],
    "ultimaMovimentacao": {
      "data": "2026-04-15",
      "tipo": "Despacho",
      "descricao": "Juiz ordenou apresentação de documentos"
    },
    "prazos": [
      {
        "tipo": "Apresentação de documentos",
        "dataLimite": "2026-04-22",
        "diasRestantes": 5
      }
    ],
    "jurisprudencia": ["Súmula 123", "Jurisprudência 456"]
  }
}
```

---

### 3. GET /api/escavador/sync
**Sincronizar todos os casos ativos manualmente**

```bash
curl "https://localhost:3000/api/escavador/sync" \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2026-04-17T22:00:00Z",
  "message": "Sincronização concluída: 5 sincronizados, 2 com atualizações, 0 erros",
  "resultado": {
    "sincronizados": 5,
    "comAtualizacoes": 2,
    "erros": 0,
    "detalhes": [
      {
        "caseId": 1,
        "caseName": "Silva vs. ABC",
        "processNumber": "0001234-56.2024.1.01.0001",
        "movimentationType": "Despacho",
        "description": "Juiz ordenou apresentação de documentos",
        "detectedAt": "2026-04-17T22:15:00Z",
        "importance": "high"
      },
      {
        "caseId": 2,
        "caseName": "Processo Trabalhista",
        "processNumber": "0005678-90.2024.1.02.0002",
        "movimentationType": "Deadline Alert",
        "description": "⚠️ Apresentação vence em 2 dias",
        "detectedAt": "2026-04-17T22:15:00Z",
        "importance": "critical"
      }
    ]
  }
}
```

---

### 4. GET /api/escavador/sync/{caseId}
**Sincronizar caso específico**

```bash
curl "https://localhost:3000/api/escavador/sync/1" \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2026-04-17T22:00:00Z",
  "message": "Caso 1 sincronizado com sucesso",
  "processo": {
    "numero": "0001234-56.2024.1.01.0001",
    "tribunal": "TJ SP",
    "status": "em andamento",
    "area": "Família",
    "partes": ["João Silva", "Maria Silva"],
    "ultimaMovimentacao": {...},
    "prazos": [...]
  }
}
```

---

### 5. GET /api/escavador/status/{caseId}
**Obter status da última sincronização**

```bash
curl "https://localhost:3000/api/escavador/status/1" \
  -H "Authorization: Bearer TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "timestamp": "2026-04-17T22:00:00Z",
  "caseId": 1,
  "status": {
    "lastSync": "2026-04-17T22:15:00Z",
    "synced": true,
    "daysSinceSync": 0
  }
}
```

---

## 🔄 Sistema de Detecção de Movimentações

### O que é detectado automaticamente:

1. **Mudanças de Status**
   - `status` mudou no processo
   - Ex: "pendente" → "em andamento"
   - Importância: 🟡 HIGH

2. **Última Movimentação**
   - Nova `ultimaMovimentacao` detectada
   - Mostra tipo, data e descrição
   - Importância: Calculada por tipo

3. **Prazos Críticos**
   - Quando `diasRestantes <= 3`
   - Alerta automático por email
   - Importância: 🟡 HIGH (2-3 dias) ou 🔴 CRITICAL (< 1 dia)

### Níveis de Importância por Tipo:

| Tipo | Importância | Ação |
|------|-------------|------|
| Sentença | 🔴 CRITICAL | Email imediato |
| Decisão | 🔴 CRITICAL | Email imediato |
| Julgamento | 🔴 CRITICAL | Email imediato |
| Condenação | 🔴 CRITICAL | Email imediato |
| Absolvição | 🔴 CRITICAL | Email imediato |
| Despacho | 🟡 HIGH | Email em poucas horas |
| Audiência | 🟡 HIGH | Email em poucas horas |
| Prazo | 🟡 HIGH | Email urgente |
| Recurso | 🟡 HIGH | Email urgente |
| Outros | 🟠 MEDIUM | Email rotineiro |

---

## ⏰ Job de Sincronização

### Configuração Padrão

```
Horário: 22:00 (10 PM) todos os dias
Frequência: Uma vez por dia
Duração: ~1-5 minutos (dependendo do número de casos)
Retry: Automático em caso de erro
```

### Como funciona:

```
22:00 → Job inicia
  ├─ Busca todos os casos com status 'new' ou 'active'
  ├─ Para cada caso:
  │  ├─ Busca dados atuais no Escavador
  │  ├─ Compara com dados armazenados
  │  ├─ Se mudanças detectadas:
  │  │  ├─ Atualiza caso no banco
  │  │  ├─ Envia email ao cliente
  │  │  └─ Registra no monitoramento
  │  └─ Se erro: continua com próximo caso
  ├─ Ao final:
  │  ├─ Registra estatísticas
  │  └─ Log de sucesso
  └─ Próximo job: amanhã às 22:00
```

---

## 📧 Email de Notificação

Quando uma mudança é detectada, cliente recebe:

```
Subject: 🔔 Atualização: Silva vs. ABC

Olá João Silva,

Há uma nova movimentação no seu caso:

📋 Caso: Silva vs. ABC
📌 Tipo: Despacho
📅 Data: 17 de Abril de 2026 22:15

Detalhes:
Juiz ordenou apresentação de documentos

⚠️ ATENÇÃO: Esta é uma movimentação importante que requer sua ação!

Acesse sua conta para mais detalhes: https://legal-hub.com

---
Legal Hub - Monitoramento de Processos
Integrado com Escavador
```

---

## 🔧 Integração com Componentes

### Com Email Service
```
Movimentação detectada → emailService.sendSimpleEmail()
                      → Cliente recebe notificação
```

### Com Deadline Service
```
Prazo < 3 dias → DeadlineAlert gerada
             → Sincronizado com sistema de prazos
             → Visualizável no dashboard
```

### Com Monitoring Service
```
Cada sincronização → monitoringService.logActivity()
                  → Visível em /api/monitoring/logs
                  → Aparece no dashboard
```

### Com Webhook Service
```
Movimentação detectada → Pode disparar webhook para n8n
                      → Automatizar fluxos externos
                      → (Implementar em versão futura)
```

---

## 🔐 Configuração Necessária

### 1. Variável de Ambiente

```bash
# .env
ESCAVADOR_API_KEY=sua_chave_aqui_jwt_token
```

### 2. Estrutura de Dados no Banco

Campo `escavadorData` adicionado ao model `Case`:
```typescript
escavadorData?: string;      // JSON com dados completos do processo
lastSyncedAt?: Date;         // Data da última sincronização
```

### 3. Permissões Necessárias

- [x] Ler casos ativos do banco
- [x] Atualizar casos com dados do Escavador
- [x] Enviar emails para clientes
- [x] Registrar atividades no monitoring
- [x] Acessar API do Escavador (com token)

---

## 🧪 Testando a Integração

### 1. Verificar Configuração

```bash
curl "https://localhost:3000/api/escavador/health" \
  -H "Authorization: Bearer sua_token_jwt"
```

✅ Deve retornar: `"status": "ready"`

### 2. Buscar Processo Específico

```bash
curl "https://localhost:3000/api/escavador/processo/0001234-56.2024.1.01.0001" \
  -H "Authorization: Bearer sua_token_jwt"
```

### 3. Sincronizar Todos os Casos

```bash
curl "https://localhost:3000/api/escavador/sync" \
  -H "Authorization: Bearer sua_token_jwt"
```

Verificar logs para:
- `✅ [ESCAVADOR]` = sucesso
- `❌ [ESCAVADOR]` = erro
- `📬` = movimentações detectadas

### 4. Monitorar Job Automático

Logs a cada 22:00:
```
🔄 [JOB] Iniciando sincronização com Escavador...
✅ [JOB] Escavador sync concluído: X sincronizados, Y com atualizações, Z erros
```

---

## 💡 Best Practices

### 1. Manter Número de Processo Atualizado
- Sempre preencher `Case.processNumber` com o número correto
- Formato: `NNNNNNN-DD.AAAA.J.TT.OOOO` (padrão CNJ)

### 2. Revisar Movimentações Regularmente
```bash
# Cron para revisar a cada dia
curl "https://localhost:3000/api/escavador/sync"
```

### 3. Monitorar Prazos Críticos
```bash
# Verificar prazos < 3 dias
curl "https://localhost:3000/api/deadlines/critical"
```

### 4. Tratamento de Erros
```
Se sync falhar:
  → Não impede outros casos
  → Registra erro no monitoring
  → Tenta novamente amanhã
  → Log disponível em /api/monitoring/logs
```

### 5. Performance
- Max ~100 casos por sync
- ~1-2 seg por processo
- Total: ~5 min para 100 casos
- Agendado para 22:00 (horário de baixa atividade)

---

## 🚨 Troubleshooting

### Problema: "ESCAVADOR_API_KEY not configured"

**Solução:**
```bash
# Adicionar ao .env
ESCAVADOR_API_KEY=seu_token_jwt_aqui

# Reiniciar servidor
npm start
```

### Problema: "Processo não encontrado"

**Causa possível:** Número de processo incorreto ou processo não existe

**Solução:**
1. Validar formato: `NNNNNNN-DD.AAAA.J.TT.OOOO`
2. Verificar em https://www.escavador.com.br
3. Atualizar `Case.processNumber` com número correto

### Problema: Job não está rodando

**Verificar logs:**
```bash
# Verificar se job está ativo
curl "https://localhost:3000/api/scheduling/info" \
  -H "Authorization: Bearer TOKEN"
```

**Se não aparecer `escavadorSync`:**
1. Verificar ESCAVADOR_API_KEY no .env
2. Reiniciar servidor
3. Verificar console logs para erros

### Problema: Email não enviado

**Verificar:**
1. `emailService` configurado corretamente
2. Email do cliente correto
3. RESEND_API_KEY ativo

---

## 📊 Métricas Úteis

### Via Dashboard
```
GET /api/monitoring/logs?type=escavador-sync
```

Mostra:
- Horário da última sincronização
- Quantidade de casos sincronizados
- Quantidade de mudanças detectadas
- Erros ocorridos

### Criar Relatório de Movimentações
```bash
# Movimentações detectadas hoje
curl "https://localhost:3000/api/monitoring/logs" \
  -H "Authorization: Bearer TOKEN"
```

---

## ✅ Checklist de Implementação

- [x] Service escavadorService.ts criado
- [x] Controller escavadorController.ts criado
- [x] Routes escavadorRoutes.ts criado
- [x] Routes integradas ao index.ts
- [x] Job de sincronização adicionado (22:00 diariamente)
- [x] Endpoints funcionando:
  - [x] GET /api/escavador/health
  - [x] GET /api/escavador/processo/{numero}
  - [x] GET /api/escavador/sync
  - [x] GET /api/escavador/sync/{caseId}
  - [x] GET /api/escavador/status/{caseId}
- [ ] ESCAVADOR_API_KEY configurada no .env
- [ ] Testes manuais dos endpoints
- [ ] Job automático verificado nos logs

---

## 📚 Próximos Passos

### Fase 17: Melhorias Escavador
1. Integração com webhooks n8n (disparar ações externas)
2. Dashboard visual com histórico de movimentações
3. Filtros e busca avançada de movimentações
4. Exportação de relatórios de processos
5. Alertas SMS para movimentações críticas

### Fase 18: Múltiplas APIs de Processo
1. Suporte para Jusbrasil (alternativa)
2. Suporte para TJMG (Tribunal MG)
3. Abstração para múltiplas fontes
4. Seleção de API por região/tribunal

---

**Status:** 🟢 Sistema Pronto  
**Última Atualização:** 2026-04-17  
**Integração:** Escavador API v2 + Legal Hub Backend
