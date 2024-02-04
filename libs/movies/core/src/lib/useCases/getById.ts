// import { User } from '@plex-tinder/auth/core';
import {
  AuthorizeAndTryCatchUseCase,
  IUseCase,
} from '@plex-tinder/shared/utils';

import { Movie } from '../domain/Movie';
import { IMovieRepository } from '../repositories/MovieRepository.interface';
import { Logger } from '@nestjs/common';

type Input = {
  id: string;
  //  user: User
};
type Output = Movie | null;
export class GetMovieByIdUseCase implements IUseCase<Input, Output> {
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
    const movie = await this.movieRepository.getOne(input.id);

    await this.authorize(input);

    return {
      success: movie,
      error: null,
    };
  }
}
