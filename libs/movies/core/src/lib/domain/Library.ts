import { z } from 'zod';

import { LibraryType } from '@prisma/client';
import { Movie } from './Movie';

export const LibrarySchema = z.object({
  title: z.string().min(1),
  guid: z.string().cuid(),
  userId: z.string().min(1),
  type: z.enum([LibraryType.MOVIE, LibraryType.TV_SHOW]),
  key: z.string().min(1),
  movies: z.array(Movie),
});

export const Library = LibrarySchema;
export type Library = z.infer<typeof Library>;
