import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Client from './Client';
import Lead from './Lead';
import ContractTemplate from './ContractTemplate';
import { IGeneratedContract } from '../types/domain';

type GeneratedContractCreationAttributes = Optional<
  IGeneratedContract,
  'id' | 'createdAt' | 'updatedAt'
>;

class GeneratedContract
  extends Model<IGeneratedContract, GeneratedContractCreationAttributes>
  implements IGeneratedContract
{
  public id!: number;
  public clientId!: number;
  public leadId!: number;
  public contractTemplateId!: number;
  public htmlContent!: string;
  public pdfUrl?: string;
  public status!: 'draft' | 'pending_signature' | 'signed' | 'rejected';
  public zapsignDocumentId?: string;
  public zapsignSignLink?: string;
  public signedAt?: Date;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GeneratedContract.init(
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
      allowNull: false,
      references: {
        model: Lead,
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    contractTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ContractTemplate,
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    htmlContent: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      comment: 'HTML do contrato gerado com dados preenchidos',
    },
    pdfUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL do PDF do contrato',
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_signature', 'signed', 'rejected'),
      defaultValue: 'draft',
    },
    zapsignDocumentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'ID do documento no ZapSign',
    },
    zapsignSignLink: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Link para assinatura no ZapSign',
    },
    signedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'generated_contracts',
  }
);

export default GeneratedContract;
