import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export const WHATSAPP_PIPELINE_STAGES = [
  'novo_lead',
  'primeiro_atendimento',
  'dados_coletados',
  'analise_juridica',
  'proposta_enviada',
  'negociacao',
  'contrato_enviado',
  'contrato_assinado',
  'cliente_ativo',
  'encerrado',
] as const;

export type WhatsAppPipelineStage = typeof WHATSAPP_PIPELINE_STAGES[number];

type WhatsAppConversationStatus = 'open' | 'waiting_client' | 'waiting_internal' | 'closed';

interface WhatsAppConversationAttributes {
  id: number;
  contactName: string;
  phoneNumber: string;
  clientId?: number | null;
  leadId?: number | null;
  assignedUserId?: number | null;
  status: WhatsAppConversationStatus;
  origin?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: Date | null;
  nextActionAt?: Date | null;
  pipelineStage: WhatsAppPipelineStage;
  internalSummary?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type WhatsAppConversationCreationAttributes = Optional<
  WhatsAppConversationAttributes,
  'id' | 'clientId' | 'leadId' | 'assignedUserId' | 'origin' | 'lastMessage' | 'lastMessageAt' | 'nextActionAt' | 'internalSummary' | 'createdAt' | 'updatedAt'
>;

class WhatsAppConversation
  extends Model<WhatsAppConversationAttributes, WhatsAppConversationCreationAttributes>
  implements WhatsAppConversationAttributes
{
  public id!: number;
  public contactName!: string;
  public phoneNumber!: string;
  public clientId?: number | null;
  public leadId?: number | null;
  public assignedUserId?: number | null;
  public status!: WhatsAppConversationStatus;
  public origin?: string | null;
  public lastMessage?: string | null;
  public lastMessageAt?: Date | null;
  public nextActionAt?: Date | null;
  public pipelineStage!: WhatsAppPipelineStage;
  public internalSummary?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WhatsAppConversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    contactName: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'leads',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    assignedUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    status: {
      type: DataTypes.ENUM('open', 'waiting_client', 'waiting_internal', 'closed'),
      allowNull: false,
      defaultValue: 'open',
    },
    origin: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    lastMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextActionAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pipelineStage: {
      type: DataTypes.ENUM(...WHATSAPP_PIPELINE_STAGES),
      allowNull: false,
      defaultValue: 'novo_lead',
    },
    internalSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'whatsapp_conversations',
  }
);

export default WhatsAppConversation;
