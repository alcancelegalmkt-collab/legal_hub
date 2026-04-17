# WhatsApp Setup Rápido - Legal Hub

**3 minutos para ativar WhatsApp no seu bot jurídico**

---

## ✅ Checklist

- [ ] Backend está rodando (`npm run dev`)
- [ ] n8n está rodando (`docker-compose logs -f n8n`)
- [ ] Celular com WhatsApp instalado
- [ ] Câmera do celular funcionando (para QR)

---

## 🚀 3 Passos

### 1️⃣ Instalar pacotes (1 min)

```bash
cd backend
npm install
```

Se o Baileys não instalou, fazer manualmente:

```bash
npm install @whiskeysockets/baileys @hapi/boom qrcode-terminal
```

### 2️⃣ Iniciar bot (1 min)

```bash
npm run dev
```

Você verá no terminal:

```
📱 Iniciando WhatsApp...
📱 QR Code gerado. Escaneie para conectar ao WhatsApp.
⚠️ QR Code será válido por 60 segundos
```

**Neste momento, um QR Code será exibido no terminal** (se não conseguir ver, aumentar a janela do terminal)

### 3️⃣ Escanear QR Code (1 min)

**No seu celular:**

1. Abrir **WhatsApp**
2. Toque em **Configurações** (engrenagem no canto inferior direito)
3. Toque em **Dispositivos Conectados**
4. Toque em **Conectar Dispositivo**
5. Aponte a câmera para o QR Code no terminal

**Pronto!** Você verá no terminal:

```
✅ WhatsApp conectado com sucesso!
📱 Bot: Seu Nome (seu_numero@s.whatsapp.net)
```

---

## 🧪 Testar

### Opção 1: Enviar mensagem via API

```bash
# Gerar token (se não tiver)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legal-hub.com","password":"admin123"}'

# Copiar o token

# Enviar mensagem
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511999999999",
    "message": "Olá! Teste da automação jurídica 🚀"
  }'
```

### Opção 2: Receber mensagem

Simplesmente envie uma mensagem para o número do bot via WhatsApp:

```
Você: "Olá, preciso de ajuda com um caso trabalhista"

Bot responde:
"Olá! 👋

Obrigado por entrar em contato com Legal Hub.

Sua mensagem foi recebida e está sendo analisada. 
Um de nossos advogados(as) entrará em contato em breve.

⏱️ Tempo médio de resposta: 2-4 horas

Legal Hub - Automação Jurídica"
```

Ao mesmo tempo, no backend você verá:

```
📨 Mensagem de 5511999999999: Olá, preciso de ajuda com um caso trabalhista
✅ Mensagem enviada para n8n
```

---

## 🔄 O Que Acontece Automaticamente

Quando cliente envia mensagem:

```
1. ✅ Bot recebe (Baileys)
2. ✅ Resposta automática enviada
3. ✅ Dados enviados para n8n webhook
4. ✅ n8n dispara "01-whatsapp-webhook-to-crm"
5. ✅ Claude IA faz triagem automática
6. ✅ Lead criado no CRM
7. ✅ Dashboard atualizado
```

Tudo em menos de 5 segundos! ⚡

---

## 📊 Verificar Status

```bash
curl http://localhost:3000/api/whatsapp/status \
  -H "Authorization: Bearer <seu_token>"
```

Resposta esperada:

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

## 🆘 Se Não Funcionar

### "QR Code não aparece"

- Aumentar a janela do terminal
- Terminal limpo? Tentar `clear` ou `cls`
- Rodar `npm run dev` novamente

### "QR Code expirou"

- Espere 60 segundos, novo QR aparecerá automaticamente
- Escaneie o novo

### "Conexão recusada ao n8n"

Verificar se n8n está rodando:

```bash
# Terminal 1 (verificar)
curl http://localhost:5678/api/v1/health

# Se der erro, reiniciar
docker-compose restart n8n
```

### "Erro ao instalar Baileys"

```bash
# Limpar cache
npm cache clean --force

# Instalar novamente
npm install @whiskeysockets/baileys --save
```

---

## 📱 Usando o Bot no Dia a Dia

### Enviar para um cliente

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511987654321",
    "message": "João, seu contrato está pronto para assinatura! 📄 https://zapsign.com/..."
  }'
```

### Enviar para vários clientes

```bash
curl -X POST http://localhost:3000/api/whatsapp/send-bulk \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumbers": [
      "5511987654321",
      "5511987654322",
      "5511987654323"
    ],
    "message": "Atualização importante sobre seus casos! 📢"
  }'
```

---

## 🎯 Próximos Passos

1. **Testar fluxo completo**: Cliente envia msg → n8n → CRM
2. **Configurar n8n**: Workflow "01-whatsapp-webhook-to-crm"
3. **Personalizar respostas**: Editar mensagem automática no código
4. **Integrar com frontend**: Dashboard mostrando chats

---

## 📚 Documentação Completa

Ver [backend/WHATSAPP.md](./backend/WHATSAPP.md) para:
- Troubleshooting avançado
- Limitações conhecidas
- Próximos desenvolvimentos

---

**WhatsApp pronto!** 📱⚖️

Qualquer dúvida, verificar:
1. Terminal backend (`npm run dev`)
2. Logs de n8n (`docker-compose logs -f n8n`)
3. Status do bot (`curl /api/whatsapp/status`)
