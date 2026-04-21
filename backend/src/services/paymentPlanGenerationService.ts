import { PaymentPlan, PaymentInstallment, HonoraryStructure } from '../models';
import { PaymentStatus, PaymentMethod } from '../types/enums';
import { HonoraryCalculationService } from './honoraryCalculationService';

/**
 * Installment data for validation and creation
 */
export interface InstallmentData {
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  description: string;
}

/**
 * Payment plan generation result
 */
export interface PaymentPlanResult {
  paymentPlan: PaymentPlan | null;
  installments: PaymentInstallment[];
  validation: {
    isValid: boolean;
    totalAmount: number;
    installmentsSum: number;
    difference: number;
    warnings: string[];
    errors: string[];
  };
}

/**
 * Service for generating and validating payment plans
 * Ensures financial consistency and automatic installment generation
 */
export class PaymentPlanGenerationService {
  /**
   * Generate complete payment plan with installmentCount for a honorary structure
   * Validates that all installmentCount sum equals total amount
   */
  static async generatePaymentPlan(
    honoraryStructure: HonoraryStructure,
    transaction?: any
  ): Promise<PaymentPlanResult> {
    const result: PaymentPlanResult = {
      paymentPlan: null,
      installments: [],
      validation: {
        isValid: false,
        totalAmount: 0,
        installmentsSum: 0,
        difference: 0,
        warnings: [],
        errors: [],
      },
    };

    try {
      // Step 1: Calculate total amount using HonoraryCalculationService
      const calculation = HonoraryCalculationService.calculateSummary({
        honoraryType: honoraryStructure.honoraryType,
        initialValue: honoraryStructure.initialValue,
        initialInstallments: honoraryStructure.initialInstallments,
        initialFirstDueDate: honoraryStructure.initialFirstDueDate,
        initialFixedDay: honoraryStructure.initialFixedDay,
        successPercentage: honoraryStructure.successPercentage,
        successCalculationBase: honoraryStructure.successCalculationBase,
        successPaymentMoment: honoraryStructure.successPaymentMoment,
        estimatedCauseValue: honoraryStructure.estimatedCauseValue,
        monthlyValue: honoraryStructure.monthlyValue,
        contractDuration: honoraryStructure.contractDuration,
        discountAmount: honoraryStructure.discountAmount,
        penaltyPercentage: honoraryStructure.penaltyPercentage,
        delayInterestPercentage: honoraryStructure.delayInterestPercentage,
        monetaryCorrection: honoraryStructure.monetaryCorrection,
      });

      result.validation.totalAmount = calculation.totalAmount;

      // Step 2: Generate installment data from payment schedule
      const installmentData = this.generateInstallmentData(calculation.paymentSchedule);

      if (installmentData.length === 0) {
        result.validation.errors.push('Nenhuma parcela foi gerada');
        return result;
      }

      // Step 3: Validate and adjust for rounding errors
      const validatedInstallments = this.validateAndAdjustInstallments(
        installmentData,
        calculation.totalAmount,
        result.validation
      );

      if (result.validation.errors.length > 0) {
        return result;
      }

      // Step 4: Create PaymentPlan (only if more than 1 installment)
      if (validatedInstallments.length > 1 && honoraryStructure.initialFirstDueDate) {
        result.paymentPlan = await PaymentPlan.create(
          {
            honoraryStructureId: honoraryStructure.id,
            paymentMethod: honoraryStructure.initialPaymentMethod as PaymentMethod,
            installments: validatedInstallments.length,
            firstDueDate: honoraryStructure.initialFirstDueDate,
            fixedDay: honoraryStructure.initialFixedDay,
          },
          { transaction }
        );
      }

      // Step 5: Create PaymentInstallments
      const paymentPlanId = result.paymentPlan?.id;
      result.installments = await Promise.all(
        validatedInstallments.map((inst) =>
          PaymentInstallment.create(
            {
              paymentPlanId: paymentPlanId || null,
              installmentNumber: inst.installmentNumber,
              dueDate: inst.dueDate,
              amount: inst.amount,
              status: PaymentStatus.PENDING,
            } as any,
            { transaction }
          )
        )
      );

      // Step 6: Final validation
      const sum = validatedInstallments.reduce((acc, inst) => acc + inst.amount, 0);
      result.validation.installmentsSum = Number(sum.toFixed(2));
      result.validation.difference = Number((calculation.totalAmount - sum).toFixed(2));
      result.validation.isValid = result.validation.difference === 0;

      if (!result.validation.isValid) {
        result.validation.warnings.push(
          `Diferença detectada: R$ ${Math.abs(result.validation.difference).toFixed(2)}`
        );
      }

      return result;
    } catch (error) {
      result.validation.errors.push(`Erro ao gerar plano de pagamento: ${(error as any).message}`);
      return result;
    }
  }

  /**
   * Generate installment data from payment schedule
   */
  private static generateInstallmentData(paymentSchedule: any[]): InstallmentData[] {
    return paymentSchedule.map((item) => ({
      installmentNumber: item.installmentNumber,
      dueDate: new Date(item.dueDate),
      amount: item.amount,
      description: item.description,
    }));
  }

  /**
   * Validate installmentCount and adjust for rounding errors
   * Ensures sum equals total amount exactly
   */
  private static validateAndAdjustInstallments(
    installments: InstallmentData[],
    totalAmount: number,
    validation: any
  ): InstallmentData[] {
    if (installments.length === 0) {
      validation.errors.push('Lista de parcelas vazia');
      return [];
    }

    // Calculate sum with floating point precision
    let sum = 0;
    const adjustedInstallments = [...installments];

    for (let i = 0; i < adjustedInstallments.length - 1; i++) {
      sum += adjustedInstallments[i].amount;
    }

    // Last installment gets the remainder to ensure exact total
    const lastAmount = Number((totalAmount - sum).toFixed(2));

    if (lastAmount < 0) {
      validation.errors.push(
        `Soma das parcelas (${sum.toFixed(2)}) exceeds total (${totalAmount.toFixed(2)})`
      );
      return [];
    }

    adjustedInstallments[adjustedInstallments.length - 1].amount = lastAmount;

    // Validate each installment
    adjustedInstallments.forEach((inst, index) => {
      if (inst.amount <= 0) {
        validation.errors.push(`Parcela ${index + 1} tem valor inválido: R$ ${inst.amount}`);
      }

      if (!inst.dueDate || !(inst.dueDate instanceof Date)) {
        validation.errors.push(`Parcela ${index + 1} tem data inválida`);
      }

      if (!inst.description || inst.description.trim() === '') {
        validation.warnings.push(`Parcela ${index + 1} sem descrição`);
      }
    });

    return adjustedInstallments;
  }

  /**
   * Generate installment dates based on parameters
   */
  static generateInstallmentDates(
    firstDueDate: Date,
    count: number,
    fixedDay?: number
  ): Date[] {
    const dates: Date[] = [];

    for (let i = 0; i < count; i++) {
      const dueDate = new Date(firstDueDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      // Apply fixed day if specified
      if (fixedDay && fixedDay > 0 && fixedDay <= 31) {
        dueDate.setDate(fixedDay);
      }

      dates.push(dueDate);
    }

    return dates;
  }

  /**
   * Calculate installment amounts with even distribution
   */
  static calculateInstallmentAmounts(totalAmount: number, installmentCount: number): number[] {
    if (installmentCount <= 0) {
      return [totalAmount];
    }

    const baseAmount = Number((totalAmount / installmentCount).toFixed(2));
    const amounts: number[] = [];

    for (let i = 0; i < installmentCount - 1; i++) {
      amounts.push(baseAmount);
    }

    // Last installment gets remainder to ensure exact total
    const lastAmount = Number((totalAmount - baseAmount * (installmentCount - 1)).toFixed(2));
    amounts.push(lastAmount);

    return amounts;
  }

  /**
   * Validate payment plan consistency
   */
  static validatePaymentPlan(paymentPlan: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!paymentPlan) {
      errors.push('Plano de pagamento não encontrado');
      return { isValid: false, errors, warnings };
    }

    if (!paymentPlan.installmentCount || paymentPlan.installments.length === 0) {
      errors.push('Plano não tem parcelas');
      return { isValid: false, errors, warnings };
    }

    // Validate installment numbers are sequential
    const numbers = paymentPlan.installmentCount.map((inst: any) => inst.installmentNumber);
    const expectedNumbers = Array.from({ length: paymentPlan.installments.length }, (_, i) => i + 1);

    if (JSON.stringify(numbers) !== JSON.stringify(expectedNumbers)) {
      errors.push('Números de parcelas não sequenciais');
    }

    // Validate dates are in order
    let lastDate = new Date(0);
    paymentPlan.installmentCount.forEach((inst: any, index: number) => {
      const dueDate = new Date(inst.dueDate);
      if (dueDate < lastDate) {
        errors.push(`Parcela ${index + 1} tem data anterior à anterior`);
      }
      lastDate = dueDate;
    });

    // Validate all amounts are positive
    paymentPlan.installmentCount.forEach((inst: any, index: number) => {
      if (inst.amount <= 0) {
        errors.push(`Parcela ${index + 1} tem valor não-positivo`);
      }
    });

    // Calculate sum
    const sum = paymentPlan.installmentCount.reduce((acc: number, inst: any) => acc + inst.amount, 0);
    const difference = Math.abs(paymentPlan.totalAmount - sum);

    if (difference > 0.01) {
      // Allow 1 cent difference due to rounding
      errors.push(
        `Soma das parcelas (R$ ${sum.toFixed(2)}) não bate com total (R$ ${paymentPlan.totalAmount.toFixed(2)})`
      );
    } else if (difference > 0) {
      warnings.push(`Diferença de arredondamento detectada: R$ ${difference.toFixed(2)}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Recalculate payment plan if honoraryStructure changed
   */
  static async recalculatePaymentPlan(
    paymentPlanId: number,
    honoraryStructure: HonoraryStructure,
    transaction?: any
  ): Promise<PaymentPlanResult> {
    // Delete existing installments
    await PaymentInstallment.destroy({
      where: { paymentPlanId },
      transaction,
    });

    // Generate new plan
    return this.generatePaymentPlan(honoraryStructure, transaction);
  }

  /**
   * Get payment plan summary for display
   */
  static async getPaymentPlanSummary(paymentPlanId: number): Promise<{
    totalInstallments: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    nextDueDate: Date | null;
    completionPercentage: number;
  }> {
    const paymentPlan = await PaymentPlan.findByPk(paymentPlanId, {
      include: ['installments'],
    });

    if (!paymentPlan) {
      throw new Error(`PaymentPlan ${paymentPlanId} not found`);
    }

    const installments = (paymentPlan as any).installments || [];
    const totalAmount = installments.reduce((sum: number, inst: any) => sum + inst.amount, 0);
    const paidAmount = installments
      .filter((inst: any) => inst.status === PaymentStatus.PAID)
      .reduce((sum: number, inst: any) => sum + inst.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    // Find next due date
    const now = new Date();
    const nextInstallment = installments.find(
      (inst: any) => new Date(inst.dueDate) > now && inst.status !== PaymentStatus.PAID
    );

    const completionPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    return {
      totalInstallments: installments.length,
      totalAmount: Number(totalAmount.toFixed(2)),
      paidAmount: Number(paidAmount.toFixed(2)),
      pendingAmount: Number(pendingAmount.toFixed(2)),
      nextDueDate: nextInstallment ? new Date(nextInstallment.dueDate) : null,
      completionPercentage: Number(completionPercentage.toFixed(2)),
    };
  }

  /**
   * Mark installment as paid
   */
  static async markInstallmentAsPaid(
    installmentId: number,
    paidAt: Date = new Date(),
    transaction?: any
  ): Promise<PaymentInstallment> {
    const installment = await PaymentInstallment.findByPk(installmentId);

    if (!installment) {
      throw new Error(`PaymentInstallment ${installmentId} not found`);
    }

    await installment.update(
      {
        status: PaymentStatus.PAID,
        paidAt,
      },
      { transaction }
    );

    return installment;
  }

  /**
   * Detect overdue installments
   */
  static async getOverdueInstallments(paymentPlanId: number): Promise<PaymentInstallment[]> {
    const now = new Date();

    return PaymentInstallment.findAll({
      where: {
        paymentPlanId,
        status: PaymentStatus.PENDING,
        dueDate: {
          [require('sequelize').Op.lt]: now,
        },
      },
      order: [['dueDate', 'ASC']],
    });
  }

  /**
   * Get payment schedule for display (next N installments)
   */
  static async getPaymentSchedule(
    paymentPlanId: number,
    limit: number = 12
  ): Promise<PaymentInstallment[]> {
    return PaymentInstallment.findAll({
      where: {
        paymentPlanId,
      },
      order: [['dueDate', 'ASC']],
      limit,
    });
  }
}
