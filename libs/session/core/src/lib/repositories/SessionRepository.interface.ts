import { Session } from '../domain/Session';
import { GameAction } from '../domain/GameAction';

export interface ISessionRepository {
  create(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findByCode(code: string): Promise<Session | null>;
  update(session: Session): Promise<void>;
  delete(id: string): Promise<void>;
  
  // New methods for Game Actions
  addGameAction(sessionId: string, action: GameAction): Promise<void>;
  getGameActions(sessionId: string): Promise<GameAction[]>;
}
