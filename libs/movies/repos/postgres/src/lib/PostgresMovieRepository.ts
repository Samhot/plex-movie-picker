import { Genre, PrismaClient } from '@prisma/client';

import {
  MediaCenterGenre,
  MediaCenterMovie,
} from '@plex-tinder/mediacenter/core';
import { IMovieRepository, Movie } from '@plex-tinder/movies/core';
import { notEmpty } from '@plex-tinder/shared/utils';
import { prismaMovieToDomainMapper } from './prismaMovieToDomainMapper';

export class PostgresMovieRepository implements IMovieRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async getAll(count: number): Promise<Movie[] | null> {
    const movies = await this.prisma.movie.findMany({
      include: { genres: true },
      take: count,
    });

    return movies ? movies.map(prismaMovieToDomainMapper) : null;
  }

  async getOne(guid: string): Promise<Movie | null> {
    const movie = await this.prisma.movie.findUnique({
      where: { guid },
      include: { genres: true },
    });

    return movie ? prismaMovieToDomainMapper(movie) : null;
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
            genres: {
              connect: await Promise.all(matchedGenres),
            },
          },
          update: {
            ...movie,
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

  findOrCreateGenre: (genreName: string) => Promise<{ id: number }>;
}
