import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WhatsAppTagAttributes {
  id: number;
  name: string;
  color: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type WhatsAppTagCreationAttributes = Optional<WhatsAppTagAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'>;

class WhatsAppTag extends Model<WhatsAppTagAttributes, WhatsAppTagCreationAttributes> implements WhatsAppTagAttributes {
  public id!: number;
  public name!: string;
  public color!: string;
  public description?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WhatsAppTag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#2563eb',
    },
    description: {
      type: DataTypes.STRING(255),
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
    tableName: 'whatsapp_tags',
  }
);

export default WhatsAppTag;
