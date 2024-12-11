import { Test, TestingModule } from '@nestjs/testing';
import { ProbeService } from './probe.service';

describe('ProbeService', () => {
  let service: ProbeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProbeService],
    }).compile();

    service = module.get<ProbeService>(ProbeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
