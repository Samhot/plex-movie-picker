import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
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
  GameSession,
} from '@plex-tinder/game-session/core';

// DTOs
class CreateGameSessionInput {
  movieIds?: string[];
  filters?: {
    duration?: number;
    minRating?: number;
    fromYear?: number;
    limit?: number;
  };
}

class JoinGameSessionInput {
  code: string;
}

class SwipeInput {
  movieId: string;
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
    private readonly processSwipeUseCase: ProcessSwipeUseCase
  ) {}

  @UseGuards(BetterAuthGuard)
  @Post()
  @ApiOkResponse({ type: GameSession })
  async create(
    @CurrentUser() user: BetterAuthUser,
    @Body(new ValidationPipe()) input: CreateGameSessionInput
  ) {
    const domainUser = betterAuthUserToDomainUser(user);
    const result = await this.createGameSessionUseCase.execute({
      host: domainUser,
      movieIds: input.movieIds || [],
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

