import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Client from './Client';
import Lead from './Lead';
import ProposalAcceptance from './ProposalAcceptance';
import { IFinancialRecord } from '../types/domain';

type FinancialRecordCreationAttributes = Optional<
  IFinancialRecord,
  'id' | 'createdAt' | 'updatedAt'
>;

class FinancialRecord
  extends Model<IFinancialRecord, FinancialRecordCreationAttributes>
  implements IFinancialRecord
{
  public id!: number;
  public clientId!: number;
  public leadId?: number;
  public proposalAcceptanceId!: number;
  public totalValue!: number;
  public paidValue!: number;
  public pendingValue!: number;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FinancialRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Lead,
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Rastreabilidade: qual lead gerou este registro financeiro',
    },
    proposalAcceptanceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProposalAcceptance,
        key: 'id',
      },
      onDelete: 'RESTRICT',
      unique: true,
    },
    totalValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor total a receber',
    },
    paidValue: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      comment: 'Valor já recebido',
    },
    pendingValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor ainda a receber (totalValue - paidValue)',
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
    tableName: 'financial_records',
  }
);

FinancialRecord.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
FinancialRecord.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });
FinancialRecord.belongsTo(ProposalAcceptance, {
  as: 'proposalAcceptance',
  foreignKey: 'proposalAcceptanceId',
});

export default FinancialRecord;
