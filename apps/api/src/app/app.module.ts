import { Module } from '@nestjs/common';
import { MoviesModule } from '@plex-tinder/movies';
import { CacheModule } from '@plex-tinder/shared/nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksService } from '@plex-tinder/tasks';

@Module({
  imports: [CacheModule, MoviesModule],
  controllers: [AppController],
  providers: [AppService, TasksService],
})
export class AppModule {}
