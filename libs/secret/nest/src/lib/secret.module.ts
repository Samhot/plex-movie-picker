import { Module } from '@nestjs/common';
import { PlexRepository } from '@plex-tinder/mediacenter/repos/plex';
import {
  CreateClientSecretsUseCase,
  GetClientSecretsUseCase,
  IClientSecretRepository,
} from '@plex-tinder/secret/core';
import { PrismaClientSecretRepository } from '@plex-tinder/secret/repos/prisma';
import { HttpClient } from '@plex-tinder/shared/clients/http';
import { PrismaService } from '@plex-tinder/shared/nest';
import { Axios } from 'axios';
import { SecretController } from './secret.controller';
import { SecretService } from './secret.service';

@Module({
  imports: [],
  controllers: [SecretController],
  providers: [
    PrismaService,
    {
      provide: CreateClientSecretsUseCase,
      useFactory: (secretRepo: IClientSecretRepository) => {
        return new CreateClientSecretsUseCase(secretRepo);
      },
      inject: [PrismaClientSecretRepository],
    },
    {
      provide: GetClientSecretsUseCase,
      useFactory: (secretRepo: IClientSecretRepository) => {
        return new GetClientSecretsUseCase(secretRepo);
      },
      inject: [PrismaClientSecretRepository],
    },
    {
      provide: SecretService,
      useFactory: (
        createClientSecretUseCase: CreateClientSecretsUseCase,
        getClientSecretUseCase: GetClientSecretsUseCase
      ) => {
        return new SecretService(
          createClientSecretUseCase,
          getClientSecretUseCase
        );
      },
      inject: [CreateClientSecretsUseCase, GetClientSecretsUseCase],
    },
    {
      provide: PrismaClientSecretRepository,
      useFactory: (prisma: PrismaService) => {
        return new PrismaClientSecretRepository(prisma);
      },
      inject: [PrismaService],
    },
    {
      provide: PlexRepository,
      useFactory: (
        http: HttpClient,
        clientSecret: PrismaClientSecretRepository
      ) => {
        return new PlexRepository(
          http,
          clientSecret,
          process.env['PLEX_CLIENT_IDENTIFIER'] || 'plex-movie-picker-app'
        );
      },
      inject: [HttpClient, PrismaClientSecretRepository],
    },
    {
      provide: HttpClient,
      useFactory: (axios: Axios) => {
        return new HttpClient(axios);
      },
      inject: [Axios],
    },
    {
      provide: Axios,
      useFactory: () => {
        return new Axios();
      },
    },
  ],
})
export class SecretModule {}
