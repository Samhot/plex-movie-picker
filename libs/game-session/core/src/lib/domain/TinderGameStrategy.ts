import { GameAction, GameActionType } from './GameAction';
import { GameState, IGameStrategy } from './GameStrategy.interface';
import { GameSession } from './GameSession';

export class TinderGameStrategy implements IGameStrategy {
  initialize(session: GameSession): Record<string, unknown> {
    return {
      mode: 'TINDER',
      totalMovies: session.movieIds.length,
    };
  }

  processAction(session: GameSession, action: GameAction, allActions: GameAction[]): GameState {
    if (action.type !== GameActionType.SWIPE) {
      // Ignore non-swipe actions in Tinder mode, or throw error
      return this.calculateState(session, allActions);
    }
    return this.calculateState(session, [...allActions, action]);
  }

  private calculateState(session: GameSession, actions: GameAction[]): GameState {
    // Logic: Check if any movie has been liked by ALL participants
    const participantsCount = session.participants.length;
    
    // Need at least 2 participants for a match to be meaningful
    if (participantsCount < 2) {
      console.log('TinderStrategy: Not enough participants for a match', participantsCount);
      return { isGameOver: false };
    }

    // Track which users liked which movies (Set to avoid duplicates)
    const likesPerMovie: Record<string, Set<string>> = {};

    for (const action of actions) {
      if (
        action.type === GameActionType.SWIPE &&
        (action.payload as { liked: boolean }).liked
      ) {
        const movieId = (action.payload as { movieId: string }).movieId;
        const userId = action.userId;
        
        if (movieId && userId) {
          if (!likesPerMovie[movieId]) {
            likesPerMovie[movieId] = new Set();
          }
          likesPerMovie[movieId].add(userId);
          
          console.log(`TinderStrategy: Movie ${movieId} has ${likesPerMovie[movieId].size}/${participantsCount} likes`);
          
          // WIN CONDITION: All participants liked this movie
          if (likesPerMovie[movieId].size >= participantsCount) {
            return {
              isGameOver: true,
              winnerMovieId: movieId,
              metadata: {
                winningReason: 'CONSENSUS',
                likesCount: likesPerMovie[movieId].size,
              },
            };
          }
        }
      }
    }

    return {
      isGameOver: false,
    };
  }
}
