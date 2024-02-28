import { Test } from '@nestjs/testing';
import { SecretService } from './secret.service';

describe('SecretService', () => {
  let service: SecretService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SecretService],
    }).compile();

    service = module.get(SecretService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
