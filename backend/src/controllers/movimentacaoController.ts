import { Request, Response } from 'express';
import { Movimentacao, Case } from '../models';
import { Op } from 'sequelize';

export const listarMovimentacoes = async (req: Request, res: Response) => {
  try {
    const {
      caseId,
      importance,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
      sort = 'DESC',
    } = req.query;

    const where: any = {};

    if (caseId) {
      where.caseId = parseInt(caseId as string);
    }

    if (importance) {
      where.importance = importance;
    }

    if (dateFrom || dateTo) {
      where.detectedAt = {};
      if (dateFrom) {
        where.detectedAt[Op.gte] = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.detectedAt[Op.lte] = new Date(dateTo as string);
      }
    }

    const movimentacoes = await Movimentacao.findAndCountAll({
      where,
      order: [['detectedAt', sort as 'ASC' | 'DESC']],
      limit: Math.min(parseInt(limit as string) || 50, 500),
      offset: parseInt(offset as string) || 0,
      include: [{ model: Case, as: 'case' }],
    });

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      count: movimentacoes.count,
      total: movimentacoes.rows.length,
      movimentacoes: movimentacoes.rows,
    });
  } catch (error) {
    console.error('❌ Erro ao listar movimentações:', error);
    return res.status(500).json({
      error: 'Failed to list movements',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const obterMovimentacoesPorCaso = async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({
        error: 'Case ID is required',
      });
    }

    const movimentacoes = await Movimentacao.findAll({
      where: { caseId: parseInt(caseId) },
      order: [['detectedAt', 'DESC']],
      include: [{ model: Case, as: 'case' }],
    });

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      caseId: parseInt(caseId),
      count: movimentacoes.length,
      movimentacoes,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar movimentações do caso:', error);
    return res.status(500).json({
      error: 'Failed to get movements',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const obterStats = async (__req: Request, res: Response) => {
  try {
    // Total de movimentações
    const total = await Movimentacao.count();

    // Por importância
    const porImportancia = await Movimentacao.findAll({
      attributes: ['importance', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      group: ['importance'],
      raw: true,
    });

    // Hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const totalHoje = await Movimentacao.count({
      where: {
        detectedAt: {
          [require('sequelize').Op.between]: [hoje, amanha],
        },
      },
    });

    // Por tipo (top 10)
    const porTipo = await Movimentacao.findAll({
      attributes: [
        'movimentationType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['movimentationType'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
      limit: 10,
      raw: true,
    });

    // Últimos 7 dias (para tendência)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const ultimosSete = await Movimentacao.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('detectedAt')), 'date'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      where: {
        detectedAt: {
          [require('sequelize').Op.gte]: seteDiasAtras,
        },
      },
      group: [require('sequelize').fn('DATE', require('sequelize').col('detectedAt'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('detectedAt')), 'DESC']],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        total,
        totalHoje,
        porImportancia: Object.fromEntries(
          porImportancia.map((item: any) => [
            item.importance,
            item.count,
          ])
        ),
        porTipo: porTipo.map((item: any) => ({
          type: item.movimentationType,
          count: item.count,
        })),
        ultimosSete: ultimosSete.map((item: any) => ({
          date: item.date,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    console.error('❌ Erro ao obter stats:', error);
    return res.status(500).json({
      error: 'Failed to get stats',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
