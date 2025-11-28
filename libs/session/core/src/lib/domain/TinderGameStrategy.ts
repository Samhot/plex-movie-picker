import { GameAction, GameActionType } from './GameAction';
import { GameState, IGameStrategy } from './GameStrategy.interface';
import { Session } from './Session';

export class TinderGameStrategy implements IGameStrategy {
  initialize(session: Session): Record<string, unknown> {
    return {
      mode: 'TINDER',
      totalMovies: session.movieIds.length,
    };
  }

  processAction(session: Session, action: GameAction, allActions: GameAction[]): GameState {
    if (action.type !== GameActionType.SWIPE) {
      // Ignore non-swipe actions in Tinder mode, or throw error
      return this.calculateState(session, allActions);
    }
    return this.calculateState(session, [...allActions, action]);
  }

  private calculateState(session: Session, actions: GameAction[]): GameState {
    // Logic: Check if any movie has been liked by ALL participants
    const participantsCount = session.participants.length;
    if (participantsCount === 0) return { isGameOver: false };

    const likesPerMovie: Record<string, number> = {};

    for (const action of actions) {
      if (
        action.type === GameActionType.SWIPE &&
        (action.payload as { liked: boolean }).liked
      ) {
        const movieId = (action.payload as { movieId: string }).movieId;
        if (movieId) {
          likesPerMovie[movieId] = (likesPerMovie[movieId] || 0) + 1;
          
          // WIN CONDITION
          if (likesPerMovie[movieId] >= participantsCount) {
            return {
              isGameOver: true,
              winnerMovieId: movieId,
              metadata: {
                winningReason: 'CONSENSUS',
              },
            };
          }
        }
      }
    }

    // Check if we ran out of movies (optional: if everyone swiped everything)
    // This requires tracking who swiped what. 
    // For now, keep it simple: just check for match.

    return {
      isGameOver: false,
    };
  }
}

