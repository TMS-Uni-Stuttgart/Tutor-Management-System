import { ConnectionOptions } from 'mongoose';
import config from 'config';

export interface DatabaseConfig {
  databaseURL: string;
  secret: string;
  config: ConnectionOptions;
  maxRetries?: number;
}

const databaseConfig: DatabaseConfig = config.get('database');

export default databaseConfig;
