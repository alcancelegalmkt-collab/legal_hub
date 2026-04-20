import makeWASocket, {
  ConnectionState,
  DisconnectReason,
  useMultiFileAuthState,
  WAMessage,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const CREDENTIALS_DIR = path.join(__dirname, '../../.auth_info');
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/whatsapp';

interface WhatsAppInstance {
  socket: any;
  isReady: boolean;
  lastMessageTimestamp: number;
}

let whatsappInstance: WhatsAppInstance = {
  socket: null,
  isReady: false,
  lastMessageTimestamp: 0,
};

const ensureCredentialsDir = () => {
  if (!fs.existsSync(CREDENTIALS_DIR)) {
    fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
  }
};

export const initializeWhatsApp = async () => {
  try {
    ensureCredentialsDir();

    const { state, saveCreds } = await useMultiFileAuthState(CREDENTIALS_DIR);

    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: ['Legal Hub', 'Safari', '1.0.0'],
    });

    socket.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('📱 QR Code gerado. Escaneie para conectar ao WhatsApp.');
        console.log('⚠️ QR Code será válido por 60 segundos');
      }

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log(
          'connection closed due to ',
          (lastDisconnect?.error as Boom)?.output?.statusCode,
          shouldReconnect ? ', reconnecting' : ', not reconnecting'
        );

        if (shouldReconnect) {
          setTimeout(() => initializeWhatsApp(), 3000);
        }
      }

      if (connection === 'open') {
        whatsappInstance.isReady = true;
        console.log('✅ WhatsApp conectado com sucesso!');
        console.log(`📱 Bot: ${socket.user?.name} (${socket.user?.id})`);
      }
    });

    socket.ev.on('creds.update', saveCreds);

    // Mensagens recebidas
    socket.ev.on('messages.upsert', async (m: { messages: WAMessage[] }) => {
      const message = m.messages[0];

      if (!message.message) return;
      if (message.key.fromMe) return;

      try {
        await handleIncomingMessage(socket, message);
      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
      }
    });

    whatsappInstance.socket = socket;
  } catch (error) {
    console.error('❌ Erro ao inicializar WhatsApp:', error);
    setTimeout(() => initializeWhatsApp(), 5000);
  }
};

const handleIncomingMessage = async (socket: any, message: WAMessage) => {
  const jid = message.key.remoteJid;
  const sender = message.key.participant || jid;
  const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

  if (!text) return;

  console.log(`📨 Mensagem de ${sender}: ${text}`);

  // Extrair número de telefone
  const phoneNumber = sender?.split('@')[0].replace(/\D/g, '');
  const contactName = message.pushName || 'Cliente';

  // Enviar para n8n para triagem
  try {
    await axios.post(N8N_WEBHOOK_URL, {
      from: `55${phoneNumber}`,
      body: text,
      sender: sender,
      timestamp: message.messageTimestamp,
      pushName: contactName,
    });

    console.log('✅ Mensagem enviada para n8n');

    // Resposta automática imediata
    await socket.sendMessage(jid, {
      text: `Olá ${contactName}! 👋\n\nObrigado por entrar em contato com Legal Hub.\n\nSua mensagem foi recebida e está sendo analisada. Um de nossos advogados(as) entrará em contato em breve.\n\n⏱️ Tempo médio de resposta: 2-4 horas\n\n*Legal Hub - Automação Jurídica*`,
    });
  } catch (error) {
    console.error('❌ Erro ao enviar para n8n:', error);
  }
};

export const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  if (!whatsappInstance.isReady || !whatsappInstance.socket) {
    throw new Error('WhatsApp não está conectado');
  }

  try {
    // Normalizar número
    let jid = phoneNumber.replace(/\D/g, '');
    if (!jid.startsWith('55')) {
      jid = '55' + jid;
    }
    jid = jid + '@s.whatsapp.net';

    const response = await whatsappInstance.socket.sendMessage(jid, {
      text: message,
    });

    console.log(`✅ Mensagem enviada para ${phoneNumber}`);
    return response;
  } catch (error) {
    console.error(`❌ Erro ao enviar mensagem para ${phoneNumber}:`, error);
    throw error;
  }
};

export const getWhatsAppStatus = () => {
  return {
    isConnected: whatsappInstance.isReady,
    user: whatsappInstance.socket?.user,
    timestamp: new Date(),
  };
};

export const getWhatsAppSocket = () => {
  return whatsappInstance.socket;
};

export default { initializeWhatsApp, sendWhatsAppMessage, getWhatsAppStatus };
