import { Module } from '@nestjs/common';
import {
  IMediaCenterCredentials,
  IMediaCenterRepository,
} from '@plex-tinder/mediacenter/core';
import { PlexRepository } from '@plex-tinder/mediacenter/repos/plex';
import {
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
      provide: FetchMoviesUseCase,
      useFactory: (
        mediaCenterRepo: IMediaCenterRepository<IMediaCenterCredentials>,
        movieRepo: IMovieRepository
      ) => {
        return new FetchMoviesUseCase(mediaCenterRepo, movieRepo);
      },
      inject: [
        PlexRepository,
        PostgresMovieRepository,
        PrismaClientSecretRepository,
        HttpClient,
      ],
    },
    {
      provide: MoviesService,
      useFactory: (
        getMovieByIdUseCase: GetMovieByIdUseCase,
        getAllMoviesUseCase: GetAllMoviesUseCase,
        fetchMoviesUseCase: FetchMoviesUseCase
      ) => {
        return new MoviesService(
          getMovieByIdUseCase,
          getAllMoviesUseCase,
          fetchMoviesUseCase
        );
      },
      inject: [GetMovieByIdUseCase, GetAllMoviesUseCase, FetchMoviesUseCase],
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
