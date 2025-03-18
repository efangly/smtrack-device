import { Test, TestingModule } from '@nestjs/testing';
import { AdjustService } from './adjust.service';

describe('AdjustService', () => {
  let service: AdjustService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdjustService],
    }).compile();

    service = module.get<AdjustService>(AdjustService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
