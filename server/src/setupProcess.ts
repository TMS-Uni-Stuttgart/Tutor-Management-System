import { HttpException, Logger } from '@nestjs/common';
import { StartUpException } from './exceptions/StartUpException';

export function setupProcess(): void {
    function handleError(err: any) {
        const logger = new Logger('Process');

        if (err instanceof StartUpException) {
            logger.error(err.message);
            logger.error('Exiting process...');
            process.exit(1);
        } else if (err instanceof HttpException) {
            logger.error(err.message);
        } else {
            logger.error('Unknown error.');
            logger.error(err);
        }
    }

    process.on('unhandledRejection', handleError);
    process.on('uncaughtException', handleError);
}
