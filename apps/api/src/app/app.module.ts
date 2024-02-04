import { Module } from '@nestjs/common';
import { MoviesModule } from '@plex-tinder/movies';
import { CacheModule, PrismaService } from '@plex-tinder/shared/nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule, TasksService } from '@plex-tinder/tasks';
import {
  IMediaCenterRepository,
  IMediaCenterCredentials,
} from '@plex-tinder/mediacenter/core';
import { PlexRepository } from '@plex-tinder/mediacenter/repos/plex';
import {
  FetchMoviesUseCase,
  IMovieRepository,
  FetchGenresUseCase,
} from '@plex-tinder/movies/core';
import { PostgresMovieRepository } from '@plex-tinder/movies/repos/postgres';
import { PrismaClientSecretRepository } from '@plex-tinder/secret/repos/prisma';
import { HttpClient } from '@plex-tinder/shared/clients/http';
import { Axios } from 'axios';

@Module({
  imports: [CacheModule, MoviesModule, TasksModule],
  controllers: [AppController],
  providers: [
    AppService,
    TasksService,
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
export class AppModule {}
