import sequelize from '../config/database';
import User from './User';
import Lead from './Lead';
import Client from './Client';
import Case from './Case';
import Document from './Document';
import Movimentacao from './Movimentacao';
import Responsavel from './Responsavel';
import Dependente from './Dependente';
import LegalArea from './LegalArea';
import CaseType from './CaseType';
import LeadDetails from './LeadDetails';
import HonoraryStructure from './HonoraryStructure';
import PaymentPlan from './PaymentPlan';
import PaymentInstallment from './PaymentInstallment';
import FinancialResponsible from './FinancialResponsible';
import Proposal from './Proposal';
import ProposalAcceptance from './ProposalAcceptance';
import FinancialRecord from './FinancialRecord';
import ContractTemplate from './ContractTemplate';
import GeneratedContract from './GeneratedContract';

// ========== LEGACY RELATIONSHIPS ==========
Lead.hasOne(Responsavel, { foreignKey: 'leadId', as: 'responsavel' });
Responsavel.belongsTo(Lead, { foreignKey: 'leadId' });

Lead.hasMany(Dependente, { foreignKey: 'leadId', as: 'dependentes' });
Dependente.belongsTo(Lead, { foreignKey: 'leadId' });

// ========== NEW RELATIONSHIPS FOR LEAD JOURNEY ==========

// Lead → User (creator)
Lead.belongsTo(User, { as: 'creator', foreignKey: 'userId' });
User.hasMany(Lead, { as: 'leads', foreignKey: 'userId' });

// Lead → LegalArea
Lead.belongsTo(LegalArea, { as: 'legalArea', foreignKey: 'legalAreaId' });
LegalArea.hasMany(Lead, { as: 'leads', foreignKey: 'legalAreaId' });

// Lead → CaseType
Lead.belongsTo(CaseType, { as: 'caseType', foreignKey: 'caseTypeId' });
CaseType.hasMany(Lead, { as: 'leads', foreignKey: 'caseTypeId' });

// Lead → LeadDetails (one-to-one)
Lead.hasOne(LeadDetails, { as: 'details', foreignKey: 'leadId' });
LeadDetails.belongsTo(Lead, { foreignKey: 'leadId' });

// Lead → HonoraryStructure (one-to-one)
Lead.hasOne(HonoraryStructure, { as: 'honoraryStructure', foreignKey: 'leadId' });
HonoraryStructure.belongsTo(Lead, { foreignKey: 'leadId' });

// Lead → Client (after proposal acceptance)
Lead.belongsTo(Client, { as: 'convertedClient', foreignKey: 'clientId' });
Client.belongsTo(Lead, { as: 'originLead', foreignKey: 'leadId' });

// Lead → Proposal (one-to-one)
Lead.hasOne(Proposal, { as: 'proposal', foreignKey: 'leadId' });
Proposal.belongsTo(Lead, { foreignKey: 'leadId' });

// Lead → ProposalAcceptance (one-to-one via proposal)
Lead.hasOne(ProposalAcceptance, { as: 'proposalAcceptance', foreignKey: 'leadId' });

// Lead → FinancialRecord (one-to-one)
Lead.hasOne(FinancialRecord, { as: 'financialRecord', foreignKey: 'leadId' });
FinancialRecord.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

// HonoraryStructure → PaymentPlan (one-to-one)
HonoraryStructure.hasOne(PaymentPlan, { as: 'paymentPlan', foreignKey: 'honoraryStructureId' });
PaymentPlan.belongsTo(HonoraryStructure, { foreignKey: 'honoraryStructureId' });

// PaymentPlan → PaymentInstallment (one-to-many)
PaymentPlan.hasMany(PaymentInstallment, { as: 'installments', foreignKey: 'paymentPlanId' });
PaymentInstallment.belongsTo(PaymentPlan, { foreignKey: 'paymentPlanId' });

// FinancialResponsible → Lead & Client
FinancialResponsible.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });
Lead.hasMany(FinancialResponsible, { as: 'financialResponsibles', foreignKey: 'leadId' });

FinancialResponsible.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Client.hasMany(FinancialResponsible, { as: 'financialResponsibles', foreignKey: 'clientId' });

// Client → FinancialResponsible (can point to responsible third party)
Client.belongsTo(FinancialResponsible, { as: 'financialResponsible', foreignKey: 'financialResponsibleId' });

// Proposal → ProposalAcceptance (one-to-one)
Proposal.hasOne(ProposalAcceptance, { as: 'acceptance', foreignKey: 'proposalId' });
ProposalAcceptance.belongsTo(Proposal, { as: 'proposal', foreignKey: 'proposalId' });

// Proposal → User (creator/responsible)
Proposal.belongsTo(User, { as: 'responsibleUser', foreignKey: 'responsibleUserId' });

// ProposalAcceptance → FinancialRecord (one-to-one)
ProposalAcceptance.hasOne(FinancialRecord, { as: 'financialRecord', foreignKey: 'proposalAcceptanceId' });
FinancialRecord.belongsTo(ProposalAcceptance, { as: 'proposalAcceptance', foreignKey: 'proposalAcceptanceId' });

// FinancialRecord → Client
FinancialRecord.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Client.hasMany(FinancialRecord, { as: 'financialRecords', foreignKey: 'clientId' });

// ContractTemplate → LegalArea & CaseType
ContractTemplate.belongsTo(LegalArea, { as: 'legalArea', foreignKey: 'legalAreaId' });
LegalArea.hasMany(ContractTemplate, { as: 'contractTemplates', foreignKey: 'legalAreaId' });

ContractTemplate.belongsTo(CaseType, { as: 'caseType', foreignKey: 'caseTypeId' });
CaseType.hasMany(ContractTemplate, { as: 'contractTemplates', foreignKey: 'caseTypeId' });

// GeneratedContract → Client, Lead, ContractTemplate
GeneratedContract.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Client.hasMany(GeneratedContract, { as: 'contracts', foreignKey: 'clientId' });

GeneratedContract.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });
Lead.hasMany(GeneratedContract, { as: 'generatedContracts', foreignKey: 'leadId' });

GeneratedContract.belongsTo(ContractTemplate, { as: 'contractTemplate', foreignKey: 'contractTemplateId' });
ContractTemplate.hasMany(GeneratedContract, { as: 'generated', foreignKey: 'contractTemplateId' });

export {
  sequelize,
  User,
  Lead,
  Client,
  Case,
  Document,
  Movimentacao,
  Responsavel,
  Dependente,
  LegalArea,
  CaseType,
  LeadDetails,
  HonoraryStructure,
  PaymentPlan,
  PaymentInstallment,
  FinancialResponsible,
  Proposal,
  ProposalAcceptance,
  FinancialRecord,
  ContractTemplate,
  GeneratedContract,
};

export default {
  sequelize,
  User,
  Lead,
  Client,
  Case,
  Document,
  Movimentacao,
  Responsavel,
  Dependente,
  LegalArea,
  CaseType,
  LeadDetails,
  HonoraryStructure,
  PaymentPlan,
  PaymentInstallment,
  FinancialResponsible,
  Proposal,
  ProposalAcceptance,
  FinancialRecord,
  ContractTemplate,
  GeneratedContract,
};
