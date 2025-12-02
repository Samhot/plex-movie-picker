import { faker } from '@faker-js/faker';

import { User } from './domain/User';

export const userMock = User.required().parse({
  id: 'clt4339t0000008l660047031',
  authorizations: [],
  disabled: false,
  fullName: faker.person.fullName(),
  email: faker.internet.email(),
} satisfies User);
