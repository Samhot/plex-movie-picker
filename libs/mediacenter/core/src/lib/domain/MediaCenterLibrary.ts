import { LibraryType } from '@prisma/client';
import { z } from 'zod';

export const MediaCenterLibrary = z.object({
  id: z.string().cuid(),
  guid: z.string().cuid(),
  type: z.enum([LibraryType.MOVIE, LibraryType.TV_SHOW]),
  title: z.string().min(1),
  key: z.string().min(1),
});

export type MediaCenterLibrary = z.infer<typeof MediaCenterLibrary>;
