import sequelize from '../config/database';
import User from './User';
import Lead from './Lead';
import Client from './Client';
import Case from './Case';
import Document from './Document';

export { User, Lead, Client, Case, Document, sequelize };

export default {
  sequelize,
  User,
  Lead,
  Client,
  Case,
  Document,
};
