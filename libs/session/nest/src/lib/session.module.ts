import { Module } from '@nestjs/common';
import {
  CreateSessionUseCase,
  GenerateDeckUseCase,
  ISessionRepository,
  ISessionNotifier,
  JoinSessionUseCase,
  ProcessSwipeUseCase,
} from '@plex-tinder/session/core';
import { PrismaSessionRepository } from '@plex-tinder/session/repos/prisma';
import { SessionController } from './session.controller';
import { PrismaService } from '@plex-tinder/shared/clients/prisma';
import { PrismaMovieRepository } from '@plex-tinder/movies/repos/prisma';
import { IMovieRepository } from '@plex-tinder/movies/core';
import { SessionGateway } from './SessionGateway';

@Module({
  controllers: [SessionController],
  providers: [
    PrismaService,
    SessionGateway,
    {
      provide: 'IMovieRepository',
      useClass: PrismaMovieRepository,
    },
    {
      provide: 'ISessionRepository',
      useClass: PrismaSessionRepository,
    },
    {
      provide: 'ISessionNotifier',
      useExisting: SessionGateway,
    },
    {
      provide: CreateSessionUseCase,
      useFactory: (repo: ISessionRepository) => new CreateSessionUseCase(repo),
      inject: ['ISessionRepository'],
    },
    {
      provide: JoinSessionUseCase,
      useFactory: (repo: ISessionRepository, notifier: ISessionNotifier) => 
        new JoinSessionUseCase(repo, notifier),
      inject: ['ISessionRepository', 'ISessionNotifier'],
    },
    {
      provide: GenerateDeckUseCase,
      useFactory: (repo: IMovieRepository) => new GenerateDeckUseCase(repo),
      inject: ['IMovieRepository'],
    },
    {
      provide: ProcessSwipeUseCase,
      useFactory: (repo: ISessionRepository, notifier: ISessionNotifier) => 
        new ProcessSwipeUseCase(repo, notifier),
      inject: ['ISessionRepository', 'ISessionNotifier'],
    },
  ],
  exports: [],
})
export class SessionModule {}
