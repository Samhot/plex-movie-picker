import { z } from 'zod';

import { ClientSecret } from './ClientSecret';
import { CreateClientSecret } from './CreateClientSecret';

export const PlexClientSecret = ClientSecret.extend({
  metadata: z.object({
    email: z.string().email(),
    contractId: z.string().min(1),
  }),
});

export const CreatePlexClientSecret = CreateClientSecret.extend({
  metadata: PlexClientSecret.shape.metadata,
});

export type PlexClientSecret = z.infer<typeof PlexClientSecret>;
export type CreatePlexClientSecret = z.infer<typeof CreatePlexClientSecret>;
