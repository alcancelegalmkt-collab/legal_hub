import { DataTypes, Model, Optional, ForeignKey } from 'sequelize';
import sequelize from '../config/database';
import Client from './Client';
import Case from './Case';

interface DocumentAttributes {
  id: number;
  clientId: number;
  caseId: number | null;
  type: 'proposal' | 'contract' | 'power_of_attorney' | 'financial_aid_declaration' | 'other';
  title: string;
  fileName: string;
  filePath: string;
  fileUrl: string | null;
  status: 'draft' | 'pending_signature' | 'signed' | 'rejected';
  zapsignId: string | null;
  zapsignSignLink: string | null;
  signedAt: Date | null;
  signedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  public id!: number;
  public clientId!: number;
  public caseId!: number | null;
  public type!: 'proposal' | 'contract' | 'power_of_attorney' | 'financial_aid_declaration' | 'other';
  public title!: string;
  public fileName!: string;
  public filePath!: string;
  public fileUrl!: string | null;
  public status!: 'draft' | 'pending_signature' | 'signed' | 'rejected';
  public zapsignId!: string | null;
  public zapsignSignLink!: string | null;
  public signedAt!: Date | null;
  public signedBy!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Document.init(
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
    caseId: {
      type: DataTypes.INTEGER,
      references: {
        model: Case,
        key: 'id',
      },
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('proposal', 'contract', 'power_of_attorney', 'financial_aid_declaration', 'other'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_signature', 'signed', 'rejected'),
      defaultValue: 'draft',
    },
    zapsignId: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true,
    },
    zapsignSignLink: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    signedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    signedBy: {
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
    tableName: 'documents',
  }
);

Document.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Document.belongsTo(Case, { as: 'case', foreignKey: 'caseId' });

export default Document;
