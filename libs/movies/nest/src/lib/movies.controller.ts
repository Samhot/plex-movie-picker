import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@plex-tinder/auth/core';
import { BetterAuthGuard, CurrentUser } from '@plex-tinder/auth/nest';
import {
  FetchGenresUseCase,
  FetchMoviesUseCase,
  GetAllMoviesUseCase,
  GetMovieByIdUseCase,
  GetMoviesFromCriteriasUseCase,
  SyncLibrariesUseCase,
} from '@plex-tinder/movies/core';
import { Authorization } from '@plex-tinder/shared/nest';
import { Movie } from './movie.model';
import { MoviesService } from './movies.service';
import { MoviesCategory } from '@plex-tinder/mediacenter/core';

@UseGuards(BetterAuthGuard)
@Controller('movies')
@ApiTags('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // @Authorization(GetMovieByIdUseCase.authorization)
  // @Post()
  // @ApiCreatedResponse({ type: Movie })
  // create(@Body() createMovieDto: CreateMovieInput) {
  //   return this.moviesService.create(createMovieDto);
  // }

  @Authorization(GetAllMoviesUseCase.authorization)
  @Get()
  @ApiOkResponse({ type: Movie, isArray: true })
  findAll(
    @CurrentUser() user: User,
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number
  ) {
    return this.moviesService.findAll(user.id, count);
  }

  @Authorization(GetMoviesFromCriteriasUseCase.authorization)
  @Get('search')
  @ApiOkResponse({ type: Movie, isArray: true })
  findFromCriterias(
    @CurrentUser() user: User,
    @Query('count') count?: number,
    @Query('watched') watched?: boolean,
    @Query('duration') duration?: number,
    @Query('audienceRating') audienceRating?: number,
    @Query('maxAge') maxAge?: number
  ) {
    return this.moviesService.getMoviesFromCriterias(
      user.id,
      count,
      watched,
      duration,
      audienceRating,
      maxAge
    );
  }

  @Authorization(FetchGenresUseCase.authorization)
  @Get('fetch/genres')
  @ApiOkResponse({ status: 200 })
  fetchGenres(@CurrentUser() user: User) {
    return this.moviesService.fetchGenres(user.id);
  }

  @Authorization(FetchMoviesUseCase.authorization)
  @Get('fetch/movies/:category')
  @ApiOkResponse({ status: 200 })
  fetchMovies(
    @CurrentUser() user: User,
    @Param('category') category: MoviesCategory = MoviesCategory.ALL
  ) {
    return this.moviesService.fetchMovies({ userId: user.id, category });
  }

  @Authorization(SyncLibrariesUseCase.authorization)
  @Get('sync/libraries')
  @ApiOkResponse({ status: 200 })
  syncLibraries(@CurrentUser() user: User) {
    return this.moviesService.syncLibraries(user.id);
  }

  @Authorization(GetMovieByIdUseCase.authorization)
  @Get(':guid')
  @ApiOkResponse({ type: Movie })
  findOne(
    @CurrentUser() user: User,
    @Param('guid') guid: string
  ) {
    return this.moviesService.getMovie(
      guid,
      user.id
    );
  }

  // @Patch(':guid')
  // @ApiOkResponse({ type: Movie })
  // update(
  //   @Param('guid') guid: string,
  //   @Body() updateMovieDto: UpdateMovieInput
  // ) {
  //   return this.moviesService.update(guid, updateMovieDto);
  // }

  // @Delete(':guid')
  // @ApiOkResponse({ type: Movie })
  // remove(@Param('guid') guid: string) {
  //   return this.moviesService.remove(guid);
  // }
}
