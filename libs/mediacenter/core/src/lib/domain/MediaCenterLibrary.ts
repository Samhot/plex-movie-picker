import { isCuidOrCustomFirebasePushId } from '@plex-tinder/shared/utils';
import { LibraryType } from '@prisma/client';
import { z } from 'zod';

export const MediaCenterLibrary = z.object({
  id: z.string().refine(isCuidOrCustomFirebasePushId),
  guid: z.string().refine(isCuidOrCustomFirebasePushId),
  type: z.enum([LibraryType.MOVIE, LibraryType.TV_SHOW]),
  title: z.string().min(1),
  key: z.string().min(1),
});

export type MediaCenterLibrary = z.infer<typeof MediaCenterLibrary>;
