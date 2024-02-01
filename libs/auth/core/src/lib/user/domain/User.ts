import { z } from 'zod';

import { isCuidOrMultipleFirebasePushId } from '@plex-tinder/shared/utils';

import { ElementaryUser } from './ElementaryUser';

const UserAuthorization = z.object({
  parkId: z.string().refine(isCuidOrMultipleFirebasePushId(1)),
  buildingsIds: z
    .array(z.string().refine(isCuidOrMultipleFirebasePushId(2)))
    .optional(),
  policies: z.array(z.string()),
});

export const User = ElementaryUser.extend({
  authorizations: z.array(UserAuthorization),
});

export type User = z.infer<typeof User>;
