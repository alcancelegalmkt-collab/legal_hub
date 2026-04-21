import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import LegalArea from './LegalArea';
import { ICaseType } from '../types/domain';

type CaseTypeCreationAttributes = Optional<ICaseType, 'id' | 'createdAt' | 'updatedAt'>;

class CaseType extends Model<ICaseType, CaseTypeCreationAttributes> implements ICaseType {
  public id!: number;
  public legalAreaId!: number;
  public name!: string;
  public description?: string;
  public requiresDependents?: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CaseType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    legalAreaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: LegalArea,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requiresDependents: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Se este tipo de ação requer cadastro de dependentes',
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
    tableName: 'case_types',
  }
);

export default CaseType;
