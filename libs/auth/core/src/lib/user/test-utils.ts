import { faker } from '@faker-js/faker';

// import { generateFakeFirebaseKey } from '@plex-tinder/shared/utils';

import { User } from './domain/User';

export const userMock = User.required({ selectedPark: true }).parse({
  id: 'PtOoZWxnfohVKCC5mCuAZjdRiuQ2',
  authorizations: [],
  // selectedPark: generateFakeFirebaseKey(),
  disabled: false,
  fullName: faker.name.fullName(),
  email: faker.internet.email(),
} satisfies User);
