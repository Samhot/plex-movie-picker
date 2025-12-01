import {
  AuthorizeAndTryCatchUseCase,
  IUseCase,
} from '@plex-tinder/shared/utils';

import { Movie } from '../domain/Movie';
import { IMovieRepository } from '../repositories/MovieRepository.interface';

type Input = {
  userId: string;
  count: number;
};
type Output = Movie[] | null;
export class GetAllMoviesUseCase implements IUseCase<Input, Output> {
  constructor(private readonly movieRepository: IMovieRepository) {}

  static 	authorization = {
    policies: ['movies_getAll' as const],
    useOrForPolicies: false,
  };

  async authorize(input: Input) {
    return !!input.userId;
  }

  @AuthorizeAndTryCatchUseCase()
  public async execute(input: Input) {
    await this.authorize(input);

    const movies = await this.movieRepository.getAllMovies(input.count);

    return {
      success: movies,
      error: null,
    };
  }
}
