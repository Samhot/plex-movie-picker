import { JoinGameSessionUseCase } from './joinGameSession';
import { IGameSessionRepository } from '../repositories/GameSessionRepository.interface';
import { IGameSessionNotifier } from '../ports/GameSessionNotifier.interface';
import { GameSession, GameSessionStatus } from '../domain/GameSession';
import { User } from '@plex-tinder/auth/core';

describe('JoinGameSessionUseCase', () => {
  let useCase: JoinGameSessionUseCase;
  let mockRepository: jest.Mocked<IGameSessionRepository>;
  let mockNotifier: jest.Mocked<IGameSessionNotifier>;

  // Helper to create a mock user
  const createUser = (id: string, name: string): User => ({
    id,
    email: `${name.toLowerCase()}@test.com`,
    fullName: name,
    disabled: false,
    authorizations: [],
  });

  // Helper to create a session
  const createSession = (
    participants: User[],
    code = 'ABCD'
  ): GameSession => {
    return new GameSession(
      'session-1',
      code,
      participants[0]?.id || 'host-1',
      ['movie-1', 'movie-2', 'movie-3'],
      GameSessionStatus.WAITING,
      participants
    );
  };

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addGameAction: jest.fn(),
      getGameActions: jest.fn(),
    };

    mockNotifier = {
      notifyParticipantJoined: jest.fn(),
      notifyMatchFound: jest.fn(),
      notifySwipeProgress: jest.fn(),
    };

    useCase = new JoinGameSessionUseCase(mockRepository, mockNotifier);
  });

  describe('authorize', () => {
    it('should return true when code and user are provided', async () => {
      const user = createUser('user-1', 'Alice');

      const result = await useCase.authorize({
        code: 'ABCD',
        user,
      });

      expect(result).toBe(true);
    });

    it('should return false when code is empty', async () => {
      const user = createUser('user-1', 'Alice');

      const result = await useCase.authorize({
        code: '',
        user,
      });

      expect(result).toBe(false);
    });

    it('should return false when user is null/undefined', async () => {
      const result = await useCase.authorize({
        code: 'ABCD',
        user: null as unknown as User,
      });

      expect(result).toBe(false);
    });
  });

  describe('execute', () => {
    describe('error cases', () => {
      it('should return error when session is not found', async () => {
        mockRepository.findByCode.mockResolvedValue(null);

        const user = createUser('user-1', 'Alice');
        const result = await useCase.execute({
          code: 'XXXX',
          user,
        });

        expect(result.success).toBeNull();
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe('GameSession not found');
      });

      it('should return error when repository throws', async () => {
        mockRepository.findByCode.mockRejectedValue(new Error('Database error'));

        const user = createUser('user-1', 'Alice');
        const result = await useCase.execute({
          code: 'ABCD',
          user,
        });

        expect(result.success).toBeNull();
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe('Database error');
      });
    });

    describe('successful join', () => {
      it('should add new participant to session', async () => {
        const host = createUser('host-1', 'Host');
        const session = createSession([host]);
        mockRepository.findByCode.mockResolvedValue(session);
        mockRepository.update.mockResolvedValue(undefined);

        const newUser = createUser('user-2', 'Bob');
        const result = await useCase.execute({
          code: 'ABCD',
          user: newUser,
        });

        expect(result.error).toBeNull();
        expect(result.success?.session).toBeDefined();
        expect(result.success?.session.participants).toHaveLength(2);
        expect(result.success?.session.participants[1].id).toBe('user-2');
      });

      it('should call repository.update with updated session', async () => {
        const host = createUser('host-1', 'Host');
        const session = createSession([host]);
        mockRepository.findByCode.mockResolvedValue(session);
        mockRepository.update.mockResolvedValue(undefined);

        const newUser = createUser('user-2', 'Bob');
        await useCase.execute({
          code: 'ABCD',
          user: newUser,
        });

        expect(mockRepository.update).toHaveBeenCalledTimes(1);
        expect(mockRepository.update).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'session-1',
          })
        );
      });

      it('should notify other participants when someone joins', async () => {
        const host = createUser('host-1', 'Host');
        const session = createSession([host]);
        mockRepository.findByCode.mockResolvedValue(session);
        mockRepository.update.mockResolvedValue(undefined);

        const newUser = createUser('user-2', 'Bob');
        await useCase.execute({
          code: 'ABCD',
          user: newUser,
        });

        expect(mockNotifier.notifyParticipantJoined).toHaveBeenCalledTimes(1);
        expect(mockNotifier.notifyParticipantJoined).toHaveBeenCalledWith('session-1', {
          id: 'user-2',
          name: 'Bob',
        });
      });
    });

    describe('idempotency', () => {
      it('should not add duplicate participant if user already in session', async () => {
        const host = createUser('host-1', 'Host');
        const existingUser = createUser('user-2', 'Bob');
        const session = createSession([host, existingUser]);
        mockRepository.findByCode.mockResolvedValue(session);

        // User-2 tries to join again
        const result = await useCase.execute({
          code: 'ABCD',
          user: existingUser,
        });

        expect(result.error).toBeNull();
        expect(result.success?.session.participants).toHaveLength(2);
        expect(mockRepository.update).not.toHaveBeenCalled();
        expect(mockNotifier.notifyParticipantJoined).not.toHaveBeenCalled();
      });

      it('should return the session even if user already joined', async () => {
        const host = createUser('host-1', 'Host');
        const existingUser = createUser('user-2', 'Bob');
        const session = createSession([host, existingUser]);
        mockRepository.findByCode.mockResolvedValue(session);

        const result = await useCase.execute({
          code: 'ABCD',
          user: existingUser,
        });

        expect(result.success?.session).toBeDefined();
        expect(result.success?.session.id).toBe('session-1');
      });
    });

    describe('case sensitivity', () => {
      it('should find session by code (code should be normalized before call)', async () => {
        const host = createUser('host-1', 'Host');
        const session = createSession([host], 'ABCD');
        mockRepository.findByCode.mockResolvedValue(session);
        mockRepository.update.mockResolvedValue(undefined);

        const newUser = createUser('user-2', 'Bob');
        const result = await useCase.execute({
          code: 'ABCD',
          user: newUser,
        });

        expect(result.success?.session).toBeDefined();
        expect(mockRepository.findByCode).toHaveBeenCalledWith('ABCD');
      });
    });

    describe('multiple participants', () => {
      it('should allow multiple users to join', async () => {
        const host = createUser('host-1', 'Host');
        const session = createSession([host]);
        
        // First join
        mockRepository.findByCode.mockResolvedValue(session);
        mockRepository.update.mockResolvedValue(undefined);

        const user2 = createUser('user-2', 'Bob');
        await useCase.execute({ code: 'ABCD', user: user2 });

        expect(session.participants).toHaveLength(2);

        // Second join
        const user3 = createUser('user-3', 'Charlie');
        await useCase.execute({ code: 'ABCD', user: user3 });

        expect(session.participants).toHaveLength(3);
        expect(mockNotifier.notifyParticipantJoined).toHaveBeenCalledTimes(2);
      });
    });
  });
});

