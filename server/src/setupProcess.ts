import { HttpException, Logger } from '@nestjs/common';
import { StartUpException } from './exceptions/StartUpException';

export function setupProcess(): void {
    function handleError(err: any) {
        const logger = new Logger('Process');

        if (err instanceof StartUpException) {
            logger.error(err.message);
        } else if (err instanceof HttpException) {
            logger.error(err.message);
        } else {
            throw err;
        }

        logger.error('Ending process');
        process.exit(1);
    }

    process.on('unhandledRejection', handleError);
    process.on('uncaughtException', handleError);
}
