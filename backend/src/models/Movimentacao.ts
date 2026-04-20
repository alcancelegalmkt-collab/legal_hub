import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Case from './Case';

interface MovimentacaoAttributes {
  id: number;
  caseId: number;
  caseName: string;
  processNumber: string;
  movimentationType: string;
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface MovimentacaoCreationAttributes extends Optional<MovimentacaoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Movimentacao extends Model<MovimentacaoAttributes, MovimentacaoCreationAttributes> implements MovimentacaoAttributes {
  public id!: number;
  public caseId!: number;
  public caseName!: string;
  public processNumber!: string;
  public movimentationType!: string;
  public description!: string;
  public importance!: 'low' | 'medium' | 'high' | 'critical';
  public detectedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Movimentacao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    caseId: {
      type: DataTypes.INTEGER,
      references: {
        model: Case,
        key: 'id',
      },
      allowNull: false,
    },
    caseName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    processNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    movimentationType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    importance: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
    },
    detectedAt: {
      type: DataTypes.DATE,
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
    tableName: 'movimentacoes',
    indexes: [
      {
        fields: ['caseId'],
      },
      {
        fields: ['processNumber'],
      },
      {
        fields: ['importance'],
      },
      {
        fields: ['detectedAt'],
      },
      {
        fields: ['caseId', 'detectedAt'],
      },
      {
        fields: ['importance', 'detectedAt'],
      },
    ],
  }
);

Movimentacao.belongsTo(Case, { as: 'case', foreignKey: 'caseId' });

export default Movimentacao;
