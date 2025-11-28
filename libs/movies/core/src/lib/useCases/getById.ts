import {
  AuthorizeAndTryCatchUseCase,
  IUseCase,
} from '@plex-tinder/shared/utils';

import { Movie } from '../domain/Movie';
import { IMovieRepository } from '../repositories/MovieRepository.interface';

type Input = {
  id: string;
  userId: string;
};
type Output = Movie | null;
export class GetMovieByIdUseCase implements IUseCase<Input, Output> {
  constructor(private readonly movieRepository: IMovieRepository) {}

  static authorization = {
    policies: ['actionPlans_maintenance_access' as const],
    useOrForPolicies: false,
  };

  async authorize(input: Input) {
    return !!input.userId;
  }

  @AuthorizeAndTryCatchUseCase()
  public async execute(input: Input) {
    await this.authorize(input);

    const movie = await this.movieRepository.getOneMovie(input.id);

    return {
      success: movie,
      error: null,
    };
  }
}
