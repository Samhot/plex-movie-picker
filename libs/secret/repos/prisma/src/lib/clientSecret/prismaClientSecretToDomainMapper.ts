import {
  MediaCenter,
  ClientSecret as PrismaClientSecret,
} from '@prisma/client';

import { ClientSecret } from '@plex-tinder/secret/core';

export const prismaClientSecretToDomainMapper = (
  prismaClientSecret: PrismaClientSecret
) => {
  const commonFields = {
    id: prismaClientSecret.id,
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
        movieSectionId: prismaClientSecret.movieSectionId,
      } satisfies ClientSecret);

    default:
      throw new Error(
        `Unknown client provider: ${prismaClientSecret.mediacenter}`
      );
  }
};
