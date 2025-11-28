import { PrismaClient, MediaSource as PrismaMediaSource } from '@prisma/client';
import {
  IMediaSourceRepository,
  CreateMediaSource,
  MediaSource,
} from '@plex-tinder/secret/core';
import { prismaMediaSourceToDomainMapper } from './prismaMediaSourceToDomainMapper';

export class PrismaMediaSourceRepository implements IMediaSourceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getMediaSources(userId: string): Promise<MediaSource[]> {
    const sources = await this.prisma.mediaSource.findMany({
      where: { userId },
    });

    return sources.map(prismaMediaSourceToDomainMapper);
  }

  async saveMediaSource(mediaSource: CreateMediaSource): Promise<MediaSource> {
    // Strategie: Une seule source par type pour le moment pour simplifier la migration
    const existing = await this.prisma.mediaSource.findFirst({
        where: { 
            userId: mediaSource.userId,
            type: mediaSource.type
        }
    });

    let saved: PrismaMediaSource;

    if (existing) {
        saved = await this.prisma.mediaSource.update({
            where: { id: existing.id },
            data: {
                url: mediaSource.url,
                credentials: mediaSource.credentials as any,
                isActive: mediaSource.isActive ?? true,
            }
        });
    } else {
        saved = await this.prisma.mediaSource.create({
            data: {
                userId: mediaSource.userId,
                type: mediaSource.type,
                url: mediaSource.url,
                credentials: mediaSource.credentials as any,
                isActive: mediaSource.isActive ?? true,
            }
        });
    }

    return prismaMediaSourceToDomainMapper(saved);
  }
}

