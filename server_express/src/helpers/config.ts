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

/**
 * Returns the value of the `sessionTimeout` setting.
 *
 * If no `sessionTimeout` configuration was provided or if the provided configuration is invalid than a default value of 120 minutes is being return.
 *
 * @returns The specified session timeout in _minutes_.
 */
export function getSessionTimeout(): number {
  try {
    const timeoutSetting = config.get('sessionTimeout');

    if (typeof timeoutSetting === 'number') {
      return timeoutSetting;
    }

    if (typeof timeoutSetting === 'string') {
      const timeout = Number.parseInt(timeoutSetting, 10);

      if (!Number.isNaN(timeout)) {
        return timeout;
      }
    }

    Logger.warn(
      `Invalid setting for 'sessionTimeout' provided (got: '${timeoutSetting}'). It has to be a number or a string which could be parsed to an integer. Falling back to a default value of 2h.`
    );

    return 120;
  } catch {
    Logger.warn(
      "No setting for 'sessionTimeout' got provided. Falling back to the default value of 2h."
    );

    return 120;
  }
}
