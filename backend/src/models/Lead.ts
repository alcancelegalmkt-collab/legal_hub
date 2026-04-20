import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface LeadAttributes {
  id: number;
  legalArea: string;
  tipoDemanda: string;
  resumoCaso: string;
  objetivoCliente: string;
  urgency: 'low' | 'medium' | 'high';
  observacoesEstrategicas: string | null;
  possuiDependente: boolean;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_generated' | 'proposal_sent' | 'closed' | 'lost' | 'converted';
  propostaStatus: string | null;
  propostaPdfUrl: string | null;
  propostaPdfNome: string | null;
  propostaEnviadaEm: Date | null;
  propostaEnviadaPor: string | null;
  valorProposto: number | null;
  formaPagamento: string | null;
  vencimentoProposta: Date | null;
  entrada: number | null;
  parcelamento: number | null;
  honorariosExito: number | null;
  assignedToId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LeadCreationAttributes extends Optional<LeadAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Lead extends Model<LeadAttributes, LeadCreationAttributes> implements LeadAttributes {
  public id!: number;
  public legalArea!: string;
  public tipoDemanda!: string;
  public resumoCaso!: string;
  public objetivoCliente!: string;
  public urgency!: 'low' | 'medium' | 'high';
  public observacoesEstrategicas!: string | null;
  public possuiDependente!: boolean;
  public status!: 'new' | 'contacted' | 'qualified' | 'proposal_generated' | 'proposal_sent' | 'closed' | 'lost' | 'converted';
  public propostaStatus!: string | null;
  public propostaPdfUrl!: string | null;
  public propostaPdfNome!: string | null;
  public propostaEnviadaEm!: Date | null;
  public propostaEnviadaPor!: string | null;
  public valorProposto!: number | null;
  public formaPagamento!: string | null;
  public vencimentoProposta!: Date | null;
  public entrada!: number | null;
  public parcelamento!: number | null;
  public honorariosExito!: number | null;
  public assignedToId!: number | null;
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
    legalArea: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'família, trabalhista, civil, penal, administrativo, previdenciário, etc',
    },
    tipoDemanda: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'ação de alimentos, guarda, divórcio, BPC/LOAS, etc',
    },
    resumoCaso: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Resumo detalhado da reunião/caso - alimenta contratos personalizados',
    },
    objetivoCliente: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'O que o cliente quer alcançar com a ação',
    },
    urgency: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    observacoesEstrategicas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações internas sobre estratégia',
    },
    possuiDependente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal_generated', 'proposal_sent', 'closed', 'lost', 'converted'),
      defaultValue: 'new',
    },
    propostaStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'pendente, aceita, rejeitada, vencida',
    },
    propostaPdfUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    propostaPdfNome: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    propostaEnviadaEm: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    propostaEnviadaPor: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'whatsapp, email, manual, etc',
    },
    valorProposto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    formaPagamento: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'à vista, parcelado, entrada + parcelado, etc',
    },
    vencimentoProposta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    entrada: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    parcelamento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'número de parcelas',
    },
    honorariosExito: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
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
    tableName: 'leads',
  }
);

Lead.belongsTo(User, { as: 'assignedTo', foreignKey: 'assignedToId' });

export default Lead;
