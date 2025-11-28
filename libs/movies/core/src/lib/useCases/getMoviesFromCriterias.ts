import {
  AuthorizeAndTryCatchUseCase,
  IUseCase,
} from '@plex-tinder/shared/utils';

import { Movie } from '../domain/Movie';
import { IMovieRepository } from '../repositories/MovieRepository.interface';
import { SearchCriteria } from '../constants';

type Input = {
  userId: string;
  criterias: SearchCriteria;
  count: number;
};
type Output = Movie[] | null;
export class GetMoviesFromCriteriasUseCase implements IUseCase<Input, Output> {
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
    
    const movies = await this.movieRepository.getMoviesFromCriterias(
      input.criterias,
      input.count
    );

    return {
      success: movies,
      error: null,
    };
  }
}
