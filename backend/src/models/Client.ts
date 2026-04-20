import sequelize from '../config/database';
import { DataTypes, Model, Optional } from 'sequelize';
import User from './User';

interface ClientAttributes {
  id: number;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  whatsapp: string;
  maritalStatus: string;
  profession: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  rg: string;
  nationality: string;
  needsFinancialAid: boolean;
  primaryLawyerId: number;
  leadId?: number | null;
  financialResponsibleId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientCreationAttributes extends Optional<ClientAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  public id!: number;
  public name!: string;
  public cpfCnpj!: string;
  public email!: string;
  public phone!: string;
  public whatsapp!: string;
  public maritalStatus!: string;
  public profession!: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public rg!: string;
  public nationality!: string;
  public needsFinancialAid!: boolean;
  public primaryLawyerId!: number;
  public leadId?: number | null;
  public financialResponsibleId?: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    cpfCnpj: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    maritalStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    profession: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    rg: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    needsFinancialAid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    primaryLawyerId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'leads',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Lead que foi convertido em cliente',
    },
    financialResponsibleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'financial_responsibles',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Responsável financeiro (pode ser terceiro)',
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
    tableName: 'clients',
  }
);

Client.belongsTo(User, { as: 'lawyer', foreignKey: 'primaryLawyerId' });

// Relacionamento com Cases
const setupClientAssociations = () => {
  const Case = require('./Case').default;
  const Document = require('./Document').default;

  Client.hasMany(Case, { as: 'cases', foreignKey: 'clientId' });
  Client.hasMany(Document, { as: 'documents', foreignKey: 'clientId' });
};

// Chamar setup de associações
setTimeout(setupClientAssociations, 100);

export default Client;
