import { Module } from '@nestjs/common';
import {
  CreateGameSessionUseCase,
  GenerateDeckUseCase,
  IGameSessionRepository,
  IGameSessionNotifier,
  JoinGameSessionUseCase,
  ProcessSwipeUseCase,
  GetGameSessionUseCase,
  GetSessionMoviesUseCase,
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
      useFactory: (prisma: PrismaService) => new PrismaMovieRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'IGameSessionRepository',
      useFactory: (prisma: PrismaService) => new PrismaGameSessionRepository(prisma),
      inject: [PrismaService],
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
    {
      provide: GetGameSessionUseCase,
      useFactory: (repo: IGameSessionRepository) => new GetGameSessionUseCase(repo),
      inject: ['IGameSessionRepository'],
    },
    {
      provide: GetSessionMoviesUseCase,
      useFactory: (repo: IGameSessionRepository, movieRepo: IMovieRepository) => 
        new GetSessionMoviesUseCase(repo, movieRepo),
      inject: ['IGameSessionRepository', 'IMovieRepository'],
    },
  ],
  exports: [],
})
export class GameSessionModule {}

