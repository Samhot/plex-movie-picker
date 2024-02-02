import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
// import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable, catchError, tap, throwError } from 'rxjs';

import { User } from '@plex-tinder/auth/core';
import {
  WinstonLogger as Logger,
  TEST_ENV_VAR,
} from '@plex-tinder/shared/utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logRegardlessOfEnv = false,
    // @InjectSentry() private readonly client: SentryService,
    private readonly logger = Logger
  ) {}

  private shouldLog() {
    return process.env['NODE_ENV'] !== TEST_ENV_VAR || this.logRegardlessOfEnv;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err) => {
        this.logError(err, context);
        return throwError(() => err);
      }),
      tap((result) =>
        this.shouldLog() ? this.logResult(result, context) : null
      )
    );
  }

  private extractErrorInfo(error: Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  private extractUserInfo(user: User) {
    return {
      uid: user.id,
      fullName: user.fullName,
      selectedPark: user.selectedPark,
    };
  }

  private logError(error: Error, context: ExecutionContext): void {
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      const body = req.body;

      this.logger.error(`HTTP: ${req.method} ${req.url}`, {
        body,
        error: this.extractErrorInfo(error),
        statusCode: res.statusCode,
        user: this.extractUserInfo(req.coreUser),
      });

      if (this.shouldLog()) {
        // this.client.instance().captureException(error, {
        //     extra: {
        //         body,
        //         statusCode: res.statusCode,
        //         user: this.extractUserInfo(req.coreUser),
        //     },
        // });
      }
    }

    // if (context.getType<GqlContextType>() === 'graphql') {
    //   const gqlContext = GqlExecutionContext.create(context);
    //   const info = gqlContext.getInfo();
    //   const input = gqlContext.getArgs();

    //   this.logger.error(`GraphQL: ${info.parentType.name}.${info.fieldName}`, {
    //     input,
    //     error: this.extractErrorInfo(error),
    //     user: this.extractUserInfo(gqlContext.getContext().req.coreUser),
    //   });

    //   if (this.shouldLog()) {
    //       this.client.instance().captureException(error, {
    //           extra: {
    //               input,
    //               user: this.extractUserInfo(gqlContext.getContext().req.coreUser),
    //           },
    //       });
    //   }
    // }
  }

  private logResult(result: unknown, context: ExecutionContext): void {
    if (context.getType() === 'http') {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      const body = req.body;

      this.logger.info(`HTTP: ${req.method} ${req.url}`, {
        body,
        result,
        statusCode: res.statusCode,
        user: this.extractUserInfo(req.coreUser),
      });
    }

    // if (context.getType<GqlContextType>() === 'graphql') {
    //   const gqlContext = GqlExecutionContext.create(context);
    //   const info = gqlContext.getInfo();
    //   const input = gqlContext.getArgs();

    //   this.logger.info(`GraphQL: ${info.parentType.name}.${info.fieldName}`, {
    //     input,
    //     result,
    //     user: this.extractUserInfo(gqlContext.getContext().req.coreUser),
    //   });
    // }
  }
}
