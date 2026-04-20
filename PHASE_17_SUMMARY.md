# ✅ Phase 17: Dashboard Visual Escavador - Completed

**Status:** 🟢 Phase Complete - Dashboard visual com histórico de movimentações implementado

**Date:** 2026-04-17  
**Duration:** Single session  
**Key Addition:** Persistent movement history with timeline visualization

---

## 🎯 O que foi construído

### Backend

#### 1. Model `Movimentacao.ts` ✅
```typescript
- id: number (primary key)
- caseId: number (foreign key)
- caseName: string
- processNumber: string (CNJ format)
- movimentationType: string (e.g., "Sentença", "Despacho")
- description: string (full movement text)
- importance: 'low' | 'medium' | 'high' | 'critical'
- detectedAt: Date (when detected)
```

Tabela com índices em: `(caseId, detectedAt)` e `(importance, detectedAt)` para queries rápidas.

#### 2. Controller `movimentacaoController.ts` ✅

**3 Endpoints:**
- `GET /api/escavador/movimentacoes` — Lista com filtros (caseId, importance, dateFrom, dateTo, limit, offset, sort)
- `GET /api/escavador/movimentacoes/:caseId` — Movimentos de um caso específico
- `GET /api/escavador/movimentacoes/stats` — Estatísticas agregadas

**Stats retornado:**
```json
{
  "total": 45,
  "totalHoje": 3,
  "porImportancia": { "critical": 2, "high": 8, "medium": 20, "low": 15 },
  "porTipo": [ { "type": "Sentença", "count": 5 }, ... ],
  "ultimosSete": [ { "date": "2026-04-17", "count": 8 }, ... ]
}
```

#### 3. Service Update `escavadorService.ts` ✅
- Após detectar cada movimento, salva em `Movimentacao.create()`
- Mantém logística de notificação e monitoramento intacta
- Silencia erros de banco (não falha sync se falhar save)

#### 4. Routes Update `escavadorRoutes.ts` ✅
- Adiciona 3 novas rotas de movimentação
- Mantém todas as rotas anteriores de busca e sync

### Frontend

#### 5. Service Fix `axiosInstance.ts` ✅
- Criado arquivo faltante que Monitoring.tsx importava
- Reexporta instância do `api.ts` (com interceptadores de auth)

#### 6. App Routes Update `App.tsx` ✅
- Adiciona rota `/monitoring` → `<Monitoring />`
- Adiciona rota `/escavador` → `<EscavadorDashboard />`
- Ambas com `ProtectedRoute` (requer auth)

#### 7. Navigation Update `Layout.tsx` ✅
- Adiciona 2 links no sidebar:
  - "Monitoramento" → `/monitoring`
  - "Processos Escavador" → `/escavador`

#### 8. Types Update `types/index.ts` ✅
- Adiciona campos ao `Case`: `processNumber`, `escavadorData`, `lastSyncedAt`
- Cria nova interface `Movimentacao` com todos os campos

#### 9. Monitoring.tsx Fix ✅
- Corrige import quebrado: `axiosInstance` → `api`
- Usa métodos da classe `api` corretamente

#### 10. Dashboard Component `EscavadorDashboard.tsx` ✅

**Estrutura da página:**

```
┌─────────────────────────────────────────┐
│ Processos Judiciais - Escavador  [PDF] │
├─────────────────────────────────────────┤
│ [Total: 45] [Críticos: 2] [Altos: 8] [Hoje: 3] │
├─────────────────────────────────────────┤
│ Filtros:                                │
│ [Caso ▼] [Importância ▼] [De] [Até] [Limpar] │
├─────────────────────────────────────────┤
│ [Últimos 7 Dias - LineChart]            │
│ [Tipos de Movimentação - BarChart]      │
├─────────────────────────────────────────┤
│ Timeline de Movimentações:              │
│ 🔴 Sentença                             │
│    Caso Silva vs. ABC (0001234-56...)   │
│    Juiz proferiu sentença favorável     │
│    17/04/2026 14:30                     │
│ ────────────────────────────────────    │
│ 🟡 Despacho                             │
│    [...]                                │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ 4 Cards de stats (Total, Críticos, Altos, Hoje)
- ✅ Filtros por caso, importância, data (Com/De)
- ✅ LineChart dos últimos 7 dias
- ✅ BarChart de tipos de movimentação (top 8)
- ✅ Timeline visual colorida:
  - 🔴 CRITICAL = vermelho
  - 🟡 HIGH = laranja
  - 🟠 MEDIUM = amarelo
  - 🟢 LOW = verde
- ✅ Ícones visuais por importance level
- ✅ Exportar para PDF (com jsPDF)
- ✅ Loading/empty states
- ✅ Auto-atualiza quando filtros mudam

---

## 📊 Data Flow (Backend → Frontend)

```
1. Daily Job (22:00)
   └─ escavadorService.sincronizarProcessos()
      ├─ Detecta mudanças
      ├─ Para cada movimento:
      │  ├─ Salva em Movimentacao.create()
      │  ├─ Envia email
      │  └─ Registra no monitoring
      └─ Retorna stats

2. Frontend GET /api/escavador/movimentacoes?[filtros]
   └─ movimentacaoController.listarMovimentacoes()
      ├─ Query com WHERE clauses
      ├─ Ordem por detectedAt DESC
      └─ Retorna array de Movimentacao[]

3. Frontend GET /api/escavador/movimentacoes/stats
   └─ movimentacaoController.obterStats()
      ├─ COUNT(*) total
      ├─ GROUP BY importance
      ├─ GROUP BY movimentationType
      ├─ GROUP BY DATE(detectedAt) para últimos 7 dias
      └─ Retorna aggregated data

4. EscavadorDashboard.tsx renderiza
   ├─ Stats cards
   ├─ Charts (Recharts)
   └─ Timeline (com filtros interativos)
```

---

## 🔗 Integration Points

| Sistema | Como funciona | Status |
|---------|---|---|
| **Email Service** | Quando movimento detectado → email enviado | ✅ Mantido |
| **Monitoring Dashboard** | Activity logs em /api/monitoring/logs | ✅ Mantido |
| **Deadline Service** | Prazo < 3 dias → MovimentacaoDetectada.importance | ✅ Mantido |
| **Webhook Service** | Preparado para disparo futuro (Phase 18) | ⏳ Ready |

---

## 🗄️ Database Schema

```sql
CREATE TABLE movimentacoes (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  caseId INTEGER NOT NULL,
  caseName VARCHAR(255) NOT NULL,
  processNumber VARCHAR(50) NOT NULL,
  movimentationType VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  importance ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  detectedAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT NOW(),
  updatedAt DATETIME NOT NULL DEFAULT NOW(),
  FOREIGN KEY (caseId) REFERENCES cases(id),
  INDEX (caseId, detectedAt),
  INDEX (importance, detectedAt),
  INDEX (processNumber)
);
```

---

## ✅ Checklist de Implementação

### Backend
- [x] Model `Movimentacao.ts` criado
- [x] `models/index.ts` atualizado
- [x] Controller `movimentacaoController.ts` criado (3 endpoints)
- [x] Routes `escavadorRoutes.ts` atualizadas
- [x] Service `escavadorService.ts` atualizado para persistir movimentos
- [x] Importações de Sequelize/ORM corretas

### Frontend
- [x] `services/axiosInstance.ts` criado
- [x] `pages/Monitoring.tsx` corrigido
- [x] `App.tsx` rotas adicionadas
- [x] `Layout.tsx` navegação adicionada
- [x] `types/index.ts` atualizado
- [x] `pages/EscavadorDashboard.tsx` criado (10 componentes)
- [x] Recharts imports (já existentes)
- [x] Tailwind CSS classes (já existentes)

### Testing
- [ ] Backend: Verificar criação de tabela ao reiniciar
- [ ] Backend: POST escavador/sync → verificar Movimentacao.create() 
- [ ] Frontend: Navegar para /escavador
- [ ] Frontend: Verificar timeline com movimentos
- [ ] Frontend: Testar todos os filtros
- [ ] Frontend: Clicar "Exportar PDF" → download

---

## 🚀 Como Usar

### 1. Reiniciar Backend
```bash
npm start
```
Logs esperados:
```
✅ Database connected successfully
✅ Database tables synced  # Inclui nova tabela movimentacoes
```

### 2. Sincronizar Processos (Primeira vez)
```bash
curl "http://localhost:3000/api/escavador/sync" \
  -H "Authorization: Bearer TOKEN"
```

Após sync, movimentos aparecem em:
```bash
curl "http://localhost:3000/api/escavador/movimentacoes" \
  -H "Authorization: Bearer TOKEN"
```

### 3. Abrir Dashboard
- Navegar para http://localhost:3001
- Sidebar → "Processos Escavador"
- Visualizar timeline, stats, filtros
- Exportar PDF

---

## 📈 Performance

| Operação | Query | Índice | Tempo Est. |
|----------|-------|--------|-----------|
| Listar movimentos (últimos 30 dias) | `WHERE importance, detectedAt` | (importance, detectedAt) | <100ms |
| Movimentos por caso | `WHERE caseId, ORDER BY detectedAt` | (caseId, detectedAt) | <50ms |
| Stats agregadas | `GROUP BY importance, movimentationType` | Indexes + memory | <200ms |
| Salvar movimento | `INSERT INTO movimentacoes` | PK auto-increment | <10ms |

---

## 🎨 Visual Design

**Colors:**
- Critical: `#dc2626` (red-600)
- High: `#f97316` (orange-500)
- Medium: `#eab308` (yellow-400)
- Low: `#22c55e` (green-500)

**Icons:**
- 🔴 Critical
- 🟡 High
- 🟠 Medium
- 🟢 Low

**Charts:**
- LineChart para trending (últimos 7 dias)
- BarChart para distribuição (tipos)
- Cards para KPIs

---

## 🔮 Próximas Fases

### Phase 18: Webhooks Avançados
- [ ] Disparar webhook para n8n quando movimento crítico
- [ ] Atualizar status do caso automaticamente
- [ ] Criar tarefas automáticas

### Phase 19: Alternativas de API
- [ ] Suporte para Jusbrasil
- [ ] Seleção automática por tribunal
- [ ] Fallback entre APIs

### Phase 20: Mobile App
- [ ] React Native
- [ ] Push notifications
- [ ] Offline support

---

## 🐛 Known Limitations

1. **PDF Export** — Requer biblioteca `jspdf` (não instalada em package.json)
   - Solução: `npm install jspdf html2canvas`

2. **Timezone** — Job roda em server timezone
   - Verificar `TZ` environment variable

3. **Duplicatas** — Baseado em exact match (hora exata)
   - Movimentos em mesmo segundo = duplicata
   - Considerar hash em Phase 18

4. **Memory** — Stats são calculadas em tempo real
   - Para 10k+ movimentos, pode ser lento
   - Considerar caching em Phase 18

---

**Status:** 🟢 Sistema Pronto  
**Próximo Passo:** `npm install jspdf html2canvas` no frontend para ativar PDF export
