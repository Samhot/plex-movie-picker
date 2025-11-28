// import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
// import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
// import { Response } from 'express';
// import { GraphQLError } from 'graphql';

// const regex = /\s/g;

// @Catch()
// export class AllExceptionsFilter implements GqlExceptionFilter {
//     shouldGenerify() {
//         return (
//             process.env['ENV'] !== DEV_ENV_VAR &&
//             process.env['ENV'] !== LOCAL_ENV_VAR &&
//             process.env['NODE_ENV'] !== TEST_ENV_VAR
//         );
//     }

//     catch(exception: Error, host: ArgumentsHost) {
//         if (host.getType() === 'http') {
//             const ctx = host.switchToHttp();
//             const response = ctx.getResponse<Response>();

//             return response.json(exception);
//         }

//         const gqlHost = GqlArgumentsHost.create(host);
//         const rawArgs = JSON.stringify(gqlHost.getArgs());

//         const statusCode =
//             exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

//         const devErrorResponse = {
//             statusCode,
//             timestamp: new Date().toISOString(),
//             errorName: exception?.name,
//             message: exception?.message,
//             rawArgs,
//         };

//         if (exception instanceof HttpException) {
//             return new GraphQLError(exception.name, {
//                 extensions: {
//                     ...exception,
//                     code: exception.name.replace(regex, ''),
//                 },
//             });
//         }

//         return new GraphQLError(this.shouldGenerify() ? 'Internal server error' : exception.message, {
//             extensions: { ...(this.shouldGenerify() ? {} : devErrorResponse), code: 'INTERNAL_SERVER_ERROR' },
//         });
//     }
// }
