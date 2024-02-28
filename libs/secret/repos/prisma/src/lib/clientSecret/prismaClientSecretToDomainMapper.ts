import { ClientSecret } from '@plex-tinder/secret/core';
import {
  MediaCenter,
  ClientSecret as PrismaClientSecret,
} from '@prisma/client';

export const prismaClientSecretToDomainMapper = (
  prismaClientSecret: PrismaClientSecret
) => {
  const commonFields = {
    id: prismaClientSecret.id,
    userId: prismaClientSecret.userId,
    createdAt: prismaClientSecret.createdAt,
    updatedAt: prismaClientSecret.updatedAt,
    secret: prismaClientSecret.secret,
  };

  switch (prismaClientSecret.mediacenter) {
    case MediaCenter.PLEX:
      return ClientSecret.parse({
        ...commonFields,
        mediacenter: MediaCenter.PLEX,
        plexUrl: prismaClientSecret.plexUrl,
        plexToken: prismaClientSecret.plexToken,
        movieSectionId: prismaClientSecret.movieSectionId ?? undefined,
      } satisfies ClientSecret);

    default:
      throw new Error(
        `Unknown client provider: ${prismaClientSecret.mediacenter}`
      );
  }
};
