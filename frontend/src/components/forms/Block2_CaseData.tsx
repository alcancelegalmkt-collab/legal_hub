import React, { useMemo, useState, useEffect } from 'react';
import { LeadFormState } from '../../hooks/useLeadFormState';
import api from '../../services/api';
import {
  ACOES_POR_AREA,
  AREA_DIREITO_OPTIONS,
  ORIGEM_DESCRICAO_OPTIONS,
  TIPO_DEMANDA_OPTIONS,
  gerarResumoBreveAcao,
} from '../../constants/intakeFlow';

interface LegalArea {
  id: number;
  name: string;
}

interface CaseType {
  id: number;
  name: string;
  requiresDependents?: boolean;
}

interface Block2Props {
  data: LeadFormState['block2'];
  onUpdate: (data: Partial<LeadFormState['block2']>) => void;
  onNext: () => void;
  onPrev: () => void;
  onCaseTypeSelected: (caseType: CaseType | null) => void;
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const gerarDescricaoIA = (conteudoBruto: string, acao: string, area: string, resumoBreveAcao: string) => {
  const linhas = conteudoBruto
    .split(/\n|\./)
    .map((l) => l.trim())
    .filter(Boolean);

  const fatos = linhas.slice(0, 4);
  const objetivoDetectado = linhas.find((linha) => /quer|pretende|objetivo|busca/i.test(linha)) || '';
  const urgencia = /urgente|urgência|imediat/i.test(conteudoBruto) ? 'Há indicativo de urgência no relato.' : '';

  return {
    descricao: `Trata-se de ${acao || 'demanda jurídica'} na área de ${area || 'Direito'}. ${resumoBreveAcao} Com base no conteúdo informado, observa-se que ${linhas[0] || 'o cliente apresentou fatos relevantes que demandam análise jurídica detalhada'}.`,
    fatos,
    objetivo: objetivoDetectado || 'Definir estratégia para alcançar o resultado jurídico pretendido pelo cliente.',
    pontosAtencao: [
      urgencia,
      'Validar documentação comprobatória dos fatos narrados.',
      'Conferir existência de prazos processuais ou administrativos.',
      'Mapear riscos iniciais e medidas preventivas cabíveis.',
    ].filter(Boolean),
  };
};

export const Block2_CaseData: React.FC<Block2Props> = ({ data, onUpdate, onNext, onPrev, onCaseTypeSelected }) => {
  const [legalAreas, setLegalAreas] = useState<LegalArea[]>([]);
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    const fetchLegalAreas = async () => {
      try {
        setLoadingAreas(true);
        const response = await api.get('/leads/legal-areas');
        setLegalAreas(response.data);
      } catch (error) {
        console.error('Erro ao carregar áreas jurídicas:', error);
      } finally {
        setLoadingAreas(false);
      }
    };
    fetchLegalAreas();
  }, []);

  useEffect(() => {
    if (!data.legalAreaId) return;
    const fetchCaseTypes = async () => {
      try {
        setLoadingTypes(true);
        const response = await api.get(`/leads/case-types?legalAreaId=${data.legalAreaId}`);
        setCaseTypes(response.data);
      } catch (error) {
        console.error('Erro ao carregar tipos de caso:', error);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchCaseTypes();
  }, [data.legalAreaId]);

  const acoesDisponiveis = useMemo(() => ACOES_POR_AREA[data.areaDireito] || ['Outra'], [data.areaDireito]);

  useEffect(() => {
    const areaEncontrada = legalAreas.find((area) => normalize(area.name) === normalize(data.areaDireito));
    if (areaEncontrada && areaEncontrada.id !== data.legalAreaId) {
      onUpdate({ legalAreaId: areaEncontrada.id, caseTypeId: null });
      onCaseTypeSelected(null);
    }
  }, [data.areaDireito, data.legalAreaId, legalAreas, onCaseTypeSelected, onUpdate]);

  useEffect(() => {
    const caseTypeEncontrado = caseTypes.find((type) => normalize(type.name) === normalize(data.tipoAcaoServico));
    if (caseTypeEncontrado && caseTypeEncontrado.id !== data.caseTypeId) {
      onUpdate({ caseTypeId: caseTypeEncontrado.id, tipoDemanda: data.tipoAcaoServico });
      onCaseTypeSelected(caseTypeEncontrado);
    }
  }, [caseTypes, data.caseTypeId, data.tipoAcaoServico, onCaseTypeSelected, onUpdate]);

  const isComplete =
    data.naturezaAtendimento &&
    data.areaDireito &&
    data.tipoAcaoServico &&
    data.resumoBreveAcao &&
    data.origemDescricao &&
    data.conteudoBruto &&
    data.descricaoFinalEditavel &&
    data.legalAreaId &&
    data.caseTypeId;

  const handleGerarResumo = () => {
    const acao = data.tipoAcaoServico === 'Outra' ? data.outraAcaoDescricao : data.tipoAcaoServico;
    const area = data.areaDireito === 'Outra' ? data.outraAreaDescricao : data.areaDireito;
    const resumo = gerarResumoBreveAcao(acao, area);
    onUpdate({ resumoBreveAcao: resumo, tipoDemanda: acao });
  };

  const handleGerarIA = () => {
    const acao = data.tipoAcaoServico === 'Outra' ? data.outraAcaoDescricao : data.tipoAcaoServico;
    const area = data.areaDireito === 'Outra' ? data.outraAreaDescricao : data.areaDireito;
    const resultado = gerarDescricaoIA(data.conteudoBruto, acao, area, data.resumoBreveAcao);

    const estrutura = `Descrição detalhada do caso:\n${resultado.descricao}\n\nFatos principais identificados:\n${resultado.fatos
      .map((f, i) => `${i + 1}. ${f}`)
      .join('\n')}\n\nObjetivo do cliente:\n${resultado.objetivo}\n\nPontos de atenção:\n${resultado.pontosAtencao
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n')}`;

    onUpdate({
      descricaoGeradaIA: estrutura,
      descricaoFinalEditavel: estrutura,
      resumoCaso: estrutura,
      objetivoCliente: resultado.objetivo,
    });
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Bloco 2: Fluxo Inteligente do Caso</h2>
      <p className="text-sm text-gray-600">
        Etapas: Natureza do atendimento → Área do direito → Tipo de ação/serviço → Resumo breve automático → Conteúdo bruto
        → Reescrita por IA → Descrição final.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">1) Tipo de Demanda *</label>
          <select
            value={data.naturezaAtendimento}
            onChange={(e) => onUpdate({ naturezaAtendimento: e.target.value, outraNaturezaDescricao: '' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecione...</option>
            {TIPO_DEMANDA_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {data.naturezaAtendimento === 'Outro' && (
            <input
              type="text"
              value={data.outraNaturezaDescricao}
              onChange={(e) => onUpdate({ outraNaturezaDescricao: e.target.value })}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Descreva a natureza da demanda"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">2) Área do Direito *</label>
          <select
            value={data.areaDireito}
            onChange={(e) =>
              onUpdate({ areaDireito: e.target.value, tipoAcaoServico: '', caseTypeId: null, outraAreaDescricao: '', outraAcaoDescricao: '' })
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecione...</option>
            {AREA_DIREITO_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {data.areaDireito === 'Outra' && (
            <input
              type="text"
              value={data.outraAreaDescricao}
              onChange={(e) => onUpdate({ outraAreaDescricao: e.target.value })}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Descreva a área"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">3) Tipo de Ação ou Serviço *</label>
          <select
            value={data.tipoAcaoServico}
            onChange={(e) => onUpdate({ tipoAcaoServico: e.target.value, outraAcaoDescricao: '' })}
            disabled={!data.areaDireito}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
          >
            <option value="">Selecione...</option>
            {acoesDisponiveis.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {data.tipoAcaoServico === 'Outra' && (
            <input
              type="text"
              value={data.outraAcaoDescricao}
              onChange={(e) => onUpdate({ outraAcaoDescricao: e.target.value })}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Descreva o tipo de ação/serviço"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">4) Resumo breve automático da ação *</label>
          <div className="mt-1 flex gap-2">
            <textarea
              value={data.resumoBreveAcao}
              onChange={(e) => onUpdate({ resumoBreveAcao: e.target.value })}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Clique em “Gerar resumo” para preencher automaticamente"
            />
            <button
              type="button"
              onClick={handleGerarResumo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 h-fit"
            >
              Gerar resumo
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">5) Origem da descrição do caso *</label>
          <select
            value={data.origemDescricao}
            onChange={(e) => onUpdate({ origemDescricao: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecione...</option>
            {ORIGEM_DESCRICAO_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">6) Conteúdo bruto *</label>
          <textarea
            value={data.conteudoBruto}
            onChange={(e) => onUpdate({ conteudoBruto: e.target.value })}
            rows={5}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Cole aqui anotações, transcrição, WhatsApp, e-mail ou texto livre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">7) Reescrita por IA (assistida) *</label>
          <div className="flex flex-wrap gap-2 mb-2">
            <button type="button" onClick={handleGerarIA} className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Gerar com IA
            </button>
            <button type="button" onClick={handleGerarIA} className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200">
              Regenerar
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ descricaoFinalEditavel: data.descricaoGeradaIA })}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Restaurar versão IA
            </button>
          </div>
          <textarea
            value={data.descricaoFinalEditavel}
            onChange={(e) => {
              onUpdate({ descricaoFinalEditavel: e.target.value, resumoCaso: e.target.value });
            }}
            rows={10}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Descrição final editável para proposta/contrato"
          />
          <p className="text-xs text-gray-500 mt-1">A revisão humana é obrigatória antes da aprovação final.</p>
        </div>

        {(loadingAreas || loadingTypes || !data.legalAreaId || !data.caseTypeId) && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            {loadingAreas || loadingTypes
              ? 'Sincronizando com base jurídica interna...'
              : 'A área/ação escolhida não foi mapeada automaticamente. Selecione manualmente nos campos abaixo para concluir.'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mapeamento técnico: Área Jurídica *</label>
            <select
              value={data.legalAreaId || ''}
              onChange={(e) => {
                onUpdate({ legalAreaId: Number(e.target.value) || null, caseTypeId: null });
                onCaseTypeSelected(null);
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione uma área...</option>
              {legalAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mapeamento técnico: Tipo de Caso *</label>
            <select
              value={data.caseTypeId || ''}
              onChange={(e) => {
                const caseTypeId = Number(e.target.value) || null;
                onUpdate({ caseTypeId });
                const selectedCaseType = caseTypes.find((ct) => ct.id === caseTypeId) || null;
                onCaseTypeSelected(selectedCaseType);
              }}
              disabled={!data.legalAreaId}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
            >
              <option value="">Selecione um tipo...</option>
              {caseTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
          ← Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete}
          className={`px-6 py-2 rounded-md font-medium ${
            isComplete ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-700 cursor-not-allowed'
          }`}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
};
