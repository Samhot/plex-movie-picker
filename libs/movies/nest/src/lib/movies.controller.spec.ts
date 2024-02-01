import { Test } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

describe('MoviesController', () => {
  let controller: MoviesController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MoviesService],
      controllers: [MoviesController],
    }).compile();

    controller = module.get(MoviesController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
