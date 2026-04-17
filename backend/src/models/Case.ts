import { DataTypes, Model, Optional, ForeignKey } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Client from './Client';

interface CaseAttributes {
  id: number;
  clientId: number;
  primaryLawyerId: number;
  title: string;
  legalArea: string;
  description: string;
  caseNumber: string;
  court: string;
  caseValue: number | null;
  honorariesFee: number;
  honorariesFeeType: 'fixed' | 'percentage' | 'hourly';
  status: 'active' | 'closed' | 'suspended' | 'archived';
  startDate: Date;
  endDate: Date | null;
  opposingParties: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CaseCreationAttributes extends Optional<CaseAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Case extends Model<CaseAttributes, CaseCreationAttributes> implements CaseAttributes {
  public id!: number;
  public clientId!: number;
  public primaryLawyerId!: number;
  public title!: string;
  public legalArea!: string;
  public description!: string;
  public caseNumber!: string;
  public court!: string;
  public caseValue!: number | null;
  public honorariesFee!: number;
  public honorariesFeeType!: 'fixed' | 'percentage' | 'hourly';
  public status!: 'active' | 'closed' | 'suspended' | 'archived';
  public startDate!: Date;
  public endDate!: Date | null;
  public opposingParties!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Case.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client,
        key: 'id',
      },
      allowNull: false,
    },
    primaryLawyerId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    legalArea: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    caseNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true,
    },
    court: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    caseValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    honorariesFee: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    honorariesFeeType: {
      type: DataTypes.ENUM('fixed', 'percentage', 'hourly'),
      defaultValue: 'fixed',
    },
    status: {
      type: DataTypes.ENUM('active', 'closed', 'suspended', 'archived'),
      defaultValue: 'active',
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    opposingParties: {
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
    tableName: 'cases',
  }
);

Case.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Case.belongsTo(User, { as: 'lawyer', foreignKey: 'primaryLawyerId' });

export default Case;
