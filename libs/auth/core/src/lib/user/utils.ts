import { User } from './domain/User';

export const hasUserPolicy = (user: User, policy: string) => {
    return user.authorizations.some(
        (a) => a.policies.includes(policy)
    );
};
