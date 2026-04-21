import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Client from './Client';
import { LeadStatus } from '../types/enums';

interface LeadAttributes {
  id: number;
  userId: number;
  legalAreaId?: number | null;
  caseTypeId?: number | null;
  clientId?: number | null;
  status: LeadStatus;
  proposalId?: number | null;
  proposalAcceptanceId?: number | null;
  financialRecordId?: number | null;
  tipoDemanda?: string | null;
  resumoCaso?: string | null;
  objetivoCliente?: string | null;
  urgency?: 'low' | 'medium' | 'high';
  observacoesEstrategicas?: string | null;
  possuiDependente?: boolean;
  propostaStatus?: string | null;
  propostaPdfUrl?: string | null;
  propostaPdfNome?: string | null;
  propostaEnviadaEm?: Date | null;
  propostaEnviadaPor?: string | null;
  valorProposto?: number | null;
  formaPagamento?: string | null;
  vencimentoProposta?: Date | null;
  entrada?: number | null;
  parcelamento?: number | null;
  honorariosExito?: number | null;
  assignedToId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LeadCreationAttributes extends Optional<LeadAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Lead extends Model<LeadAttributes, LeadCreationAttributes> implements LeadAttributes {
  public id!: number;
  public userId!: number;
  public legalAreaId?: number | null;
  public caseTypeId?: number | null;
  public clientId?: number | null;
  public status!: LeadStatus;
  public proposalId?: number | null;
  public proposalAcceptanceId?: number | null;
  public financialRecordId?: number | null;
  public tipoDemanda?: string | null;
  public resumoCaso?: string | null;
  public objetivoCliente?: string | null;
  public urgency?: 'low' | 'medium' | 'high';
  public observacoesEstrategicas?: string | null;
  public possuiDependente?: boolean;
  public propostaStatus?: string | null;
  public propostaPdfUrl?: string | null;
  public propostaPdfNome?: string | null;
  public propostaEnviadaEm?: Date | null;
  public propostaEnviadaPor?: string | null;
  public valorProposto?: number | null;
  public formaPagamento?: string | null;
  public vencimentoProposta?: Date | null;
  public entrada?: number | null;
  public parcelamento?: number | null;
  public honorariosExito?: number | null;
  public assignedToId?: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lead.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'RESTRICT',
      comment: 'Usuário que criou o lead',
    },
    legalAreaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'legal_areas',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Área jurídica do lead',
    },
    caseTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'case_types',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Tipo de caso específico',
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Client,
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Cliente convertido do lead (preenchido após aceitação da proposta)',
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal_generated', 'proposal_sent', 'closed', 'lost', 'converted'),
      defaultValue: 'new',
      comment: 'Status do lead na jornada',
    },
    proposalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proposals',
        key: 'id',
      },
      onDelete: 'SET NULL',
      unique: true,
      comment: 'Proposta gerada para este lead',
    },
    proposalAcceptanceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proposal_acceptances',
        key: 'id',
      },
      onDelete: 'SET NULL',
      unique: true,
      comment: 'Aceitação da proposta',
    },
    financialRecordId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'financial_records',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Registro financeiro associado',
    },
    tipoDemanda: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '[LEGACY] ação de alimentos, guarda, divórcio, BPC/LOAS, etc',
    },
    resumoCaso: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '[LEGACY] Resumo detalhado da reunião/caso',
    },
    objetivoCliente: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '[LEGACY] O que o cliente quer alcançar com a ação',
    },
    urgency: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
      comment: '[LEGACY] Urgência do caso',
    },
    observacoesEstrategicas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '[LEGACY] Observações internas sobre estratégia',
    },
    possuiDependente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '[LEGACY] Se possui dependentes',
    },
    propostaStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '[LEGACY] pendente, aceita, rejeitada, vencida',
    },
    propostaPdfUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '[LEGACY]',
    },
    propostaPdfNome: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '[LEGACY]',
    },
    propostaEnviadaEm: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '[LEGACY]',
    },
    propostaEnviadaPor: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '[LEGACY] whatsapp, email, manual, etc',
    },
    valorProposto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: '[LEGACY]',
    },
    formaPagamento: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '[LEGACY] à vista, parcelado, entrada + parcelado, etc',
    },
    vencimentoProposta: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '[LEGACY]',
    },
    entrada: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: '[LEGACY]',
    },
    parcelamento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '[LEGACY] número de parcelas',
    },
    honorariosExito: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: '[LEGACY]',
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
      comment: '[LEGACY] Responsável designado',
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
    tableName: 'leads',
  }
);

export default Lead;
