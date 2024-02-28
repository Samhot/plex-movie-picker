import { Test } from '@nestjs/testing';
import { SecretController } from './secret.controller';
import { SecretService } from './secret.service';

describe('SecretController', () => {
  let controller: SecretController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SecretService],
      controllers: [SecretController],
    }).compile();

    controller = module.get(SecretController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
