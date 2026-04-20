# 🧪 Guia de Testes - Escavador Integration

---

## 1️⃣ Pré-requisitos

```bash
# 1. Backend rodando
npm start

# 2. Token JWT válido (obter em /api/auth/login)
TOKEN="seu_jwt_token_aqui"

# 3. Variável de ambiente configurada
ESCAVADOR_API_KEY=seu_token_escavador

# 4. Casos criados no banco com processNumber
# Exemplo: Case.processNumber = "0001234-56.2024.1.01.0001"
```

---

## 2️⃣ Teste 1: Health Check

**Objetivo:** Verificar se Escavador está configurado

```bash
curl "http://localhost:3000/api/escavador/health" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada (200):**
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

**Se falhar (configuração não encontrada):**
```json
{
  "success": true,
  "escavador": {
    "configured": false,
    "status": "not configured"
  }
}
```

✅ **Status:** Health check OK - seguir para Teste 2

---

## 3️⃣ Teste 2: Buscar Processo

**Objetivo:** Buscar um processo específico no Escavador

### Exemplo 1: Processo válido

```bash
# Substitua pelo número real de um processo
curl "http://localhost:3000/api/escavador/processo/0001234-56.2024.1.01.0001" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada (200):**
```json
{
  "success": true,
  "timestamp": "2026-04-17T22:15:00Z",
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
    "jurisprudencia": ["Súmula 123"]
  }
}
```

### Exemplo 2: Processo não encontrado

```bash
curl "http://localhost:3000/api/escavador/processo/9999999-99.9999.9.99.9999" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada (404):**
```json
{
  "success": false,
  "message": "Processo 9999999-99.9999.9.99.9999 não encontrado no Escavador"
}
```

### Exemplo 3: Número inválido

```bash
curl "http://localhost:3000/api/escavador/processo/" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada (400):**
```json
{
  "error": "Process number is required"
}
```

✅ **Status:** Busca OK - seguir para Teste 3

---

## 4️⃣ Teste 3: Sincronizar Caso Específico

**Objetivo:** Sincronizar um caso com os dados do Escavador

### Setup: Criar caso com processNumber

```bash
# 1. Login
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@example.com",
    "password": "sua_senha"
  }'

# Copiar token da resposta e usar abaixo

# 2. Criar caso
curl -X POST "http://localhost:3000/api/cases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "title": "Silva vs. ABC",
    "description": "Ação de família",
    "processNumber": "0001234-56.2024.1.01.0001",
    "status": "active"
  }'
```

### Executar teste

```bash
# Sincronizar caso ID 1
curl "http://localhost:3000/api/escavador/sync/1" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada (200):**
```json
{
  "success": true,
  "timestamp": "2026-04-17T22:15:00Z",
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

**Verificar banco de dados:**
```sql
SELECT id, title, escavadorData, lastSyncedAt 
FROM cases 
WHERE id = 1;
```

**Resultado esperado:**
- `escavadorData` = JSON com dados do processo
- `lastSyncedAt` = timestamp da sincronização

✅ **Status:** Sincronização OK - seguir para Teste 4

---

## 5️⃣ Teste 4: Verificar Status de Sincronização

**Objetivo:** Obter data da última sincronização

```bash
curl "http://localhost:3000/api/escavador/status/1" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada (200):**
```json
{
  "success": true,
  "timestamp": "2026-04-17T22:15:00Z",
  "caseId": 1,
  "status": {
    "lastSync": "2026-04-17T22:15:00Z",
    "synced": true,
    "daysSinceSync": 0
  }
}
```

**Se nunca foi sincronizado:**
```json
{
  "success": true,
  "caseId": 1,
  "status": {
    "synced": false
  }
}
```

✅ **Status:** Status OK - seguir para Teste 5

---

## 6️⃣ Teste 5: Sincronizar Todos os Casos

**Objetivo:** Sincronizar todos os casos ativos de uma vez

```bash
curl "http://localhost:3000/api/escavador/sync" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada (200):**
```json
{
  "success": true,
  "timestamp": "2026-04-17T22:15:00Z",
  "message": "Sincronização concluída: 3 sincronizados, 1 com atualizações, 0 erros",
  "resultado": {
    "sincronizados": 3,
    "comAtualizacoes": 1,
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
      }
    ]
  }
}
```

**O que verificar nos logs:**
```
📂 [ESCAVADOR] Iniciando sincronização de processos...
🔍 Buscando processo 0001234-56.2024.1.01.0001 no Escavador...
✅ Processo encontrado: TJ SP
📬 1 atualização(ões) detectada(s) para 0001234-56.2024.1.01.0001
✅ Notificação enviada para cliente@example.com
✅ [ESCAVADOR] Sincronização concluída: 3 sincronizados, 1 com atualizações, 0 erros
```

✅ **Status:** Sincronização em massa OK - seguir para Teste 6

---

## 7️⃣ Teste 6: Verificar Notificações por Email

**Objetivo:** Confirmar que emails são enviados quando há mudanças

### Setup

```bash
# Criar caso com processNumber válido
curl -X POST "http://localhost:3000/api/cases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "title": "Novo Processo",
    "description": "Teste de notificação",
    "processNumber": "0001234-56.2024.1.01.0001",
    "status": "active"
  }'

# Sincronizar
curl "http://localhost:3000/api/escavador/sync/2" \
  -H "Authorization: Bearer $TOKEN"
```

**Verificar email recebido:**
```
Para: cliente@example.com
Assunto: 🔴 Atualização: Novo Processo
Conteúdo: 
  - Tipo: Despacho
  - Descrição: Juiz ordenou...
  - Data: 17 de Abril de 2026
  - Link: https://legal-hub.com
```

**Se é email crítico (dias <= 1):**
```
Assunto: 🚨 Atualização: Novo Processo
Corpo: ⚠️ ATENÇÃO: Esta é uma movimentação importante que requer sua ação!
```

✅ **Status:** Notificações OK - seguir para Teste 7

---

## 8️⃣ Teste 7: Verificar Job Automático

**Objetivo:** Confirmar que o job de sincronização está rodando

### Verificar job registrado

```bash
curl "http://localhost:3000/api/scheduling/info" \
  -H "Authorization: Bearer $TOKEN"
```

**Deve conter:**
```json
{
  "jobs": [
    "weeklyClientUpdates",
    "deadlineAlerts",
    "completedCaseSummary",
    "realtimeDeadlineMonitoring",
    "escavadorSync"  // ✅ Deve aparecer aqui
  ]
}
```

### Verificar logs a cada 22:00

```
22:00:00 🔄 [JOB] Iniciando sincronização com Escavador...
22:00:15 🔍 Buscando processo...
22:00:30 ✅ [JOB] Escavador sync concluído: X sincronizados, Y com atualizações, Z erros
```

**Ao adicionar novo caso:**
1. Criar caso com processNumber
2. Aguardar até 22:00
3. Job roda automaticamente
4. Verificar logs de execução
5. Confirmar sincronização no banco

✅ **Status:** Job OK - seguir para Teste 8

---

## 9️⃣ Teste 8: Detecção de Mudanças

**Objetivo:** Validar que mudanças são detectadas corretamente

### Scenario: Status muda

```bash
# Antes: Case.status = "em andamento"
# Depois: Escavador retorna status = "concluído"

curl "http://localhost:3000/api/escavador/sync/1" \
  -H "Authorization: Bearer $TOKEN"
```

**Email enviado deve conter:**
```
Tipo: Status Change
Descrição: Status alterado de "em andamento" para "concluído"
Importância: 🟡 HIGH
```

### Scenario: Prazo crítico

```bash
# Escavador retorna prazo com diasRestantes = 2

curl "http://localhost:3000/api/escavador/sync/1" \
  -H "Authorization: Bearer $TOKEN"
```

**Email enviado deve conter:**
```
Tipo: Deadline Alert
Descrição: ⚠️ [tipo prazo] vence em 2 dias
Importância: 🔴 HIGH (2 dias) ou 🚨 CRITICAL (1 dia)
```

### Scenario: Movimentação crítica

```bash
# Escavador retorna: ultimaMovimentacao.tipo = "Sentença"

curl "http://localhost:3000/api/escavador/sync/1" \
  -H "Authorization: Bearer $TOKEN"
```

**Email enviado deve conter:**
```
Tipo: Sentença
Descrição: [descricao da sentença]
Importância: 🚨 CRITICAL
```

✅ **Status:** Detecção OK - todos os testes passando!

---

## 🔟 Teste 9: Error Handling

**Objetivo:** Validar tratamento de erros

### Erro 1: API Key inválida

```bash
# Remover ESCAVADOR_API_KEY do .env temporariamente
# Reiniciar servidor

curl "http://localhost:3000/api/escavador/health" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada:**
```json
{
  "escavador": {
    "configured": false,
    "status": "not configured"
  }
}
```

### Erro 2: Caso sem processNumber

```bash
# Criar caso SEM processNumber
curl -X POST "http://localhost:3000/api/cases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "title": "Sem Processo",
    "description": "Sem número",
    "status": "active"
    // processNumber omitido
  }'

# Sincronizar todos
curl "http://localhost:3000/api/escavador/sync" \
  -H "Authorization: Bearer $TOKEN"
```

**Logs esperados:**
```
⚠️ Caso 5 sem número de processo
(não faz requisição ao Escavador, segue para próximo)
```

### Erro 3: Caso não encontrado

```bash
curl "http://localhost:3000/api/escavador/sync/99999" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada (404):**
```json
{
  "error": "Case 99999 not found"
}
```

### Erro 4: Timeout de API

```bash
# Se Escavador está offline/lento
curl "http://localhost:3000/api/escavador/sync" \
  -H "Authorization: Bearer $TOKEN"

# Timeout esperado: 10 segundos (configurado no axios)
```

**Logs esperados:**
```
❌ Erro ao sincronizar caso X: RequestError
❌ [ESCAVADOR] Sincronização concluída: 5 sincronizados, 0 com atualizações, 1 erro
```

✅ **Status:** Error handling OK

---

## 📊 Teste 10: Monitoramento

**Objetivo:** Verificar se atividades aparecem no monitoring

```bash
# Verificar logs de Escavador
curl "http://localhost:3000/api/monitoring/logs?type=case-update" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta esperada:**
```json
{
  "logs": [
    {
      "timestamp": "2026-04-17T22:15:00Z",
      "type": "case-update",
      "action": "Status Change: Status alterado...",
      "status": "success",
      "details": "Processo 0001234-56.2024.1.01.0001"
    }
  ]
}
```

✅ **Status:** Monitoramento OK

---

## ✅ Checklist Final

- [ ] Health check retorna "ready"
- [ ] Buscar processo retorna dados válidos
- [ ] Sincronizar caso específico funciona
- [ ] Status mostra última sincronização
- [ ] Sincronizar todos funciona com múltiplos casos
- [ ] Emails são enviados em caso de mudanças
- [ ] Job está registrado em /api/scheduling/info
- [ ] Job executa automaticamente às 22:00
- [ ] Mudanças de status são detectadas
- [ ] Prazos críticos são detectados
- [ ] Movimentações críticas são detectadas
- [ ] Erros são tratados graciosamente
- [ ] Atividades aparecem no monitoring
- [ ] Logs mostram execução do job

---

## 🚀 Próximos Passos

1. ✅ Testes manuais concluídos
2. [ ] Testes automatizados (Jest/Supertest)
3. [ ] Load testing (100+ casos)
4. [ ] Teste de falha de API
5. [ ] Teste de sincronização incremental
6. [ ] Integração com CI/CD

---

**Status:** Testes Prontos  
**Última Atualização:** 2026-04-17  
**Versão:** 1.0
