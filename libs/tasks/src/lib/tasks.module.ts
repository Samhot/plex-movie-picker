import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {
  IMediaCenterCredentials,
  IMediaCenterRepository,
} from '@plex-tinder/mediacenter/core';
import { PlexRepository } from '@plex-tinder/mediacenter/repos/plex';
import {
  FetchGenresUseCase,
  FetchMoviesUseCase,
  IMovieRepository,
} from '@plex-tinder/movies/core';
import { PostgresMovieRepository } from '@plex-tinder/movies/repos/postgres';
import { PrismaClientSecretRepository } from '@plex-tinder/secret/repos/prisma';
import { HttpClient } from '@plex-tinder/shared/clients/http';
import { PrismaService } from '@plex-tinder/shared/nest';
import { Axios } from 'axios';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    PrismaService,
    {
      provide: FetchMoviesUseCase,
      useFactory: (
        mediaCenterRepo: IMediaCenterRepository<IMediaCenterCredentials>,
        movieRepo: IMovieRepository,
        fetchGenresUseCase: FetchGenresUseCase
      ) => {
        return new FetchMoviesUseCase(
          mediaCenterRepo,
          movieRepo,
          fetchGenresUseCase
        );
      },
      inject: [PlexRepository, PostgresMovieRepository, FetchGenresUseCase],
    },
    {
      provide: PlexRepository,
      useFactory: (
        http: HttpClient,
        clientSecret: PrismaClientSecretRepository
      ) => {
        return new PlexRepository(http, clientSecret);
      },
      inject: [HttpClient, PrismaClientSecretRepository],
    },
    {
      provide: PostgresMovieRepository,
      useFactory: (prisma: PrismaService) => {
        return new PostgresMovieRepository(prisma);
      },
      inject: [PrismaService],
    },
    {
      provide: FetchGenresUseCase,
      useFactory: (
        mediaCenterRepo: IMediaCenterRepository<IMediaCenterCredentials>,
        movieRepo: IMovieRepository
      ) => {
        return new FetchGenresUseCase(mediaCenterRepo, movieRepo);
      },
      inject: [PlexRepository, PostgresMovieRepository],
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
    {
      provide: PrismaClientSecretRepository,
      useFactory: (prisma: PrismaService) => {
        return new PrismaClientSecretRepository(prisma);
      },
      inject: [PrismaService],
    },
  ],
})
export class TasksModule {}
