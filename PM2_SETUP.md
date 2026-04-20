# PM2 Setup - Legal Hub Backend

## O que fazer no Hostinger

### 1. Instalar PM2 Globalmente
```bash
npm install -g pm2
```

### 2. Navegar até a pasta do projeto
```bash
cd /home/u528898188/domains/sistema.advogadaleliciabarros.com.br/public_html/.builds/source/legal_hub-master
```

### 3. Instalar dependências (se não estiverem instaladas)
```bash
cd backend
npm install
npm run build
cd ..
```

### 4. Iniciar com PM2
```bash
pm2 start ecosystem.config.js
```

### 5. Configurar PM2 para iniciar na reboot do servidor
```bash
pm2 startup
pm2 save
```

### 6. Verificar status
```bash
pm2 status
pm2 logs legal-hub-backend
```

### 7. Comandos úteis
```bash
pm2 stop legal-hub-backend      # Parar
pm2 restart legal-hub-backend   # Reiniciar
pm2 delete legal-hub-backend    # Remover do PM2
pm2 monit                        # Monitorar em tempo real
pm2 logs                         # Ver todos os logs
```

## Verificar se está funcionando
```bash
curl http://localhost:3000/api/health
```

Resultado esperado:
```json
{"status":"ok","timestamp":"...","environment":"production"}
```
