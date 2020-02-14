import winston, { format } from 'winston';
import { format as formatDate } from 'date-fns';

function getLogLevel(): string {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'info';
    case 'test':
      return 'error';
    default:
      return 'debug';
  }
}

const withTimestamp = format.printf(({ message, level, timestamp }) => {
  if (timestamp) {
    const dateString = formatDate(new Date(timestamp), 'yyyy:MM:dd-HH:mm:ssX');
    return `[${dateString}] ${level}: ${message}`;
  }

  return message;
});

const Logger = winston.createLogger({
  level: 'silly',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new winston.transports.Console({
      format: format.combine(format.cli({ all: true }), format.simple(), withTimestamp),
      level: getLogLevel(),
    }),
    new winston.transports.File({ filename: 'logs/server.log', level: 'info' }),
  ],
});

export default Logger;
