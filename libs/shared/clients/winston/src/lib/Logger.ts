import { Logger, createLogger } from 'winston';
import * as Transport from 'winston-transport';

import { IExecutionContextStorage, ILogger } from '@plex-tinder/shared/utils';

export class WinstonLogger implements ILogger {
  private logger: Logger;
  static levels = {
    debug: 3,
    info: 2,
    warn: 1,
    error: 0,
  };

  constructor(
    private readonly executionContextStorage: IExecutionContextStorage,
    private readonly transports: Transport[],
    private context?: Record<string, unknown>
  ) {
    this.logger = createLogger({
      levels: WinstonLogger.levels,
      transports,
    });
  }

  public child(context?: Record<string, unknown>) {
    return new WinstonLogger(this.executionContextStorage, this.transports, {
      ...this.context,
      ...context,
    });
  }

  public addToContext(context: Record<string, unknown>) {
    this.context = {
      ...this.context,
      ...context,
    };
  }

  public log(message: string, context?: Record<string, unknown>) {
    const clsContext = this.executionContextStorage.getAll();

    return this.logger.info(message, {
      ...clsContext,
      ...this.context,
      ...context,
      logName: 'info',
      severity: 'INFO',
      timestamp: new Date(),
    });
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.log(message, context);
  }

  public error(message: string, context?: Record<string, unknown>) {
    const clsContext = this.executionContextStorage.getAll();
    return this.logger.error(message, {
      ...clsContext,
      ...this.context,
      ...context,
      logName: 'error',
      severity: 'ERROR',
      timestamp: new Date(),
    });
  }

  public warn(message: string, context?: Record<string, unknown>) {
    const clsContext = this.executionContextStorage.getAll();
    return this.logger.warn(message, {
      ...clsContext,
      ...this.context,
      ...context,
      logName: 'warn',
      severity: 'WARNING',
      timestamp: new Date(),
    });
  }

  public debug(message: string, context?: Record<string, unknown>) {
    const clsContext = this.executionContextStorage.getAll();
    return this.logger.debug(message, {
      ...clsContext,
      ...this.context,
      ...context,
      logName: 'debug',
      severity: 'DEBUG',
      timestamp: new Date(),
    });
  }
}
