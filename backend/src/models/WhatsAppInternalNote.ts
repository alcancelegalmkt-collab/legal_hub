import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import WhatsAppConversation from './WhatsAppConversation';
import User from './User';

interface WhatsAppInternalNoteAttributes {
  id: number;
  conversationId: number;
  userId: number;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

type WhatsAppInternalNoteCreationAttributes = Optional<WhatsAppInternalNoteAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class WhatsAppInternalNote
  extends Model<WhatsAppInternalNoteAttributes, WhatsAppInternalNoteCreationAttributes>
  implements WhatsAppInternalNoteAttributes
{
  public id!: number;
  public conversationId!: number;
  public userId!: number;
  public note!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WhatsAppInternalNote.init(
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: 'whatsapp_internal_notes',
  }
);

export default WhatsAppInternalNote;
