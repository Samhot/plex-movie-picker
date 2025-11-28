import { User } from '@plex-tinder/auth/core';

export enum SessionStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export class Session {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly hostId: string,
    public readonly movieIds: string[], // The Deck
    public status: SessionStatus = SessionStatus.WAITING,
    public readonly participants: User[] = [],
    public readonly createdAt: Date = new Date()
  ) {}

  public addParticipant(user: User): void {
    if (!this.participants.find((p) => p.id === user.id)) {
      this.participants.push(user);
    }
  }

  public start(): void {
    if (this.status !== SessionStatus.WAITING) {
      throw new Error('Session is already started or finished');
    }
    this.status = SessionStatus.IN_PROGRESS;
  }
}

