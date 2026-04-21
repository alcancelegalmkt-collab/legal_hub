import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Proposal from './Proposal';
import { IProposalAcceptance } from '../types/domain';
import { AcceptanceMethod } from '../types/enums';

type ProposalAcceptanceCreationAttributes = Optional<
  IProposalAcceptance,
  'id' | 'createdAt' | 'updatedAt'
>;

class ProposalAcceptance
  extends Model<IProposalAcceptance, ProposalAcceptanceCreationAttributes>
  implements IProposalAcceptance
{
  public id!: number;
  public proposalId!: number;
  public acceptedAt!: Date;
  public acceptanceMethod!: AcceptanceMethod;
  public zapsignDocumentId?: string;
  public zapsignSignLink?: string;
  public signedPdfUrl?: string;
  public observations?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProposalAcceptance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    proposalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Proposal,
        key: 'id',
      },
      onDelete: 'CASCADE',
      unique: true,
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    acceptanceMethod: {
      type: DataTypes.ENUM(
        AcceptanceMethod.DIGITAL,
        AcceptanceMethod.EMAIL,
        AcceptanceMethod.PHONE,
        AcceptanceMethod.IN_PERSON
      ),
      allowNull: false,
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
    signedPdfUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL do PDF assinado',
    },
    observations: {
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
    tableName: 'proposal_acceptances',
  }
);

export default ProposalAcceptance;
