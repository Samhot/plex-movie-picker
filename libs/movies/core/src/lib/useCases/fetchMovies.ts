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
import { FetchGenresUseCase } from './fetchGenres';
import { MoviesCategory } from '@plex-tinder/mediacenter/repos/plex';

type Input = {
  userId: string;
  category: MoviesCategory;
};
type Output = {
  status: HttpStatusCode;
  savedCount: number;
  foundCount: number;
};
export class FetchMoviesUseCase implements IUseCase<Input, Output> {
  constructor(
    private readonly mediaCenterRepo: IMediaCenterRepository<IMediaCenterCredentials>,
    private readonly movieRepository: IMovieRepository,
    private readonly fetchGenresUseCase: FetchGenresUseCase
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

    await this.fetchGenresUseCase.execute(input);

    const movies = await this.mediaCenterRepo.getMovies(input);

    if (movies) {
      const saved = await this.movieRepository.createManyMovies(movies);
      return {
        success: {
          status: HttpStatusCode.Created,
          savedCount: saved
            ? movies.filter(
                (movie) => !saved.map((s) => s.guid).includes(movie.guid)
              ).length
            : 0,
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
