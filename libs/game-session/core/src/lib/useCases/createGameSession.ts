import { IUseCase } from '@plex-tinder/shared/utils';
import { GameSession, GameSessionStatus } from '../domain/GameSession';
import { IGameSessionRepository } from '../repositories/GameSessionRepository.interface';
import { User } from '@plex-tinder/auth/core';
import * as crypto from 'crypto';

const MAX_CODE_RETRIES = 5;

type Input = {
  host: User;
  movieIds: string[];
};

type Output = {
  session: GameSession;
  code: string;
};

export class CreateGameSessionUseCase implements IUseCase<Input, Output> {
  constructor(private readonly gameSessionRepository: IGameSessionRepository) {}

  static authorization = {
    policies: ['game_session_create' as const],
    useOrForPolicies: false,
  };

  async authorize(input: Input) {
    return !!input.host;
  }

  public async execute(input: Input) {
    // Generate unique code with retry logic
    let code: string;
    let attempts = 0;
    
    do {
      code = this.generateShortCode();
      const existingSession = await this.gameSessionRepository.findByCode(code);
      
      if (!existingSession) {
        break; // Code is unique
      }
      
      attempts++;
      if (attempts >= MAX_CODE_RETRIES) {
        return {
          success: null,
          error: new Error('Failed to generate unique session code after multiple attempts'),
        };
      }
    } while (attempts < MAX_CODE_RETRIES);

    const sessionId = crypto.randomUUID();

    const session = new GameSession(
      sessionId,
      code,
      input.host.id,
      input.movieIds,
      GameSessionStatus.WAITING,
      [input.host] // Host is the first participant
    );

    await this.gameSessionRepository.create(session);

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

