import { GameAction } from './GameAction';
import { Session } from './Session';

export interface GameState {
  isGameOver: boolean;
  winnerMovieId?: string;
  // On pourra ajouter ici des infos spécifiques au jeu (ex: bracket tree, remaining movies...)
  metadata?: Record<string, unknown>;
}

export interface IGameStrategy {
  /**
   * Process an action from a user and return the new game state
   */
  processAction(session: Session, action: GameAction, allActions: GameAction[]): GameState;

  /**
   * Initialize game metadata if needed
   */
  initialize(session: Session): Record<string, unknown>;
}

