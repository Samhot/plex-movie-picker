import { ProcessSwipeUseCase } from './processSwipe';
import { IGameSessionRepository } from '../repositories/GameSessionRepository.interface';
import { IGameSessionNotifier } from '../ports/GameSessionNotifier.interface';
import { GameSession, GameSessionStatus } from '../domain/GameSession';
import { GameAction, GameActionType } from '../domain/GameAction';
import { User } from '@plex-tinder/auth/core';

describe('ProcessSwipeUseCase', () => {
  let useCase: ProcessSwipeUseCase;
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
    movieIds: string[] = ['movie1', 'movie2', 'movie3']
  ): GameSession => {
    return new GameSession(
      'session-1',
      'ABCD',
      participants[0]?.id || 'host-1',
      movieIds,
      GameSessionStatus.IN_PROGRESS,
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

    useCase = new ProcessSwipeUseCase(mockRepository, mockNotifier);
  });

  describe('authorize', () => {
    it('should return true when all required fields are present with liked=true', async () => {
      const result = await useCase.authorize({
        sessionId: 'session-1',
        userId: 'user-1',
        movieId: 'movie-1',
        liked: true,
      });

      expect(result).toBe(true);
    });

    it('should return true when all required fields are present with liked=false', async () => {
      const result = await useCase.authorize({
        sessionId: 'session-1',
        userId: 'user-1',
        movieId: 'movie-1',
        liked: false,
      });

      expect(result).toBe(true);
    });

    it('should return false when sessionId is missing', async () => {
      const result = await useCase.authorize({
        sessionId: '',
        userId: 'user-1',
        movieId: 'movie-1',
        liked: true,
      });

      expect(result).toBe(false);
    });

    it('should return false when userId is missing', async () => {
      const result = await useCase.authorize({
        sessionId: 'session-1',
        userId: '',
        movieId: 'movie-1',
        liked: true,
      });

      expect(result).toBe(false);
    });

    it('should return false when movieId is missing', async () => {
      const result = await useCase.authorize({
        sessionId: 'session-1',
        userId: 'user-1',
        movieId: '',
        liked: true,
      });

      expect(result).toBe(false);
    });
  });

  describe('execute', () => {
    describe('error cases', () => {
      it('should return error when session is not found', async () => {
        mockRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute({
          sessionId: 'non-existent-session',
          userId: 'user-1',
          movieId: 'movie-1',
          liked: true,
        });

        expect(result.success).toBeNull();
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe('GameSession not found');
      });

      it('should return error when session is already finished', async () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = new GameSession(
          'session-1',
          'ABCD',
          user1.id,
          ['movie-1', 'movie-2'],
          GameSessionStatus.FINISHED, // Already finished
          [user1, user2]
        );

        mockRepository.findById.mockResolvedValue(session);

        const result = await useCase.execute({
          sessionId: 'session-1',
          userId: 'user-1',
          movieId: 'movie-1',
          liked: true,
        });

        expect(result.success).toBeNull();
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe('GameSession is already finished');
        expect(mockRepository.addGameAction).not.toHaveBeenCalled();
      });

      it('should return error when user is not a participant', async () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        mockRepository.findById.mockResolvedValue(session);

        const result = await useCase.execute({
          sessionId: 'session-1',
          userId: 'user-3', // Not a participant
          movieId: 'movie-1',
          liked: true,
        });

        expect(result.success).toBeNull();
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe('User is not a participant of this session');
        expect(mockRepository.addGameAction).not.toHaveBeenCalled();
      });

      it('should return error when repository throws', async () => {
        mockRepository.findById.mockRejectedValue(new Error('Database error'));

        const result = await useCase.execute({
          sessionId: 'session-1',
          userId: 'user-1',
          movieId: 'movie-1',
          liked: true,
        });

        expect(result.success).toBeNull();
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe('Database error');
      });
    });

    describe('successful swipe - no match', () => {
      it('should save action and return isMatch: false when no consensus', async () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        mockRepository.findById.mockResolvedValue(session);
        mockRepository.addGameAction.mockResolvedValue(undefined);
        mockRepository.getGameActions.mockResolvedValue([
          new GameAction('user-1', GameActionType.SWIPE, { movieId: 'movie-1', liked: true }),
        ]);

        const result = await useCase.execute({
          sessionId: 'session-1',
          userId: 'user-1',
          movieId: 'movie-1',
          liked: true,
        });

        expect(result.error).toBeNull();
        expect(result.success).toEqual({
          isMatch: false,
        });
        expect(mockRepository.addGameAction).toHaveBeenCalledWith(
          'session-1',
          expect.objectContaining({
            userId: 'user-1',
            type: GameActionType.SWIPE,
            payload: { movieId: 'movie-1', liked: true },
          })
        );
        expect(mockNotifier.notifyMatchFound).not.toHaveBeenCalled();
      });

      it('should handle dislike correctly', async () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        mockRepository.findById.mockResolvedValue(session);
        mockRepository.addGameAction.mockResolvedValue(undefined);
        mockRepository.getGameActions.mockResolvedValue([
          new GameAction('user-1', GameActionType.SWIPE, { movieId: 'movie-1', liked: false }),
        ]);

        const result = await useCase.execute({
          sessionId: 'session-1',
          userId: 'user-1',
          movieId: 'movie-1',
          liked: false,
        });

        expect(result.error).toBeNull();
        expect(result.success).toEqual({
          isMatch: false,
        });
        expect(mockRepository.addGameAction).toHaveBeenCalledWith(
          'session-1',
          expect.objectContaining({
            payload: { movieId: 'movie-1', liked: false },
          })
        );
      });
    });

    describe('successful swipe - match found', () => {
      it('should return isMatch: true and notify when consensus is reached', async () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        mockRepository.findById.mockResolvedValue(session);
        mockRepository.addGameAction.mockResolvedValue(undefined);
        // Both users have liked movie-1
        mockRepository.getGameActions.mockResolvedValue([
          new GameAction('user-1', GameActionType.SWIPE, { movieId: 'movie-1', liked: true }),
          new GameAction('user-2', GameActionType.SWIPE, { movieId: 'movie-1', liked: true }),
        ]);

        const result = await useCase.execute({
          sessionId: 'session-1',
          userId: 'user-2',
          movieId: 'movie-1',
          liked: true,
        });

        expect(result.error).toBeNull();
        expect(result.success).toEqual({
          isMatch: true,
          matchedMovieId: 'movie-1',
        });
        expect(mockNotifier.notifyMatchFound).toHaveBeenCalledWith('session-1', 'movie-1');
      });

      it('should work with 3 participants', async () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const user3 = createUser('user-3', 'Charlie');
        const session = createSession([user1, user2, user3]);

        mockRepository.findById.mockResolvedValue(session);
        mockRepository.addGameAction.mockResolvedValue(undefined);
        // All 3 users have liked movie-2
        mockRepository.getGameActions.mockResolvedValue([
          new GameAction('user-1', GameActionType.SWIPE, { movieId: 'movie-2', liked: true }),
          new GameAction('user-2', GameActionType.SWIPE, { movieId: 'movie-2', liked: true }),
          new GameAction('user-3', GameActionType.SWIPE, { movieId: 'movie-2', liked: true }),
        ]);

        const result = await useCase.execute({
          sessionId: 'session-1',
          userId: 'user-3',
          movieId: 'movie-2',
          liked: true,
        });

        expect(result.error).toBeNull();
        expect(result.success?.isMatch).toBe(true);
        expect(result.success?.matchedMovieId).toBe('movie-2');
        expect(mockNotifier.notifyMatchFound).toHaveBeenCalledWith('session-1', 'movie-2');
      });
    });
  });
});

