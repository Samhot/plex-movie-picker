import { Library } from '@plex-tinder/movies/core';
import { Genre, Movie, Library as PrismaLibrary } from '@prisma/client';
import { prismaMovieToDomainMapper } from './prismaMovieToDomainMapper';

export const prismaLibraryToDomainMapper = (
  library: PrismaLibrary & { movies: ({ genres: Genre[] } & Movie)[] }
): Library => {
  return {
    ...library,
    movies: library.movies.map((m) => prismaMovieToDomainMapper(m)),
  };
};
