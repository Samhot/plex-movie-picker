import { Injectable } from '@nestjs/common';
import {
  GameAction,
  GameActionType,
  ISessionRepository,
  Session,
  SessionStatus,
} from '@plex-tinder/session/core';
import { PrismaService } from '@plex-tinder/shared/clients/prisma';
import { User } from '@plex-tinder/auth/core';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: Session): Promise<void> {
    await this.prisma.gameSession.create({
      data: {
        id: session.id,
        code: session.code,
        hostId: session.hostId,
        status: session.status,
        movieIds: session.movieIds,
        createdAt: session.createdAt,
        updatedAt: new Date(),
        participants: {
          connect: session.participants.map((p) => ({ id: p.id })),
        },
      },
    });
  }

  async findById(id: string): Promise<Session | null> {
    const sessionModel = await this.prisma.gameSession.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!sessionModel) return null;

    return new Session(
      sessionModel.id,
      sessionModel.code,
      sessionModel.hostId,
      sessionModel.movieIds,
      sessionModel.status as SessionStatus,
      sessionModel.participants.map(
        (p) =>
          ({
            id: p.id,
            email: p.email,
            fullName: p.name ?? '',
            disabled: false,
            authorizations: [],
          } as User)
      ),
      sessionModel.createdAt
    );
  }

  async findByCode(code: string): Promise<Session | null> {
    const sessionModel = await this.prisma.gameSession.findUnique({
      where: { code },
      include: {
        participants: true,
      },
    });

    if (!sessionModel) return null;

    return new Session(
      sessionModel.id,
      sessionModel.code,
      sessionModel.hostId,
      sessionModel.movieIds,
      sessionModel.status as SessionStatus,
      sessionModel.participants.map(
        (p) =>
          ({
            id: p.id,
            email: p.email,
            fullName: p.name ?? '',
            disabled: false,
            authorizations: [],
          } as User)
      ),
      sessionModel.createdAt
    );
  }

  async update(session: Session): Promise<void> {
    await this.prisma.gameSession.update({
      where: { id: session.id },
      data: {
        status: session.status,
        participants: {
          set: session.participants.map((p) => ({ id: p.id })),
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.gameSession.delete({ where: { id } });
  }

  async addGameAction(sessionId: string, action: GameAction): Promise<void> {
    await this.prisma.gameAction.create({
      data: {
        sessionId,
        userId: action.userId,
        type: action.type,
        payload: JSON.stringify(action.payload),
      },
    });
  }

  async getGameActions(sessionId: string): Promise<GameAction[]> {
    const actions = await this.prisma.gameAction.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return actions.map(
      (a) =>
        new GameAction(
          a.userId,
          a.type as GameActionType,
          a.payload as Record<string, unknown>,
          a.createdAt
        )
    );
  }
}
