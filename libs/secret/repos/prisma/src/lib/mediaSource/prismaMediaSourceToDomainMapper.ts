import { MediaSource as PrismaMediaSource, MediaCenter } from '@prisma/client';
import { MediaSource, PlexCredentialsSchema } from '@plex-tinder/secret/core';

export const prismaMediaSourceToDomainMapper = (
  prismaSource: PrismaMediaSource
): MediaSource => {
  let credentials;
  
  if (prismaSource.type === MediaCenter.PLEX) {
      // On tente de parser comme des credentials Plex
      // prismaSource.credentials est JsonValue (null, string, number, boolean, object, array)
      // Zod parse accepte unknown
      const parsed = PlexCredentialsSchema.safeParse(prismaSource.credentials);
      if (parsed.success) {
          credentials = parsed.data;
      } else {
          console.error('Invalid Plex credentials in DB', parsed.error);
          credentials = {}; // Ou throw error
      }
  } else {
      credentials = prismaSource.credentials as Record<string, unknown>;
  }

  return {
    id: prismaSource.id,
    userId: prismaSource.userId,
    type: prismaSource.type,
    url: prismaSource.url,
    credentials,
    isActive: prismaSource.isActive,
    createdAt: prismaSource.createdAt,
    updatedAt: prismaSource.updatedAt,
  };
};

