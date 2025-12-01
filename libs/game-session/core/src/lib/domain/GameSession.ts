import { User } from '@plex-tinder/auth/core';

export enum GameSessionStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export class GameSession {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly hostId: string,
    public readonly movieIds: string[], // The Deck
    public status: GameSessionStatus = GameSessionStatus.WAITING,
    public readonly participants: User[] = [],
    public readonly createdAt: Date = new Date()
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
}

