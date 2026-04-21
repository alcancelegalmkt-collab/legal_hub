import { HonoraryType, SuccessCalculationBase, SuccessPaymentMoment } from '../types/enums';

/**
 * Financial summary for display and validation
 */
export interface HonoraryCalculationSummary {
  honoraryType: HonoraryType;
  baseAmount: number;
  successAmount?: number;
  successPercentage?: number;
  discountAmount: number;
  discountedAmount: number;
  penaltyPercentage: number;
  delayInterestPercentage: number;
  monetaryCorrection: boolean;
  totalAmount: number;
  monthlyAmount?: number;
  months?: number;
  installments: number;
  installmentAmount?: number;
  installmentDates?: Date[];
  paymentSchedule: PaymentScheduleItem[];
  observations?: {
    base: string;
    success?: string;
    discount?: string;
    total: string;
  };
}

/**
 * Individual payment in a schedule
 */
export interface PaymentScheduleItem {
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  description: string;
  type: 'initial' | 'installment' | 'success' | 'monthly';
}

/**
 * Honorary structure input for calculations
 */
export interface HonoraryInput {
  honoraryType: HonoraryType;
  initialValue?: number;
  initialInstallments?: number;
  initialFirstDueDate?: Date;
  initialFixedDay?: number;
  successPercentage?: number;
  successCalculationBase?: SuccessCalculationBase;
  successPaymentMoment?: SuccessPaymentMoment;
  estimatedCauseValue?: number;
  monthlyValue?: number;
  contractDuration?: string;
  discountAmount?: number;
  penaltyPercentage?: number;
  delayInterestPercentage?: number;
  monetaryCorrection?: boolean;
}

/**
 * Comprehensive service for calculating all honorary-related financial values
 */
export class HonoraryCalculationService {
  /**
   * Calculate complete summary for a honorary structure
   */
  static calculateSummary(input: HonoraryInput): HonoraryCalculationSummary {
    let baseAmount = 0;
    let successAmount = 0;
    let monthlyAmount = 0;
    let months = 0;
    let installmentCount = 1;
    let installmentAmount = 0;
    let installmentDates: Date[] = [];
    let paymentSchedule: PaymentScheduleItem[] = [];

    switch (input.honoraryType) {
      case HonoraryType.INITIAL_SUCCESS:
        baseAmount = input.initialValue || 0;
        installmentCount = input.initialInstallments || 1;
        successAmount = this.calculateSuccessFee(
          input.estimatedCauseValue || 0,
          input.successPercentage || 0,
          input.successCalculationBase || SuccessCalculationBase.GROSS
        );
        installmentDates = this.generateInstallmentDates(
          input.initialFirstDueDate,
          installmentCount,
          input.initialFixedDay
        );
        paymentSchedule = this.generateInitialSuccessSchedule(
          baseAmount,
          installmentCount,
          successAmount,
          input.successPaymentMoment || SuccessPaymentMoment.AGREEMENT,
          installmentDates
        );
        installmentAmount = installmentCount > 0 ? baseAmount / installmentCount : 0;
        break;

      case HonoraryType.UNIQUE:
        baseAmount = input.initialValue || 0;
        paymentSchedule = [
          {
            installmentNumber: 1,
            dueDate: input.initialFirstDueDate || new Date(),
            amount: baseAmount,
            description: 'Honorário único',
            type: 'initial',
          },
        ];
        break;

      case HonoraryType.SUCCESS_ONLY:
        baseAmount = 0;
        successAmount = this.calculateSuccessFee(
          input.estimatedCauseValue || 0,
          input.successPercentage || 0,
          input.successCalculationBase || SuccessCalculationBase.GROSS
        );
        paymentSchedule = [
          {
            installmentNumber: 1,
            dueDate: input.initialFirstDueDate || new Date(),
            amount: successAmount,
            description: 'Honorário de sucesso',
            type: 'success',
          },
        ];
        break;

      case HonoraryType.MONTHLY:
        monthlyAmount = input.monthlyValue || 0;
        months = this.getMonthsFromDuration(input.contractDuration || 'indefinite');
        baseAmount = monthlyAmount * months;
        installmentCount = months;
        paymentSchedule = this.generateMonthlySchedule(
          monthlyAmount,
          months,
          input.initialFirstDueDate || new Date()
        );
        break;
    }

    // Calculate discounts and final amount
    const discountAmount = input.discountAmount || 0;
    const discountedAmount = Math.max(0, baseAmount + successAmount - discountAmount);
    const totalAmount = discountedAmount;

    return {
      honoraryType: input.honoraryType,
      baseAmount,
      successAmount: successAmount > 0 ? successAmount : undefined,
      successPercentage: input.successPercentage,
      discountAmount,
      discountedAmount,
      penaltyPercentage: input.penaltyPercentage || 0,
      delayInterestPercentage: input.delayInterestPercentage || 0,
      monetaryCorrection: input.monetaryCorrection || false,
      totalAmount,
      monthlyAmount: monthlyAmount > 0 ? monthlyAmount : undefined,
      months: months > 0 ? months : undefined,
      installments: installmentCount,
      installmentAmount: installmentAmount > 0 ? installmentAmount : undefined,
      installmentDates: installmentDates.length > 0 ? installmentDates : undefined,
      paymentSchedule,
      observations: this.generateObservations(input),
    };
  }

  /**
   * Calculate success fee based on different calculation bases
   */
  private static calculateSuccessFee(
    estimatedCauseValue: number,
    percentage: number,
    base: SuccessCalculationBase
  ): number {
    if (!estimatedCauseValue || !percentage) return 0;

    switch (base) {
      case SuccessCalculationBase.GROSS:
        return (estimatedCauseValue * percentage) / 100;
      case SuccessCalculationBase.NET:
        // Assume ~30% in taxes/costs for net calculation
        const netValue = estimatedCauseValue * 0.7;
        return (netValue * percentage) / 100;
      case SuccessCalculationBase.RECEIVED:
        // For received, we calculate as if 100% was received
        return (estimatedCauseValue * percentage) / 100;
      default:
        return (estimatedCauseValue * percentage) / 100;
    }
  }

  /**
   * Generate installment payment dates
   */
  private static generateInstallmentDates(
    firstDueDate: Date | undefined,
    count: number,
    fixedDay?: number
  ): Date[] {
    const dates: Date[] = [];
    const startDate = firstDueDate ? new Date(firstDueDate) : new Date();

    for (let i = 0; i < count; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      if (fixedDay && fixedDay > 0 && fixedDay <= 31) {
        dueDate.setDate(fixedDay);
      }

      dates.push(dueDate);
    }

    return dates;
  }

  /**
   * Generate payment schedule for initial + success structure
   */
  private static generateInitialSuccessSchedule(
    initialAmount: number,
    installments: number,
    successAmount: number,
    successPaymentMoment: SuccessPaymentMoment,
    installmentDates: Date[]
  ): PaymentScheduleItem[] {
    const schedule: PaymentScheduleItem[] = [];
    const installmentAmount = installments > 0 ? initialAmount / installments : 0;

    // Add initial installments
    for (let i = 0; i < installments; i++) {
      schedule.push({
        installmentNumber: i + 1,
        dueDate: installmentDates[i] || new Date(),
        amount: installmentAmount,
        description: `Parcela ${i + 1} de ${installments} (honorário inicial)`,
        type: 'installment',
      });
    }

    // Add success fee based on payment moment
    const successDueDate = this.calculateSuccessDueDate(
      installmentDates[installmentDates.length - 1] || new Date(),
      successPaymentMoment
    );

    if (successAmount > 0) {
      schedule.push({
        installmentNumber: installments + 1,
        dueDate: successDueDate,
        amount: successAmount,
        description: this.getSuccessDescription(successPaymentMoment),
        type: 'success',
      });
    }

    return schedule;
  }

  /**
   * Generate payment schedule for monthly structure
   */
  private static generateMonthlySchedule(
    monthlyAmount: number,
    months: number,
    firstDueDate: Date
  ): PaymentScheduleItem[] {
    const schedule: PaymentScheduleItem[] = [];

    for (let i = 0; i < months; i++) {
      const dueDate = new Date(firstDueDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        installmentNumber: i + 1,
        dueDate,
        amount: monthlyAmount,
        description: `Mês ${i + 1} de ${months}`,
        type: 'monthly',
      });
    }

    return schedule;
  }

  /**
   * Calculate due date for success fee based on payment moment
   */
  private static calculateSuccessDueDate(
    lastInstallmentDate: Date,
    moment: SuccessPaymentMoment
  ): Date {
    const dueDate = new Date(lastInstallmentDate);

    switch (moment) {
      case SuccessPaymentMoment.AGREEMENT:
        // Immediately when agreement is signed
        return new Date();
      case SuccessPaymentMoment.RELEASE:
        // 30 days after last installment
        dueDate.setDate(dueDate.getDate() + 30);
        return dueDate;
      case SuccessPaymentMoment.RECEIVED:
        // 15 days after last installment (assuming money will be received)
        dueDate.setDate(dueDate.getDate() + 15);
        return dueDate;
      case SuccessPaymentMoment.BENEFIT:
        // 60 days (time for benefit to be received in social cases)
        dueDate.setDate(dueDate.getDate() + 60);
        return dueDate;
      case SuccessPaymentMoment.OTHER:
        // Default to 30 days
        dueDate.setDate(dueDate.getDate() + 30);
        return dueDate;
      default:
        return dueDate;
    }
  }

  /**
   * Get description for success payment moment
   */
  private static getSuccessDescription(moment: SuccessPaymentMoment): string {
    switch (moment) {
      case SuccessPaymentMoment.AGREEMENT:
        return 'Honorário de sucesso (no acordo)';
      case SuccessPaymentMoment.RELEASE:
        return 'Honorário de sucesso (na liberação)';
      case SuccessPaymentMoment.RECEIVED:
        return 'Honorário de sucesso (quando receber)';
      case SuccessPaymentMoment.BENEFIT:
        return 'Honorário de sucesso (ao receber o benefício)';
      case SuccessPaymentMoment.OTHER:
        return 'Honorário de sucesso (conforme acordado)';
      default:
        return 'Honorário de sucesso';
    }
  }

  /**
   * Get number of months from contract duration string
   */
  private static getMonthsFromDuration(duration: string): number {
    switch (duration) {
      case 'indefinite':
        return 12;
      case '3':
        return 3;
      case '6':
        return 6;
      case '12':
        return 12;
      default:
        return 12;
    }
  }

  /**
   * Calculate penalty amount for late payment
   */
  static calculatePenalty(amount: number, penaltyPercentage: number): number {
    if (!amount || !penaltyPercentage) return 0;
    return (amount * penaltyPercentage) / 100;
  }

  /**
   * Calculate interest for delayed payment
   */
  static calculateDelayInterest(
    amount: number,
    interestPercentage: number,
    daysOverdue: number
  ): number {
    if (!amount || !interestPercentage || !daysOverdue) return 0;
    // Simple interest calculation: amount * (percentage / 100) * (days / 30)
    return (amount * interestPercentage * daysOverdue) / 100 / 30;
  }

  /**
   * Calculate monetary correction (IPCA or similar)
   */
  static calculateMonetaryCorrection(
    amount: number,
    correctionRate: number = 0.0066 // ~0.66% per month average IPCA
  ): number {
    if (!amount) return 0;
    return (amount * correctionRate) / 100;
  }

  /**
   * Calculate total amount due including penalties and interest
   */
  static calculateTotalDue(
    baseAmount: number,
    penaltyPercentage: number = 0,
    delayInterestPercentage: number = 0,
    daysOverdue: number = 0,
    applyMonetaryCorrection: boolean = false
  ): {
    baseAmount: number;
    penalty: number;
    interest: number;
    correction: number;
    totalDue: number;
  } {
    const penalty = this.calculatePenalty(baseAmount, penaltyPercentage);
    const interest = this.calculateDelayInterest(baseAmount, delayInterestPercentage, daysOverdue);
    const correction = applyMonetaryCorrection ? this.calculateMonetaryCorrection(baseAmount) : 0;
    const totalDue = baseAmount + penalty + interest + correction;

    return {
      baseAmount,
      penalty,
      interest,
      correction,
      totalDue,
    };
  }

  /**
   * Validate honorary amount ranges
   */
  static validateHonoraryAmount(amount: number, honoraryType: HonoraryType): {
    valid: boolean;
    message?: string;
  } {
    const MIN_AMOUNT = 100; // R$ 100 minimum
    const MAX_AMOUNT = 1000000; // R$ 1 million maximum

    if (amount < MIN_AMOUNT) {
      return {
        valid: false,
        message: `Valor mínimo para honorários é R$ ${MIN_AMOUNT.toFixed(2)}`,
      };
    }

    if (amount > MAX_AMOUNT) {
      return {
        valid: false,
        message: `Valor máximo para honorários é R$ ${MAX_AMOUNT.toFixed(2)}`,
      };
    }

    // Type-specific validations
    if (honoraryType === HonoraryType.SUCCESS_ONLY && amount < 500) {
      return {
        valid: false,
        message: 'Honorário de sucesso deve ser no mínimo R$ 500',
      };
    }

    if (honoraryType === HonoraryType.MONTHLY && amount < 500) {
      return {
        valid: false,
        message: 'Honorário mensal deve ser no mínimo R$ 500',
      };
    }

    return { valid: true };
  }

  /**
   * Validate success percentage
   */
  static validateSuccessPercentage(percentage: number): {
    valid: boolean;
    message?: string;
  } {
    if (percentage < 5) {
      return {
        valid: false,
        message: 'Percentual de sucesso mínimo é 5%',
      };
    }

    if (percentage > 50) {
      return {
        valid: false,
        message: 'Percentual de sucesso máximo é 50%',
      };
    }

    return { valid: true };
  }

  /**
   * Generate observations explaining the calculation
   */
  private static generateObservations(
    input: HonoraryInput
  ): {
    base: string;
    success?: string;
    discount?: string;
    total: string;
  } {
    const obs: any = {};

    switch (input.honoraryType) {
      case HonoraryType.INITIAL_SUCCESS:
        obs.base = `R$ ${(input.initialValue || 0).toFixed(2)} em ${input.initialInstallments || 1}x`;
        if (input.successPercentage) {
          obs.success = `${input.successPercentage}% sobre ${input.successCalculationBase === SuccessCalculationBase.NET ? 'valor líquido' : 'valor bruto'}`;
        }
        break;

      case HonoraryType.UNIQUE:
        obs.base = `R$ ${(input.initialValue || 0).toFixed(2)} única`;
        break;

      case HonoraryType.SUCCESS_ONLY:
        if (input.successPercentage) {
          obs.base = `${input.successPercentage}% sobre ${input.successCalculationBase || 'valor bruto'}`;
          obs.success = `Sem honorário inicial, apenas em caso de sucesso`;
        }
        break;

      case HonoraryType.MONTHLY:
        obs.base = `R$ ${(input.monthlyValue || 0).toFixed(2)}/mês por ${input.contractDuration || '12 meses'}`;
        break;
    }

    if (input.discountAmount && input.discountAmount > 0) {
      obs.discount = `Desconto de R$ ${input.discountAmount.toFixed(2)}`;
    }

    const total = (input.initialValue || 0) + (input.monthlyValue || 0);
    obs.total = `Total estimado: R$ ${total.toFixed(2)}`;

    return obs;
  }

  /**
   * Format money value for display
   */
  static formatMoney(value: number, currency: string = 'BRL'): string {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    });
    return formatter.format(value);
  }

  /**
   * Parse money string to number
   */
  static parseMoney(value: string): number {
    return parseFloat(value.replace(/[^\d.-]/g, ''));
  }
}
