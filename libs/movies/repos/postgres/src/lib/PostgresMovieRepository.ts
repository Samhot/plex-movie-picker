import { PrismaClient } from '@prisma/client';

import { IMovieRepository } from '@plex-tinder/movies/core';
import { prismaMovieToDomainMapper } from './prismaRegulatoryReportToDomainMapper';

export class PostgresMovieRepository implements IMovieRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getOne(guid: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { guid },
      include: { genres: true },
    });

    return movie ? prismaMovieToDomainMapper(movie) : null;
  }
}
