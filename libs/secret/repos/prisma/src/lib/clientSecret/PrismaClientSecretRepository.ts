import { PrismaClient } from '@prisma/client';

import { ClientSecret, ClientSecretRepository } from '@plex-tinder/secret/core';

import { prismaClientSecretToDomainMapper } from './prismaClientSecretToDomainMapper';

export class PrismaClientSecretRepository implements ClientSecretRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getClientSecrets({ id }: { id: string }) {
    const testest = await this.prisma.clientSecret.findUnique({
      where: {
        id,
      },
    });
    if (!testest) return null;
    return prismaClientSecretToDomainMapper(testest);
  }

  async saveClientSecret(clientSecret: ClientSecret) {
    return prismaClientSecretToDomainMapper(
      await this.prisma.clientSecret.create({
        data: clientSecret,
      })
    );
  }
}
