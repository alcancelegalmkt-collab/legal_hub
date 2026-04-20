import sequelize from '../config/database';
import User from './User';
import Lead from './Lead';
import Client from './Client';
import Case from './Case';
import Document from './Document';
import Movimentacao from './Movimentacao';
import Responsavel from './Responsavel';
import Dependente from './Dependente';

// Relacionamentos
Lead.hasOne(Responsavel, { foreignKey: 'leadId', as: 'responsavel' });
Responsavel.belongsTo(Lead, { foreignKey: 'leadId' });

Lead.hasMany(Dependente, { foreignKey: 'leadId', as: 'dependentes' });
Dependente.belongsTo(Lead, { foreignKey: 'leadId' });

export { User, Lead, Client, Case, Document, Movimentacao, Responsavel, Dependente, sequelize };

export default {
  sequelize,
  User,
  Lead,
  Client,
  Case,
  Document,
  Movimentacao,
  Responsavel,
  Dependente,
};
