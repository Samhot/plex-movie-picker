import { Movie } from '@plex-tinder/movies/core';
import { Genre, Movie as PrismaMovie } from '@prisma/client';

export const prismaMovieToDomainMapper = (
  movie: PrismaMovie & { genres: Genre[] }
): Movie => {
  return {
    ...movie,
    summary: movie.summary ?? undefined,
    slug: movie.slug ?? undefined,
    tagline: movie.tagline ?? undefined,
  };
};
