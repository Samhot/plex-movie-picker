import { z } from 'zod';

import { isCuidOrCustomFirebasePushId } from '@plex-tinder/shared/utils';

export const MovieSchema = z.object({
  title: z.string().min(1),
  guid: z.string().refine(isCuidOrCustomFirebasePushId),
  summary: z.string().optional(),
  slug: z.string().min(1),
  year: z.number().positive().int(),
  thumb: z.string().min(1),
  tagline: z.string().min(1),
  duration: z.number().positive().int(),
  audienceRating: z.number().positive().int(),
  genres: z.array(z.string().min(1)),
});

export const Movie = MovieSchema;
export type Movie = z.infer<typeof Movie>;
