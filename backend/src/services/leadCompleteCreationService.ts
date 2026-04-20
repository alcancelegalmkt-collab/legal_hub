import {
  Lead,
  LeadDetails,
  Responsavel,
  Dependente,
  HonoraryStructure,
  PaymentPlan,
  PaymentInstallment,
  Proposal,
  ProposalAcceptance,
  FinancialRecord,
  Client,
} from '../models';
import { LeadStatus, HonoraryType, PaymentStatus, AcceptanceMethod, ProposalStatus, PaymentMethod, SuccessCalculationBase, SuccessPaymentMoment, ContractDuration } from '../types/enums';
import { sequelize } from '../models';

interface Block1Data {
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  whatsapp?: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface Block2Data {
  legalAreaId: number;
  caseTypeId: number;
  tipoDemanda: string;
  resumoCaso: string;
  objetivoCliente: string;
}

interface Block3Data {
  possuiDependente: boolean;
  dependentes: Array<{
    nomeCompleto: string;
    dataNascimento: string;
    cpf?: string;
    parentesco: string;
    condicaoEspecifica?: string;
  }>;
}

interface Block4Data {
  honoraryType: HonoraryType;
  initialValue?: number;
  initialPaymentMethod?: string;
  initialInstallments?: number;
  initialFirstDueDate?: string;
  initialFixedDay?: number;
  successPercentage?: number;
  successCalculationBase?: 'gross' | 'net' | 'received';
  successPaymentMoment?: string;
  estimatedCauseValue?: number;
  monthlyValue?: number;
  contractDuration?: string;
  discountAmount?: number;
  penaltyPercentage?: number;
  delayInterestPercentage?: number;
  monetaryCorrection?: boolean;
  contractualHonorariesIndependent?: boolean;
  agreementOnlyWithAdvocate?: boolean;
  notes?: string;
}

interface Block5Data {
  observations?: string;
}

interface Block6Data {
  acceptanceMethod: AcceptanceMethod;
  acceptedAt: string;
  observations?: string;
}

interface Block7Data {
  totalValue: number;
  paidValue: number;
  notes?: string;
}

interface LeadCompletePayload {
  responsavel: Block1Data;
  leadDetails: Block2Data;
  dependentes: Block3Data['dependentes'];
  honoraryStructure: Block4Data;
  proposal: Block5Data;
  acceptance: Block6Data;
  financialRecord: Block7Data;
}

interface LeadCreationResult {
  lead: Lead;
  leadDetails: LeadDetails;
  responsavel: Responsavel;
  dependentes: Dependente[];
  honoraryStructure: HonoraryStructure;
  paymentPlan?: PaymentPlan;
  paymentInstallments: PaymentInstallment[];
  proposal: Proposal;
  proposalAcceptance: ProposalAcceptance;
  financialRecord: FinancialRecord;
  client?: Client;
}

export class LeadCompleteCreationService {
  /**
   * Create a complete lead with all 7 blocks in a single transaction
   * This orchestrates the entire workflow from lead creation to proposal acceptance
   */
  static async createCompleteLead(
    payload: LeadCompletePayload,
    userId: number
  ): Promise<LeadCreationResult> {
    const transaction = await sequelize.transaction();

    try {
      // Step 1: Create Lead
      const lead = await Lead.create(
        {
          userId,
          legalAreaId: payload.leadDetails.legalAreaId,
          caseTypeId: payload.leadDetails.caseTypeId,
          status: LeadStatus.NEW,
          // Legacy fields for backward compatibility
          legalArea: '',
          tipoDemanda: payload.leadDetails.tipoDemanda,
          resumoCaso: payload.leadDetails.resumoCaso,
          objetivoCliente: payload.leadDetails.objetivoCliente,
        },
        { transaction }
      );

      // Step 2: Create LeadDetails
      const leadDetails = await LeadDetails.create(
        {
          leadId: lead.id,
          clientSummary: payload.leadDetails.resumoCaso,
          clientObjective: payload.leadDetails.objetivoCliente,
        },
        { transaction }
      );

      // Step 3: Create Responsavel (payment responsible for this lead)
      const responsavel = await Responsavel.create(
        {
          leadId: lead.id,
          nomeCompleto: payload.responsavel.nomeCompleto,
          cpf: payload.responsavel.cpf,
          email: payload.responsavel.email,
          telefone: payload.responsavel.telefone,
          endereco: payload.responsavel.endereco,
          cidade: payload.responsavel.cidade,
          estado: payload.responsavel.estado,
          cep: payload.responsavel.cep,
        },
        { transaction }
      );

      // Step 4: Create Dependentes if applicable
      const dependentes = await Promise.all(
        payload.dependentes.map((dep) =>
          Dependente.create(
            {
              leadId: lead.id,
              nomeCompleto: dep.nomeCompleto,
              dataNascimento: new Date(dep.dataNascimento),
              cpf: dep.cpf,
              parentesco: dep.parentesco,
              condicaoEspecifica: dep.condicaoEspecifica,
            },
            { transaction }
          )
        )
      );

      // Step 5: Create HonoraryStructure
      const honoraryStructure = await HonoraryStructure.create(
        {
          leadId: lead.id,
          honoraryType: payload.honoraryStructure.honoraryType as HonoraryType,
          initialValue: payload.honoraryStructure.initialValue,
          initialPaymentMethod: payload.honoraryStructure.initialPaymentMethod as PaymentMethod | undefined,
          initialInstallments: payload.honoraryStructure.initialInstallments,
          initialFirstDueDate: payload.honoraryStructure.initialFirstDueDate ? new Date(payload.honoraryStructure.initialFirstDueDate) : undefined,
          initialFixedDay: payload.honoraryStructure.initialFixedDay,
          successPercentage: payload.honoraryStructure.successPercentage,
          successCalculationBase: payload.honoraryStructure.successCalculationBase as SuccessCalculationBase | undefined,
          successPaymentMoment: payload.honoraryStructure.successPaymentMoment as SuccessPaymentMoment | undefined,
          estimatedCauseValue: payload.honoraryStructure.estimatedCauseValue,
          monthlyValue: payload.honoraryStructure.monthlyValue,
          contractDuration: payload.honoraryStructure.contractDuration as ContractDuration | undefined,
          discountAmount: payload.honoraryStructure.discountAmount,
          penaltyPercentage: payload.honoraryStructure.penaltyPercentage,
          delayInterestPercentage: payload.honoraryStructure.delayInterestPercentage,
          monetaryCorrection: payload.honoraryStructure.monetaryCorrection,
          contractualHonorariesIndependent: payload.honoraryStructure.contractualHonorariesIndependent,
          agreementOnlyWithAdvocate: payload.honoraryStructure.agreementOnlyWithAdvocate,
          currency: 'BRL',
          notes: payload.honoraryStructure.notes,
        },
        { transaction }
      );

      // Step 6: Create PaymentPlan and PaymentInstallments if installments > 1
      let paymentPlan: PaymentPlan | undefined;
      let paymentInstallments: PaymentInstallment[] = [];

      if (
        payload.honoraryStructure.initialInstallments &&
        payload.honoraryStructure.initialInstallments > 1 &&
        payload.honoraryStructure.initialFirstDueDate
      ) {
        paymentPlan = await PaymentPlan.create(
          {
            honoraryStructureId: honoraryStructure.id,
            paymentMethod: payload.honoraryStructure.initialPaymentMethod as PaymentMethod,
            installments: payload.honoraryStructure.initialInstallments!,
            firstDueDate: new Date(payload.honoraryStructure.initialFirstDueDate!),
            fixedDay: payload.honoraryStructure.initialFixedDay,
          },
          { transaction }
        );

        // Generate PaymentInstallments
        const installmentAmount =
          (payload.honoraryStructure.initialValue || 0) / (payload.honoraryStructure.initialInstallments || 1);

        paymentInstallments = await Promise.all(
          Array.from({ length: payload.honoraryStructure.initialInstallments! }, (_, i) => {
            const dueDate = new Date(payload.honoraryStructure.initialFirstDueDate!);
            dueDate.setMonth(dueDate.getMonth() + i);

            return PaymentInstallment.create(
              {
                paymentPlanId: paymentPlan!.id,
                installmentNumber: i + 1,
                dueDate,
                amount: installmentAmount,
                status: PaymentStatus.PENDING as PaymentStatus,
              },
              { transaction }
            );
          })
        );
      }

      // Step 7: Create Proposal
      const proposalNumber = this.generateProposalNumber();
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      const proposal = await Proposal.create(
        {
          leadId: lead.id,
          proposalNumber,
          generatedAt: new Date(),
          validUntil,
          status: ProposalStatus.DRAFT,
          htmlContent: '<p>Proposta será renderizada aqui</p>',
          responsibleUserId: userId,
          observations: payload.proposal.observations,
        },
        { transaction }
      );

      // Step 8: Create ProposalAcceptance
      const proposalAcceptance = await ProposalAcceptance.create(
        {
          proposalId: proposal.id,
          acceptedAt: new Date(payload.acceptance.acceptedAt),
          acceptanceMethod: payload.acceptance.acceptanceMethod as AcceptanceMethod,
          observations: payload.acceptance.observations,
        },
        { transaction }
      );

      // Step 9: Create FinancialRecord
      const financialRecord = await FinancialRecord.create(
        {
          clientId: lead.clientId || 0, // Will be updated when client is created
          leadId: lead.id,
          proposalAcceptanceId: proposalAcceptance.id,
          totalValue: payload.financialRecord.totalValue,
          paidValue: payload.financialRecord.paidValue,
          pendingValue: payload.financialRecord.totalValue - payload.financialRecord.paidValue,
          notes: payload.financialRecord.notes,
        },
        { transaction }
      );

      // Step 10: Update Lead with relationships
      await lead.update(
        {
          proposalId: proposal.id,
          proposalAcceptanceId: proposalAcceptance.id,
          financialRecordId: financialRecord.id,
          status: LeadStatus.PROPOSAL_SENT,
        },
        { transaction }
      );

      // Step 11: Convert Lead to Client (optional, if acceptance method is specified)
      let client: Client | undefined;
      if (payload.acceptance.acceptanceMethod) {
        client = await this.convertLeadToClient(
          lead.id,
          payload.responsavel,
          userId,
          transaction
        );

        // Update FinancialRecord with clientId
        await financialRecord.update({ clientId: client.id }, { transaction });
      }

      await transaction.commit();

      return {
        lead,
        leadDetails,
        responsavel,
        dependentes,
        honoraryStructure,
        paymentPlan,
        paymentInstallments,
        proposal,
        proposalAcceptance,
        financialRecord,
        client,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Convert a Lead to a Client
   * Creates the Client record and links it to the Lead
   */
  private static async convertLeadToClient(
    leadId: number,
    responsavelData: Block1Data,
    userId: number,
    transaction: any
  ): Promise<Client> {
    const client = await Client.create(
      {
        name: responsavelData.nomeCompleto,
        cpfCnpj: responsavelData.cpf,
        email: responsavelData.email,
        phone: responsavelData.telefone,
        whatsapp: responsavelData.whatsapp || responsavelData.telefone,
        maritalStatus: '',
        profession: '',
        address: responsavelData.endereco,
        city: responsavelData.cidade,
        state: responsavelData.estado,
        zipCode: responsavelData.cep,
        rg: '',
        nationality: '',
        primaryLawyerId: userId,
        leadId,
        needsFinancialAid: false,
      },
      { transaction }
    );

    // Update Lead status to converted
    await Lead.update(
      { clientId: client.id, status: LeadStatus.CONVERTED },
      { where: { id: leadId }, transaction }
    );

    return client;
  }

  /**
   * Generate a unique proposal number in format: PROP-YYYY-NNNN
   */
  private static generateProposalNumber(): string {
    const year = new Date().getFullYear();
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `PROP-${year}-${random}`;
  }

  /**
   * Calculate total value including success fees
   */
  static calculateTotalValue(
    honoraryStructure: any,
    estimatedCauseValue?: number
  ): number {
    let total = 0;

    switch (honoraryStructure.honoraryType) {
      case HonoraryType.INITIAL_SUCCESS:
        total = (honoraryStructure.initialValue || 0);
        if (estimatedCauseValue && honoraryStructure.successPercentage) {
          const successFee = (estimatedCauseValue * honoraryStructure.successPercentage) / 100;
          total += successFee;
        }
        break;

      case HonoraryType.UNIQUE:
        total = honoraryStructure.initialValue || 0;
        break;

      case HonoraryType.SUCCESS_ONLY:
        if (estimatedCauseValue && honoraryStructure.successPercentage) {
          total = (estimatedCauseValue * honoraryStructure.successPercentage) / 100;
        }
        break;

      case HonoraryType.MONTHLY:
        if (honoraryStructure.monthlyValue && honoraryStructure.contractDuration) {
          const months = this.getMonthsFromDuration(honoraryStructure.contractDuration);
          total = (honoraryStructure.monthlyValue || 0) * months;
        }
        break;
    }

    // Apply discount if exists
    if (honoraryStructure.discountAmount) {
      total -= honoraryStructure.discountAmount;
    }

    return Math.max(0, total);
  }

  /**
   * Get number of months from contract duration
   */
  private static getMonthsFromDuration(duration: string): number {
    switch (duration) {
      case 'indefinite':
        return 12; // Default to 1 year for indefinite
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
}
