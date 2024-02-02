// import { ExecutionContext, Injectable } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { GqlExecutionContext } from '@nestjs/graphql';
// import { AuthGuard } from '@nestjs/passport';
// import { DecodedIdToken } from 'firebase-admin/lib/auth';

// import { PUBLIC_METADATA } from './public.decorator';

// @Injectable()
// export class AuthenticationGuard extends AuthGuard('firebase-auth') {
//     constructor(private reflector: Reflector) {
//         super();
//     }

//     static getUserFromContext = (context: ExecutionContext): DecodedIdToken => {
//         return GqlExecutionContext.create(context).getContext().req.user;
//     };

//     override canActivate(context: ExecutionContext) {
//         const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_METADATA, [
//             context.getHandler(),
//             context.getClass(),
//         ]);

//         if (isPublic) {
//             return true;
//         }

//         return super.canActivate(context);
//     }

//     getRequest(context: ExecutionContext) {
//         const ctx = GqlExecutionContext.create(context);
//         return ctx.getContext().req;
//     }
// }
