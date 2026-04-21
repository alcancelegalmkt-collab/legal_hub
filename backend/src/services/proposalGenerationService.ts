import Lead from '../models/Lead';
import Responsavel from '../models/Responsavel';
import Dependente from '../models/Dependente';

interface ProposalData {
  proposalNumber: string;
  date: string;
  validity: string;
  lead: Lead;
  responsavel: Responsavel;
  dependentes: Dependente[];
  customTerms?: string;
}

const generateProposalNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `PROP-${year}-${random}`;
};

const calculateProposalDetails = (
  baseValue: number,
  parcelamento: number,
  entrada: number
): {
  baseValue: number;
  entrada: number;
  saldoParcelar: number;
  valorParcela: number;
  totalComTaxa: number;
} => {
  const saldoParcelar = baseValue - entrada;
  const taxaMensal = 0.02; // 2% ao mês
  const totalComTaxa = saldoParcelar * (1 + taxaMensal * parcelamento);
  const valorParcela = totalComTaxa / parcelamento;

  return {
    baseValue,
    entrada,
    saldoParcelar,
    valorParcela,
    totalComTaxa,
  };
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const generateProposalHTML = (data: ProposalData): string => {
  const details = calculateProposalDetails(
    data.lead.valorProposto || 0,
    data.lead.parcelamento || 1,
    data.lead.entrada || 0
  );

  const currentDate = new Date();
  const validityDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  let parcelasHTML = '';
  if (data.lead.parcelamento && data.lead.parcelamento > 1) {
    let dueDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    for (let i = 1; i <= data.lead.parcelamento; i++) {
      const dueDateStr = dueDate.toLocaleDateString('pt-BR');
      parcelasHTML += `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${i}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${dueDateStr}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(details.valorParcela)}</td>
        </tr>
      `;
      dueDate = new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  const dependentesHTML = data.dependentes
    .map(
      (dep) => `
    <div style="margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #7c3aed;">
      <p><strong>Nome:</strong> ${dep.nomeCompleto}</p>
      ${dep.cpf ? `<p><strong>CPF:</strong> ${dep.cpf}</p>` : ''}
      ${dep.dataNascimento ? `<p><strong>Data de Nascimento:</strong> ${new Date(dep.dataNascimento).toLocaleDateString('pt-BR')}</p>` : ''}
      ${dep.parentesco ? `<p><strong>Parentesco:</strong> ${dep.parentesco}</p>` : ''}
      ${dep.condicaoEspecifica ? `<p><strong>Condição Específica:</strong> ${dep.condicaoEspecifica}</p>` : ''}
    </div>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposta de Honorários</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            page-break-after: always;
        }
        .header {
            border-bottom: 3px solid #7c3aed;
            margin-bottom: 30px;
            padding-bottom: 20px;
        }
        .logo-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #7c3aed;
        }
        .proposal-number {
            text-align: right;
            font-size: 14px;
            color: #666;
        }
        .proposal-number p {
            margin: 3px 0;
        }
        h1 {
            text-align: center;
            color: #7c3aed;
            font-size: 28px;
            margin: 20px 0;
        }
        .dates {
            text-align: center;
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            background-color: #7c3aed;
            color: white;
            padding: 12px 15px;
            margin: 20px 0 15px 0;
            font-size: 16px;
            font-weight: bold;
            border-radius: 4px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            padding: 12px;
            background-color: #f9f9f9;
            border-left: 4px solid #7c3aed;
        }
        .info-label {
            font-weight: bold;
            color: #7c3aed;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            color: #333;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #7c3aed;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 12px;
            border: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .total-row {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .total-row td {
            border-top: 2px solid #7c3aed;
        }
        .value-column {
            text-align: right;
            font-weight: 500;
        }
        .payment-info {
            background-color: #f0f4ff;
            border: 1px solid #7c3aed;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .payment-info p {
            margin: 8px 0;
        }
        .terms {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #7c3aed;
            font-size: 13px;
            line-height: 1.8;
            margin: 20px 0;
        }
        .terms h4 {
            color: #7c3aed;
            margin-bottom: 10px;
        }
        .signature-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        .signature-line {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
        }
        .signature-box {
            text-align: center;
            width: 40%;
        }
        .signature-line-text {
            border-top: 1px solid #333;
            margin: 5px 0;
            font-size: 12px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        @media print {
            body {
                background-color: white;
            }
            .container {
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-section">
                <div class="logo">⚖️ Letícia Barros</div>
                <div class="proposal-number">
                    <p><strong>Nº Proposta:</strong> ${data.proposalNumber}</p>
                    <p><strong>Data:</strong> ${data.date}</p>
                    <p><strong>Validade:</strong> ${data.validity}</p>
                </div>
            </div>
        </div>

        <h1>PROPOSTA DE HONORÁRIOS</h1>

        <div class="dates">
            <p>Proposta elaborada em ${new Date().toLocaleDateString('pt-BR')} | Válida até ${validityDate.toLocaleDateString('pt-BR')}</p>
        </div>

        <div class="section">
            <div class="section-title">DADOS DO CLIENTE</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Nome Completo</div>
                    <div class="info-value">${data.responsavel.nomeCompleto}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">CPF/CNPJ</div>
                    <div class="info-value">${data.responsavel.cpf || 'Não informado'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Telefone</div>
                    <div class="info-value">${data.responsavel.telefone || 'Não informado'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${data.responsavel.email || 'Não informado'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Endereço</div>
                    <div class="info-value">${data.responsavel.endereco || 'Não informado'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Cidade/Estado</div>
                    <div class="info-value">${data.responsavel.cidade || '-'} / ${data.responsavel.estado || '-'}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">DADOS DO CASO</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Área Jurídica</div>
                    <div class="info-value">${data.lead.legalAreaId}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Tipo de Demanda</div>
                    <div class="info-value">${data.lead.tipoDemanda}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label">Resumo do Caso</div>
                    <div class="info-value">${data.lead.resumoCaso}</div>
                </div>
                ${data.lead.objetivoCliente ? `
                    <div class="info-item" style="grid-column: 1 / -1;">
                        <div class="info-label">Objetivo do Cliente</div>
                        <div class="info-value">${data.lead.objetivoCliente}</div>
                    </div>
                ` : ''}
            </div>
        </div>

        ${data.dependentes.length > 0 ? `
        <div class="section">
            <div class="section-title">BENEFICIÁRIOS/DEPENDENTES</div>
            ${dependentesHTML}
        </div>
        ` : ''}

        <div class="section">
            <div class="section-title">TABELA DE HONORÁRIOS</div>
            <table>
                <tr>
                    <th>Descrição</th>
                    <th class="value-column">Valor</th>
                </tr>
                <tr>
                    <td>Valor Base da Proposta</td>
                    <td class="value-column">${formatCurrency(details.baseValue)}</td>
                </tr>
                ${details.entrada > 0 ? `
                    <tr>
                        <td>Entrada</td>
                        <td class="value-column">${formatCurrency(details.entrada)}</td>
                    </tr>
                    <tr>
                        <td>Saldo a Parcelar</td>
                        <td class="value-column">${formatCurrency(details.saldoParcelar)}</td>
                    </tr>
                ` : ''}
                ${data.lead.parcelamento && data.lead.parcelamento > 1 ? `
                    <tr>
                        <td>Total com Taxa de Parcelamento (${(0.02 * data.lead.parcelamento * 100).toFixed(0)}%)</td>
                        <td class="value-column">${formatCurrency(details.totalComTaxa)}</td>
                    </tr>
                ` : ''}
                <tr class="total-row">
                    <td>Total a Pagar</td>
                    <td class="value-column">${formatCurrency(details.baseValue)}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">FORMA DE PAGAMENTO</div>
            <div class="payment-info">
                ${data.lead.formaPagamento ? `
                    <p><strong>Modalidade:</strong> ${data.lead.formaPagamento}</p>
                ` : ''}
                ${data.lead.entrada && data.lead.entrada > 0 ? `
                    <p><strong>Entrada:</strong> ${formatCurrency(data.lead.entrada)}</p>
                ` : ''}
                ${data.lead.parcelamento && data.lead.parcelamento > 1 ? `
                    <p><strong>Parcelamento:</strong> ${data.lead.parcelamento}x de ${formatCurrency(details.valorParcela)}</p>
                ` : ''}
            </div>

            ${data.lead.parcelamento && data.lead.parcelamento > 1 ? `
            <h4 style="color: #7c3aed; margin-top: 20px; margin-bottom: 10px;">Cronograma de Pagamento</h4>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: center;">Parcela</th>
                        <th style="text-align: center;">Data de Vencimento</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    ${parcelasHTML}
                </tbody>
            </table>
            ` : ''}
        </div>

        <div class="section">
            <div class="section-title">CONDIÇÕES GERAIS</div>
            <div class="terms">
                <h4>Termos e Condições</h4>
                <p>
                    <strong>1. Validade:</strong> Esta proposta é válida por 30 dias contados da data de emissão.
                </p>
                <p>
                    <strong>2. Aceitação:</strong> A aceitação desta proposta deve ser formalizada através de assinatura do Contrato de Prestação de Serviços Jurídicos.
                </p>
                <p>
                    <strong>3. Honorários Adicionais:</strong> Despesas extraordinárias não previstas, como pericias, viagens, ou atos processuais excepcionais, serão cobrados adicionalmente.
                </p>
                <p>
                    <strong>4. Confidencialidade:</strong> Todos os dados e informações fornecidos serão mantidos em sigilo profissional.
                </p>
                <p>
                    <strong>5. Rescisão:</strong> O contrato pode ser rescindido por ambas as partes mediante comunicação escrita com antecedência de 30 dias.
                </p>
                ${data.customTerms ? `<p><strong>6. Termos Customizados:</strong> ${data.customTerms}</p>` : ''}
            </div>
        </div>

        <div class="signature-section">
            <p style="margin-bottom: 20px; font-weight: bold;">Para aceitar esta proposta, assine a procuração ou contrato que será enviado separadamente.</p>
            <div class="signature-line">
                <div class="signature-box">
                    <div class="signature-line-text" style="height: 40px;"></div>
                    <p style="margin-top: 5px;">Assinatura do Cliente</p>
                    <p style="font-size: 11px; color: #999;">${data.responsavel.nomeCompleto}</p>
                </div>
                <div class="signature-box">
                    <div class="signature-line-text" style="height: 40px;"></div>
                    <p style="margin-top: 5px;">Assinatura da Advogada</p>
                    <p style="font-size: 11px; color: #999;">Letícia Barros</p>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>⚖️ <strong>Letícia Barros - Advocacia</strong> | Proposta gerada automaticamente pelo sistema Legal Hub</p>
            <p>Esta proposta é válida conforme as condições acima até ${validityDate.toLocaleDateString('pt-BR')}</p>
        </div>
    </div>
</body>
</html>
  `;
};

export const generateProposal = async (leadId: number, customTerms?: string) => {
  try {
    const lead = await Lead.findByPk(leadId, {
      include: [
        { model: Responsavel, as: 'responsavel' },
        { model: Dependente, as: 'dependentes' },
      ],
    });

    if (!lead) {
      throw new Error(`Lead não encontrado: ${leadId}`);
    }

    const responsavel = (lead as any).responsavel;
    if (!responsavel) {
      throw new Error(`Responsável não encontrado para o lead: ${leadId}`);
    }

    const dependentes = (lead as any).dependentes || [];

    const proposalNumber = generateProposalNumber();
    const currentDate = new Date();
    const validity = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const data: ProposalData = {
      proposalNumber,
      date: currentDate.toLocaleDateString('pt-BR'),
      validity: validity.toLocaleDateString('pt-BR'),
      lead,
      responsavel,
      dependentes,
      customTerms,
    };

    const html = generateProposalHTML(data);

    return {
      proposalNumber,
      html,
      date: data.date,
      validity: data.validity,
      leadId,
    };
  } catch (error) {
    console.error('Erro ao gerar proposta:', error);
    throw error;
  }
};

export default {
  generateProposal,
  generateProposalNumber,
};
