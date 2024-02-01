import { z } from 'zod';

import { isCuidOrMultipleFirebasePushId } from '@plex-tinder/shared/utils';

export const ElementaryUser = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(1),
  disabled: z.boolean().default(false),
  selectedPark: z.string().refine(isCuidOrMultipleFirebasePushId(1)).optional(),
});

export type ElementaryUser = z.infer<typeof ElementaryUser>;
