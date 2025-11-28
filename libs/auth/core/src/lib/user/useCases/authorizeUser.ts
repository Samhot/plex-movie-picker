import { IUseCase, Policies } from '@plex-tinder/shared/utils';
import { AuthorizeAndTryCatchUseCase } from '@plex-tinder/shared/utils';
import { IResponse } from '@plex-tinder/shared/utils';
import { User } from '../domain/User';

type Input = {
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
    requiredPolicies,
    useOrForPolicies,
  }: Input): Promise<IResponse<Output>> {
    const userPolicies = user.authorizations.flatMap(
      (authorization) => authorization.policies
    );

    if (!userPolicies.length) {
      return {
        success: false,
        error: null,
      };
    }

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
