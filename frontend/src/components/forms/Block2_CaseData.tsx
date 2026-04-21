import React, { useState, useEffect } from 'react';
import { LeadFormState } from '../../hooks/useLeadFormState';
import api from '../../services/api';

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
    if (data.legalAreaId) {
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
    }
  }, [data.legalAreaId]);

  const handleCaseTypeChange = (caseTypeId: number) => {
    onUpdate({ caseTypeId });
    const selectedCaseType = caseTypes.find((ct) => ct.id === caseTypeId) || null;
    onCaseTypeSelected(selectedCaseType || null);
  };

  const isComplete =
    data.legalAreaId && data.caseTypeId && data.tipoDemanda && data.resumoCaso && data.objetivoCliente;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Bloco 2: Dados do Caso</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Área Jurídica *</label>
          {loadingAreas ? (
            <div className="mt-1 px-3 py-2 text-gray-500">Carregando...</div>
          ) : (
            <select
              value={data.legalAreaId || ''}
              onChange={(e) => {
                onUpdate({ legalAreaId: Number(e.target.value) || null, caseTypeId: null });
                onCaseTypeSelected(null);
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione uma área...</option>
              {legalAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Caso *</label>
          {loadingTypes ? (
            <div className="mt-1 px-3 py-2 text-gray-500">Carregando tipos...</div>
          ) : (
            <select
              value={data.caseTypeId || ''}
              onChange={(e) => handleCaseTypeChange(Number(e.target.value))}
              disabled={!data.legalAreaId}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Selecione um tipo...</option>
              {caseTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Demanda *</label>
          <input
            type="text"
            value={data.tipoDemanda}
            onChange={(e) => onUpdate({ tipoDemanda: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Ação de alimentos, Guarda de menor, Divórcio, etc"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Resumo do Caso / Reunião *</label>
          <textarea
            value={data.resumoCaso}
            onChange={(e) => onUpdate({ resumoCaso: e.target.value })}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descrição detalhada dos fatos e circunstâncias do caso. Será utilizada na geração automática de documentos."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Objetivo do Cliente *</label>
          <textarea
            value={data.objetivoCliente}
            onChange={(e) => onUpdate({ objetivoCliente: e.target.value })}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="O que o cliente quer alcançar com essa ação"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
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
