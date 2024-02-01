import { gql } from 'graphql-tag';
import { JwtPayload, verify } from 'jsonwebtoken';

import { FirebaseService } from '@plex-tinder/shared/nest';
import { IntegrationTestManager } from '@plex-tinder/shared/test';

import { IntegrationTestAuthModule } from './auth.module';

describe('AuthResolver', () => {
  const manager = new IntegrationTestManager(
    IntegrationTestAuthModule,
    IntegrationTestAuthModule
  );
  let firebase: FirebaseService;

  beforeAll(async () => {
    await manager.beforeAll();
    firebase = manager['prismaApp'].get<FirebaseService>(FirebaseService);
  });

  afterAll(async () => {
    await manager.afterAll();
  });

  describe('generateCustomToken', () => {
    const query = gql`
      query GenerateCustomToken {
        generateCustomToken
      }
    `;

    it('should return a custom token', async () => {
      // Act
      const result = await manager.sendQuery<{
        generateCustomToken: string;
      }>('prisma', query, {});

      // Assert
      expect(
        (
          verify(
            result.data!.generateCustomToken,
            firebase.serviceAccount.privateKey!
          ) as JwtPayload
        ).uid
      ).toEqual(manager.coreUser.id);
    });

    it('should not allow unauthenticated users', async () => {
      // Act
      const result = await manager.sendQuery<{
        generateCustomToken: string;
      }>('prisma', query, {}, false, false);

      // Assert
      expect(result.errors?.[0].message).toEqual('UnauthorizedException');
    });
  });
});
