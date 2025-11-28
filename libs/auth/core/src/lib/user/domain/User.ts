import { z } from 'zod';

import { ElementaryUser } from './ElementaryUser';

const UserAuthorization = z.object({
  policies: z.array(z.string()),
});

export const User = ElementaryUser.extend({
  authorizations: z.array(UserAuthorization).optional().default([]),
});

export type User = z.infer<typeof User>;
