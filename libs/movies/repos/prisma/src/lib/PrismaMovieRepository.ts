import { Genre, PrismaClient, Library as PrismaLibrary } from '@prisma/client';

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

export class PrismaMovieRepository implements IMovieRepository {
  constructor(private readonly prisma: PrismaClient) {}
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
    const savedMovies = await Promise.all(
      movies.map(async (movie) => {
        const { genres, ...rest } = movie;
        const matchedGenres = (
          await Promise.all(genres?.map((genre) => this.findGenre(genre)) ?? [])
        ).filter(notEmpty);

        return await this.prisma.movie.upsert({
          where: {
            guid: rest.guid,
          },
          create: {
            ...movie,
            libraries: {
              connect: {
                guid: existingLibraries.find(
                  (l) => l.key === String(movie.libraryId)
                )?.guid,
              },
            },
            genres: {
              connect: await Promise.all(matchedGenres),
            },
          },
          update: {
            ...movie,
            libraries: {
              connect: {
                guid: existingLibraries.find(
                  (l) => l.key === String(movie.libraryId)
                )?.guid,
              },
            },
            genres: {
              connect: await Promise.all(matchedGenres),
            },
          },
          include: { genres: true },
        });
      })
    );

    return savedMovies.map(prismaMovieToDomainMapper);
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
