import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { isDevelopment } from './isDevelopmentMode';

enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

interface LogOptions {
  /** Severity of the logged message. */
  level: LogLevel;

  /** Override used context. */
  context?: string;
}

/**
 * Logger used in the application.
 *
 * If you just want to use the static `logger` property of the class you could just import the `logger` object provided by this module. It's a reference on the static logger of this class.
 */
export class Logger {
  static readonly logger = new Logger('Static Logger');

  private readonly console: Console;
  private readonly logLevelToPrint: LogLevel;
  private readonly context?: string;

  constructor(context?: string) {
    this.console = console;
    this.logLevelToPrint = isDevelopment() ? LogLevel.DEBUG : LogLevel.WARN;
    this.context = context;
  }

  /**
   * Logs the given message to the console.
   *
   * If possible use one of the shorthand functions: `info`, `warn`, `error`, `debug`. Those will apply the proper options for you.
   *
   * If the severity of a message is too low it will not get logged (ie a `DEBUG` message won't be logged in production).
   *
   * @param message Message to log.
   * @param options Options for the logged message.
   */
  log(message: string, options: LogOptions = { level: LogLevel.INFO }): void {
    if (options.level < this.logLevelToPrint) {
      return;
    }

    const timestamp = DateTime.local().toFormat('HH:mm:ss');
    const context = options.context ?? this.context ?? 'Logger';

    this.console.log(
      `%c${this.getPrefixForLevel(options.level)}%c ${timestamp} - [${context}] ${message}`,
      this.getPrefixCSS(options.level),
      ''
    );
  }

  /**
   * This will log an info message to the console.
   *
   * @param message Message to log.
   * @param options (optional) Options for the logged message.
   */
  info(message: string, options?: Omit<LogOptions, 'level'>): void {
    this.log(message, { ...options, level: LogLevel.INFO });
  }

  /**
   * This will log a debug message to the console.
   *
   * @param message Message to log.
   * @param options (optional) Options for the logged message.
   */
  debug(message: string, options?: Omit<LogOptions, 'level'>): void {
    this.log(message, { ...options, level: LogLevel.DEBUG });
  }

  /**
   * This will log a warning message to the console.
   *
   * @param message Message to log.
   * @param options (optional) Options for the logged message.
   */
  warn(message: string, options?: Omit<LogOptions, 'level'>): void {
    this.log(message, { ...options, level: LogLevel.WARN });
  }

  /**
   * This will log an error message to the console.
   *
   * @param message Message to log.
   * @param options (optional) Options for the logged message.
   */
  error(message: string, options?: Omit<LogOptions, 'level'>): void {
    this.log(message, { ...options, level: LogLevel.ERROR });
  }

  private getPrefixCSS(level: LogLevel): string {
    const bgColor = this.getColorForLevel(level);
    return `color: #fff; background: ${bgColor}; border-radius: 4px; padding: 2px 4px;`;
  }

  private getPrefixForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'debug';
      case LogLevel.INFO:
        return 'info ';
      case LogLevel.WARN:
        return 'warn ';
      case LogLevel.ERROR:
        return 'error';
      default:
        return 'NOT_FOUND';
    }
  }

  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '#00a5fe';
      case LogLevel.INFO:
        return '#008000';
      case LogLevel.WARN:
        return '#de9000';
      case LogLevel.ERROR:
        return '#e53935';
      default:
        return 'inherit';
    }
  }
}

export function useLogger(context?: string): Logger {
  const logger = useMemo(() => new Logger(context), [context]);
  return logger;
}

export const logger: Logger = Logger.logger;
