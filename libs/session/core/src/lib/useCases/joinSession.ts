import { IResponse, IUseCase } from '@plex-tinder/shared/utils';
import { Session } from '../domain/Session';
import { ISessionRepository } from '../repositories/SessionRepository.interface';
import { ISessionNotifier } from '../ports/SessionNotifier.interface';
import { User } from '@plex-tinder/auth/core';

type Input = {
  code: string;
  user: User;
};

type Output = {
  session: Session;
};

export class JoinSessionUseCase implements IUseCase<Input, Output> {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly sessionNotifier: ISessionNotifier
  ) {}

  async authorize(input: Input) {
    return !!input.code && !!input.user;
  }

  public async execute(input: Input): Promise<IResponse<Output, Error>> {
    try {
      const session = await this.sessionRepository.findByCode(input.code);

    if (!session) {
      return { success: null, error: new Error('Session not found') };
    }

    // Idempotency check
    if (!session.participants.find((p) => p.id === input.user.id)) {
      session.addParticipant(input.user);
      await this.sessionRepository.update(session);

      // Notify room that someone joined
      this.sessionNotifier.notifyParticipantJoined(session.id, {
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
