# WhatsApp Integration - Baileys

**Integração WhatsApp 100% gratuita usando Baileys**

Baileys é uma biblioteca Node.js que se conecta ao WhatsApp Web sem necessidade de APIs pagas como Twilio.

---

## 🚀 Como Funciona

1. **QR Code**: Na primeira execução, um QR Code é gerado
2. **Escanear**: Escaneie com seu telefone (WhatsApp → Configurações → Dispositivos Conectados)
3. **Conectado**: Bot está pronto para receber/enviar mensagens
4. **n8n Integration**: Mensagens são automaticamente enviadas para n8n para triagem

---

## 📋 Pré-requisitos

- Node.js 18+
- Número WhatsApp ativo
- Celular com WhatsApp instalado (para escanear QR)

---

## 🔧 Setup

### 1️⃣ Instalar Dependências

```bash
cd backend
npm install @whiskeysockets/baileys @hapi/boom qrcode-terminal
```

### 2️⃣ Configurar Variáveis

```bash
# .env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp
```

### 3️⃣ Iniciar Backend

```bash
npm run dev
```

Você verá:

```
📱 Iniciando WhatsApp...
📱 QR Code gerado. Escaneie para conectar ao WhatsApp.
⚠️ QR Code será válido por 60 segundos
```

### 4️⃣ Escanear QR Code

1. Abrir WhatsApp no celular
2. Ir em **Configurações** → **Dispositivos Conectados** → **Conectar Dispositivo**
3. Escaneie o QR Code exibido no terminal

Após escanear:

```
✅ WhatsApp conectado com sucesso!
📱 Bot: seu_nome (seu_numero@s.whatsapp.net)
```

---

## 📱 Usando o Bot

### Cliente envia mensagem

Quando alguém enviar uma mensagem para o número:

```
1. Mensagem recebida pelo bot
2. Resposta automática enviada: "Olá! Sua mensagem foi recebida..."
3. Mensagem enviada para n8n webhook
4. n8n dispara workflow "01-whatsapp-webhook-to-crm"
5. Lead criado no CRM
6. Triagem automática com IA
```

---

## 🔌 API Endpoints

### Enviar Mensagem

```bash
POST /api/whatsapp/send
Authorization: Bearer <token>

{
  "phoneNumber": "5511999999999",
  "message": "Olá! Este é um teste."
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "result": {...}
}
```

### Enviar em Massa

```bash
POST /api/whatsapp/send-bulk
Authorization: Bearer <token>

{
  "phoneNumbers": [
    "5511999999999",
    "5511988888888",
    "5511977777777"
  ],
  "message": "Olá a todos!"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "3 mensagens enviadas, 0 falharam",
  "results": [...]
}
```

### Verificar Status

```bash
GET /api/whatsapp/status
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "isConnected": true,
  "user": {
    "id": "5511999999999@s.whatsapp.net",
    "name": "João Silva",
    "short": "João"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔄 Fluxo Completo

### Cliente envia msg WhatsApp
```
Celular → WhatsApp → Baileys (bot)
```

### Bot processa
```
1. Recebe mensagem
2. Envia resposta automática: "Olá! Sua mensagem foi recebida..."
3. Faz POST para n8n webhook: /webhook/whatsapp
```

### n8n processa
```
Webhook → Extract Data → Claude AI (triagem) → Criar Lead no CRM
```

### Backend
```
Lead salvo no CRM com:
- Nome do cliente
- Número WhatsApp
- Área jurídica (detectada por IA)
- Urgência (detectada por IA)
- Score de qualificação (0-100)
- Status: "new"
```

---

## 🔐 Credenciais

As credenciais do WhatsApp são armazenadas em:

```
backend/.auth_info/
├── creds.json
├── pre-keys/
└── sessions/
```

**⚠️ IMPORTANTE:** Não fazer commit de `.auth_info/` (já está no .gitignore)

---

## 🐛 Troubleshooting

### "QR Code expirou"

O QR Code é válido por 60 segundos. Se expirar:
- O bot tenta gerar um novo automaticamente
- Espere a mensagem "QR Code gerado"
- Escaneie o novo QR

### "WhatsApp desconectou"

O bot reconecta automaticamente:
- Verifica conexão a cada 30 segundos
- Se desconectar, tenta reconectar
- Se QR expirar, gera novo

### "Mensagem não foi enviada"

Verificar:
- Número está correto? (formato: 5511999999999)
- Bot está conectado? (POST /api/whatsapp/status)
- Número alvo tem WhatsApp?

### "Erro: ECONNREFUSED ao n8n"

- n8n está rodando? (http://localhost:5678)
- N8N_WEBHOOK_URL está correto?
- Firewall bloqueando conexão?

---

## 📊 Logs

O bot loga tudo que faz:

```
📨 Mensagem de 5511999999999: Olá, preciso de ajuda
✅ Mensagem enviada para n8n
✅ Mensagem enviada para 5511999999999
```

Para ver logs em tempo real:

```bash
# Terminal backend
npm run dev 2>&1 | grep -E "✅|❌|📨"
```

---

## ⚠️ Limitações Conhecidas

| Limitação | Detalhe |
|-----------|---------|
| Múltiplas Instâncias | Cada bot precisa de número diferente |
| Mídia | Imagens/vídeos requerem setup adicional |
| Grupos | Suporta grupos (com setup extra) |
| Taxa de Envio | WhatsApp limita ~100 msgs/min por número |
| Duração Sessão | Sessão válida enquanto WhatsApp Web aberto |

---

## 🚀 Próximos Passos

1. **Suporte a Mídia**: Receber/enviar imagens
2. **Suporte a Grupos**: Bot em grupos do WhatsApp
3. **Múltiplos Bots**: Vários números conectados
4. **Armazenamento Seguro**: Criptografar credenciais
5. **Dashboard**: Interface para gerenciar bot

---

## 📚 Recursos

- [Baileys GitHub](https://github.com/WhiskeySockets/Baileys)
- [Documentação Baileys](https://github.com/WhiskeySockets/Baileys/wiki)
- [WhatsApp Web API](https://web.whatsapp.com)

---

## 💡 Dicas

- **Teste antes de produção**: Use número pessoal primeiro
- **Monitore a conexão**: Bot se desconecta se WhatsApp Web fechar
- **Backup de credenciais**: `.auth_info/` não pode ser perdido
- **Rate Limiting**: WhatsApp throttles se enviar muito rápido

---

**WhatsApp bot pronto para automatização jurídica!** 📱⚖️
