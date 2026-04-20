import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Lead from './Lead';

interface ResponsavelAttributes {
  id: number;
  leadId: number;
  nomeCompleto: string;
  cpf: string | null;
  rg: string | null;
  dataNascimento: Date | null;
  estadoCivil: string | null;
  profissao: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  relacaoComDependente: string | null;
  nacionalidade: string | null;
  nomeMae: string | null;
  nomePai: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ResponsavelCreationAttributes extends Optional<ResponsavelAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Responsavel extends Model<ResponsavelAttributes, ResponsavelCreationAttributes> implements ResponsavelAttributes {
  public id!: number;
  public leadId!: number;
  public nomeCompleto!: string;
  public cpf!: string | null;
  public rg!: string | null;
  public dataNascimento!: Date | null;
  public estadoCivil!: string | null;
  public profissao!: string | null;
  public telefone!: string | null;
  public email!: string | null;
  public endereco!: string | null;
  public cidade!: string | null;
  public estado!: string | null;
  public cep!: string | null;
  public relacaoComDependente!: string | null;
  public nacionalidade!: string | null;
  public nomeMae!: string | null;
  public nomePai!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Responsavel.init(
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
      unique: false,
    },
    rg: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    dataNascimento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estadoCivil: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'solteiro, casado, divorciado, viúvo, união estável, etc',
    },
    profissao: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
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
    relacaoComDependente: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'mãe, pai, responsável legal, tutor, curador, etc',
    },
    nacionalidade: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nomeMae: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nomePai: {
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
    tableName: 'responsaveis',
  }
);

Responsavel.belongsTo(Lead, { foreignKey: 'leadId', onDelete: 'CASCADE' });

export default Responsavel;
