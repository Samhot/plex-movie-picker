import { z } from 'zod';

import { isCuid } from '@plex-tinder/shared/utils';
import { MediaCenter } from '@prisma/client';

export const ClientSecret = z.object({
  id: z.string().refine(isCuid),
  userId: z.string().refine(isCuid),
  secret: z.string(),
  mediacenter: z.enum([MediaCenter.PLEX]),
  plexUrl: z.string(),
  plexToken: z.string(),
  movieSectionId: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ClientSecret = z.infer<typeof ClientSecret>;
