import { IResponse, IUseCase } from '@plex-tinder/shared/utils';
import {
  GameAction,
  GameActionType,
} from '../domain/GameAction';
import { IGameStrategy } from '../domain/GameStrategy.interface';
import { IGameSessionRepository } from '../repositories/GameSessionRepository.interface';
import { IGameSessionNotifier } from '../ports/GameSessionNotifier.interface';
import { TinderGameStrategy } from '../domain/TinderGameStrategy';
import { GameSessionStatus } from '../domain/GameSession';

type Input = {
  sessionId: string;
  userId: string;
  movieId: string;
  liked: boolean;
};

type Output = {
  isMatch: boolean;
  matchedMovieId?: string;
};

export class ProcessSwipeUseCase implements IUseCase<Input, Output> {
  async authorize(input: Input) {
    return !!input.sessionId && !!input.userId && !!input.movieId && typeof input.liked === 'boolean';
  }

  // In a real app, we might inject a StrategyFactory to choose between Tinder/Bracket/etc.
  // For V1, we hardcode TinderGameStrategy or inject it as a default.
  private gameStrategy: IGameStrategy = new TinderGameStrategy();

  constructor(
    private readonly gameSessionRepository: IGameSessionRepository,
    private readonly gameSessionNotifier: IGameSessionNotifier
  ) {}

  public async execute(input: Input): Promise<IResponse<Output, Error>> {
    try {
      // 1. Get GameSession
      const session = await this.gameSessionRepository.findById(input.sessionId);
      if (!session) {
        return { success: null, error: new Error('GameSession not found') };
      }

      // 1b. Check if session is expired
      if (session.isExpired()) {
        return { success: null, error: new Error('GameSession has expired') };
      }

      // 1c. Check if session is already finished (match already found)
      if (session.status === GameSessionStatus.FINISHED) {
        return { success: null, error: new Error('GameSession is already finished') };
      }

      // 1e. Verify user is a participant
      const isParticipant = session.participants.some(p => p.id === input.userId);
      if (!isParticipant) {
        return { success: null, error: new Error('User is not a participant of this session') };
      }

      // 1f. Start the session if it's still in WAITING status (first swipe)
      if (session.status === GameSessionStatus.WAITING) {
        session.start();
        await this.gameSessionRepository.update(session);
      }

      // 2. Create Action Object
      const action = new GameAction(
        input.userId,
        GameActionType.SWIPE,
        {
          movieId: input.movieId,
          liked: input.liked,
        }
      );

      // 3. Save Action (Persistence)
      await this.gameSessionRepository.addGameAction(input.sessionId, action);

      // 4. Re-fetch all actions to calculate state
      const allActions = await this.gameSessionRepository.getGameActions(input.sessionId);

      // 5. Process via Game Engine
      const gameState = this.gameStrategy.processAction(session, action, allActions);

      // 6. Calculate likes count for progress notification
      const likesForMovie = allActions.filter(
        a => a.type === GameActionType.SWIPE &&
        (a.payload as { movieId: string; liked: boolean }).movieId === input.movieId &&
        (a.payload as { movieId: string; liked: boolean }).liked
      );
      const uniqueLikes = new Set(likesForMovie.map(a => a.userId)).size;

      // 7. Notify progress (useful for UI to show "2/3 have liked this movie")
      this.gameSessionNotifier.notifySwipeProgress(input.sessionId, {
        movieId: input.movieId,
        totalParticipants: session.participants.length,
        likesCount: uniqueLikes,
      });

      // 8. Handle Result
      if (gameState.isGameOver && gameState.winnerMovieId) {
        // Update session status to FINISHED
        session.status = GameSessionStatus.FINISHED;
        await this.gameSessionRepository.update(session);

        this.gameSessionNotifier.notifyMatchFound(input.sessionId, gameState.winnerMovieId);

        return {
          success: {
            isMatch: true,
            matchedMovieId: gameState.winnerMovieId
          },
          error: null,
        };
      }

      return {
        success: {
          isMatch: false,
        },
        error: null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: null, error: new Error(errorMessage) };
    }
  }
}
