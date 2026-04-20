import axios, { AxiosInstance } from 'axios';
import { Case, Movimentacao } from '../models';
import emailService from './emailService';
import webhookService from './webhookService';
import monitoringService from './monitoringService';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProcessoEscavador {
  numero: string;
  tribunal: string;
  status: string;
  area: string;
  partes: string[];
  ultimaMovimentacao?: {
    data: string;
    tipo: string;
    descricao: string;
  };
  prazos?: Array<{
    tipo: string;
    dataLimite: string;
    diasRestantes: number;
  }>;
  jurisprudencia?: string[];
}

interface MovimentacaoDetectada {
  caseId: number;
  caseName: string;
  processNumber: string;
  movimentationType: string;
  description: string;
  detectedAt: Date;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

class EscavadorService {
  private client: AxiosInstance;
  private baseUrl = 'https://api.escavador.com.br/api/v2';
  private lastSync: Map<number, Date> = new Map();

  constructor() {
    const token = process.env.ESCAVADOR_API_KEY;

    if (!token) {
      console.warn('⚠️ ESCAVADOR_API_KEY not configured');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  /**
   * Buscar processo no Escavador
   */
  async buscarProcesso(numeroProcesso: string): Promise<ProcessoEscavador | null> {
    try {
      console.log(`🔍 Buscando processo ${numeroProcesso} no Escavador...`);

      const response = await this.client.get(`/processos/buscar`, {
        params: {
          numero: numeroProcesso,
        },
      });

      if (response.data && response.data.data) {
        const processo = response.data.data;
        console.log(`✅ Processo encontrado: ${processo.tribunal}`);
        return this.formatarProcesso(processo);
      }

      console.log('⚠️ Processo não encontrado no Escavador');
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar processo:', error);
      return null;
    }
  }

  /**
   * Sincronizar todos os processos ativos
   */
  async sincronizarProcessos(): Promise<{
    sincronizados: number;
    comAtualizacoes: number;
    erros: number;
    detalhes: MovimentacaoDetectada[];
  }> {
    try {
      console.log('📂 [ESCAVADOR] Iniciando sincronização de processos...');

      // Buscar todos os casos ativos
      const cases = await Case.findAll({
        where: { status: ['new', 'active'] },
        include: [{ model: (await import('../models')).Client, as: 'client' }],
      });

      let sincronizados = 0;
      let comAtualizacoes = 0;
      let erros = 0;
      const detalhes: MovimentacaoDetectada[] = [];

      for (const caseItem of cases) {
        try {
          const numeroProcesso = (caseItem as any).processNumber;
          if (!numeroProcesso) {
            console.warn(`⚠️ Caso ${caseItem.id} sem número de processo`);
            continue;
          }

          // Buscar dados no Escavador
          const processo = await this.buscarProcesso(numeroProcesso);

          if (!processo) {
            erros++;
            continue;
          }

          // Verificar se houve atualizações
          const atualizacoes = await this.detectarAtualizacoes(caseItem as any, processo);

          if (atualizacoes.length > 0) {
            comAtualizacoes++;

            // Atualizar caso
            await (caseItem as any).update({
              lastSyncedAt: new Date(),
              escavadorData: JSON.stringify(processo),
            });

            // Notificar sobre cada atualização
            for (const atualizacao of atualizacoes) {
              detalhes.push(atualizacao);

              // Salvar movimento no banco
              try {
                await Movimentacao.create({
                  caseId: atualizacao.caseId,
                  caseName: atualizacao.caseName,
                  processNumber: atualizacao.processNumber,
                  movimentationType: atualizacao.movimentationType,
                  description: atualizacao.description,
                  importance: atualizacao.importance,
                  detectedAt: atualizacao.detectedAt,
                });
              } catch (movError) {
                console.warn(
                  `⚠️ Erro ao salvar movimento no banco: ${movError}`
                );
              }

              // Enviar notificação
              await this.notificarAtualizacao(caseItem as any, atualizacao);

              // Registrar no monitoramento
              monitoringService.logActivity(
                'case-update',
                `${atualizacao.movimentationType}: ${atualizacao.description}`,
                'success',
                `Processo ${numeroProcesso}`
              );
            }

            console.log(
              `📬 ${atualizacoes.length} atualização(ões) detectada(s) para ${numeroProcesso}`
            );
          }

          sincronizados++;
        } catch (error) {
          erros++;
          console.error(`❌ Erro ao sincronizar caso ${caseItem.id}:`, error);
        }
      }

      console.log(
        `✅ [ESCAVADOR] Sincronização concluída: ${sincronizados} sincronizados, ${comAtualizacoes} com atualizações, ${erros} erros`
      );

      return {
        sincronizados,
        comAtualizacoes,
        erros,
        detalhes,
      };
    } catch (error) {
      console.error('❌ Erro em sincronizarProcessos:', error);
      return {
        sincronizados: 0,
        comAtualizacoes: 0,
        erros: 1,
        detalhes: [],
      };
    }
  }

  /**
   * Detectar novas movimentações
   */
  private async detectarAtualizacoes(
    caseItem: any,
    novoProcesso: ProcessoEscavador
  ): Promise<MovimentacaoDetectada[]> {
    const atualizacoes: MovimentacaoDetectada[] = [];

    try {
      const dadosAntigos = caseItem.escavadorData
        ? JSON.parse(caseItem.escavadorData)
        : null;

      // Comparar status
      if (dadosAntigos && dadosAntigos.status !== novoProcesso.status) {
        atualizacoes.push({
          caseId: caseItem.id,
          caseName: caseItem.title,
          processNumber: caseItem.processNumber,
          movimentationType: 'Status Change',
          description: `Status alterado de "${dadosAntigos.status}" para "${novoProcesso.status}"`,
          detectedAt: new Date(),
          importance: 'high',
        });
      }

      // Comparar última movimentação
      if (
        novoProcesso.ultimaMovimentacao &&
        (!dadosAntigos ||
          dadosAntigos.ultimaMovimentacao?.data !==
            novoProcesso.ultimaMovimentacao.data)
      ) {
        atualizacoes.push({
          caseId: caseItem.id,
          caseName: caseItem.title,
          processNumber: caseItem.processNumber,
          movimentationType: novoProcesso.ultimaMovimentacao.tipo,
          description: novoProcesso.ultimaMovimentacao.descricao,
          detectedAt: new Date(),
          importance: this.calcularImportancia(
            novoProcesso.ultimaMovimentacao.tipo
          ),
        });
      }

      // Comparar prazos
      if (novoProcesso.prazos && novoProcesso.prazos.length > 0) {
        for (const prazo of novoProcesso.prazos) {
          if (prazo.diasRestantes <= 3) {
            atualizacoes.push({
              caseId: caseItem.id,
              caseName: caseItem.title,
              processNumber: caseItem.processNumber,
              movimentationType: 'Deadline Alert',
              description: `⚠️ ${prazo.tipo} vence em ${prazo.diasRestantes} dias`,
              detectedAt: new Date(),
              importance: prazo.diasRestantes <= 1 ? 'critical' : 'high',
            });
          }
        }
      }

      return atualizacoes;
    } catch (error) {
      console.error('❌ Erro ao detectar atualizações:', error);
      return atualizacoes;
    }
  }

  /**
   * Notificar cliente sobre atualização
   */
  private async notificarAtualizacao(
    caseItem: any,
    atualizacao: MovimentacaoDetectada
  ): Promise<void> {
    try {
      const client = (caseItem as any).client;

      if (!client || !client.email) {
        console.warn(`⚠️ Cliente não encontrado para caso ${caseItem.id}`);
        return;
      }

      // Enviar email
      const emoji = {
        high: '🔴',
        critical: '🚨',
        medium: '🟡',
        low: '🟢',
      };

      await emailService.sendSimpleEmail(
        client.email,
        `${emoji[atualizacao.importance]} Atualização: ${atualizacao.caseName}`,
        `
Olá ${client.name},

Há uma nova movimentação no seu caso:

📋 Caso: ${atualizacao.caseName}
📌 Tipo: ${atualizacao.movimentationType}
📅 Data: ${format(atualizacao.detectedAt, "dd 'de' MMMM 'de' yyyy HH:mm", {
          locale: ptBR,
        })}

Detalhes:
${atualizacao.description}

${atualizacao.importance === 'critical' ? '⚠️ ATENÇÃO: Esta é uma movimentação importante que requer sua ação!' : ''}

Acesse sua conta para mais detalhes: https://legal-hub.com

---
Legal Hub - Monitoramento de Processos
Integrado com Escavador
      `
      );

      console.log(`✅ Notificação enviada para ${client.email}`);
    } catch (error) {
      console.error('❌ Erro ao notificar cliente:', error);
    }
  }

  /**
   * Calcular importância da movimentação
   */
  private calcularImportancia(
    tipo: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const critico = [
      'sentença',
      'decisão',
      'julgamento',
      'condenação',
      'absolvição',
    ];
    const alto = ['despacho', 'audiência', 'prazo', 'recurso'];

    const tipoLower = tipo.toLowerCase();

    if (critico.some(c => tipoLower.includes(c))) return 'critical';
    if (alto.some(a => tipoLower.includes(a))) return 'high';
    return 'medium';
  }

  /**
   * Formatar dados do Escavador
   */
  private formatarProcesso(dados: any): ProcessoEscavador {
    return {
      numero: dados.numero || '',
      tribunal: dados.tribunal || '',
      status: dados.status || 'Desconhecido',
      area: dados.area || '',
      partes: dados.partes || [],
      ultimaMovimentacao: dados.ultima_movimentacao
        ? {
            data: dados.ultima_movimentacao.data,
            tipo: dados.ultima_movimentacao.tipo,
            descricao: dados.ultima_movimentacao.descricao,
          }
        : undefined,
      prazos: dados.prazos || [],
      jurisprudencia: dados.jurisprudencia || [],
    };
  }

  /**
   * Obter status da sincronização
   */
  getLastSyncStatus(caseId: number): {
    lastSync?: Date;
    synced: boolean;
    daysSinceSync?: number;
  } {
    const lastSync = this.lastSync.get(caseId);

    if (!lastSync) {
      return { synced: false };
    }

    const daysSinceSync = differenceInDays(new Date(), lastSync);

    return {
      lastSync,
      synced: true,
      daysSinceSync,
    };
  }
}

export default new EscavadorService();
