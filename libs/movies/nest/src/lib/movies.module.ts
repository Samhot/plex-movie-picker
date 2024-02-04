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
  IMovieRepository,
} from '@plex-tinder/movies/core';
import { PostgresMovieRepository } from '@plex-tinder/movies/repos/postgres';
import { PrismaClientSecretRepository } from '@plex-tinder/secret/repos/prisma';
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
      provide: MoviesService,
      useFactory: (
        getMovieByIdUseCase: GetMovieByIdUseCase,
        getAllMoviesUseCase: GetAllMoviesUseCase,
        fetchMoviesUseCase: FetchMoviesUseCase,
        fetchGenresUseCase: FetchGenresUseCase
      ) => {
        return new MoviesService(
          getMovieByIdUseCase,
          getAllMoviesUseCase,
          fetchMoviesUseCase,
          fetchGenresUseCase
        );
      },
      inject: [
        GetMovieByIdUseCase,
        GetAllMoviesUseCase,
        FetchMoviesUseCase,
        FetchGenresUseCase,
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
        clientSecret: PrismaClientSecretRepository
      ) => {
        return new PlexRepository(http, clientSecret);
      },
      inject: [HttpClient, PrismaClientSecretRepository],
    },
    {
      provide: PrismaClientSecretRepository,
      useFactory: (prisma: PrismaService) => {
        return new PrismaClientSecretRepository(prisma);
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
