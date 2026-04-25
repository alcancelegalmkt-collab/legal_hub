import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class WhatsAppConversationTag extends Model {
  public conversationId!: number;
  public tagId!: number;
}

WhatsAppConversationTag.init(
  {
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'whatsapp_conversations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'whatsapp_tags',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'whatsapp_conversation_tags',
    timestamps: false,
  }
);

export default WhatsAppConversationTag;
