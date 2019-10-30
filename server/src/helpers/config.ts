import { ConnectionOptions } from 'mongoose';
import config from 'config';
import Logger from './Logger';

export interface DatabaseConfig {
  databaseURL: string;
  secret: string;
  config: ConnectionOptions;
  maxRetries?: number;
}

export const databaseConfig: DatabaseConfig = config.get('database');

export function getSessionTimeout(): number {
  const timeoutSetting = config.get('sessionTimeout');

  if (typeof timeoutSetting === 'number') {
    return timeoutSetting;
  }

  if (typeof timeoutSetting === 'string') {
    const timeout = Number.parseInt(timeoutSetting);

    if (!Number.isNaN(timeout)) {
      return timeout;
    }
  }

  Logger.warn(
    `Invalid setting for 'sessionTimeout' provided (got: '${timeoutSetting}'). It has to be a number or a string which could be parsed to an integer. Falling back to a default value of 2h.`
  );

  return 120;
}
