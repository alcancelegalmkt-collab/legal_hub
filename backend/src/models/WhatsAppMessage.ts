import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import WhatsAppConversation from './WhatsAppConversation';

interface WhatsAppMessageAttributes {
  id: number;
  conversationId: number;
  direction: 'incoming' | 'outgoing';
  messageType: 'text' | 'image' | 'document' | 'audio' | 'template' | 'interactive';
  content: string;
  mediaUrl?: string | null;
  externalMessageId?: string | null;
  sentAt: Date;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type WhatsAppMessageCreationAttributes = Optional<
  WhatsAppMessageAttributes,
  'id' | 'mediaUrl' | 'externalMessageId' | 'readAt' | 'createdAt' | 'updatedAt'
>;

class WhatsAppMessage extends Model<WhatsAppMessageAttributes, WhatsAppMessageCreationAttributes> implements WhatsAppMessageAttributes {
  public id!: number;
  public conversationId!: number;
  public direction!: 'incoming' | 'outgoing';
  public messageType!: 'text' | 'image' | 'document' | 'audio' | 'template' | 'interactive';
  public content!: string;
  public mediaUrl?: string | null;
  public externalMessageId?: string | null;
  public sentAt!: Date;
  public readAt?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WhatsAppMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: WhatsAppConversation,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    direction: {
      type: DataTypes.ENUM('incoming', 'outgoing'),
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'document', 'audio', 'template', 'interactive'),
      allowNull: false,
      defaultValue: 'text',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mediaUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    externalMessageId: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    readAt: {
      type: DataTypes.DATE,
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
    tableName: 'whatsapp_messages',
  }
);

export default WhatsAppMessage;
