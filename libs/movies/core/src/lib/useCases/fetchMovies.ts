// import { User } from '@plex-tinder/auth/core';
import {
  AuthorizeAndTryCatchUseCase,
  IUseCase,
} from '@plex-tinder/shared/utils';

import { Logger } from '@nestjs/common';
import {
  IMediaCenterCredentials,
  IMediaCenterRepository,
} from '@plex-tinder/mediacenter/core';
import { HttpStatusCode } from 'axios';
import { IMovieRepository } from '../repositories/MovieRepository.interface';

type Input = {
  //
};
type Output = {
  status: HttpStatusCode;
  savedCount: number;
  foundCount: number;
};
export class FetchMoviesUseCase implements IUseCase<Input, Output> {
  constructor(
    private readonly mediaCenterRepo: IMediaCenterRepository<IMediaCenterCredentials>,
    private readonly movieRepository: IMovieRepository
  ) {}

  static authorization = {
    policies: ['actionPlans_maintenance_access' as const],
    useOrForPolicies: false,
  };

  async authorize(_: Input) {
    Logger.log('TODO: Check if user is allowed to see this action', _);
    return true;
  }

  @AuthorizeAndTryCatchUseCase()
  public async execute(input: Input) {
    await this.authorize(input);

    const genres = await this.mediaCenterRepo.getAllGenres('plex');
    const movies = await this.mediaCenterRepo.getAllMovies('plex');

    if (genres) {
      const createdGenres = await this.movieRepository.createManyGenres(
        genres.map((genre) => ({
          ...genre,
          id: Number(genre.id),
        }))
      );
      Logger.log('Created new genres', createdGenres);
    }

    if (movies) {
      const saved = await this.movieRepository.createManyMovies(movies);
      return {
        success: {
          status: HttpStatusCode.Created,
          savedCount: saved ? saved.length : 0,
          foundCount: movies ? movies.length : 0,
        },
        error: null,
      };
    }

    return {
      success: null,
      error: Error('Invalid credentals'),
    };
  }
}
