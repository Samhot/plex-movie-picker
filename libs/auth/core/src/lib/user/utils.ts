import { User } from './domain/User';

export const hasUserTotalAccessToParkWithPolicy = (user: User, parkId: string, policy: string) => {
    return user.authorizations.some(
        (a) => a.parkId === parkId && !a.buildingsIds?.length && a.policies.includes(policy)
    );
};
