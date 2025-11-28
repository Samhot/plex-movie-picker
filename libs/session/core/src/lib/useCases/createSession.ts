import { IUseCase } from '@plex-tinder/shared/utils';
import { Session, SessionStatus } from '../domain/Session';
import { ISessionRepository } from '../repositories/SessionRepository.interface';
import { User } from '@plex-tinder/auth/core';
import * as crypto from 'crypto';

type Input = {
  host: User;
  movieIds: string[];
};

type Output = {
  session: Session;
  code: string;
};

export class CreateSessionUseCase implements IUseCase<Input, Output> {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  static authorization = {
    policies: ['session_create' as const],
    useOrForPolicies: false,
  };

  async authorize(input: Input) {
    return !!input.host;
  }

  public async execute(input: Input) {
    const code = this.generateShortCode();
    const sessionId = crypto.randomUUID();

    const session = new Session(
      sessionId,
      code,
      input.host.id,
      input.movieIds,
      SessionStatus.WAITING,
      [input.host] // Host is the first participant
    );

    await this.sessionRepository.create(session);

    return {
      success: {
        session,
        code,
      },
      error: null,
    };
  }

  private generateShortCode(): string {
    // Generate a 4-char uppercase code (e.g. ABCD)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

