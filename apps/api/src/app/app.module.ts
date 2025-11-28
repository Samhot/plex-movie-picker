import { Module } from '@nestjs/common';
import { MoviesModule } from '@plex-tinder/movies';
import { CacheModule, PrismaService } from '@plex-tinder/shared/nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule, TasksService } from '@plex-tinder/tasks';
import { MediacenterNestModule } from '@plex-tinder/mediacenter/nest';
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
import { PrismaMediaSourceRepository } from '@plex-tinder/secret/repos/prisma';
import { HttpClient } from '@plex-tinder/shared/clients/http';
import { Axios } from 'axios';

@Module({
  imports: [CacheModule, MoviesModule, TasksModule, MediacenterNestModule],
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
        mediaSourceRepo: PrismaMediaSourceRepository
      ) => {
        return new PlexRepository(http, mediaSourceRepo);
      },
      inject: [HttpClient, PrismaMediaSourceRepository],
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
      provide: PrismaMediaSourceRepository,
      useFactory: (prisma: PrismaService) => {
        return new PrismaMediaSourceRepository(prisma);
      },
      inject: [PrismaService],
    },
  ],
})
export class AppModule {}
