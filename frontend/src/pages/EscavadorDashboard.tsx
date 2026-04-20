import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Layout from '../components/Layout';
import api from '../services/api';
import { Movimentacao, Case } from '../types';

interface MovimentacaoStats {
  total: number;
  totalHoje: number;
  porImportancia: Record<string, number>;
  porTipo: Array<{ type: string; count: number }>;
  ultimosSete: Array<{ date: string; count: number }>;
}

export default function EscavadorDashboard() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [stats, setStats] = useState<MovimentacaoStats | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    caseId: '',
    importance: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar casos para filtro
      if (cases.length === 0) {
        const casesRes = await api.client.get('/cases');
        setCases(casesRes.data.cases);
      }

      // Carregar movimentações com filtros
      const params = new URLSearchParams();
      if (filtros.caseId) params.append('caseId', filtros.caseId);
      if (filtros.importance) params.append('importance', filtros.importance);
      if (filtros.dateFrom) params.append('dateFrom', filtros.dateFrom);
      if (filtros.dateTo) params.append('dateTo', filtros.dateTo);

      const [movRes, statsRes] = await Promise.all([
        api.client.get(`/escavador/movimentacoes?${params.toString()}`),
        api.client.get('/escavador/movimentacoes/stats'),
      ]);

      setMovimentacoes(movRes.data.movimentacoes);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      caseId: '',
      importance: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const exportarPDF = () => {
    const doc = new (window as any).jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 10;

    // Título
    doc.setFontSize(16);
    doc.text('Histórico de Movimentações - Escavador', pageWidth / 2, yPos, {
      align: 'center',
    });
    yPos += 10;

    // Data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 10, yPos);
    yPos += 8;

    // Stats
    doc.setFontSize(12);
    doc.text('Estatísticas Gerais', 10, yPos);
    yPos += 6;
    doc.setFontSize(10);
    if (stats) {
      doc.text(`Total de Movimentações: ${stats.total}`, 10, yPos);
      yPos += 5;
      doc.text(`Movimentações Hoje: ${stats.totalHoje}`, 10, yPos);
      yPos += 5;
      doc.text(
        `Críticas: ${stats.porImportancia.critical || 0} | Altas: ${stats.porImportancia.high || 0} | Médias: ${stats.porImportancia.medium || 0} | Baixas: ${stats.porImportancia.low || 0}`,
        10,
        yPos
      );
      yPos += 8;
    }

    // Movimentações
    doc.setFontSize(12);
    doc.text('Movimentações Detectadas', 10, yPos);
    yPos += 6;
    doc.setFontSize(9);

    movimentacoes.forEach((mov, idx) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 10;
      }

      const linhas = doc.splitTextToSize(
        `${idx + 1}. ${mov.caseName} (${mov.processNumber}) - ${mov.movimentationType}\nDescrição: ${mov.description}\nImportância: ${mov.importance} | Data: ${new Date(mov.detectedAt).toLocaleDateString('pt-BR')}`,
        pageWidth - 20
      );

      doc.text(linhas, 10, yPos);
      yPos += linhas.length * 4 + 2;
    });

    doc.save(`escavador_movimentacoes_${new Date().getTime()}.pdf`);
  };

  const getImportanciaColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getImportanciaIcon = (importance: string) => {
    switch (importance) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟡';
      case 'medium':
        return '🟠';
      default:
        return '🟢';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Processos Judiciais - Escavador
          </h1>
          <button
            onClick={exportarPDF}
            className="px-4 py-2 bg-legal-600 text-white rounded-lg hover:bg-legal-700 transition"
            disabled={movimentacoes.length === 0}
          >
            📥 Exportar PDF
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Críticos</div>
              <div className="text-3xl font-bold text-red-600">
                {stats.porImportancia.critical || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Altos</div>
              <div className="text-3xl font-bold text-orange-600">
                {stats.porImportancia.high || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Hoje</div>
              <div className="text-3xl font-bold text-legal-600">
                {stats.totalHoje}
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caso
              </label>
              <select
                value={filtros.caseId}
                onChange={(e) => handleFiltroChange('caseId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-legal-500"
              >
                <option value="">Todos</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importância
              </label>
              <select
                value={filtros.importance}
                onChange={(e) =>
                  handleFiltroChange('importance', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-legal-500"
              >
                <option value="">Todas</option>
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                De
              </label>
              <input
                type="date"
                value={filtros.dateFrom}
                onChange={(e) => handleFiltroChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-legal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Até
              </label>
              <input
                type="date"
                value={filtros.dateTo}
                onChange={(e) => handleFiltroChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-legal-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={limparFiltros}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        {stats && (
          <div className="grid grid-cols-2 gap-6">
            {/* Últimos 7 dias */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Últimos 7 Dias</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.ultimosSete}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#7c3aed"
                    name="Movimentações"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top tipos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Tipos de Movimentação</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.porTipo.slice(0, 8)}
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Timeline de Movimentações</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Carregando...
            </div>
          ) : movimentacoes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma movimentação encontrada
            </div>
          ) : (
            <div className="space-y-4">
              {movimentacoes.map((mov) => (
                <div
                  key={mov.id}
                  className="border-l-4 border-legal-500 pl-4 py-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {getImportanciaIcon(mov.importance)}
                        </span>
                        <h3 className="font-semibold text-gray-900">
                          {mov.movimentationType}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded border ${getImportanciaColor(
                            mov.importance
                          )}`}
                        >
                          {mov.importance}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {mov.caseName} ({mov.processNumber})
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        {mov.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">
                        {new Date(mov.detectedAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(mov.detectedAt).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
