import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType } from 'docx';
import { Lead, Client, HonoraryStructure, Proposal, ProposalAcceptance } from '../models';
import { HonoraryCalculationService } from './honoraryCalculationService';

export enum DocumentType {
  PROPOSAL = 'proposal',
  SERVICE_AGREEMENT = 'service_agreement',
  POWER_OF_ATTORNEY = 'power_of_attorney',
  FINANCIAL_HARDSHIP = 'financial_hardship',
}

export interface ProposalGeneratorInput {
  leadId: number;
  clientId?: number;
  documentTypes: DocumentType[];
  locale?: 'pt-BR' | 'en-US';
  outputFormat?: 'docx' | 'pdf';
}

export interface GeneratedDocument {
  type: DocumentType;
  filename: string;
  content: Buffer;
  contentType: string;
  generatedAt: Date;
}

interface DocumentData {
  client: any;
  lead: any;
  honoraryStructure: any;
  proposal: any;
  acceptance: any;
  calculation: any;
}

/**
 * Service for generating legal documents from lead/client data
 */
export class ProposalGeneratorService {
  private static readonly LOCALE_DEFAULT = 'pt-BR';

  /**
   * Generate one or more legal documents for a lead/client
   */
  static async generateDocuments(input: ProposalGeneratorInput): Promise<GeneratedDocument[]> {
    const documentData = await this.gatherDocumentData(input.leadId, input.clientId);
    const documents: GeneratedDocument[] = [];

    for (const docType of input.documentTypes) {
      const doc = await this.generateDocument(docType, documentData, input.locale || this.LOCALE_DEFAULT);
      documents.push(doc);
    }

    return documents;
  }

  /**
   * Gather all necessary data for document generation
   */
  private static async gatherDocumentData(leadId: number, clientId?: number): Promise<DocumentData> {
    const lead = await Lead.findByPk(leadId, { include: ['LeadDetails'] });
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    const client = clientId
      ? await Client.findByPk(clientId)
      : await Client.findOne({ where: { leadId } });

    const honoraryStructure = await HonoraryStructure.findOne({ where: { leadId } });
    if (!honoraryStructure) throw new Error(`HonoraryStructure for lead ${leadId} not found`);

    const proposal = await Proposal.findOne({ where: { leadId } });
    const acceptance = proposal ? await ProposalAcceptance.findOne({ where: { proposalId: proposal.id } }) : null;

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

    return {
      client,
      lead,
      honoraryStructure,
      proposal,
      acceptance,
      calculation,
    };
  }

  /**
   * Generate a specific document
   */
  private static async generateDocument(
    type: DocumentType,
    data: DocumentData,
    locale: string
  ): Promise<GeneratedDocument> {
    let docxDocument: Document;
    const timestamp = new Date().toISOString().split('T')[0];

    switch (type) {
      case DocumentType.PROPOSAL:
        docxDocument = this.generateProposalDocument(data, locale);
        return {
          type,
          filename: `Proposta-Honorarios-${data.lead.id}-${timestamp}.docx`,
          content: await Packer.toBuffer(docxDocument),
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          generatedAt: new Date(),
        };

      case DocumentType.SERVICE_AGREEMENT:
        docxDocument = this.generateServiceAgreementDocument(data, locale);
        return {
          type,
          filename: `Contrato-Servicos-${data.lead.id}-${timestamp}.docx`,
          content: await Packer.toBuffer(docxDocument),
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          generatedAt: new Date(),
        };

      case DocumentType.POWER_OF_ATTORNEY:
        docxDocument = this.generatePowerOfAttorneyDocument(data, locale);
        return {
          type,
          filename: `Procuracao-${data.lead.id}-${timestamp}.docx`,
          content: await Packer.toBuffer(docxDocument),
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          generatedAt: new Date(),
        };

      case DocumentType.FINANCIAL_HARDSHIP:
        docxDocument = this.generateFinancialHardshipDocument(data, locale);
        return {
          type,
          filename: `Declaracao-Hipossuficiencia-${data.lead.id}-${timestamp}.docx`,
          content: await Packer.toBuffer(docxDocument),
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          generatedAt: new Date(),
        };

      default:
        throw new Error(`Unknown document type: ${type}`);
    }
  }

  /**
   * Generate Proposta de Honorários document
   */
  private static generateProposalDocument(data: DocumentData, locale: string): Document {
    const { client, honoraryStructure, calculation } = data;
    const currentDate = new Date().toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US');

    return new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'PROPOSTA DE HONORÁRIOS',
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              style: 'Heading1',
            }),

            new Paragraph({
              text: `Data: ${currentDate}`,
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: 'I. DADOS DO CLIENTE',
              style: 'Heading2',
              spacing: { after: 200 },
            }),

            this.createClientInfoTable(client),

            new Paragraph({
              text: 'II. ESTRUTURA DE HONORÁRIOS',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            this.createHonoraryStructureTable(honoraryStructure, calculation),

            new Paragraph({
              text: 'III. RESUMO FINANCEIRO',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            this.createFinancialSummaryTable(calculation),

            new Paragraph({
              text: 'IV. CRONOGRAMA DE PAGAMENTO',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            this.createPaymentScheduleTable(calculation, locale),

            new Paragraph({
              text: 'V. OBSERVAÇÕES',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              text: calculation.observations?.total || 'Nenhuma observação adicional.',
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: 'VI. ASSINATURA',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              text: '__________________________\nResponsável',
              spacing: { before: 400 },
            }),
          ],
        },
      ],
    });
  }

  /**
   * Generate Contrato de Prestação de Serviços document
   */
  private static generateServiceAgreementDocument(data: DocumentData, locale: string): Document {
    const { client, honoraryStructure, calculation } = data;
    const currentDate = new Date().toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US');

    return new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS PROFISSIONAIS',
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              style: 'Heading1',
            }),

            new Paragraph({
              text: `Celebrado em ${currentDate}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: 'I. PARTES CONTRATANTES',
              style: 'Heading2',
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'CLIENTE: ',
                  bold: true,
                }),
                new TextRun(client?.name || 'NÃO INFORMADO'),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'CPF/CNPJ: ',
                  bold: true,
                }),
                new TextRun(client?.cpfCnpj || 'NÃO INFORMADO'),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Email: ',
                  bold: true,
                }),
                new TextRun(client?.email || 'NÃO INFORMADO'),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: 'II. OBJETO DO CONTRATO',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              text: 'Prestação de serviços jurídicos conforme estrutura de honorários estabelecida neste contrato.',
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: 'III. HONORÁRIOS PROFISSIONAIS',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            this.createHonoraryStructureTable(honoraryStructure, calculation),

            new Paragraph({
              text: 'IV. CONDIÇÕES DE PAGAMENTO',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            this.createPaymentScheduleTable(calculation, locale),

            new Paragraph({
              text: 'V. RESPONSABILIDADES',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              text: '• O cliente se compromete a fornecer todas as informações e documentos necessários',
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: '• O profissional se compromete a atuar com diligência e confidencialidade',
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: '• A rescisão contratual deve ser comunicada com antecedência de 30 dias',
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: 'VI. ASSINATURA',
              style: 'Heading2',
              spacing: { before: 400, after: 400 },
            }),

            new Paragraph({
              text: `${client?.name || 'CLIENTE'}\n__________________________\nAssinatura\n\nData: ___/___/______`,
              spacing: { after: 200 },
            }),
          ],
        },
      ],
    });
  }

  /**
   * Generate Procuração document
   */
  private static generatePowerOfAttorneyDocument(data: DocumentData, locale: string): Document {
    const { client } = data;
    const currentDate = new Date().toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US');

    return new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'PROCURAÇÃO',
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              style: 'Heading1',
            }),

            new Paragraph({
              text: `Comparecimento em ${currentDate}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: 'SAIBAM TODOS QUANTOS ESTE INSTRUMENTO DE PROCURAÇÃO LEREM QUE CONSTITUINTE, COMPARECENDO NESTA DATA:',
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Outorgante: ',
                  bold: true,
                }),
                new TextRun(client?.name || 'NÃO INFORMADO'),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'CPF: ',
                  bold: true,
                }),
                new TextRun(client?.cpfCnpj || 'NÃO INFORMADO'),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Nacionalidade: ',
                  bold: true,
                }),
                new TextRun(client?.nationality || 'NÃO INFORMADA'),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Profissão: ',
                  bold: true,
                }),
                new TextRun(client?.profession || 'NÃO INFORMADA'),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Endereço: ',
                  bold: true,
                }),
                new TextRun(
                  `${client?.address || 'NÃO INFORMADO'}, ${client?.city || ''}, ${client?.state || ''}`
                ),
              ],
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: 'PELO PRESENTE INSTRUMENTO CONSTITUI SEU BASTANTE PROCURADOR A SER NOMEADO NO ATO DO PROTOCOLO DESTE INSTRUMENTO, A QUEM CONFERE PODERES GERAIS PARA:',
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: '• Representar o outorgante em juízo e fora dele',
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: '• Promover ações, demandas e reclamações de qualquer natureza',
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: '• Transigir, desistir, reconhecer direitos, receber e dar quitação',
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: '• Praticar todos os atos necessários à defesa dos direitos do outorgante',
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: 'O outorgante fica responsável por todas as obrigações assumidas pelo procurador em virtude desta procuração.',
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: `${client?.name || 'OUTORGANTE'}\n__________________________\nAssinatura\n\nData: ___/___/______`,
              spacing: { after: 200 },
            }),
          ],
        },
      ],
    });
  }

  /**
   * Generate Declaração de Hipossuficiência document
   */
  private static generateFinancialHardshipDocument(data: DocumentData, locale: string): Document {
    const { client } = data;
    const currentDate = new Date().toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US');

    return new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'DECLARAÇÃO DE HIPOSSUFICIÊNCIA',
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              style: 'Heading1',
            }),

            new Paragraph({
              text: `Data: ${currentDate}`,
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: 'I. IDENTIFICAÇÃO DO DECLARANTE',
              style: 'Heading2',
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Nome: ',
                  bold: true,
                }),
                new TextRun(client?.name || 'NÃO INFORMADO'),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'CPF: ',
                  bold: true,
                }),
                new TextRun(client?.cpfCnpj || 'NÃO INFORMADO'),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Profissão: ',
                  bold: true,
                }),
                new TextRun(client?.profession || 'NÃO INFORMADA'),
              ],
              spacing: { after: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Renda Mensal: ',
                  bold: true,
                }),
                new TextRun('A SER PREENCHIDO'),
              ],
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: 'II. DECLARAÇÃO',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              text: 'O(a) declarante acima identificado(a) vem por este meio declarar, sob as penas da lei, que não possui renda ou patrimônio suficiente para arcar com as despesas e custas processuais e com os honorários advocatícios, razão pela qual solicita:',
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: '• Isenção de custas processuais',
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: '• Isenção de despesas advocatícias',
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: '• Assistência jurídica gratuita',
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: 'III. COMPROMISSO',
              style: 'Heading2',
              spacing: { before: 400, after: 200 },
            }),

            new Paragraph({
              text: 'O(a) declarante compromete-se a informar ao tribunal qualquer mudança em sua situação econômica durante o processo.',
              spacing: { after: 400 },
            }),

            new Paragraph({
              text: `${client?.name || 'DECLARANTE'}\n__________________________\nAssinatura\n\nData: ___/___/______`,
              spacing: { after: 200 },
            }),
          ],
        },
      ],
    });
  }

  /**
   * Create client information table
   */
  private static createClientInfoTable(client: any): Table {
    return new Table({
      width: { size: 100, type: 'pct' },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Nome', bold: true })]
              })],
              shading: { fill: 'E8E8E8' },
            }),
            new TableCell({
              children: [new Paragraph(client?.name || 'NÃO INFORMADO')],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'CPF/CNPJ', bold: true })]
              })],
              shading: { fill: 'E8E8E8' },
            }),
            new TableCell({
              children: [new Paragraph(client?.cpfCnpj || 'NÃO INFORMADO')],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Email', bold: true })]
              })],
              shading: { fill: 'E8E8E8' },
            }),
            new TableCell({
              children: [new Paragraph(client?.email || 'NÃO INFORMADO')],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Telefone', bold: true })]
              })],
              shading: { fill: 'E8E8E8' },
            }),
            new TableCell({
              children: [new Paragraph(client?.phone || 'NÃO INFORMADO')],
            }),
          ],
        }),
      ],
    });
  }

  /**
   * Create honorary structure table
   */
  private static createHonoraryStructureTable(honoraryStructure: any, calculation: any): Table {
    const rows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Tipo de Honorário', bold: true })]
            })],
            shading: { fill: 'E8E8E8' },
          }),
          new TableCell({
            children: [new Paragraph(honoraryStructure.honoraryType)],
          }),
        ],
      }),
    ];

    if (calculation.baseAmount > 0) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Valor Base', bold: true })]
              })],
              shading: { fill: 'E8E8E8' },
            }),
            new TableCell({
              children: [new Paragraph(HonoraryCalculationService.formatMoney(calculation.baseAmount))],
            }),
          ],
        })
      );
    }

    if (calculation.successAmount) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Valor de Sucesso', bold: true })]
              })],
              shading: { fill: 'E8E8E8' },
            }),
            new TableCell({
              children: [new Paragraph(HonoraryCalculationService.formatMoney(calculation.successAmount))],
            }),
          ],
        })
      );
    }

    if (calculation.discountAmount > 0) {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Desconto', bold: true })]
              })],
              shading: { fill: 'E8E8E8' },
            }),
            new TableCell({
              children: [new Paragraph(HonoraryCalculationService.formatMoney(calculation.discountAmount))],
            }),
          ],
        })
      );
    }

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Total', bold: true })]
            })],
            shading: { fill: 'D3D3D3' },
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: HonoraryCalculationService.formatMoney(calculation.totalAmount), bold: true })]
            })],
            shading: { fill: 'D3D3D3' },
          }),
        ],
      })
    );

    return new Table({
      width: { size: 100, type: 'pct' },
      rows,
    });
  }

  /**
   * Create financial summary table
   */
  private static createFinancialSummaryTable(calculation: any): Table {
    return new Table({
      width: { size: 100, type: 'pct' },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Descrição', bold: true })]
              })],
              shading: { fill: 'E8E8E8' },
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Valor', bold: true })]
              })],
              shading: { fill: 'E8E8E8' },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Valor Base')],
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                text: HonoraryCalculationService.formatMoney(calculation.baseAmount),
              })],
            }),
          ],
        }),
        ...(calculation.successAmount
          ? [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph('Valor de Sucesso')],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      text: HonoraryCalculationService.formatMoney(calculation.successAmount),
                    })],
                  }),
                ],
              }),
            ]
          : []),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph('Subtotal')],
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                text: HonoraryCalculationService.formatMoney(calculation.baseAmount + (calculation.successAmount || 0)),
              })],
            }),
          ],
        }),
        ...(calculation.discountAmount > 0
          ? [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph('( - ) Desconto')],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      text: HonoraryCalculationService.formatMoney(calculation.discountAmount),
                    })],
                  }),
                ],
              }),
            ]
          : []),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'TOTAL', bold: true })]
              })],
              shading: { fill: 'D3D3D3' },
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: HonoraryCalculationService.formatMoney(calculation.totalAmount), bold: true })]
              })],
              shading: { fill: 'D3D3D3' },
            }),
          ],
        }),
      ],
    });
  }

  /**
   * Create payment schedule table
   */
  private static createPaymentScheduleTable(calculation: any, locale: string): Table {
    const rows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Parcela', bold: true })]
            })],
            shading: { fill: 'E8E8E8' },
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Data de Vencimento', bold: true })]
            })],
            shading: { fill: 'E8E8E8' },
          }),
          new TableCell({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: 'Valor', bold: true })]
            })],
            shading: { fill: 'E8E8E8' },
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Descrição', bold: true })]
            })],
            shading: { fill: 'E8E8E8' },
          }),
        ],
      }),
    ];

    calculation.paymentSchedule.forEach((item: any) => {
      const dueDate = new Date(item.dueDate).toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US');
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(String(item.installmentNumber))],
            }),
            new TableCell({
              children: [new Paragraph(dueDate)],
            }),
            new TableCell({
              children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                text: HonoraryCalculationService.formatMoney(item.amount),
              })],
            }),
            new TableCell({
              children: [new Paragraph(item.description)],
            }),
          ],
        })
      );
    });

    return new Table({
      width: { size: 100, type: 'pct' },
      rows,
    });
  }

  /**
   * Validate document generation input
   */
  static validateInput(input: ProposalGeneratorInput): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!input.leadId || input.leadId <= 0) {
      errors.push('leadId é obrigatório e deve ser um número positivo');
    }

    if (!input.documentTypes || input.documentTypes.length === 0) {
      errors.push('Pelo menos um tipo de documento deve ser especificado');
    }

    const validTypes = Object.values(DocumentType);
    input.documentTypes?.forEach((type) => {
      if (!validTypes.includes(type)) {
        errors.push(`Tipo de documento inválido: ${type}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
