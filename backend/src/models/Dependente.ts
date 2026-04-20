import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Lead from './Lead';

interface DependenteAttributes {
  id: number;
  leadId: number;
  nomeCompleto: string;
  cpf: string | null;
  rgOuCertidao: string | null;
  dataNascimento: Date | null;
  idade: number | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  condicaoEspecifica: string | null;
  parentesco: string | null;
  nis: string | null;
  numeroBeneficio: string | null;
  deficienciaOuCondicaoSaude: string | null;
  observacoesDocumentais: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DependenteCreationAttributes extends Optional<DependenteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Dependente extends Model<DependenteAttributes, DependenteCreationAttributes> implements DependenteAttributes {
  public id!: number;
  public leadId!: number;
  public nomeCompleto!: string;
  public cpf!: string | null;
  public rgOuCertidao!: string | null;
  public dataNascimento!: Date | null;
  public idade!: number | null;
  public endereco!: string | null;
  public cidade!: string | null;
  public estado!: string | null;
  public cep!: string | null;
  public condicaoEspecifica!: string | null;
  public parentesco!: string | null;
  public nis!: string | null;
  public numeroBeneficio!: string | null;
  public deficienciaOuCondicaoSaude!: string | null;
  public observacoesDocumentais!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Dependente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    leadId: {
      type: DataTypes.INTEGER,
      references: {
        model: Lead,
        key: 'id',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    nomeCompleto: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: true,
    },
    rgOuCertidao: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'RG ou número da certidão de nascimento',
    },
    dataNascimento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    idade: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    endereco: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: 'UF - Unidade Federativa',
    },
    cep: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    condicaoEspecifica: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição da condição específica do caso',
    },
    parentesco: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'filho, filha, neto, neta, irmão, irmã, etc',
    },
    nis: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Número de Inscrição Social',
    },
    numeroBeneficio: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número do benefício previdenciário ou assistencial',
    },
    deficienciaOuCondicaoSaude: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição de deficiência ou condição de saúde relevante ao caso',
    },
    observacoesDocumentais: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre documentação necessária ou disponível',
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
    tableName: 'dependentes',
  }
);

Dependente.belongsTo(Lead, { foreignKey: 'leadId', onDelete: 'CASCADE' });

export default Dependente;
