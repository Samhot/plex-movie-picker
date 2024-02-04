// import { User } from '@plex-tinder/auth/core';
import {
  AuthorizeAndTryCatchUseCase,
  IUseCase,
} from '@plex-tinder/shared/utils';

import { Movie } from '../domain/Movie';
import { IMovieRepository } from '../repositories/MovieRepository.interface';
import { Logger } from '@nestjs/common';

type Input = {
  // id: string;
  //  user: User
  count: number;
};
type Output = Movie[] | null;
export class GetAllMoviesUseCase implements IUseCase<Input, Output> {
  constructor(private readonly movieRepository: IMovieRepository) {}

  static authorization = {
    policies: ['actionPlans_maintenance_access' as const],
    useOrForPolicies: false,
  };

  async authorize(_: Input) {
    // TODO: Check if user is allowed to see this action
    Logger.log('TODO: Check if user is allowed to see this action', _);
    return true;
  }

  @AuthorizeAndTryCatchUseCase()
  public async execute(input: Input) {
    const movies = await this.movieRepository.getAll(input.count);

    await this.authorize(input);

    return {
      success: movies,
      error: null,
    };
  }
}
