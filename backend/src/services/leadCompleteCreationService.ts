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
import { LeadStatus, HonoraryType, AcceptanceMethod, ProposalStatus, PaymentMethod, SuccessCalculationBase, SuccessPaymentMoment, ContractDuration } from '../types/enums';
import { sequelize } from '../models';
import { HonoraryCalculationService } from './honoraryCalculationService';
import { PaymentPlanGenerationService } from './paymentPlanGenerationService';

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
  paymentPlan: PaymentPlan | null;
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

      // Step 5: Calculate honorary summary using HonoraryCalculationService
      const honoraryCalculation = HonoraryCalculationService.calculateSummary({
        honoraryType: payload.honoraryStructure.honoraryType,
        initialValue: payload.honoraryStructure.initialValue,
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
      });

      // Step 6: Create HonoraryStructure
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

      // Step 7: Generate PaymentPlan and PaymentInstallments
      const paymentPlanResult = await PaymentPlanGenerationService.generatePaymentPlan(
        honoraryStructure,
        transaction
      );

      if (!paymentPlanResult.validation.isValid && paymentPlanResult.validation.errors.length > 0) {
        throw new Error(`Payment plan validation failed: ${paymentPlanResult.validation.errors.join(', ')}`);
      }

      // Log any warnings
      if (paymentPlanResult.validation.warnings.length > 0) {
        console.warn('Payment plan warnings:', paymentPlanResult.validation.warnings);
      }

      const paymentPlan = paymentPlanResult.paymentPlan;
      const paymentInstallments = paymentPlanResult.installments;

      // Step 8: Create Proposal
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

      // Step 9: Create ProposalAcceptance
      const proposalAcceptance = await ProposalAcceptance.create(
        {
          proposalId: proposal.id,
          acceptedAt: new Date(payload.acceptance.acceptedAt),
          acceptanceMethod: payload.acceptance.acceptanceMethod as AcceptanceMethod,
          observations: payload.acceptance.observations,
        },
        { transaction }
      );

      // Step 10: Create FinancialRecord using calculated total value
      const financialRecordTotal = payload.financialRecord.totalValue || honoraryCalculation.totalAmount;
      const financialRecordPaid = payload.financialRecord.paidValue || 0;

      const financialRecord = await FinancialRecord.create(
        {
          clientId: lead.clientId || 0, // Will be updated when client is created
          leadId: lead.id,
          proposalAcceptanceId: proposalAcceptance.id,
          totalValue: financialRecordTotal,
          paidValue: financialRecordPaid,
          pendingValue: financialRecordTotal - financialRecordPaid,
          notes: payload.financialRecord.notes,
        },
        { transaction }
      );

      // Step 11: Convert Lead to Client (optional, if acceptance method is specified)
      let client: Client | undefined;
      let finalLeadStatus = LeadStatus.PROPOSAL_SENT;

      if (payload.acceptance.acceptanceMethod) {
        client = await this.convertLeadToClient(
          lead.id,
          payload.responsavel,
          userId,
          transaction
        );

        // Update FinancialRecord with clientId
        await financialRecord.update({ clientId: client.id }, { transaction });

        // Status changes to CONVERTED when lead becomes client
        finalLeadStatus = LeadStatus.CONVERTED;
      }

      // Step 12: Update Lead with final status and relationships
      await lead.update(
        {
          proposalId: proposal.id,
          proposalAcceptanceId: proposalAcceptance.id,
          financialRecordId: financialRecord.id,
          status: finalLeadStatus,
        },
        { transaction }
      );

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
   * Note: Status update is handled by createCompleteLead
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

    // Link client to lead (status update happens in createCompleteLead)
    await Lead.update(
      { clientId: client.id },
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
   * Calculate total value using HonoraryCalculationService
   */
  static calculateTotalValue(
    honoraryStructure: any
  ): number {
    const summary = HonoraryCalculationService.calculateSummary({
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
    return summary.totalAmount;
  }

}
