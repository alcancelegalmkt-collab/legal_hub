import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Lead from './Lead';
import { IHonoraryStructure } from '../types/domain';
import {
  HonoraryType,
  SuccessCalculationBase,
  SuccessPaymentMoment,
  PaymentMethod,
  ContractDuration,
} from '../types/enums';

type HonoraryStructureCreationAttributes = Optional<
  IHonoraryStructure,
  'id' | 'createdAt' | 'updatedAt'
>;

class HonoraryStructure
  extends Model<IHonoraryStructure, HonoraryStructureCreationAttributes>
  implements IHonoraryStructure
{
  public id!: number;
  public leadId!: number;
  public honoraryType!: HonoraryType;
  public initialValue?: number;
  public initialPaymentMethod?: PaymentMethod;
  public initialInstallments?: number;
  public initialFirstDueDate?: Date;
  public initialFixedDay?: number;
  public successPercentage?: number;
  public successCalculationBase?: SuccessCalculationBase;
  public successPaymentMoment?: SuccessPaymentMoment;
  public successPaymentMomentOther?: string;
  public estimatedCauseValue?: number;
  public estimatedHonorarySuccess?: number;
  public monthlyValue?: number;
  public contractDuration?: ContractDuration;
  public discountAmount?: number;
  public penaltyPercentage?: number;
  public delayInterestPercentage?: number;
  public monetaryCorrection?: boolean;
  public contractualHonorariesIndependent?: boolean;
  public agreementOnlyWithAdvocate?: boolean;
  public contractualPenaltyPercentage?: number;
  public currency!: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

HonoraryStructure.init(
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
    honoraryType: {
      type: DataTypes.ENUM(
        HonoraryType.INITIAL_SUCCESS,
        HonoraryType.UNIQUE,
        HonoraryType.SUCCESS_ONLY,
        HonoraryType.MONTHLY
      ),
      allowNull: false,
    },
    // INITIAL_SUCCESS + UNIQUE
    initialValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    initialPaymentMethod: {
      type: DataTypes.ENUM(
        PaymentMethod.PIX,
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.BOLETO,
        PaymentMethod.CREDIT_CARD,
        PaymentMethod.CASH,
        PaymentMethod.CHECK
      ),
      allowNull: true,
    },
    initialInstallments: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 12 },
    },
    initialFirstDueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    initialFixedDay: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 31 },
    },
    // SUCCESS_ONLY + INITIAL_SUCCESS
    successPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Percentual de êxito (0-100)',
    },
    successCalculationBase: {
      type: DataTypes.ENUM(
        SuccessCalculationBase.GROSS,
        SuccessCalculationBase.NET,
        SuccessCalculationBase.RECEIVED
      ),
      allowNull: true,
    },
    successPaymentMoment: {
      type: DataTypes.ENUM(
        SuccessPaymentMoment.AGREEMENT,
        SuccessPaymentMoment.RELEASE,
        SuccessPaymentMoment.RECEIVED,
        SuccessPaymentMoment.BENEFIT,
        SuccessPaymentMoment.OTHER
      ),
      allowNull: true,
    },
    successPaymentMomentOther: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Descrição se successPaymentMoment = OTHER',
    },
    estimatedCauseValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor estimado da causa/proveito econômico',
    },
    estimatedHonorarySuccess: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor estimado do honorário de êxito (calculado)',
    },
    // MONTHLY
    monthlyValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    contractDuration: {
      type: DataTypes.ENUM(
        ContractDuration.INDEFINITE,
        ContractDuration.THREE_MONTHS,
        ContractDuration.SIX_MONTHS,
        ContractDuration.TWELVE_MONTHS
      ),
      allowNull: true,
    },
    // COMUNS
    discountAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    penaltyPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Multa por inadimplência (%)',
    },
    delayInterestPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Juros por atraso (% ao mês)',
    },
    monetaryCorrection: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    contractualHonorariesIndependent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Honorários contratuais independem de sucumbenciais',
    },
    agreementOnlyWithAdvocate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Acordo somente com anuência da advogada',
    },
    contractualPenaltyPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Multa contratual por descumprimento (%)',
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'BRL',
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
    tableName: 'honorary_structures',
  }
);

HonoraryStructure.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

export default HonoraryStructure;
