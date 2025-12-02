import { CreateGameSessionUseCase } from './createGameSession';
import { IGameSessionRepository } from '../repositories/GameSessionRepository.interface';
import { GameSessionStatus } from '../domain/GameSession';
import { User } from '@plex-tinder/auth/core';

describe('CreateGameSessionUseCase', () => {
  let useCase: CreateGameSessionUseCase;
  let mockRepository: jest.Mocked<IGameSessionRepository>;

  // Helper to create a mock user
  const createUser = (id: string, name: string): User => ({
    id,
    email: `${name.toLowerCase()}@test.com`,
    fullName: name,
    disabled: false,
    authorizations: [],
  });

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

    useCase = new CreateGameSessionUseCase(mockRepository);
  });

  describe('authorize', () => {
    it('should return true when host is provided', async () => {
      const host = createUser('host-1', 'Alice');

      const result = await useCase.authorize({
        host,
        movieIds: ['movie-1', 'movie-2'],
      });

      expect(result).toBe(true);
    });

    it('should return false when host is null/undefined', async () => {
      const result = await useCase.authorize({
        host: null as unknown as User,
        movieIds: ['movie-1', 'movie-2'],
      });

      expect(result).toBe(false);
    });
  });

  describe('execute', () => {
    it('should create a session with correct properties', async () => {
      const host = createUser('host-1', 'Alice');
      const movieIds = ['movie-1', 'movie-2', 'movie-3'];

      mockRepository.create.mockResolvedValue(undefined);

      const result = await useCase.execute({
        host,
        movieIds,
      });

      expect(result.error).toBeNull();
      expect(result.success).toBeDefined();
      expect(result.success?.session).toBeDefined();
      expect(result.success?.code).toBeDefined();
    });

    it('should generate a 4-character code', async () => {
      const host = createUser('host-1', 'Alice');

      mockRepository.create.mockResolvedValue(undefined);

      const result = await useCase.execute({
        host,
        movieIds: ['movie-1'],
      });

      expect(result.success?.code).toHaveLength(4);
      expect(result.success?.code).toMatch(/^[A-Z0-9]{4}$/);
    });

    it('should set session status to WAITING', async () => {
      const host = createUser('host-1', 'Alice');

      mockRepository.create.mockResolvedValue(undefined);

      const result = await useCase.execute({
        host,
        movieIds: ['movie-1'],
      });

      expect(result.success?.session.status).toBe(GameSessionStatus.WAITING);
    });

    it('should add host as first participant', async () => {
      const host = createUser('host-1', 'Alice');

      mockRepository.create.mockResolvedValue(undefined);

      const result = await useCase.execute({
        host,
        movieIds: ['movie-1'],
      });

      expect(result.success?.session.participants).toHaveLength(1);
      expect(result.success?.session.participants[0].id).toBe('host-1');
    });

    it('should set host as hostId', async () => {
      const host = createUser('host-1', 'Alice');

      mockRepository.create.mockResolvedValue(undefined);

      const result = await useCase.execute({
        host,
        movieIds: ['movie-1'],
      });

      expect(result.success?.session.hostId).toBe('host-1');
    });

    it('should include all movieIds in the session', async () => {
      const host = createUser('host-1', 'Alice');
      const movieIds = ['movie-1', 'movie-2', 'movie-3', 'movie-4', 'movie-5'];

      mockRepository.create.mockResolvedValue(undefined);

      const result = await useCase.execute({
        host,
        movieIds,
      });

      expect(result.success?.session.movieIds).toEqual(movieIds);
    });

    it('should call repository.create with the session', async () => {
      const host = createUser('host-1', 'Alice');

      mockRepository.create.mockResolvedValue(undefined);

      await useCase.execute({
        host,
        movieIds: ['movie-1'],
      });

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          hostId: 'host-1',
          movieIds: ['movie-1'],
          status: GameSessionStatus.WAITING,
        })
      );
    });

    it('should generate unique session IDs', async () => {
      const host = createUser('host-1', 'Alice');

      mockRepository.create.mockResolvedValue(undefined);

      const result1 = await useCase.execute({ host, movieIds: ['movie-1'] });
      const result2 = await useCase.execute({ host, movieIds: ['movie-1'] });

      expect(result1.success?.session.id).not.toBe(result2.success?.session.id);
    });

    it('should handle empty movieIds array', async () => {
      const host = createUser('host-1', 'Alice');

      mockRepository.create.mockResolvedValue(undefined);

      const result = await useCase.execute({
        host,
        movieIds: [],
      });

      expect(result.error).toBeNull();
      expect(result.success?.session.movieIds).toEqual([]);
    });
  });

  describe('generateShortCode', () => {
    it('should generate codes with only uppercase letters and numbers', async () => {
      const host = createUser('host-1', 'Alice');
      mockRepository.create.mockResolvedValue(undefined);

      // Run multiple times to check consistency
      for (let i = 0; i < 20; i++) {
        const result = await useCase.execute({ host, movieIds: ['movie-1'] });
        expect(result.success?.code).toMatch(/^[A-Z0-9]{4}$/);
      }
    });
  });
});

