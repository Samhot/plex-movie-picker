import { faker } from '@faker-js/faker';

export const prismaMovieMock = {
  // id,
  code: faker.string.alpha(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  name: faker.word.noun(),
  archived: false,
  validUntil: {
    validUntil: faker.date.future(),
  },
};
