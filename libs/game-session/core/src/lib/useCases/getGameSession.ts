import { IResponse, IUseCase } from '@plex-tinder/shared/utils';
import { GameSession } from '../domain/GameSession';
import { IGameSessionRepository } from '../repositories/GameSessionRepository.interface';

type Input = {
  sessionId: string;
  userId: string; // To verify access
};

type Output = {
  session: GameSession;
};

export class GetGameSessionUseCase implements IUseCase<Input, Output> {
  constructor(private readonly gameSessionRepository: IGameSessionRepository) {}

  async authorize(input: Input) {
    return !!input.sessionId && !!input.userId;
  }

  public async execute(input: Input): Promise<IResponse<Output, Error>> {
    try {
      const session = await this.gameSessionRepository.findById(input.sessionId);

      if (!session) {
        return { success: null, error: new Error('GameSession not found') };
      }

      // Verify user is a participant (or host)
      const isParticipant = session.participants.some(p => p.id === input.userId);
      if (!isParticipant) {
        return { success: null, error: new Error('User is not a participant of this session') };
      }

      return { success: { session }, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: null, error: new Error(errorMessage) };
    }
  }
}

