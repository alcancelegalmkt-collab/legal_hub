import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dialect = (process.env.DB_DIALECT || 'postgres') as any;

const config: any = {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
};

if (dialect === 'sqlite') {
  config.dialect = 'sqlite';
  config.storage = process.env.DB_STORAGE || './legal_hub.sqlite';
} else {
  config.database = process.env.DB_NAME || 'legal_hub';
  config.username = process.env.DB_USER || 'legal_user';
  config.password = process.env.DB_PASSWORD || 'legal_password_dev';
  config.host = process.env.DB_HOST || 'localhost';
  config.port = parseInt(process.env.DB_PORT || '5432');
  config.dialect = 'postgres';
  config.pool = {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  };
}

const sequelize = new Sequelize(config);

export default sequelize;
