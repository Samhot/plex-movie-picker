import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule, MoviesService } from '@plex-tinder/movies';
import { TasksService } from '@plex-tinder/tasks';
import { PrismaService } from 'libs/movies/nest/src/lib/prisma.service';
import { PrismaModule } from 'libs/movies/nest/src/lib/prisma.module';

@Module({
  imports: [MoviesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, TasksService, PrismaService, MoviesService],
})
export class AppModule {}
