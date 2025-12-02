import { IResponse, IUseCase } from '@plex-tinder/shared/utils';
import { IGameSessionRepository } from '../repositories/GameSessionRepository.interface';
import { IMovieRepository, Movie } from '@plex-tinder/movies/core';

type Input = {
  sessionId: string;
  userId: string; // To verify access
};

type Output = {
  movies: Movie[];
  totalCount: number;
};

export class GetSessionMoviesUseCase implements IUseCase<Input, Output> {
  constructor(
    private readonly gameSessionRepository: IGameSessionRepository,
    private readonly movieRepository: IMovieRepository
  ) {}

  async authorize(input: Input) {
    return !!input.sessionId && !!input.userId;
  }

  public async execute(input: Input): Promise<IResponse<Output, Error>> {
    try {
      // 1. Get session
      const session = await this.gameSessionRepository.findById(input.sessionId);

      if (!session) {
        return { success: null, error: new Error('GameSession not found') };
      }

      // 2. Verify user is a participant
      const isParticipant = session.participants.some(p => p.id === input.userId);
      if (!isParticipant) {
        return { success: null, error: new Error('User is not a participant of this session') };
      }

      // 3. Fetch movies by their GUIDs
      // Note: For optimization, we could add a getMoviesByIds method to IMovieRepository
      const moviePromises = session.movieIds.map(guid => 
        this.movieRepository.getOneMovie(guid)
      );
      
      const movieResults = await Promise.all(moviePromises);
      
      // Filter out nulls (movies not found)
      const movies = movieResults.filter((m): m is Movie => m !== null);

      return {
        success: {
          movies,
          totalCount: session.movieIds.length,
        },
        error: null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: null, error: new Error(errorMessage) };
    }
  }
}

