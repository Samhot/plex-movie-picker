import { User } from '@plex-tinder/auth/core';

export enum GameSessionStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  EXPIRED = 'EXPIRED',
}

// Default session TTL: 24 hours
export const SESSION_TTL_HOURS = 24;

export class GameSession {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly hostId: string,
    public readonly movieIds: string[], // The Deck
    public status: GameSessionStatus = GameSessionStatus.WAITING,
    public readonly participants: User[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly expiresAt: Date = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000)
  ) {}

  public addParticipant(user: User): void {
    if (!this.participants.find((p) => p.id === user.id)) {
      this.participants.push(user);
    }
  }

  public start(): void {
    if (this.status !== GameSessionStatus.WAITING) {
      throw new Error('GameSession is already started or finished');
    }
    this.status = GameSessionStatus.IN_PROGRESS;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}

