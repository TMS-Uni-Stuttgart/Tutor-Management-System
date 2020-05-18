import { StartUpException } from './exceptions/StartUpException';
import { Logger } from '@nestjs/common';

export function setupProcess() {
  process.on('uncaughtException', (err) => {
    if (err instanceof StartUpException) {
      Logger.error(err.message);
      process.exit(1);
    } else {
      throw err;
    }
  });
}
