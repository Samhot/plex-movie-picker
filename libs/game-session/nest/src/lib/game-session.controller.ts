import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { 
  BetterAuthGuard, 
  CurrentUser, 
  BetterAuthUser, 
  betterAuthUserToDomainUser 
} from '@plex-tinder/auth/nest';
import {
  CreateGameSessionUseCase,
  JoinGameSessionUseCase,
  ProcessSwipeUseCase,
  GenerateDeckUseCase,
  GameSession,
} from '@plex-tinder/game-session/core';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTOs
class CreateGameSessionFilters {
  @ApiProperty({ description: 'Max duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ description: 'Minimum rating (e.g. 7.0)', required: false })
  @IsOptional()
  @IsNumber()
  minRating?: number;

  @ApiProperty({ description: 'Movies released after this year', required: false })
  @IsOptional()
  @IsNumber()
  fromYear?: number;

  @ApiProperty({ description: 'Number of movies in the deck (default 20)', required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ description: 'Filter by genre IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  genreIds?: number[];
}

class CreateGameSessionInput {
  @ApiProperty({ description: 'List of movie IDs (GUIDs) - optional if filters provided', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  movieIds?: string[];

  @ApiProperty({ description: 'Filters to auto-generate the movie deck', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateGameSessionFilters)
  filters?: CreateGameSessionFilters;
}

class JoinGameSessionInput {
  @ApiProperty({ description: 'Session code to join (e.g. ABCD)' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

class SwipeInput {
  @ApiProperty({ description: 'Movie ID to swipe on' })
  @IsString()
  @IsNotEmpty()
  movieId: string;

  @ApiProperty({ description: 'true = like, false = dislike' })
  @IsBoolean()
  liked: boolean;
}

class SwipeResponse {
  isMatch: boolean;
  matchedMovieId?: string;
}

@Controller('game-sessions')
@ApiTags('game-sessions')
export class GameSessionController {
  constructor(
    private readonly createGameSessionUseCase: CreateGameSessionUseCase,
    private readonly joinGameSessionUseCase: JoinGameSessionUseCase,
    private readonly processSwipeUseCase: ProcessSwipeUseCase,
    private readonly generateDeckUseCase: GenerateDeckUseCase
  ) {}

  @UseGuards(BetterAuthGuard)
  @Post()
  @ApiOkResponse({ type: GameSession })
  async create(
    @CurrentUser() user: BetterAuthUser,
    @Body(new ValidationPipe({ transform: true })) input: CreateGameSessionInput
  ) {
    const domainUser = betterAuthUserToDomainUser(user);
    
    let movieIds = input.movieIds || [];

    // Si des filtres sont fournis et pas de movieIds, générer le deck automatiquement
    if (input.filters && movieIds.length === 0) {
      const deckResult = await this.generateDeckUseCase.execute({
        userId: domainUser.id,
        duration: input.filters.duration,
        minRating: input.filters.minRating,
        fromYear: input.filters.fromYear,
        genreIds: input.filters.genreIds,
        limit: input.filters.limit || 20,
      });

      if (deckResult.error) {
        throw new Error(`Failed to generate deck: ${deckResult.error.message}`);
      }

      movieIds = deckResult.success?.movieIds || [];
    }

    if (movieIds.length === 0) {
      throw new Error('No movies provided. Either provide movieIds or filters to generate a deck.');
    }

    const result = await this.createGameSessionUseCase.execute({
      host: domainUser,
      movieIds,
    });

    return result.success.session;
  }

  @UseGuards(BetterAuthGuard)
  @Post('join')
  @ApiOkResponse({ type: GameSession })
  async join(
    @CurrentUser() user: BetterAuthUser,
    @Body(new ValidationPipe()) input: JoinGameSessionInput
  ) {
    const domainUser = betterAuthUserToDomainUser(user);
    return await this.joinGameSessionUseCase.execute({
      code: input.code.toUpperCase(),
      user: domainUser,
    });
  }

  @UseGuards(BetterAuthGuard)
  @Post(':id/swipe')
  @ApiOkResponse({ type: SwipeResponse })
  async swipe(
    @CurrentUser() user: BetterAuthUser,
    @Param('id') sessionId: string,
    @Body(new ValidationPipe()) input: SwipeInput
  ) {
    const domainUser = betterAuthUserToDomainUser(user);
    return await this.processSwipeUseCase.execute({
      sessionId,
      userId: domainUser.id,
      movieId: input.movieId,
      liked: input.liked,
    });
  }
}

