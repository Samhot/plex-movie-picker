import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Movie } from './movie.model';
import { CreateMovieInput, UpdateMovieInput } from './movie.input';

@Controller('movies')
@ApiTags('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @ApiCreatedResponse({ type: Movie })
  create(@Body() createMovieDto: CreateMovieInput) {
    return this.moviesService.create(createMovieDto);
  }

  @Get()
  @ApiOkResponse({ type: Movie, isArray: true })
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':guid')
  @ApiOkResponse({ type: Movie })
  findOne(@Param('guid') guid: string) {
    return this.moviesService.findOne(guid);
  }

  @Patch(':guid')
  @ApiOkResponse({ type: Movie })
  update(
    @Param('guid') guid: string,
    @Body() updateMovieDto: UpdateMovieInput
  ) {
    return this.moviesService.update(guid, updateMovieDto);
  }

  @Delete(':guid')
  @ApiOkResponse({ type: Movie })
  remove(@Param('guid') guid: string) {
    return this.moviesService.remove(guid);
  }
}
