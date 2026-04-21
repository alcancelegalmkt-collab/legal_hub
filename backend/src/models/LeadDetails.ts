import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Lead from './Lead';
import { ILeadDetails } from '../types/domain';

type LeadDetailsCreationAttributes = Optional<ILeadDetails, 'id' | 'createdAt' | 'updatedAt'>;

class LeadDetails extends Model<ILeadDetails, LeadDetailsCreationAttributes> implements ILeadDetails {
  public id!: number;
  public leadId!: number;
  public clientSummary!: string;
  public clientObjective?: string;
  public estimatedCauseValue?: number;
  public hasHadPreviousAction?: boolean;
  public documentInitials?: string;
  public strategicObservations?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LeadDetails.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Lead,
        key: 'id',
      },
      onDelete: 'CASCADE',
      unique: true,
    },
    clientSummary: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Resumo da reunião ou descrição completa do caso',
    },
    clientObjective: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'O que o cliente quer alcançar com a ação',
    },
    estimatedCauseValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor estimado da causa ou proveito econômico',
    },
    hasHadPreviousAction: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Já houve ação anterior relacionada?',
    },
    documentInitials: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Lista de documentos iniciais fornecidos',
    },
    strategicObservations: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações estratégicas internas',
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
    tableName: 'lead_details',
  }
);


export default LeadDetails;
