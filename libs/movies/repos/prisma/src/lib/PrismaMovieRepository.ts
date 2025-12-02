import { Genre } from '@prisma/client';

import {
  MediaCenterGenre,
  MediaCenterLibrary,
  MediaCenterMovie,
} from '@plex-tinder/mediacenter/core';
import {
  IMovieRepository,
  Movie,
  SearchCriteria,
  Library,
} from '@plex-tinder/movies/core';
import { notEmpty } from '@plex-tinder/shared/utils';
import { prismaMovieToDomainMapper } from './prismaMovieToDomainMapper';
import { prismaLibraryToDomainMapper } from './prismaLibraryToDomainMapper';
import { PrismaService } from '@plex-tinder/shared/clients/prisma';

export class PrismaMovieRepository implements IMovieRepository {
  constructor(private readonly prisma: PrismaService) {}
  async getAllMovies(count: number): Promise<Movie[] | null> {
    const movies = await this.prisma.movie.findMany({
      include: { genres: true },
      take: count,
    });

    return movies ? movies.map(prismaMovieToDomainMapper) : null;
  }

  async getOneMovie(guid: string): Promise<Movie | null> {
    const movie = await this.prisma.movie.findUnique({
      where: { guid },
      include: { genres: true },
    });

    return movie ? prismaMovieToDomainMapper(movie) : null;
  }

  async getMoviesFromCriterias(
    criterias?: SearchCriteria,
    count?: number
  ): Promise<Movie[] | null> {
    const movies = await this.prisma.movie.findMany({
      include: { genres: true },
      where: {
        viewCount:
          criterias?.watched === true
            ? { gt: 0 }
            : criterias?.watched === false
            ? { equals: 0 }
            : undefined,
        duration: criterias?.duration ?? undefined,
        year: criterias?.maxAge
          ? { gte: new Date().getFullYear() - criterias.maxAge }
          : undefined,
        audienceRating: criterias?.audienceRating
          ? { gte: criterias.audienceRating }
          : undefined,
      },
      take: count === 0 ? undefined : count,
    });

    return movies ? movies.map(prismaMovieToDomainMapper) : null;
  }

  private async findGenre(genreName: string): Promise<Genre | null> {
    const foundGenre = await this.prisma.genre.findFirst({
      where: { name: genreName },
    });

    return foundGenre;
  }

  async createManyGenres(
    genres: MediaCenterGenre[]
  ): Promise<{ id: number }[]> {
    return Promise.all(
      genres.map(async (genre) => {
        return await this.prisma.genre.upsert({
          where: { id: genre.id },
          create: { name: genre.name, id: genre.id },
          update: { name: genre.name, id: genre.id },
        });
      })
    );
  }

  async createManyMovies(movies: MediaCenterMovie[]): Promise<Movie[] | null> {
    const existingLibraries = await this.prisma.library.findMany();
    const savedMovies: (ReturnType<typeof prismaMovieToDomainMapper>)[] = [];
    const skippedMovies: string[] = [];
    
    for (const movie of movies) {
      try {
        // Validation des champs obligatoires
        if (!movie.year || isNaN(movie.year) || movie.year <= 0) {
          skippedMovies.push(`"${movie.title}" (missing/invalid year)`);
          continue;
        }
        
        if (!movie.guid || !movie.title) {
          skippedMovies.push(`"${movie.title || 'Unknown'}" (missing guid or title)`);
          continue;
        }

        // Extraire les champs qui ne correspondent pas au schéma Prisma
        const { genres, libraryId, ...movieData } = movie;
        
        // Nettoyer les valeurs "undefined" string
        const cleanedMovieData = {
          ...movieData,
          slug: movieData.slug === 'undefined' ? null : movieData.slug,
          tagline: movieData.tagline === 'undefined' ? null : movieData.tagline,
          summary: movieData.summary === 'undefined' ? null : movieData.summary,
        };
        
        // Trouver les genres correspondants dans la DB
        const matchedGenres = (
          await Promise.all(genres?.map((genre) => this.findGenre(genre)) ?? [])
        ).filter(notEmpty);

        // Trouver la bibliothèque correspondante
        const matchedLibrary = existingLibraries.find(
          (l) => l.key === String(libraryId)
        );

        const saved = await this.prisma.movie.upsert({
          where: {
            guid: cleanedMovieData.guid,
          },
          create: {
            ...cleanedMovieData,
            ...(matchedLibrary && {
              libraries: {
                connect: { guid: matchedLibrary.guid },
              },
            }),
            ...(matchedGenres.length > 0 && {
              genres: {
                connect: matchedGenres.map((g) => ({ id: g.id })),
              },
            }),
          },
          update: {
            ...cleanedMovieData,
            ...(matchedLibrary && {
              libraries: {
                connect: { guid: matchedLibrary.guid },
              },
            }),
            ...(matchedGenres.length > 0 && {
              genres: {
                set: matchedGenres.map((g) => ({ id: g.id })),
              },
            }),
          },
          include: { genres: true },
        });
        
        savedMovies.push(prismaMovieToDomainMapper(saved));
      } catch (error) {
        console.error(`Error saving movie "${movie.title}" (${movie.guid}):`, error);
        skippedMovies.push(`"${movie.title}" (${(error as Error).message})`);
        // Continue instead of throwing - don't let one bad movie break the whole import
      }
    }

    if (skippedMovies.length > 0) {
      console.warn(`Skipped ${skippedMovies.length} movies:`, skippedMovies);
    }
    
    console.log(`Successfully saved ${savedMovies.length} movies`);

    return savedMovies;
  }

  async getLibraries(userId: string): Promise<Library[] | null> {
    const libraries = await this.prisma.library.findMany({
      where: { userId },
      include: { movies: { include: { genres: true } } },
    });

    return libraries ? libraries.map(prismaLibraryToDomainMapper) : null;
  }

  async createManyLibraries(
    userId: string,
    libraries: MediaCenterLibrary[]
  ): Promise<Library[] | null> {
    const savedLibraries = await Promise.all(
      libraries.map(async (library) => {
        return await this.prisma.library.upsert({
          where: {
            guid: library.guid,
          },
          include: { movies: { include: { genres: true } } },
          create: { ...library, userId },
          update: { ...library, userId },
        });
      })
    );
    return savedLibraries.map(prismaLibraryToDomainMapper);
  }
}

