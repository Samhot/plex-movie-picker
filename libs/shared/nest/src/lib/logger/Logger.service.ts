// import { LoggingWinston } from '@google-cloud/logging-winston';
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { join } from 'path';
import { transports as WinstonTransports, format } from 'winston';

import { WinstonLogger } from '@plex-tinder/shared/clients/winston';
import { IExecutionContextStorage } from '@plex-tinder/shared/utils';

@Injectable()
export class LoggerService extends WinstonLogger implements NestLoggerService {
  constructor(
    _executionContextStorage: IExecutionContextStorage,
    _context?: Record<string, unknown>
  ) {
    const transports =
      process.env['NODE_ENV'] !== 'production'
        ? [
            new WinstonTransports.Console({
              format: format.combine(
                format.timestamp(),
                format.printf((info) => {
                  return `${info['timestamp']}\t[${info['level']}]\t${
                    info['message']
                  }\t${JSON.stringify(info['context'], null, 4)}`;
                })
              ),
            }),
            ...Object.keys(WinstonLogger.levels).map(
              (level) =>
                new WinstonTransports.File({
                  filename: join(process.cwd(), `/logs/${level}.log`),
                  level,
                  format: format.json(),
                })
            ),
          ]
        : [
            // new LoggingWinston({
            //   levels: WinstonLogger.levels,
            //   redirectToStdout: true,
            //   useMessageField: false,
            // }),
          ];
    super(_executionContextStorage, transports, _context);
  }
}
