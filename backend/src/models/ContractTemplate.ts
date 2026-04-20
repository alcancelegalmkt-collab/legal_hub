import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import LegalArea from './LegalArea';
import CaseType from './CaseType';
import { IContractTemplate } from '../types/domain';

type ContractTemplateCreationAttributes = Optional<
  Omit<IContractTemplate, 'defaultClauses'> & { defaultClauses?: string },
  'id' | 'createdAt' | 'updatedAt'
>;

class ContractTemplate
  extends Model<Omit<IContractTemplate, 'defaultClauses'> & { defaultClauses?: string }, ContractTemplateCreationAttributes>
  implements Omit<IContractTemplate, 'defaultClauses'>
{
  public id!: number;
  public legalAreaId!: number;
  public caseTypeId?: number;
  public name!: string;
  public htmlTemplate!: string;
  public defaultClauses?: string;
  public version!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ContractTemplate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    legalAreaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: LegalArea,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    caseTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: CaseType,
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'null = template genérico da área',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    htmlTemplate: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      comment: 'Template HTML do contrato com placeholders {{variavel}}',
    },
    defaultClauses: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array de {id, title, content, order, isRequired}',
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'contract_templates',
  }
);

ContractTemplate.belongsTo(LegalArea, { as: 'legalArea', foreignKey: 'legalAreaId' });
ContractTemplate.belongsTo(CaseType, { as: 'caseType', foreignKey: 'caseTypeId' });

export default ContractTemplate;
