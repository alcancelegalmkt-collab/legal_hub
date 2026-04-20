import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Lead from './Lead';
import Client from './Client';
import { IFinancialResponsible } from '../types/domain';
import { FinancialResponsibleType } from '../types/enums';

type FinancialResponsibleCreationAttributes = Optional<
  IFinancialResponsible,
  'id' | 'createdAt' | 'updatedAt'
>;

class FinancialResponsible
  extends Model<IFinancialResponsible, FinancialResponsibleCreationAttributes>
  implements IFinancialResponsible
{
  public id!: number;
  public leadId?: number;
  public clientId?: number;
  public responsibleType!: FinancialResponsibleType;
  public name!: string;
  public cpf!: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FinancialResponsible.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Lead,
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Client,
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    responsibleType: {
      type: DataTypes.ENUM(
        FinancialResponsibleType.CLIENT,
        FinancialResponsibleType.THIRD_PARTY,
        FinancialResponsibleType.DEPENDENT_LINKED
      ),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
    },
    notes: {
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
    tableName: 'financial_responsibles',
  }
);

FinancialResponsible.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });
FinancialResponsible.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });

export default FinancialResponsible;
