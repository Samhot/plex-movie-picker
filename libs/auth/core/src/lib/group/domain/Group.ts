import { z } from 'zod';

import { isCuidOrMultipleFirebasePushId } from '@plex-tinder/shared/utils';

export const Group = z.object({
  id: z.string().refine(isCuidOrMultipleFirebasePushId(1, { separator: '&' })),
  name: z.string(),
  parks: z.set(z.string().refine(isCuidOrMultipleFirebasePushId(1))),
  buildings: z.set(z.string().refine(isCuidOrMultipleFirebasePushId(2))),
  allParks: z.set(z.string().refine(isCuidOrMultipleFirebasePushId(1))),
  allBuildings: z.set(z.string().refine(isCuidOrMultipleFirebasePushId(2))),
  users: z
    .record(
      z.object({
        restrictedRessources: z
          .object({
            parks: z.record(z.boolean().optional()).optional(),
            buildings: z
              .record(z.record(z.literal(true).optional()))
              .optional(),
          })
          .optional(),
        role: z.string(),
      })
    )
    .optional(),
  roles: z.array(
    z.object({
      id: z.string().refine(isCuidOrMultipleFirebasePushId(1)),
      authorizations: z.record(z.boolean()),
      name: z.string(),
    })
  ),
});

export type Group = z.infer<typeof Group>;
