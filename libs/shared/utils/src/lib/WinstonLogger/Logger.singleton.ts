// import { LoggingWinston } from '@google-cloud/logging-winston';
import { join } from 'path';
import * as winston from 'winston';
import { createLogger, format, transports } from 'winston';

type Loggers = {
  info: winston.LeveledLogMethod | null;
  warn: winston.LeveledLogMethod | null;
  debug: winston.LeveledLogMethod | null;
  error: winston.LeveledLogMethod | null;
};

class Logger {
  private readonly _loggers: Loggers = {
    info: null,
    warn: null,
    debug: null,
    error: null,
  };

  private static _instance: Logger;

  private constructor() {
    for (const level of Object.keys(this._loggers)) {
      const fileTransport =
        process.env['NODE_ENV'] !== 'production'
          ? new transports.File({
              filename: join(process.cwd(), `/logs/${level}.log`),
              level,
              format: format.json(),
            })
          : // : new LoggingWinston({
            //       logName: process.env['ENV'] + '-' + level,
            //       redirectToStdout: true,
            //       useMessageField: false,
            //       level,
            //   });
            new transports.File({
              filename: join(process.cwd(), `/logs/${level}.log`),
              level,
              format: format.json(),
            });

      this._loggers[level] = createLogger({
        levels: { [level]: 0 },
        transports:
          process.env['NODE_ENV'] !== 'production'
            ? [
                new transports.Console({
                  level,
                  format: format.combine(
                    format.timestamp(),
                    format.printf((info) => {
                      return `${info['timestamp']}\t[${info['level']}]\t${
                        info['message']
                      }\t${JSON.stringify(info['context'], null, 4)}`;
                    })
                  ),
                }),
                fileTransport,
              ]
            : [fileTransport],
      })[level];
    }
  }

  static getInstance() {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new Logger();
    return this._instance;
  }

  public static info(message: string, context?: unknown) {
    const logger = Logger.getInstance()._loggers['info'];

    if (!logger) return null;

    return logger(message, {
      context,
      logName: 'info',
      severity: 'INFO',
      timestamp: new Date(),
    });
  }

  public static error(messageOrError: unknown, context?: unknown) {
    const logger = Logger.getInstance()._loggers['error'];

    if (!logger) return null;

    return logger(String(messageOrError), {
      context,
      logName: 'error',
      severity: 'ERROR',
      timestamp: new Date(),
    });
  }

  public static warn(message: string, context?: unknown) {
    const logger = Logger.getInstance()._loggers['warn'];

    if (!logger) return null;

    return logger(message, {
      context,
      logName: 'warn',
      severity: 'WARNING',
      timestamp: new Date(),
    });
  }

  public static debug(message: string, context?: unknown) {
    const logger = Logger.getInstance()._loggers['debug'];

    if (!logger) return null;

    return logger(message, {
      context,
      logName: 'debug',
      severity: 'DEBUG',
      timestamp: new Date(),
    });
  }

  public static getLogger(level: keyof Loggers) {
    return Logger.getInstance()._loggers[level];
  }
}

export default Logger;
