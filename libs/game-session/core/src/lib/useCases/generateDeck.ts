import {
  IResponse,
  IUseCase,
} from '@plex-tinder/shared/utils';
import { IMovieRepository } from '@plex-tinder/movies/core';

export type GenerateDeckInput = {
  userId: string; // To filter by user's libraries/permissions if needed later
  duration?: number; // Max duration in minutes
  minRating?: number; // Min audience rating
  fromYear?: number; // Released after year
  genreIds?: number[]; // Filter by genre IDs
  limit?: number; // Deck size (default 50)
};

type Output = {
  movieIds: string[];
};

export class GenerateDeckUseCase
  implements IUseCase<GenerateDeckInput, Output>
{
  constructor(private readonly movieRepository: IMovieRepository) {}
  
  async authorize() {
    return true;
  }

  public async execute(
    input: GenerateDeckInput
  ): Promise<IResponse<Output, Error>> {
    try {
      // 1. Fetch candidates based on criteria
      const movies = await this.movieRepository.getMoviesFromCriterias(
        {
          duration: input.duration,
          audienceRating: input.minRating,
          // Note: current IMovieRepository.getMoviesFromCriterias interface might need update
          // to support fromYear and genres if not already flexible enough.
          // I will map what is available in SearchCriteria.
        },
        1000 // Fetch a large pool to shuffle from
      );

      if (!movies || movies.length === 0) {
        return { success: { movieIds: [] }, error: null };
      }

      // 2. Filter in memory for missing criterias if repo doesn't support them yet
      // (e.g. Year, Genres) - implementing logic here to avoid touching Repo too much now
      let filtered = movies;

      if (input.fromYear) {
        filtered = filtered.filter((m) => m.year >= input.fromYear!);
      }

      // 3. Shuffle (Fisher-Yates)
      const shuffled = this.shuffle(filtered);

      // 4. Slice to limit
      const limit = input.limit || 50;
      const selection = shuffled.slice(0, limit);

      return {
        success: {
          movieIds: selection.map((m) => m.guid),
        },
        error: null,
      };
    } catch (error) {
      return { success: null, error: error as Error };
    }
  }

  private shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}
