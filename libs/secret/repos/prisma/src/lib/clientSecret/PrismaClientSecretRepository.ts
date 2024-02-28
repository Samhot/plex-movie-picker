import {
  IClientSecretRepository,
  CreateClientSecret,
} from '@plex-tinder/secret/core';
import { PrismaClient } from '@prisma/client';
import { prismaClientSecretToDomainMapper } from './prismaClientSecretToDomainMapper';

export class PrismaClientSecretRepository implements IClientSecretRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getClientSecrets(userId: string) {
    if (userId) {
      const secrets = await this.prisma.clientSecret.findUnique({
        where: {
          userId: userId,
        },
      });
      if (!secrets) return null;
      return prismaClientSecretToDomainMapper(secrets);
    } else {
      return null;
    }
  }

  async saveClientSecret(clientSecret: CreateClientSecret) {
    return prismaClientSecretToDomainMapper(
      await this.prisma.clientSecret.upsert({
        where: { userId: clientSecret.userId },
        create: clientSecret,
        update: clientSecret,
      })
    );
  }
}
