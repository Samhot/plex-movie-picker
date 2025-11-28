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
  CreateSessionUseCase,
  JoinSessionUseCase,
  ProcessSwipeUseCase,
  Session,
} from '@plex-tinder/session/core';

// DTOs
class CreateSessionInput {
  movieIds?: string[];
  filters?: {
    duration?: number;
    minRating?: number;
    fromYear?: number;
    limit?: number;
  };
}

class JoinSessionInput {
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

@Controller('sessions')
@ApiTags('sessions')
export class SessionController {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly joinSessionUseCase: JoinSessionUseCase,
    private readonly processSwipeUseCase: ProcessSwipeUseCase
  ) {}

  @UseGuards(BetterAuthGuard)
  @Post()
  @ApiOkResponse({ type: Session })
  async create(
    @CurrentUser() user: BetterAuthUser,
    @Body(new ValidationPipe()) input: CreateSessionInput
  ) {
    const domainUser = betterAuthUserToDomainUser(user);
    const result = await this.createSessionUseCase.execute({
      host: domainUser,
      movieIds: input.movieIds || [],
    });

    return result.success.session;
  }

  @UseGuards(BetterAuthGuard)
  @Post('join')
  @ApiOkResponse({ type: Session })
  async join(
    @CurrentUser() user: BetterAuthUser,
    @Body(new ValidationPipe()) input: JoinSessionInput
  ) {
    const domainUser = betterAuthUserToDomainUser(user);
    return await this.joinSessionUseCase.execute({
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
