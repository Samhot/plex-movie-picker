import { IUseCase, Policies } from '@plex-tinder/shared/utils';
import { AuthorizeAndTryCatchUseCase } from '@plex-tinder/shared/utils';
import { IResponse } from '@plex-tinder/shared/utils';
import { User } from '../domain/User';

type Input = {
  ressource: {
    parkId: string;
    buildingsIds?: string[];
    checkTotalAccessToPark?: boolean;
  };
  user: User;
  requiredPolicies: readonly Policies[];
  useOrForPolicies: boolean;
};
type Output = boolean;

export class AuthorizeUserUseCase implements IUseCase<Input, Output> {
  static authorization = {};

  authorize() {
    return true;
  }

  @AuthorizeAndTryCatchUseCase()
  public async execute({
    user,
    ressource,
    requiredPolicies,
    useOrForPolicies,
  }: Input): Promise<IResponse<Output>> {
    const userAuthorizations = user.authorizations.filter(
      (authorization) =>
        authorization.parkId === ressource.parkId &&
        (authorization.buildingsIds?.length
          ? !ressource.checkTotalAccessToPark
          : true) &&
        (ressource.buildingsIds?.length && authorization.buildingsIds?.length
          ? ressource.buildingsIds.every((b) =>
              authorization.buildingsIds?.includes(b)
            )
          : true)
    );

    if (!userAuthorizations.length) {
      return {
        success: false,
        error: null,
      };
    }

    const userPolicies = userAuthorizations.flatMap(
      (authorization) => authorization.policies
    );

    const policyPredicate = (policy: string) =>
      policy
        .split('_')
        .some((_, index, array) =>
          userPolicies.includes(array.slice(0, index + 1).join('_'))
        );

    const isAuthorized =
      !requiredPolicies.length ||
      (useOrForPolicies
        ? requiredPolicies.some(policyPredicate)
        : requiredPolicies.every(policyPredicate));

    return {
      success: isAuthorized,
      error: null,
    };
  }
}
