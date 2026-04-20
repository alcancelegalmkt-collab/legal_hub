import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import HonoraryStructure from './HonoraryStructure';
import { IPaymentPlan } from '../types/domain';
import { PaymentMethod } from '../types/enums';

type PaymentPlanCreationAttributes = Optional<IPaymentPlan, 'id' | 'createdAt' | 'updatedAt'>;

class PaymentPlan
  extends Model<IPaymentPlan, PaymentPlanCreationAttributes>
  implements IPaymentPlan
{
  public id!: number;
  public honoraryStructureId!: number;
  public paymentMethod!: PaymentMethod;
  public installments!: number;
  public firstDueDate!: Date;
  public fixedDay?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentPlan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    honoraryStructureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: HonoraryStructure,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    paymentMethod: {
      type: DataTypes.ENUM(
        PaymentMethod.PIX,
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.BOLETO,
        PaymentMethod.CREDIT_CARD,
        PaymentMethod.CASH,
        PaymentMethod.CHECK
      ),
      allowNull: false,
    },
    installments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    firstDueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fixedDay: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 31,
      },
      comment: 'Dia fixo de vencimento das parcelas',
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
    tableName: 'payment_plans',
  }
);

PaymentPlan.belongsTo(HonoraryStructure, {
  as: 'honoraryStructure',
  foreignKey: 'honoraryStructureId',
});

export default PaymentPlan;
