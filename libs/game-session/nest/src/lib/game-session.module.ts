import { Module } from '@nestjs/common';
import {
  CreateGameSessionUseCase,
  GenerateDeckUseCase,
  IGameSessionRepository,
  IGameSessionNotifier,
  JoinGameSessionUseCase,
  ProcessSwipeUseCase,
} from '@plex-tinder/game-session/core';
import { PrismaGameSessionRepository } from '@plex-tinder/game-session/repos/prisma';
import { GameSessionController } from './game-session.controller';
import { PrismaService } from '@plex-tinder/shared/clients/prisma';
import { PrismaMovieRepository } from '@plex-tinder/movies/repos/prisma';
import { IMovieRepository } from '@plex-tinder/movies/core';
import { GameSessionGateway } from './GameSessionGateway';

@Module({
  controllers: [GameSessionController],
  providers: [
    PrismaService,
    GameSessionGateway,
    {
      provide: 'IMovieRepository',
      useClass: PrismaMovieRepository,
    },
    {
      provide: 'IGameSessionRepository',
      useClass: PrismaGameSessionRepository,
    },
    {
      provide: 'IGameSessionNotifier',
      useExisting: GameSessionGateway,
    },
    {
      provide: CreateGameSessionUseCase,
      useFactory: (repo: IGameSessionRepository) => new CreateGameSessionUseCase(repo),
      inject: ['IGameSessionRepository'],
    },
    {
      provide: JoinGameSessionUseCase,
      useFactory: (repo: IGameSessionRepository, notifier: IGameSessionNotifier) => 
        new JoinGameSessionUseCase(repo, notifier),
      inject: ['IGameSessionRepository', 'IGameSessionNotifier'],
    },
    {
      provide: GenerateDeckUseCase,
      useFactory: (repo: IMovieRepository) => new GenerateDeckUseCase(repo),
      inject: ['IMovieRepository'],
    },
    {
      provide: ProcessSwipeUseCase,
      useFactory: (repo: IGameSessionRepository, notifier: IGameSessionNotifier) => 
        new ProcessSwipeUseCase(repo, notifier),
      inject: ['IGameSessionRepository', 'IGameSessionNotifier'],
    },
  ],
  exports: [],
})
export class GameSessionModule {}

