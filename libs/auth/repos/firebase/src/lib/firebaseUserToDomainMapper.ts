import { ElementaryUser, User } from '@plex-tinder/auth/core';

import { UserFirebase } from './types';

export const firebaseElementaryUserToDomainMapper = (
  user: UserFirebase & { uid: string }
) => {
  return ElementaryUser.parse({
    id: user.uid,
    disabled: user.disabled ?? false,
    selectedPark: user.selectedParc,
    email: user.email,
    fullName: user.displayName || 'Unknown',
  } satisfies ElementaryUser);
};

export const firebaseUserToDomainMapper = (
  user: UserFirebase & { uid: string },
  authorizations: { parkId: string; policies: string[] }[]
): User => {
  return User.parse({
    ...firebaseElementaryUserToDomainMapper(user),
    selectedPark: user.selectedParc,
    authorizations,
  } satisfies User);
};
