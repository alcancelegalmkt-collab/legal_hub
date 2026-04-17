import { DataTypes, Model, Optional, ForeignKey } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface LeadAttributes {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  legalArea: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedBudget: number | null;
  source: 'whatsapp' | 'phone' | 'email' | 'website' | 'referral';
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
  aiQualificationScore: number;
  assignedToId: number | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LeadCreationAttributes extends Optional<LeadAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Lead extends Model<LeadAttributes, LeadCreationAttributes> implements LeadAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public phone!: string;
  public whatsapp!: string;
  public legalArea!: string;
  public description!: string;
  public urgency!: 'low' | 'medium' | 'high';
  public estimatedBudget!: number | null;
  public source!: 'whatsapp' | 'phone' | 'email' | 'website' | 'referral';
  public status!: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
  public aiQualificationScore!: number;
  public assignedToId!: number | null;
  public notes!: string;
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
    name: {
      type: DataTypes.STRING(255),
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
    legalArea: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'trabalhista, família, civil, penal, administrativo, etc',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    urgency: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    estimatedBudget: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM('whatsapp', 'phone', 'email', 'website', 'referral'),
      defaultValue: 'whatsapp',
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'lost', 'converted'),
      defaultValue: 'new',
    },
    aiQualificationScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Score from 0-100 given by AI qualification',
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
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
    tableName: 'leads',
  }
);

Lead.belongsTo(User, { as: 'assignedTo', foreignKey: 'assignedToId' });

export default Lead;
