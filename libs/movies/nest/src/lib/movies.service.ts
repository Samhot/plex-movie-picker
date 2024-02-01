import { Injectable } from '@nestjs/common';
import { CreateMovieInput, UpdateMovieInput } from './movie.input';
import { PrismaService } from '../../../../prisma/prisma.service';
import { notEmpty } from '@plex-tinder/utils';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMovieDto: CreateMovieInput) {
    const { genres, ...rest } = createMovieDto;
    const matchedGenres = genres.map((genre) => this.findOrCreateGenre(genre));

    return await this.prisma.movie.upsert({
      where: {
        guid: rest.guid,
      },
      create: {
        ...createMovieDto,
        genres: {
          connect: await Promise.all(matchedGenres),
        },
      },
      update: {
        ...createMovieDto,
        genres: {
          connect: await Promise.all(matchedGenres),
        },
      },
    });
  }

  async findGenre(genreId: string) {
    return await this.prisma.genre.findUnique({ where: { id: genreId } });
  }

  async findGenreByName(genreName: string) {
    return await this.prisma.genre.findFirst({ where: { name: genreName } });
  }

  async upsertGenre(genre: { id: string; name: string } | string) {
    return await this.prisma.genre.upsert({
      where: { id: typeof genre === 'string' ? genre : genre.id },
      create: { name: typeof genre === 'string' ? genre : genre.name },
      update: { name: typeof genre === 'string' ? genre : genre.name },
    });
  }

  async findOrCreateGenre(genreName: string) {
    const foundGenre = await this.findGenreByName(genreName);

    if (foundGenre) {
      return foundGenre;
    }

    return await this.upsertGenre(genreName);
  }

  findAll() {
    return this.prisma.movie.findMany({ take: 60 });
  }

  findOne(guid: string) {
    return this.prisma.movie.findUnique({ where: { guid } });
  }

  async update(guid: string, updateMovieInput: UpdateMovieInput) {
    const lala = updateMovieInput.tagline;
    const { genres, ...rest } = updateMovieInput;
    const matchedGenres = (
      await Promise.all(genres?.map((genre) => this.findGenre(genre)) ?? [])
    ).filter(notEmpty);

    return this.prisma.movie.update({
      where: { guid },
      data: {
        ...rest,
        genres: {
          connect: genres ? matchedGenres : undefined,
        },
      },
    });
  }

  remove(guid: string) {
    return this.prisma.movie.delete({ where: { guid } });
  }
}
