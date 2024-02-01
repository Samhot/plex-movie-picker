import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { AuthorizeParkUseCase } from '@plex-tinder/assets/core';
import { FirebaseParkRepository } from '@plex-tinder/assets/repos/firebase';
import { AuthorizeUserUseCase } from '@plex-tinder/auth/core';
import {
  FirebaseGroupRepository,
  FirebaseUserRepository,
} from '@plex-tinder/auth/repos/firebase';
import {
  COMMON_MODULES,
  FirebaseDatabaseService,
  FirebaseService,
} from '@plex-tinder/shared/nest';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Global()
@Module({
  exports: [
    FirebaseUserRepository,
    FirebaseGroupRepository,
    FirebaseParkRepository,
    AuthorizeParkUseCase,
    AuthorizeUserUseCase,
  ],
  providers: [
    AuthResolver,
    {
      provide: AuthService,
      useFactory: (firebaseService: FirebaseService) => {
        return new AuthService(firebaseService);
      },
      inject: [FirebaseService],
    },
    {
      provide: FirebaseUserRepository,
      useFactory: (
        firebaseDataService: FirebaseDatabaseService,
        cache: Cache,
        groupRepo: FirebaseGroupRepository
      ) => {
        return new FirebaseUserRepository(
          firebaseDataService,
          cache,
          groupRepo
        );
      },
      inject: [FirebaseDatabaseService, CACHE_MANAGER, FirebaseGroupRepository],
    },
    {
      provide: FirebaseGroupRepository,
      useFactory: (
        firebaseDataService: FirebaseDatabaseService,
        cache: Cache
      ) => {
        return new FirebaseGroupRepository(firebaseDataService, cache);
      },
      inject: [FirebaseDatabaseService, CACHE_MANAGER],
    },
    {
      provide: FirebaseParkRepository,
      useFactory: (firebaseDataService: FirebaseDatabaseService) => {
        return new FirebaseParkRepository(firebaseDataService);
      },
      inject: [FirebaseDatabaseService],
    },
    {
      provide: AuthorizeParkUseCase,
      useFactory: (parkRepository: FirebaseParkRepository) =>
        new AuthorizeParkUseCase(parkRepository),
      inject: [FirebaseParkRepository],
    },
    {
      provide: AuthorizeUserUseCase,
      useClass: AuthorizeUserUseCase,
    },
  ],
})
export class AuthModule {}

@Module({
  imports: [...COMMON_MODULES, AuthModule],
})
export class IntegrationTestAuthModule {}
