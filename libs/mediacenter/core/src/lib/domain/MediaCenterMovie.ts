import { isCuidOrCustomFirebasePushId } from '@plex-tinder/shared/utils';
import { z } from 'zod';

export const Genre = z.object({
  id: z.number().positive().int(),
  name: z.string().min(1),
});

export const MediaCenterMovie = z.object({
  title: z.string().min(1),
  guid: z.string().refine(isCuidOrCustomFirebasePushId),
  summary: z.string().optional(),
  slug: z.string().optional(),
  year: z.number().positive().int(),
  poster: z.string().min(1),
  tagline: z.string().optional(),
  duration: z.number().positive().int(),
  audienceRating: z.number().positive().int(),
  genres: z.array(z.string()),
});

export type MediaCenterMovie = z.infer<typeof MediaCenterMovie>;
export type MediaCenterGenre = z.infer<typeof Genre>;
