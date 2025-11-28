import { z } from 'zod';


const Genre = z.object({
  id: z.number().positive().int(),
  name: z.string().min(1),
});

export const MovieSchema = z.object({
  title: z.string().min(1),
  guid: z.string().cuid(),
  summary: z.string().optional(),
  slug: z.string().optional(),
  year: z.number().positive().int(),
  poster: z.string().min(1),
  tagline: z.string().optional(),
  duration: z.number().positive().int(),
  audienceRating: z.number().positive().int(),
  genres: z.array(Genre),
});

export const Movie = MovieSchema;
export type Movie = z.infer<typeof Movie>;
