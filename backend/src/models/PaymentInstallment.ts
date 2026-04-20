import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import PaymentPlan from './PaymentPlan';
import { IPaymentInstallment } from '../types/domain';
import { PaymentStatus, PaymentMethod } from '../types/enums';

type PaymentInstallmentCreationAttributes = Optional<
  IPaymentInstallment,
  'id' | 'createdAt' | 'updatedAt'
>;

class PaymentInstallment
  extends Model<IPaymentInstallment, PaymentInstallmentCreationAttributes>
  implements IPaymentInstallment
{
  public id!: number;
  public paymentPlanId!: number;
  public installmentNumber!: number;
  public dueDate!: Date;
  public amount!: number;
  public status!: PaymentStatus;
  public paidAt?: Date;
  public paidMethod?: PaymentMethod;
  public receiptUrl?: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentInstallment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    paymentPlanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PaymentPlan,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    installmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        PaymentStatus.PENDING,
        PaymentStatus.PAID,
        PaymentStatus.OVERDUE,
        PaymentStatus.PARTIALLY_PAID,
        PaymentStatus.CANCELLED
      ),
      defaultValue: PaymentStatus.PENDING,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paidMethod: {
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
    receiptUrl: {
      type: DataTypes.STRING(500),
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
    tableName: 'payment_installments',
  }
);

PaymentInstallment.belongsTo(PaymentPlan, {
  as: 'paymentPlan',
  foreignKey: 'paymentPlanId',
});

export default PaymentInstallment;
