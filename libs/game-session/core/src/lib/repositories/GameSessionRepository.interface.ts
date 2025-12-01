import { GameSession } from '../domain/GameSession';
import { GameAction } from '../domain/GameAction';

export interface IGameSessionRepository {
  create(session: GameSession): Promise<void>;
  findById(id: string): Promise<GameSession | null>;
  findByCode(code: string): Promise<GameSession | null>;
  update(session: GameSession): Promise<void>;
  delete(id: string): Promise<void>;
  
  // Methods for Game Actions
  addGameAction(sessionId: string, action: GameAction): Promise<void>;
  getGameActions(sessionId: string): Promise<GameAction[]>;
}

