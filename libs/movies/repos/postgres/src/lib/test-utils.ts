import { faker } from '@faker-js/faker';

// import { generateCuid, generateFakeFirebaseKey } from '@plex-tinder/shared/utils';

// const id = generateCuid();
export const prismaRegulatoryReportMock = {
  // id,
  // documentKey: `${generateFakeFirebaseKey()}/${generateFakeFirebaseKey()}`,
  code: faker.random.alpha(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
  // createdBy: generateCuid(),
  name: faker.word.noun(),
  visitDateView: {
    // id,
    visitDate: faker.date.past(),
  },
  observations: [],
  archived: false,
  validUntil: {
    // id,
    validUntil: faker.date.future(),
  },
};
