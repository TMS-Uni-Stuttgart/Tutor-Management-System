import { useMemo } from 'react';
import { isDevelopment } from './isDevelopmentMode';
import { DateTime } from 'luxon';

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
}

export class Logger {
  static logger = new Logger();

  private readonly console: Console;
  private readonly logLevelToPrint: LogLevel;

  constructor() {
    this.console = console;
    this.logLevelToPrint = isDevelopment() ? LogLevel.DEBUG : LogLevel.WARN;

    // FIXME: Remove me!!!
    this.warn('New logger created');
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
  log(message: string, options: LogOptions): void {
    if (options.level < this.logLevelToPrint) {
      return;
    }

    const prefix = this.getPrefixForLevel(options.level);
    const timestamp = DateTime.local().toFormat('yyyy-MM-dd, hh:mm:ss');

    this.console.log(
      `%c[${timestamp}] ${prefix} - ${message}`,
      `color: ${this.getColorForLevel(options.level)}`
    );
  }

  /**
   * This will log an info message to the console.
   *
   * @param message Message to log.
   */
  info(message: string): void {
    this.log(message, { level: LogLevel.INFO });
  }

  /**
   * This will log a debug message to the console.
   *
   * @param message Message to log.
   */
  debug(message: string): void {
    this.log(message, { level: LogLevel.DEBUG });
  }

  /**
   * This will log a warning message to the console.
   *
   * @param message Message to log.
   */
  warn(message: string): void {
    this.log(message, { level: LogLevel.WARN });
  }

  /**
   * This will log an error message to the console.
   *
   * @param message Message to log.
   */
  error(message: string): void {
    this.log(message, { level: LogLevel.ERROR });
  }

  private getPrefixForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.VERBOSE:
        return 'VERBOSE';
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.ERROR:
        return 'ERROR';
    }
  }

  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '#1976d2';
      case LogLevel.WARN:
        return 'orange';
      case LogLevel.ERROR:
        return '#e53935';
      default:
        return 'inherit';
    }
  }
}

export function useLogger(): Logger {
  const logger = useMemo(() => new Logger(), []);
  return logger;
}
