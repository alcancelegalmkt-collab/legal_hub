import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Lead from './Lead';
import User from './User';
import { IProposal, IProposalShareLink } from '../types/domain';
import { ProposalStatus } from '../types/enums';

type ProposalCreationAttributes = Optional<IProposal, 'id' | 'createdAt' | 'updatedAt'>;

class Proposal
  extends Model<IProposal, ProposalCreationAttributes>
  implements Omit<IProposal, 'sharedLinks'>
{
  public id!: number;
  public leadId!: number;
  public proposalNumber!: string;
  public generatedAt!: Date;
  public validUntil!: Date;
  public status!: ProposalStatus;
  public htmlContent!: string;
  public pdfUrl?: string;
  public responsibleUserId!: number;
  public observations?: string;
  public sharedLinks?: IProposalShareLink[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Proposal.init(
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
    proposalNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Formato: PROP-YYYY-NNNN',
    },
    generatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        ProposalStatus.DRAFT,
        ProposalStatus.SENT,
        ProposalStatus.ACCEPTED,
        ProposalStatus.REJECTED
      ),
      defaultValue: ProposalStatus.DRAFT,
    },
    htmlContent: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      comment: 'HTML da proposta gerada',
    },
    pdfUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL do PDF armazenado',
    },
    responsibleUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sharedLinks: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array de {link, expiresAt, accessCount}',
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
    tableName: 'proposals',
  }
);

export default Proposal;
