import { z } from 'zod';

import { ClientSecret } from './ClientSecret';
import { MediaCenter } from '@prisma/client';

export const CreateClientSecret = ClientSecret.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  secret: z.string(),
  mediacenter: z.enum([MediaCenter.PLEX]),
  plexUrl: z.string(),
  plexToken: z.string(),
  movieSectionId: z.number(),
});

export type CreateClientSecret = z.infer<typeof CreateClientSecret>;
