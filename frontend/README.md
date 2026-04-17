# Legal Hub Frontend

**React 18 + TypeScript + Tailwind CSS**

Interface web moderna para gerenciar leads, clientes, casos e documentos jurídicos.

---

## 🚀 Setup

### 1️⃣ Instalar dependências
```bash
npm install
```

### 2️⃣ Configurar variáveis de ambiente
```bash
cp .env.example .env
# Editar .env conforme necessário
```

### 3️⃣ Iniciar o servidor
```bash
npm start
```

O aplicativo estará disponível em `http://localhost:3001`

---

## 📋 Estrutura

```
src/
├── components/      # Componentes reutilizáveis (Layout, Card, etc)
├── pages/           # Páginas principais (Login, Dashboard, Leads, etc)
├── services/        # Serviço de API (axios + interceptors)
├── store/           # Estado global (Zustand)
├── types/           # Tipos TypeScript
├── utils/           # Utilidades
├── hooks/           # React Hooks customizados
├── assets/          # Imagens, ícones
├── App.tsx          # Roteamento principal
├── index.tsx        # Entrada da aplicação
└── index.css        # Estilos globais (Tailwind)
```

---

## 🎨 Componentes Principais

### Layout
- Sidebar de navegação
- Top bar
- Sistema de menu
- Logout button

### Card
- Container reutilizável
- CardHeader, CardBody, CardFooter

### Páginas
- **Login**: Autenticação com JWT
- **Dashboard**: Visão geral de leads e estatísticas
- **Leads**: CRUD de leads com filtros
- **Clients**: Gestão de clientes (em desenvolvimento)
- **Cases**: Gestão de casos (em desenvolvimento)
- **Documents**: Gestão de documentos (em desenvolvimento)

---

## 🔐 Autenticação

### Sistema JWT
- Token armazenado no localStorage
- Interceptor automático de erros 401
- Redirect para login se token expirar

### Zustand Store
```typescript
const { user, token, login, logout } = useAuthStore();
```

---

## 🛠️ Serviço de API

Centralizado em `src/services/api.ts`:

```typescript
// Leads
await api.getLeads(page, limit, status, legalArea)
await api.createLead(leadData)
await api.getLeadById(id)
await api.updateLead(id, updates)
await api.convertLeadToClient(id, clientData)

// Clients
await api.getClients(page, limit)
await api.createClient(clientData)
await api.getClientById(id)

// Cases
await api.getCases(page, limit)
await api.createCase(caseData)

// Documents
await api.getDocuments(clientId)
```

---

## 📦 Dependências

- **react**: UI library
- **react-router-dom**: Roteamento
- **axios**: HTTP client
- **zustand**: State management
- **tailwindcss**: Utility-first CSS
- **@heroicons/react**: Ícones SVG
- **date-fns**: Manipulação de datas

---

## 🚀 Build

```bash
npm run build
```

Gera otimized build em `build/`

---

## ✅ Próximas Fases

- [ ] Página de Clientes (CRUD)
- [ ] Página de Casos (CRUD)
- [ ] Página de Documentos
- [ ] Integração com geração de documentos
- [ ] Kanban board para leads
- [ ] Filtros avançados
- [ ] Temas (claro/escuro)
- [ ] Testes unitários
- [ ] PWA setup
