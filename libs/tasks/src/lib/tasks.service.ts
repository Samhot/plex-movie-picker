import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MoviesCategory } from '@plex-tinder/mediacenter/core';
import { FetchMoviesUseCase } from '@plex-tinder/movies/core';
import { WinstonLogger } from '@plex-tinder/shared/utils';

@Injectable()
export class TasksService {
  constructor(private readonly fetchMoviesUseCase: FetchMoviesUseCase) {}

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  handleCron() {
    WinstonLogger.info('Fetching new movies from Plex');
    this.fetchMoviesUseCase.execute({ userId: '1', category: MoviesCategory.ALL });
    WinstonLogger.info('Fetching new movies from Plex done');
  }
}
