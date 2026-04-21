import { Lead, Client, Responsavel, ProposalAcceptance } from '../models';
import { LeadStatus, AcceptanceMethod } from '../types/enums';
import { sequelize } from '../models';

/**
 * Conversion result with validation details
 */
export interface ConversionResult {
  success: boolean;
  leadId: number;
  clientId?: number;
  clientWasNew: boolean;
  clientWasExisting: boolean;
  clientWasMerged: boolean;
  message: string;
  warnings: string[];
  errors: string[];
}

/**
 * Service for automatic Lead to Client conversion
 * Triggered when ProposalAcceptance is accepted
 * Ensures no duplicates and maintains referential integrity
 */
export class LeadToClientConversionService {
  /**
   * Convert Lead to Client - AUTOMATIC trigger point
   * Called when ProposalAcceptance.acceptanceMethod is set (proposal accepted)
   */
  static async convertLeadToClientOnAcceptance(
    leadId: number,
    proposalAcceptanceId: number
  ): Promise<ConversionResult> {
    const transaction = await sequelize.transaction();

    const result: ConversionResult = {
      success: false,
      leadId,
      clientWasNew: false,
      clientWasExisting: false,
      clientWasMerged: false,
      message: '',
      warnings: [],
      errors: [],
    };

    try {
      // Step 1: Validate Lead exists and is not already converted
      const lead = await Lead.findByPk(leadId, {
        include: ['LeadDetails', 'responsavel'],
        transaction,
      });

      if (!lead) {
        result.errors.push(`Lead ${leadId} não encontrado`);
        await transaction.rollback();
        return result;
      }

      // Already converted?
      if (lead.status === LeadStatus.CONVERTED && lead.clientId) {
        result.clientWasExisting = true;
        result.clientId = lead.clientId;
        result.message = 'Lead já está convertido para cliente';
        result.success = true;
        await transaction.rollback();
        return result;
      }

      // Step 2: Validate ProposalAcceptance exists
      const acceptance = await ProposalAcceptance.findByPk(proposalAcceptanceId, {
        transaction,
      });

      if (!acceptance) {
        result.errors.push(`ProposalAcceptance ${proposalAcceptanceId} não encontrado`);
        await transaction.rollback();
        return result;
      }

      if (!acceptance.acceptanceMethod) {
        result.errors.push('ProposalAcceptance não tem acceptanceMethod definido');
        await transaction.rollback();
        return result;
      }

      // Step 3: Check for existing client (avoid duplicates)
      const existingClient = await this.findExistingClient(lead, transaction);

      let client: Client;

      if (existingClient) {
        // Step 4a: Merge with existing client
        client = await this.mergeWithExistingClient(lead, existingClient, transaction);
        result.clientWasExisting = true;
        result.clientWasMerged = true;
        result.message = `Lead vinculado ao cliente existente ${existingClient.id}`;
      } else {
        // Step 4b: Create new client
        client = await this.createNewClient(lead, transaction);
        result.clientWasNew = true;
        result.message = `Novo cliente criado: ${client.id}`;
      }

      result.clientId = client.id;

      // Step 5: Link Lead to Client
      await lead.update(
        {
          clientId: client.id,
          status: LeadStatus.CONVERTED,
        },
        { transaction }
      );

      // Step 6: Update related records
      await this.updateLeadRelationships(lead.id, client.id, transaction);

      // Step 7: Commit transaction
      await transaction.commit();
      result.success = true;

      console.log(`✅ Lead ${leadId} convertido para Cliente ${client.id}`);
      return result;
    } catch (error) {
      await transaction.rollback();
      result.errors.push(`Erro na conversão: ${(error as any).message}`);
      console.error(`❌ Erro ao converter Lead ${leadId}:`, error);
      return result;
    }
  }

  /**
   * Manual conversion trigger (fallback/recovery)
   */
  static async convertLeadToClientManual(
    leadId: number,
    _acceptanceMethod: AcceptanceMethod = AcceptanceMethod.DIGITAL
  ): Promise<ConversionResult> {
    const transaction = await sequelize.transaction();

    const result: ConversionResult = {
      success: false,
      leadId,
      clientWasNew: false,
      clientWasExisting: false,
      clientWasMerged: false,
      message: '',
      warnings: [],
      errors: [],
    };

    try {
      // Validate Lead
      const lead = await Lead.findByPk(leadId, {
        include: ['LeadDetails', 'responsavel'],
        transaction,
      });

      if (!lead) {
        result.errors.push(`Lead ${leadId} não encontrado`);
        await transaction.rollback();
        return result;
      }

      // Already converted?
      if (lead.status === LeadStatus.CONVERTED && lead.clientId) {
        result.clientWasExisting = true;
        result.clientId = lead.clientId;
        result.message = 'Lead já está convertido';
        result.success = true;
        await transaction.rollback();
        return result;
      }

      // Check for existing client
      const existingClient = await this.findExistingClient(lead, transaction);

      let client: Client;

      if (existingClient) {
        client = await this.mergeWithExistingClient(lead, existingClient, transaction);
        result.clientWasExisting = true;
        result.clientWasMerged = true;
        result.message = `Lead vinculado ao cliente ${existingClient.id}`;
      } else {
        client = await this.createNewClient(lead, transaction);
        result.clientWasNew = true;
        result.message = `Novo cliente criado: ${client.id}`;
      }

      result.clientId = client.id;

      // Update lead
      await lead.update(
        {
          clientId: client.id,
          status: LeadStatus.CONVERTED,
        },
        { transaction }
      );

      // Update relationships
      await this.updateLeadRelationships(lead.id, client.id, transaction);

      await transaction.commit();
      result.success = true;

      return result;
    } catch (error) {
      await transaction.rollback();
      result.errors.push(`Erro na conversão: ${(error as any).message}`);
      return result;
    }
  }

  /**
   * Find existing client by CPF/Email to avoid duplicates
   */
  private static async findExistingClient(
    lead: Lead,
    transaction?: any
  ): Promise<Client | null> {
    const responsavel = await Responsavel.findOne({
      where: { leadId: lead.id },
      transaction,
    });

    if (!responsavel) {
      return null;
    }

    // Check by CPF
    if (responsavel.cpf) {
      const existingByCpf = await Client.findOne({
        where: { cpfCnpj: responsavel.cpf },
        transaction,
      });

      if (existingByCpf) {
        return existingByCpf;
      }
    }

    // Check by Email
    if (responsavel.email) {
      const existingByEmail = await Client.findOne({
        where: { email: responsavel.email },
        transaction,
      });

      if (existingByEmail) {
        return existingByEmail;
      }
    }

    return null;
  }

  /**
   * Create new client from lead data
   */
  private static async createNewClient(lead: Lead, transaction?: any): Promise<Client> {
    const responsavel = await Responsavel.findOne({
      where: { leadId: lead.id },
      transaction,
    });

    if (!responsavel) {
      throw new Error(`Responsavel for Lead ${lead.id} not found`);
    }

    return Client.create(
      {
        name: responsavel.nomeCompleto ?? '',
        cpfCnpj: responsavel.cpf ?? '',
        email: responsavel.email ?? '',
        phone: responsavel.telefone ?? '',
        whatsapp: responsavel.telefone ?? '',
        address: responsavel.endereco ?? '',
        city: responsavel.cidade ?? '',
        state: responsavel.estado ?? '',
        zipCode: responsavel.cep ?? '',
        maritalStatus: '',
        profession: '',
        rg: '',
        nationality: '',
        leadId: lead.id,
        primaryLawyerId: lead.userId,
        needsFinancialAid: false,
      } as any,
      { transaction }
    );
  }

  /**
   * Merge Lead data with existing client
   */
  private static async mergeWithExistingClient(
    lead: Lead,
    existingClient: Client,
    transaction?: any
  ): Promise<Client> {
    const responsavel = await Responsavel.findOne({
      where: { leadId: lead.id },
      transaction,
    });

    if (!responsavel) {
      return existingClient;
    }

    // Update client with lead data (fill gaps)
    const updates: any = {};

    if (!existingClient.email && responsavel.email) {
      updates.email = responsavel.email ?? '';
    }

    if (!existingClient.phone && responsavel.telefone) {
      updates.phone = responsavel.telefone ?? '';
    }

    if (!existingClient.whatsapp && responsavel.telefone) {
      updates.whatsapp = responsavel.telefone ?? '';
    }

    if (!existingClient.address && responsavel.endereco) {
      updates.address = responsavel.endereco ?? '';
    }

    if (!existingClient.city && responsavel.cidade) {
      updates.city = responsavel.cidade ?? '';
    }

    if (!existingClient.state && responsavel.estado) {
      updates.state = responsavel.estado ?? '';
    }

    if (!existingClient.zipCode && responsavel.cep) {
      updates.zipCode = responsavel.cep ?? '';
    }

    if (Object.keys(updates).length > 0) {
      await existingClient.update(updates, { transaction });
    }

    // Link lead to client
    if (!existingClient.leadId) {
      await existingClient.update({ leadId: lead.id }, { transaction });
    }

    return existingClient;
  }

  /**
   * Update all lead-related records to point to client
   */
  private static async updateLeadRelationships(
    _leadId: number,
    _clientId: number,
    _transaction?: any
  ): Promise<void> {
    // Note: Financial records and proposals already have their own relationships
    // This method can be extended to handle additional linkages if needed

    // For now, the main linkage is through Lead.clientId which is already done
    // Additional relationships would depend on specific business requirements
  }

  /**
   * Batch convert multiple leads (useful for migrations)
   */
  static async batchConvertLeads(leadIds: number[]): Promise<ConversionResult[]> {
    const results: ConversionResult[] = [];

    for (const leadId of leadIds) {
      const result = await this.convertLeadToClientManual(leadId);
      results.push(result);
    }

    return results;
  }

  /**
   * Get conversion status of a lead
   */
  static async getConversionStatus(leadId: number): Promise<{
    leadId: number;
    isConverted: boolean;
    clientId?: number;
    clientName?: string;
    conversionDate?: Date;
  }> {
    const lead = await Lead.findByPk(leadId, {
      include: ['client'],
    });

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    return {
      leadId,
      isConverted: lead.status === LeadStatus.CONVERTED && !!lead.clientId,
      clientId: lead.clientId || undefined,
      clientName: (lead as any).client?.name || undefined,
      conversionDate: lead.updatedAt,
    };
  }

  /**
   * Revert conversion (for testing/recovery)
   */
  static async revertConversion(leadId: number): Promise<boolean> {
    const lead = await Lead.findByPk(leadId);

    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    await lead.update({
      clientId: null,
      status: LeadStatus.PROPOSAL_SENT,
    });

    return true;
  }

  /**
   * Find unconverted leads
   */
  static async findUnconvertedLeads(limit: number = 50): Promise<Lead[]> {
    return Lead.findAll({
      where: {
        status: LeadStatus.PROPOSAL_SENT,
        clientId: null,
      },
      include: ['proposal'],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  /**
   * Find accepted but not converted proposals
   */
  static async findAcceptedButNotConvertedLeads(): Promise<Lead[]> {
    const unconverted = await this.findUnconvertedLeads(1000);

    const filtered: Lead[] = [];

    for (const lead of unconverted) {
      const proposal = (lead as any).proposal;
      if (proposal) {
        const acceptance = await ProposalAcceptance.findOne({
          where: { proposalId: proposal.id },
        });

        if (acceptance && acceptance.acceptanceMethod) {
          filtered.push(lead);
        }
      }
    }

    return filtered;
  }

  /**
   * Auto-convert all accepted leads
   */
  static async autoConvertAcceptedLeads(): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: ConversionResult[];
  }> {
    const leads = await this.findAcceptedButNotConvertedLeads();
    const results: ConversionResult[] = [];

    let successful = 0;
    let failed = 0;

    for (const lead of leads) {
      try {
        const result = await this.convertLeadToClientManual(lead.id);
        results.push(result);

        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        results.push({
          success: false,
          leadId: lead.id,
          clientWasNew: false,
          clientWasExisting: false,
          clientWasMerged: false,
          message: `Erro: ${(error as any).message}`,
          warnings: [],
          errors: [(error as any).message],
        });
      }
    }

    return {
      total: leads.length,
      successful,
      failed,
      results,
    };
  }
}
