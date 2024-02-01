import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule, MoviesService } from '@plex-tinder/movies';
import { TasksService } from '@plex-tinder/tasks';
import { PrismaModule } from 'libs/prisma/prisma.module';
import { PrismaService } from 'libs/prisma/prisma.service';

@Module({
  imports: [MoviesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, TasksService, PrismaService, MoviesService],
})
export class AppModule {}
