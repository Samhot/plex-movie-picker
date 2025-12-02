import { IResponse, IUseCase } from '@plex-tinder/shared/utils';
import { GameSession } from '../domain/GameSession';
import { IGameSessionRepository } from '../repositories/GameSessionRepository.interface';
import { IGameSessionNotifier } from '../ports/GameSessionNotifier.interface';
import { User } from '@plex-tinder/auth/core';

const MAX_PARTICIPANTS = 10;

type Input = {
  code: string;
  user: User;
};

type Output = {
  session: GameSession;
};

export class JoinGameSessionUseCase implements IUseCase<Input, Output> {
  constructor(
    private readonly gameSessionRepository: IGameSessionRepository,
    private readonly gameSessionNotifier: IGameSessionNotifier
  ) {}

  async authorize(input: Input) {
    return !!input.code && !!input.user;
  }

  public async execute(input: Input): Promise<IResponse<Output, Error>> {
    try {
      const session = await this.gameSessionRepository.findByCode(input.code);

      if (!session) {
        return { success: null, error: new Error('GameSession not found') };
      }

      // Check if session is expired
      if (session.isExpired()) {
        return { success: null, error: new Error('GameSession has expired') };
      }

      // Check if session is full (but allow if user is already a participant)
      const isAlreadyParticipant = session.participants.some(p => p.id === input.user.id);
      if (!isAlreadyParticipant && session.participants.length >= MAX_PARTICIPANTS) {
        return { success: null, error: new Error(`Session is full (max ${MAX_PARTICIPANTS} participants)`) };
      }

      // Idempotency check
      if (!session.participants.find((p) => p.id === input.user.id)) {
        session.addParticipant(input.user);
        await this.gameSessionRepository.update(session);

        // Notify room that someone joined
        this.gameSessionNotifier.notifyParticipantJoined(session.id, {
          id: input.user.id,
          name: input.user.fullName,
        });
      }

      return { success: { session }, error: null };
    } catch (error) {
      return { success: null, error: error as Error };
    }
  }
}

