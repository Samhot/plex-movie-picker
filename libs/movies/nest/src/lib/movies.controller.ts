import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MoviesCategory } from '@plex-tinder/mediacenter/repos/plex';
import {
  FetchGenresUseCase,
  FetchMoviesUseCase,
  GetAllMoviesUseCase,
  GetMovieByIdUseCase,
  GetMoviesFromCriteriasUseCase,
} from '@plex-tinder/movies/core';
import { Authorization } from '@plex-tinder/shared/nest';
import { Movie } from './movie.model';
import { MoviesService } from './movies.service';
// import { User } from '@plex-tinder/auth/core';

// @UseGuards(AuthorizationGuard)
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
  findAll() {
    return this.moviesService.findAll();
  }

  @Authorization(GetMoviesFromCriteriasUseCase.authorization)
  @Get('search')
  @ApiOkResponse({ type: Movie, isArray: true })
  findFromCriterias(
    @Query('count') count?: number,
    @Query('watched') watched?: boolean,
    @Query('duration') duration?: number,
    @Query('audienceRating') audienceRating?: number,
    @Query('maxAge') maxAge?: number
  ) {
    return this.moviesService.getMoviesFromCriterias(
      count,
      watched,
      duration,
      audienceRating,
      maxAge
    );
  }

  @Authorization(FetchGenresUseCase.authorization)
  @Get('fetch/genres/:userId')
  @ApiOkResponse({ status: 200 })
  fetchGenres(@Param('userId') userId: string) {
    return this.moviesService.fetchGenres(userId);
  }

  @Authorization(FetchMoviesUseCase.authorization)
  @Get('fetch/movies/:userId/:category')
  @ApiOkResponse({ status: 200 })
  fetchMovies(
    @Param('userId') userId: string,
    @Param('category') category: MoviesCategory = MoviesCategory.ALL
  ) {
    return this.moviesService.fetchMovies({ userId, category });
  }

  @Authorization(GetMovieByIdUseCase.authorization)
  @Get(':guid')
  @ApiOkResponse({ type: Movie })
  findOne(
    // @CurrentUser() user: User,
    @Param('guid') guid: string
  ) {
    return this.moviesService.getMovie(
      guid
      // , user
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
