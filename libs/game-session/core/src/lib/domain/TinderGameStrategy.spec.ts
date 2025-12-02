import { TinderGameStrategy } from './TinderGameStrategy';
import { GameSession, GameSessionStatus } from './GameSession';
import { GameAction, GameActionType } from './GameAction';
import { User } from '@plex-tinder/auth/core';

describe('TinderGameStrategy', () => {
  let strategy: TinderGameStrategy;

  // Helper to create a mock user
  const createUser = (id: string, name: string): User => ({
    id,
    email: `${name.toLowerCase()}@test.com`,
    fullName: name,
    disabled: false,
    authorizations: [],
  });

  // Helper to create a swipe action
  const createSwipeAction = (userId: string, movieId: string, liked: boolean): GameAction => {
    return new GameAction(userId, GameActionType.SWIPE, { movieId, liked });
  };

  // Helper to create a session
  const createSession = (participants: User[], movieIds: string[] = ['movie1', 'movie2', 'movie3']): GameSession => {
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
    strategy = new TinderGameStrategy();
  });

  describe('initialize', () => {
    it('should return initial metadata with mode and total movies count', () => {
      const user1 = createUser('user-1', 'Alice');
      const session = createSession([user1], ['movie1', 'movie2', 'movie3']);

      const metadata = strategy.initialize(session);

      expect(metadata).toEqual({
        mode: 'TINDER',
        totalMovies: 3,
      });
    });
  });

  describe('processAction', () => {
    describe('with less than 2 participants', () => {
      it('should return isGameOver: false when only 1 participant', () => {
        const user1 = createUser('user-1', 'Alice');
        const session = createSession([user1]);
        const action = createSwipeAction('user-1', 'movie1', true);

        const result = strategy.processAction(session, action, []);

        expect(result.isGameOver).toBe(false);
        expect(result.winnerMovieId).toBeUndefined();
      });

      it('should return isGameOver: false when 0 participants', () => {
        const session = createSession([]);
        const action = createSwipeAction('user-1', 'movie1', true);

        const result = strategy.processAction(session, action, []);

        expect(result.isGameOver).toBe(false);
      });
    });

    describe('with 2 participants', () => {
      it('should return isGameOver: false when only one user likes a movie', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);
        const action = createSwipeAction('user-1', 'movie1', true);

        const result = strategy.processAction(session, action, []);

        expect(result.isGameOver).toBe(false);
        expect(result.winnerMovieId).toBeUndefined();
      });

      it('should return isGameOver: true when both users like the same movie', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        const existingActions = [createSwipeAction('user-1', 'movie1', true)];
        const newAction = createSwipeAction('user-2', 'movie1', true);

        const result = strategy.processAction(session, newAction, existingActions);

        expect(result.isGameOver).toBe(true);
        expect(result.winnerMovieId).toBe('movie1');
        expect(result.metadata).toEqual({
          winningReason: 'CONSENSUS',
          likesCount: 2,
        });
      });

      it('should return isGameOver: false when users like different movies', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        const existingActions = [createSwipeAction('user-1', 'movie1', true)];
        const newAction = createSwipeAction('user-2', 'movie2', true);

        const result = strategy.processAction(session, newAction, existingActions);

        expect(result.isGameOver).toBe(false);
      });

      it('should not count dislikes towards consensus', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        const existingActions = [createSwipeAction('user-1', 'movie1', true)];
        const newAction = createSwipeAction('user-2', 'movie1', false); // dislike

        const result = strategy.processAction(session, newAction, existingActions);

        expect(result.isGameOver).toBe(false);
      });
    });

    describe('with 3+ participants', () => {
      it('should require all participants to like for consensus', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const user3 = createUser('user-3', 'Charlie');
        const session = createSession([user1, user2, user3]);

        const existingActions = [
          createSwipeAction('user-1', 'movie1', true),
          createSwipeAction('user-2', 'movie1', true),
        ];
        const newAction = createSwipeAction('user-3', 'movie2', true); // Different movie

        const result = strategy.processAction(session, newAction, existingActions);

        expect(result.isGameOver).toBe(false);
      });

      it('should return match when all 3 participants like the same movie', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const user3 = createUser('user-3', 'Charlie');
        const session = createSession([user1, user2, user3]);

        const existingActions = [
          createSwipeAction('user-1', 'movie1', true),
          createSwipeAction('user-2', 'movie1', true),
        ];
        const newAction = createSwipeAction('user-3', 'movie1', true);

        const result = strategy.processAction(session, newAction, existingActions);

        expect(result.isGameOver).toBe(true);
        expect(result.winnerMovieId).toBe('movie1');
        expect(result.metadata?.['likesCount']).toBe(3);
      });
    });

    describe('duplicate handling', () => {
      it('should ignore duplicate likes from the same user', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        // User 1 likes movie1 twice
        const existingActions = [
          createSwipeAction('user-1', 'movie1', true),
          createSwipeAction('user-1', 'movie1', true), // duplicate
        ];
        const newAction = createSwipeAction('user-1', 'movie1', true); // another duplicate

        const result = strategy.processAction(session, newAction, existingActions);

        // Should NOT be a match because only user-1 liked it (duplicates ignored)
        expect(result.isGameOver).toBe(false);
      });

      it('should correctly count unique users when duplicates exist', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        const existingActions = [
          createSwipeAction('user-1', 'movie1', true),
          createSwipeAction('user-1', 'movie1', true), // duplicate
        ];
        const newAction = createSwipeAction('user-2', 'movie1', true);

        const result = strategy.processAction(session, newAction, existingActions);

        expect(result.isGameOver).toBe(true);
        expect(result.winnerMovieId).toBe('movie1');
        expect(result.metadata?.['likesCount']).toBe(2);
      });
    });

    describe('non-swipe actions', () => {
      it('should ignore non-swipe action types', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        const existingActions = [createSwipeAction('user-1', 'movie1', true)];
        const nonSwipeAction = new GameAction('user-2', GameActionType.VETO, {
          movieId: 'movie1',
        });

        const result = strategy.processAction(session, nonSwipeAction, existingActions);

        expect(result.isGameOver).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle empty actions array', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);
        const action = createSwipeAction('user-1', 'movie1', true);

        const result = strategy.processAction(session, action, []);

        expect(result.isGameOver).toBe(false);
      });

      it('should handle action with missing movieId in payload', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        const existingActions = [createSwipeAction('user-1', 'movie1', true)];
        const malformedAction = new GameAction('user-2', GameActionType.SWIPE, {
          liked: true,
          // movieId is missing
        });

        const result = strategy.processAction(session, malformedAction, existingActions);

        expect(result.isGameOver).toBe(false);
      });

      it('should detect first match among multiple movies', () => {
        const user1 = createUser('user-1', 'Alice');
        const user2 = createUser('user-2', 'Bob');
        const session = createSession([user1, user2]);

        // Both users like movie2, but not movie1
        const existingActions = [
          createSwipeAction('user-1', 'movie1', true),
          createSwipeAction('user-2', 'movie1', false),
          createSwipeAction('user-1', 'movie2', true),
        ];
        const newAction = createSwipeAction('user-2', 'movie2', true);

        const result = strategy.processAction(session, newAction, existingActions);

        expect(result.isGameOver).toBe(true);
        expect(result.winnerMovieId).toBe('movie2');
      });
    });
  });
});

