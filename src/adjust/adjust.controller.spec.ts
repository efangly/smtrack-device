import { Test, TestingModule } from '@nestjs/testing';
import { AdjustController } from './adjust.controller';

describe('AdjustController', () => {
  let controller: AdjustController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdjustController],
    }).compile();

    controller = module.get<AdjustController>(AdjustController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
