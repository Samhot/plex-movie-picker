import { z } from 'zod';
import { MediaCenter } from '@prisma/client';

// Définition des credentials spécifiques à Plex
export const PlexCredentialsSchema = z.object({
  plexToken: z.string(),
  movieSectionId: z.number().optional(),
});

// Union de tous les types de credentials possibles (pour l'instant seulement Plex)
// On utilise z.unknown() pour la base de données mais on peut valider plus finement
export const MediaSourceCredentialsSchema = z.union([
  PlexCredentialsSchema,
  z.record(z.unknown()), // Fallback pour autres types ou migration
]);

export const MediaSource = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  type: z.nativeEnum(MediaCenter),
  url: z.string(),
  credentials: MediaSourceCredentialsSchema,
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MediaSource = z.infer<typeof MediaSource>;
export type PlexCredentials = z.infer<typeof PlexCredentialsSchema>;

