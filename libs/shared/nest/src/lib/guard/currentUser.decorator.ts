// import { ExecutionContext, createParamDecorator } from '@nestjs/common';
// import { GqlExecutionContext } from '@nestjs/graphql';

// import { User } from '@beeldi-app/auth/core';

// export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext): User => {
//     const ctx = GqlExecutionContext.create(context);
//     const user: User = ctx.getContext().req.coreUser;

//     return user;
// });
