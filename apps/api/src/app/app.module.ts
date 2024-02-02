import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule, MoviesService } from '@plex-tinder/movies';
import { TasksService } from '@plex-tinder/tasks';
import { PrismaModule, PrismaService } from '@plex-tinder/shared/prisma';

@Module({
  imports: [MoviesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, TasksService, PrismaService, MoviesService],
})
export class AppModule {}
