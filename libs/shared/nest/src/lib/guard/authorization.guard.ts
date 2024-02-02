import { CanActivate, Injectable } from '@nestjs/common';

import { AuthorizationData } from '@plex-tinder/shared/utils';

export type UseCaseAuthorizationData =
  | AuthorizationData
  | AuthorizationData[]
  | ((
      args: Record<string, unknown>
    ) => AuthorizationData | AuthorizationData[] | undefined);

@Injectable()
export class AuthorizationGuard implements CanActivate {
  // constructor(
  //     private readonly reflector: Reflector,
  //     private readonly firebaseUserRepository: FirebaseUserRepository,
  //     private readonly authorizeParkUseCase: AuthorizeParkUseCase,
  //     private readonly authorizeUserUseCase: AuthorizeUserUseCase,
  //     @Optional()
  //     @Inject(DEFAULT_AUTHORIZATION_METADATA)
  //     private readonly defaultAuthorization: AuthorizationData = { policies: [] }
  // ) {}

  private errorMessage = (code: string) =>
    `You are not authorized to perform this action [${code}]`;

  // private extractAuthorizationData = (
  //     useCaseAuthorizationData: UseCaseAuthorizationData,
  //     ctx: GqlExecutionContext
  // ) => {
  //     if (typeof useCaseAuthorizationData === 'function') {
  //         const args = ctx.getArgs().input;

  //         const authorizationData = useCaseAuthorizationData(args);
  //         if (!authorizationData) {
  //             return [this.defaultAuthorization];
  //         }

  //         return this.extractAuthorizationData(authorizationData, ctx);
  //     }

  //     if (Array.isArray(useCaseAuthorizationData)) {
  //         return useCaseAuthorizationData.map((authorizationData) => ({
  //             ...this.defaultAuthorization,
  //             ...authorizationData,
  //         }));
  //     }

  //     return [
  //         {
  //             ...this.defaultAuthorization,
  //             ...useCaseAuthorizationData,
  //         },
  //     ];
  // };

  async canActivate(): // context: ExecutionContext
  Promise<boolean> {
    // const useCaseAuthorizationData = this.reflector.get<UseCaseAuthorizationData>(
    //     AUTHORIZATION_METADATA,
    //     context.getHandler()
    // );

    // const ctx = GqlExecutionContext.create(context);

    // const authorizationsData = this.extractAuthorizationData(useCaseAuthorizationData, ctx);

    // const decodedToken: DecodedIdToken = ctx.getContext().req.user;
    // const { uid } = decodedToken;

    // if (!uid) {
    //     WinstonLogger.debug('Uid not found in token', { decodedToken });

    //     throw new GraphQLError(this.errorMessage('NO_UID'));
    // }

    // const user = await this.firebaseUserRepository.getOne(uid);

    // ctx.getContext().req.coreUser = user;

    // const failedAuthorizations: {
    //     authorizationData: (typeof authorizationsData)[number];
    //     isParkAuthorized: IResponse<boolean, Error>;
    //     isUserAuthorized: IResponse<boolean, Error>;
    // }[] = [];

    // const isAuthorized = await authorizationsData.reduce(async (resultPromise, authorizationData) => {
    //     const result = await resultPromise;

    //     if (result) return result;

    //     if (!user.selectedPark) {
    //         return false;
    //     }

    //     const { policies, useOrForPolicies, packs, modules, doNotCheckPark } = authorizationData;
    //     const isParkAuthorized = doNotCheckPark
    //         ? { success: true, error: null }
    //         : await this.authorizeParkUseCase.execute({
    //               parkId: user.selectedPark,
    //               modules,
    //               packs,
    //           });

    //     const isUserAuthorized = await this.authorizeUserUseCase.execute({
    //         user,
    //         ressource: {
    //             parkId: user.selectedPark,
    //         },
    //         requiredPolicies: policies,
    //         useOrForPolicies: useOrForPolicies ?? false,
    //     });

    //     if (!isParkAuthorized.success || !isUserAuthorized.success) {
    //         failedAuthorizations.push({ authorizationData, isParkAuthorized, isUserAuthorized });
    //     }

    //     return !!isParkAuthorized.success && !!isUserAuthorized.success;
    // }, Promise.resolve(false));

    // if (!isAuthorized) {
    //     WinstonLogger.debug('AuthorizationGuard denied access', { failedAuthorizations });
    // }

    // return isAuthorized;
    return true;
  }
}
