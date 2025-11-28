import { faker } from '@faker-js/faker';

import { User } from './domain/User';

export const userMock = User.required().parse({
  id: 'PtOoZWxnfohVKCC5mCuAZjdRiuQ2',
  authorizations: [],
  disabled: false,
  fullName: faker.name.fullName(),
  email: faker.internet.email(),
} satisfies User);
