import { Module } from '@nestjs/common';
import { PlexController } from './plex.controller';
import {
  GetPlexAuthPinUseCase,
  CheckPlexAuthPinUseCase,
  GetPlexResourcesUseCase,
} from '@plex-tinder/mediacenter/core';
import { PlexRepository } from '@plex-tinder/mediacenter/repos/plex';
import { PrismaMediaSourceRepository } from '@plex-tinder/secret/repos/prisma';
import { HttpClient } from '@plex-tinder/shared/clients/http';
import { PrismaService } from '@plex-tinder/shared/nest';
import { Axios } from 'axios';

@Module({
  controllers: [PlexController],
  providers: [
    PrismaService,
    {
      provide: GetPlexAuthPinUseCase,
      useFactory: (plexRepo: PlexRepository) => {
        return new GetPlexAuthPinUseCase(plexRepo);
      },
      inject: [PlexRepository],
    },
    {
      provide: CheckPlexAuthPinUseCase,
      useFactory: (plexRepo: PlexRepository) => {
        return new CheckPlexAuthPinUseCase(plexRepo);
      },
      inject: [PlexRepository],
    },
    {
      provide: GetPlexResourcesUseCase,
      useFactory: (plexRepo: PlexRepository) => {
        return new GetPlexResourcesUseCase(plexRepo);
      },
      inject: [PlexRepository],
    },
    {
      provide: PlexRepository,
      useFactory: (
        http: HttpClient,
        mediaSourceRepo: PrismaMediaSourceRepository
      ) => {
        return new PlexRepository(http, mediaSourceRepo);
      },
      inject: [HttpClient, PrismaMediaSourceRepository],
    },
    {
      provide: PrismaMediaSourceRepository,
      useFactory: (prisma: PrismaService) => {
        return new PrismaMediaSourceRepository(prisma);
      },
      inject: [PrismaService],
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
  exports: [],
})
export class MediacenterNestModule {}
