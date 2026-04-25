export const TIPO_DEMANDA_OPTIONS = [
  'Judicial',
  'Extrajudicial',
  'Consultivo',
  'Preventivo',
  'Administrativo',
  'Assessoria jurídica recorrente',
  'Outro',
] as const;

export const AREA_DIREITO_OPTIONS = [
  'Trabalhista', 'Trabalhista empresarial', 'Família', 'Sucessões', 'Previdenciário', 'Consumidor', 'Cível',
  'Contratual', 'Imobiliário', 'Empresarial', 'Societário', 'Tributário', 'Administrativo', 'Penal', 'Compliance',
  'Propriedade intelectual', 'Digital / proteção de dados', 'Saúde', 'Bancário', 'Extrajudicial',
  'Assessoria jurídica para empresas', 'Correspondente jurídico / diligências', 'Outra',
] as const;

export const ORIGEM_DESCRICAO_OPTIONS = [
  'Digitação manual', 'Colar transcrição/reunião', 'Colar conversa do WhatsApp', 'Colar e-mail do cliente',
  'Gerar a partir de reunião do Meet', 'Outra',
] as const;

export const ACOES_POR_AREA: Record<string, string[]> = {
  Trabalhista: [
    'Reclamação trabalhista', 'Rescisão indireta', 'Reconhecimento de vínculo empregatício', 'Horas extras',
    'Adicional de insalubridade', 'Adicional de periculosidade', 'Acúmulo de função', 'Desvio de função',
    'Verbas rescisórias', 'Reintegração ao emprego', 'Estabilidade gestante', 'Assédio moral', 'Assédio sexual',
    'Dano moral trabalhista', 'Equiparação salarial', 'FGTS não recolhido', 'Reconhecimento de acidente de trabalho',
    'Reversão de justa causa', 'Cumprimento de acordo', 'Execução trabalhista', 'Defesa trabalhista',
    'Acordo extrajudicial trabalhista', 'Consultoria trabalhista', 'Outra',
  ],
  'Trabalhista empresarial': [
    'Defesa em reclamação trabalhista', 'Contestação e acompanhamento processual', 'Acordo extrajudicial trabalhista',
    'Auditoria trabalhista', 'Elaboração de contratos de trabalho', 'Revisão de contratos e políticas internas',
    'Consultoria preventiva trabalhista', 'Adequação de jornada e banco de horas', 'Parecer jurídico trabalhista',
    'Treinamento interno', 'Outra',
  ],
  Família: [
    'Ação de alimentos', 'Execução de alimentos', 'Revisional de alimentos', 'Exoneração de alimentos', 'Guarda',
    'Regulamentação de convivência/visitas', 'Divórcio consensual', 'Divórcio litigioso', 'Dissolução de união estável',
    'Reconhecimento de união estável', 'Partilha de bens', 'Investigação de paternidade',
    'Reconhecimento de paternidade', 'Tutela', 'Curatela', 'Interdição', 'Alienação parental',
    'Medidas protetivas familiares', 'Outra',
  ],
  Sucessões: ['Inventário judicial', 'Inventário extrajudicial', 'Arrolamento', 'Sobrepartilha', 'Testamento', 'Abertura/cumprimento de testamento', 'Petição de herança', 'Planejamento sucessório', 'Partilha amigável', 'Regularização de herança', 'Outra'],
  Previdenciário: ['Aposentadoria por idade', 'Aposentadoria por tempo de contribuição', 'Aposentadoria especial', 'Aposentadoria da pessoa com deficiência', 'Auxílio-doença / benefício por incapacidade temporária', 'Aposentadoria por incapacidade permanente', 'BPC/LOAS', 'Pensão por morte', 'Salário-maternidade', 'Auxílio-acidente', 'Revisão de benefício', 'Restabelecimento de benefício', 'Planejamento previdenciário', 'Recurso administrativo previdenciário', 'Outra'],
  Consumidor: ['Indenização por dano moral', 'Indenização por dano material', 'Inexistência de débito', 'Repetição de indébito', 'Revisão contratual', 'Problema com empréstimo fraudulento', 'Negativação indevida', 'Cobrança indevida', 'Produto com defeito', 'Serviço não prestado', 'Cancelamento contratual', 'Responsabilidade bancária', 'Golpe/fraude bancária', 'Outra'],
  Cível: ['Ação de indenização', 'Obrigação de fazer', 'Obrigação de não fazer', 'Cobrança', 'Execução de título extrajudicial', 'Cumprimento de sentença', 'Monitória', 'Reparação de danos', 'Tutela de urgência', 'Produção antecipada de provas', 'Defesa cível', 'Outra'],
  Contratual: ['Elaboração de contrato', 'Revisão de contrato', 'Rescisão contratual', 'Cobrança contratual', 'Notificação extrajudicial', 'Renegociação contratual', 'Análise de cláusulas', 'Parecer sobre contrato', 'Mediação contratual', 'Outra'],
  Imobiliário: ['Usucapião', 'Adjudicação compulsória', 'Despejo', 'Cobrança de aluguel', 'Revisão de contrato de locação', 'Elaboração de contrato imobiliário', 'Distrato imobiliário', 'Regularização imobiliária', 'Ação possessória', 'Inventário com imóvel', 'Notificação imobiliária', 'Outra'],
  Empresarial: ['Consultoria empresarial', 'Elaboração de contratos empresariais', 'Revisão de contratos empresariais', 'Cobrança empresarial', 'Recuperação de crédito', 'Notificação extrajudicial', 'Mediação empresarial', 'Parecer jurídico empresarial', 'Estruturação de operação', 'Due diligence jurídica', 'Outra'],
  Societário: ['Constituição de sociedade', 'Alteração contratual', 'Acordo de sócios', 'Saída de sócio', 'Exclusão de sócio', 'Reorganização societária', 'Planejamento societário', 'Dissolução societária', 'Apuração de haveres', 'Outra'],
  Tributário: ['Defesa administrativa tributária', 'Execução fiscal', 'Embargos à execução fiscal', 'Planejamento tributário', 'Recuperação de crédito tributário', 'Revisão de tributos', 'Parcelamento tributário', 'Consultoria tributária', 'Outra'],
  Administrativo: ['Defesa em processo administrativo', 'Recurso administrativo', 'Servidor público', 'Processo disciplinar', 'Licitações e contratos públicos', 'Parecer administrativo', 'Outra'],
  Penal: ['Defesa criminal', 'Acompanhamento em delegacia', 'Habeas corpus', 'Queixa-crime', 'Representação criminal', 'Pedido de liberdade', 'Execução penal', 'Outra'],
  Compliance: ['Programa de compliance', 'Código de conduta', 'Canal de denúncias', 'Política interna', 'Investigação interna', 'Treinamento corporativo', 'Adequação regulatória', 'Outra'],
  'Propriedade intelectual': ['Registro de marca', 'Oposição a registro', 'Defesa de marca', 'Contrato de cessão/licença', 'Notificação extrajudicial', 'Outra'],
  'Digital / proteção de dados': ['Adequação à LGPD', 'Política de privacidade', 'Termos de uso', 'Consultoria em proteção de dados', 'Incidente de dados', 'Notificação e resposta jurídica', 'Outra'],
  Saúde: ['Fornecimento de medicamento', 'Tratamento/ cirurgia negada', 'Home care', 'Reajuste abusivo de plano', 'Cobertura negada', 'Outra'],
  Bancário: ['Revisão de contrato bancário', 'Empréstimo fraudulento', 'Cartão consignado', 'Cobrança indevida', 'Superendividamento', 'Negativação indevida', 'Outra'],
  Extrajudicial: ['Notificação extrajudicial', 'Parecer jurídico', 'Consultoria avulsa', 'Elaboração de acordo', 'Revisão de acordo', 'Mediação', 'Negociação', 'Ata / formalização de tratativas', 'Elaboração de declaração', 'Contrato particular', 'Análise documental', 'Outra'],
  'Assessoria jurídica para empresas': ['Assessoria jurídica mensal', 'Assessoria jurídica recorrente', 'Consultoria preventiva', 'Elaboração e revisão de contratos', 'Consultivo trabalhista empresarial', 'Consultivo cível empresarial', 'Recuperação de crédito', 'Notificações e cobranças', 'Compliance e políticas internas', 'Suporte jurídico a RH', 'Suporte jurídico comercial', 'Pareceres recorrentes', 'Participação em reuniões estratégicas', 'Treinamento jurídico interno', 'Outra'],
  'Correspondente jurídico / diligências': ['Audiência como correspondente', 'Protocolo', 'Cópia de processo', 'Despacho', 'Cumprimento de diligência', 'Acompanhamento processual local', 'Outra'],
  Outra: ['Outra'],
};

const SUMARIOS_FIXOS: Record<string, string> = {
  'Ação de alimentos': 'Medida judicial destinada à fixação de pensão alimentícia em favor de dependente, observando necessidade e possibilidade.',
  'Assessoria jurídica mensal': 'Serviço contínuo de suporte jurídico preventivo e consultivo para empresas, com foco em redução de riscos e passivos.',
  'Notificação extrajudicial': 'Instrumento formal para comunicar, cobrar, constituir em mora ou registrar posição jurídica antes de eventual judicialização.',
};

export const gerarResumoBreveAcao = (acao: string, area: string) => {
  if (!acao) return '';
  if (SUMARIOS_FIXOS[acao]) return SUMARIOS_FIXOS[acao];
  if (acao === 'Outra') return `Serviço jurídico personalizado na área de ${area || 'atuação informada'}, com escopo a ser detalhado na proposta.`;
  return `Atuação em ${acao.toLowerCase()} na área de ${area || 'direito aplicável'}, com definição técnica do escopo e estratégia conforme o caso concreto.`;
};
