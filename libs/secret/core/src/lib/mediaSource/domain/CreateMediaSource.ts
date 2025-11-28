import { z } from 'zod';
import { MediaSource } from './MediaSource';

export const CreateMediaSource = MediaSource.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
}).extend({
  isActive: z.boolean().optional(),
});

export type CreateMediaSource = z.infer<typeof CreateMediaSource>;

