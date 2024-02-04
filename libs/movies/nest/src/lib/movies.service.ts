import { Injectable } from '@nestjs/common';
// import { User } from '@plex-tinder/auth/core';
import {
  FetchMoviesUseCase,
  GetAllMoviesUseCase,
  GetMovieByIdUseCase,
} from '@plex-tinder/movies/core';

@Injectable()
export class MoviesService {
  constructor(
    // private readonly prisma: PrismaService,
    private readonly getMovieByIdUseCase: GetMovieByIdUseCase,
    private readonly getAllMoviesUseCase: GetAllMoviesUseCase,
    private readonly fetchMoviesUseCase: FetchMoviesUseCase
  ) {}

  // async create(createMovieDto: CreateMovieInput) {
  //   const { genres, ...rest } = createMovieDto;
  //   const matchedGenres = genres.map((genre) => this.findOrCreateGenre(genre));

  //   return await this.prisma.movie.upsert({
  //     where: {
  //       guid: rest.guid,
  //     },
  //     create: {
  //       ...createMovieDto,
  //       genres: {
  //         connect: await Promise.all(matchedGenres),
  //       },
  //     },
  //     update: {
  //       ...createMovieDto,
  //       genres: {
  //         connect: await Promise.all(matchedGenres),
  //       },
  //     },
  //   });
  // }

  // async findGenre(genreId: string) {
  //   return await this.prisma.genre.findUnique({ where: { id: genreId } });
  // }

  // async findGenreByName(genreName: string) {
  //   return await this.prisma.genre.findFirst({ where: { name: genreName } });
  // }

  // async upsertGenre(genre: { id: string; name: string } | string) {
  //   return await this.prisma.genre.upsert({
  //     where: { id: typeof genre === 'string' ? genre : genre.id },
  //     create: { name: typeof genre === 'string' ? genre : genre.name },
  //     update: { name: typeof genre === 'string' ? genre : genre.name },
  //   });
  // }

  // async findOrCreateGenre(genreName: string) {
  //   const foundGenre = await this.findGenreByName(genreName);

  //   if (foundGenre) {
  //     return foundGenre;
  //   }

  //   return await this.upsertGenre(genreName);
  // }

  async findAll(count = 10) {
    return await this.getAllMoviesUseCase.execute({
      // , user
      count,
    });
  }

  async getMovie(
    id: string
    // , user: User
  ) {
    return await this.getMovieByIdUseCase.execute({
      id,
      // , user
    });
  }

  async fetchMovies() {
    return await this.fetchMoviesUseCase.execute({});
  }

  // async update(guid: string, updateMovieInput: UpdateMovieInput) {
  //   const { genres, ...rest } = updateMovieInput;
  //   const matchedGenres = (
  //     await Promise.all(genres?.map((genre) => this.findGenre(genre)) ?? [])
  //   ).filter(notEmpty);

  //   return this.prisma.movie.update({
  //     where: { guid },
  //     data: {
  //       ...rest,
  //       genres: {
  //         connect: genres ? matchedGenres : undefined,
  //       },
  //     },
  //   });
  // }

  // remove(guid: string) {
  //   return this.prisma.movie.delete({ where: { guid } });
  // }
}
