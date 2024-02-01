export const userHasAuthorizations = (
    appPolicies: string[],
    userAuthorizations: string[],
    userOr?: boolean
): boolean => {
    if (userOr) {
        return appPolicies.some((policy) =>
            policy
                .split('_')
                .some((item, index, array) => userAuthorizations.includes(array.slice(0, index + 1).join('_')))
        );
    }

    return appPolicies.every((policy) =>
        policy.split('_').some((item, index, array) => userAuthorizations.includes(array.slice(0, index + 1).join('_')))
    );
};
