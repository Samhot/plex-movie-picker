import { Module } from '@nestjs/common';
import {
  IMediaCenterCredentials,
  IMediaCenterRepository,
} from '@plex-tinder/mediacenter/core';
import { PlexRepository } from '@plex-tinder/mediacenter/repos/plex';
import {
  FetchGenresUseCase,
  FetchMoviesUseCase,
  GetAllMoviesUseCase,
  GetMovieByIdUseCase,
  GetMoviesFromCriteriasUseCase,
  IMovieRepository,
  SyncLibrariesUseCase,
} from '@plex-tinder/movies/core';
import { PostgresMovieRepository } from '@plex-tinder/movies/repos/postgres';
import { PrismaMediaSourceRepository } from '@plex-tinder/secret/repos/prisma';
import { HttpClient } from '@plex-tinder/shared/clients/http';
import { PrismaService } from '@plex-tinder/shared/nest';
import { Axios } from 'axios';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
  imports: [],
  controllers: [MoviesController],
  providers: [
    PrismaService,
    {
      provide: GetMovieByIdUseCase,
      useFactory: (movieRepo: IMovieRepository) => {
        return new GetMovieByIdUseCase(movieRepo);
      },
      inject: [PostgresMovieRepository],
    },
    {
      provide: GetAllMoviesUseCase,
      useFactory: (movieRepo: IMovieRepository) => {
        return new GetAllMoviesUseCase(movieRepo);
      },
      inject: [PostgresMovieRepository],
    },
    {
      provide: GetMoviesFromCriteriasUseCase,
      useFactory: (movieRepo: IMovieRepository) => {
        return new GetMoviesFromCriteriasUseCase(movieRepo);
      },
      inject: [PostgresMovieRepository],
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
      provide: SyncLibrariesUseCase,
      useFactory: (
        mediaCenterRepo: IMediaCenterRepository<IMediaCenterCredentials>,
        movieRepo: IMovieRepository
      ) => {
        return new SyncLibrariesUseCase(mediaCenterRepo, movieRepo);
      },
      inject: [PlexRepository, PostgresMovieRepository],
    },
    {
      provide: MoviesService,
      useFactory: (
        getMovieByIdUseCase: GetMovieByIdUseCase,
        getAllMoviesUseCase: GetAllMoviesUseCase,
        getMoviesFromCriteriasUseCase: GetMoviesFromCriteriasUseCase,
        fetchMoviesUseCase: FetchMoviesUseCase,
        fetchGenresUseCase: FetchGenresUseCase,
        syncLibrariesUseCase: SyncLibrariesUseCase
      ) => {
        return new MoviesService(
          getMovieByIdUseCase,
          getAllMoviesUseCase,
          getMoviesFromCriteriasUseCase,
          fetchMoviesUseCase,
          fetchGenresUseCase,
          syncLibrariesUseCase
        );
      },
      inject: [
        GetMovieByIdUseCase,
        GetAllMoviesUseCase,
        GetMoviesFromCriteriasUseCase,
        FetchMoviesUseCase,
        FetchGenresUseCase,
        SyncLibrariesUseCase,
      ],
    },
    {
      provide: PostgresMovieRepository,
      useFactory: (prisma: PrismaService) => {
        return new PostgresMovieRepository(prisma);
      },
      inject: [PrismaService],
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
})
export class MoviesModule {}
