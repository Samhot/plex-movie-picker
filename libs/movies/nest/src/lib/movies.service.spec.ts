import { Test } from '@nestjs/testing';
import { MoviesService } from './movies.service';

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MoviesService],
    }).compile();

    service = module.get(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
