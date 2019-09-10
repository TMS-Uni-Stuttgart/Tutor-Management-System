import { ConnectionOptions } from 'mongoose';
import config from 'config';

export interface DatabaseConfig {
  databaseURL: string;
  secret: string;
  config: ConnectionOptions;
}

const databaseConfig: DatabaseConfig = config.get('database');

export default databaseConfig;
