import Anthropic from '@anthropic-ai/sdk';
import { Document as DocxDocument, Packer, Paragraph, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import Client from '../models/Client';
import Case from '../models/Case';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface DocumentRequest {
  clientId: number;
  caseId?: number;
  documentType: 'proposal' | 'contract' | 'power_of_attorney' | 'financial_aid_declaration';
  customData?: Record<string, any>;
}

interface GeneratedContent {
  title: string;
  sections: Array<{
    heading: string;
    content: string;
  }>;
}

const generateDocumentContent = async (
  documentType: string,
  client: Client,
  caseData?: Case
): Promise<GeneratedContent> => {
  let prompt = '';

  switch (documentType) {
    case 'proposal':
      prompt = `
        Gere uma PROPOSTA DE HONORÁRIOS profissional em formato estruturado para:

        Cliente: ${client.name}
        Área Jurídica: ${caseData?.legalArea || 'Geral'}
        Valor da Causa: R$ ${caseData?.caseValue || 'A definir'}

        Inclua:
        1. Identificação das partes
        2. Descrição do serviço
        3. Honorários propostos (em reais)
        4. Forma de pagamento
        5. Prazo de validade
        6. Condições gerais

        Forneça em formato JSON com campos: title, sections (array de {heading, content})
      `;
      break;

    case 'contract':
      prompt = `
        Gere um CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS profissional para:

        Cliente: ${client.name}
        CPF/CNPJ: ${client.cpfCnpj}
        Endereço: ${client.address}, ${client.city}, ${client.state}
        Área: ${caseData?.legalArea || 'Geral'}
        Honorários: R$ ${caseData?.honorariesFee || 'A negociar'}

        Inclua:
        1. Partes contratantes
        2. Objeto do contrato
        3. Honorários e forma de pagamento
        4. Duração do contrato
        5. Direitos e deveres
        6. Confidencialidade
        7. Rescisão
        8. Disposições gerais

        Forneça em formato JSON com campos: title, sections (array de {heading, content})
      `;
      break;

    case 'power_of_attorney':
      prompt = `
        Gere uma PROCURAÇÃO para:

        Cliente: ${client.name}
        CPF: ${client.cpfCnpj}
        RG: ${client.rg}
        Nacionalidade: ${client.nationality}

        Poderes: Gerais para representação judicial

        Inclua:
        1. Identificação do outorgante
        2. Identificação do procurador
        3. Poderes conferidos
        4. Vigência
        5. Revogação
        6. Fecho

        Forneça em formato JSON com campos: title, sections (array de {heading, content})
      `;
      break;

    case 'financial_aid_declaration':
      prompt = `
        Gere uma DECLARAÇÃO DE HIPOSSUFICIÊNCIA para:

        Cliente: ${client.name}
        CPF: ${client.cpfCnpj}
        Profissão: ${client.profession}

        Inclua:
        1. Identificação
        2. Estado civil
        3. Dependentes
        4. Profissão e renda
        5. Patrimônio
        6. Justificativa da hipossuficiência
        7. Assinatura e data

        Forneça em formato JSON com campos: title, sections (array de {heading, content})
      `;
      break;

    default:
      throw new Error(`Tipo de documento não suportado: ${documentType}`);
  }

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Resposta inesperada da IA');
  }

  try {
    // Tenta extrair JSON da resposta
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Nenhum JSON encontrado na resposta');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Erro ao fazer parse do JSON:', content.text);
    throw new Error('Falha ao processar resposta da IA');
  }
};

const createDocxDocument = (content: GeneratedContent): DocxDocument => {
  const sections = [
    new Paragraph({
      text: content.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  content.sections.forEach((section) => {
    sections.push(
      new Paragraph({
        text: section.heading,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 },
      })
    );

    section.content.split('\n').forEach((line) => {
      if (line.trim()) {
        sections.push(
          new Paragraph({
            text: line,
            spacing: { line: 360, after: 200 },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
    });
  });

  return new DocxDocument({
    sections: [
      {
        children: sections,
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
      },
    ],
  });
};

const saveDocumentFile = async (doc: DocxDocument, fileName: string): Promise<string> => {
  const documentsDir = path.join(process.cwd(), 'uploads', 'documents');

  // Garantir que o diretório existe
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }

  const filePath = path.join(documentsDir, fileName);

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);

  return filePath;
};

export const generateDocument = async (request: DocumentRequest): Promise<{
  fileName: string;
  filePath: string;
  content: GeneratedContent;
}> => {
  // Buscar dados do cliente
  const client = await Client.findByPk(request.clientId);
  if (!client) {
    throw new Error(`Cliente não encontrado: ${request.clientId}`);
  }

  // Buscar dados do caso se fornecido
  let caseData: Case | null = null;
  if (request.caseId) {
    caseData = await Case.findByPk(request.caseId);
  }

  // Gerar conteúdo usando Claude
  const content = await generateDocumentContent(
    request.documentType,
    client,
    caseData || undefined
  );

  // Criar documento DOCX
  const docxDoc = createDocxDocument(content);

  // Salvar arquivo
  const timestamp = Date.now();
  const fileName = `${request.documentType}_${client.id}_${timestamp}.docx`;
  const filePath = await saveDocumentFile(docxDoc, fileName);

  return {
    fileName,
    filePath,
    content,
  };
};

export default {
  generateDocument,
};
