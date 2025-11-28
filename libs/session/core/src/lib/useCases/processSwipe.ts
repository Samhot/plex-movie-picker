import { IResponse, IUseCase } from '@plex-tinder/shared/utils';
import {
  GameAction,
  GameActionType,
} from '../domain/GameAction';
import { IGameStrategy } from '../domain/GameStrategy.interface';
import { ISessionRepository } from '../repositories/SessionRepository.interface';
import { ISessionNotifier } from '../ports/SessionNotifier.interface';
import { TinderGameStrategy } from '../domain/TinderGameStrategy'; // Default strategy for V1

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
    return !!input.sessionId && !!input.userId && !!input.movieId && !!input.liked;
  }

  // In a real app, we might inject a StrategyFactory to choose between Tinder/Bracket/etc.
  // For V1, we hardcode TinderGameStrategy or inject it as a default.
  private gameStrategy: IGameStrategy = new TinderGameStrategy();

  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly sessionNotifier: ISessionNotifier
  ) {}

  public async execute(input: Input): Promise<IResponse<Output, Error>> {
    try {
    // 1. Get Session
    const session = await this.sessionRepository.findById(input.sessionId);
    if (!session) {
      return { success: null, error: new Error('Session not found') };
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
    // We need to save the action to DB so history is preserved
    await this.sessionRepository.addGameAction(input.sessionId, action);

    // 4. Re-fetch all actions to calculate state
    // Optimization: We could pass only the new action if the strategy was stateful, 
    // but pure strategy requires full history or accumulated state.
    // For V1 MVP: We fetch all actions for this session.
    const allActions = await this.sessionRepository.getGameActions(input.sessionId);

    // 5. Process via Game Engine
    const gameState = this.gameStrategy.processAction(session, action, allActions);

    // 6. Handle Result
    if (gameState.isGameOver && gameState.winnerMovieId) {
        // OPTIONAL: Update session status to FINISHED in DB
        // session.status = SessionStatus.FINISHED;
        // await this.sessionRepository.update(session);
        
        this.sessionNotifier.notifyMatchFound(input.sessionId, gameState.winnerMovieId);

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
      return { success: null, error: error as Error };
    }
  }
}
