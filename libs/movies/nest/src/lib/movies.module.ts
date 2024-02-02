import { Module } from '@nestjs/common';
import {
  GetMovieByIdUseCase,
  IMovieRepository,
} from '@plex-tinder/movies/core';
import { PostgresMovieRepository } from '@plex-tinder/movies/repos/postgres';
import { MoviesController } from './movies.controller';
import { PrismaService } from '@plex-tinder/shared/nest';
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
      provide: MoviesService,
      useFactory: (getMovieByIdUseCase: GetMovieByIdUseCase) => {
        return new MoviesService(getMovieByIdUseCase);
      },
      inject: [GetMovieByIdUseCase],
    },
    {
      provide: PostgresMovieRepository,
      useFactory: (prisma: PrismaService) => {
        return new PostgresMovieRepository(prisma);
      },
      inject: [PrismaService],
    },
  ],
})
export class MoviesModule {}
