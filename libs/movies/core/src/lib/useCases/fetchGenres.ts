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
  userId: string;
};
type Output = {
  status: HttpStatusCode;
  savedCount: number;
  foundCount: number;
};
export class FetchGenresUseCase implements IUseCase<Input, Output> {
  constructor(
    private readonly mediaCenterRepo: IMediaCenterRepository<IMediaCenterCredentials>,
    private readonly movieRepository: IMovieRepository
  ) {}

  static authorization = {
    policies: ['movies_fetchGenres' as const],
    useOrForPolicies: false,
  };

  async authorize(input: Input) {
    return !!input.userId;
  }

  @AuthorizeAndTryCatchUseCase()
  public async execute(input: Input) {
    await this.authorize(input);

    const genres = await this.mediaCenterRepo.getAllGenres(input.userId);

    if (genres) {
      const createdGenres = await this.movieRepository.createManyGenres(
        genres.map((genre) => ({
          ...genre,
          id: Number(genre.id),
        }))
      );
      Logger.log('Created new genres', createdGenres);

      return {
        success: {
          status: HttpStatusCode.Created,
          savedCount: genres.filter((x) => createdGenres.includes({ id: x.id }))
            .length,
          foundCount: genres ? genres.length : 0,
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
