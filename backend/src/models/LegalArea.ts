import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ILegalArea } from '../types/domain';

type LegalAreaCreationAttributes = Optional<ILegalArea, 'id' | 'createdAt' | 'updatedAt'>;

class LegalArea extends Model<ILegalArea, LegalAreaCreationAttributes> implements ILegalArea {
  public id!: number;
  public name!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LegalArea.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
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
    tableName: 'legal_areas',
  }
);

export default LegalArea;
