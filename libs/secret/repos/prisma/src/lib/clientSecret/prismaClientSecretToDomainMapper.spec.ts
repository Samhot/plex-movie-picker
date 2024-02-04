import { faker } from '@faker-js/faker';
import { ClientProvider, ClientSecret as PrismaClientSecret } from '@prisma/client';

import { generateCuid } from '@beeldi-app/shared/utils';

import { prismaClientSecretToDomainMapper } from './prismaClientSecretToDomainMapper';

describe('prismaClientSecretToDomainMapper', () => {
    const prismaClientSecret = {
        id: generateCuid(),
        provider: ClientProvider.SMARTFM,
        secret: 'secret',
        createdAt: new Date(),
        updatedAt: new Date(),
        parkId: generateCuid(),
        metadata: {
            email: faker.internet.email(),
            contractId: faker.datatype.uuid(),
        },
    } satisfies PrismaClientSecret;

    describe('success', () => {
        it('should map a prisma client secret to a domain client secret', () => {
            const mapped = prismaClientSecretToDomainMapper(prismaClientSecret);

            expect(mapped).toEqual({
                id: prismaClientSecret.id,
                provider: prismaClientSecret.provider,
                secret: prismaClientSecret.secret,
                parkId: prismaClientSecret.parkId,
                metadata: prismaClientSecret.metadata,
                createdAt: prismaClientSecret.createdAt,
                updatedAt: prismaClientSecret.updatedAt,
            });
        });
    });

    describe('failure', () => {
        it('should throw an error when an invalid provider is provided', () => {
            expect(() =>
                prismaClientSecretToDomainMapper({
                    ...prismaClientSecret,
                    provider: 'invalid' as ClientProvider,
                } as PrismaClientSecret)
            ).toThrowError();
        });
    });
});
