import React, { useState } from 'react';
import { LeadFormState } from '../../hooks/useLeadFormState';

interface Block3Props {
  data: LeadFormState['block3'];
  onUpdate: (data: Partial<LeadFormState['block3']>) => void;
  addDependent: (dependent: LeadFormState['block3']['dependentes'][0]) => void;
  removeDependent: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
  showDependents: boolean;
}

export const Block3_Dependents: React.FC<Block3Props> = ({
  data,
  onUpdate,
  addDependent,
  removeDependent,
  onNext,
  onPrev,
  showDependents,
}) => {
  const [newDependent, setNewDependent] = useState<Partial<LeadFormState['block3']['dependentes'][0]>>({
    nomeCompleto: '',
    dataNascimento: '',
    parentesco: '',
  });

  const handleAddDependent = () => {
    if (newDependent.nomeCompleto && newDependent.dataNascimento && newDependent.parentesco) {
      addDependent({
        nomeCompleto: newDependent.nomeCompleto,
        dataNascimento: newDependent.dataNascimento,
        cpf: newDependent.cpf || '',
        parentesco: newDependent.parentesco,
        condicaoEspecifica: newDependent.condicaoEspecifica,
      });
      setNewDependent({
        nomeCompleto: '',
        dataNascimento: '',
        parentesco: '',
        cpf: '',
        condicaoEspecifica: '',
      });
    }
  };

  const isComplete = !showDependents || data.dependentes.length > 0 || !data.possuiDependente;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">
        Bloco 3: Dependentes {!showDependents && '(Não aplicável)'}
      </h2>

      {!showDependents ? (
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
          Este tipo de caso não requer informações de dependentes.
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={data.possuiDependente}
                onChange={(e) => onUpdate({ possuiDependente: e.target.checked })}
                className="mr-2"
              />
              O caso envolve dependentes
            </label>
          </div>

          {data.possuiDependente && (
            <>
              <div className="space-y-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                <h3 className="font-semibold text-gray-800">Adicionar Dependente</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                    <input
                      type="text"
                      value={newDependent.nomeCompleto || ''}
                      onChange={(e) => setNewDependent({ ...newDependent, nomeCompleto: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Maria Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Nascimento *</label>
                    <input
                      type="date"
                      value={newDependent.dataNascimento || ''}
                      onChange={(e) => setNewDependent({ ...newDependent, dataNascimento: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parentesco *</label>
                    <select
                      value={newDependent.parentesco || ''}
                      onChange={(e) => setNewDependent({ ...newDependent, parentesco: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="filho">Filho(a)</option>
                      <option value="neto">Neto(a)</option>
                      <option value="irmao">Irmão/Irmã</option>
                      <option value="pai">Pai</option>
                      <option value="mae">Mãe</option>
                      <option value="avó">Avó(ó)</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <input
                      type="text"
                      value={newDependent.cpf || ''}
                      onChange={(e) => setNewDependent({ ...newDependent, cpf: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 12345678901"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Condição Específica (se houver)</label>
                    <input
                      type="text"
                      value={newDependent.condicaoEspecifica || ''}
                      onChange={(e) => setNewDependent({ ...newDependent, condicaoEspecifica: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Menor de idade, Deficiência física, etc"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddDependent}
                  disabled={!newDependent.nomeCompleto || !newDependent.dataNascimento || !newDependent.parentesco}
                  className={`w-full px-4 py-2 rounded-md font-medium ${
                    newDependent.nomeCompleto && newDependent.dataNascimento && newDependent.parentesco
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                  }`}
                >
                  + Adicionar Dependente
                </button>
              </div>

              {data.dependentes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800">Dependentes Adicionados</h3>
                  {data.dependentes.map((dep) => (
                    <div key={dep.id} className="p-3 bg-gray-100 rounded-md flex justify-between items-center">
                      <div>
                        <p className="font-medium">{dep.nomeCompleto}</p>
                        <p className="text-sm text-gray-600">{dep.parentesco}</p>
                      </div>
                      <button
                        onClick={() => removeDependent(dep.id || '')}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

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
