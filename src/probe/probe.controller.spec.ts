import { Test, TestingModule } from '@nestjs/testing';
import { ProbeController } from './probe.controller';
import { ProbeService } from './probe.service';

describe('ProbeController', () => {
  let controller: ProbeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProbeController],
      providers: [ProbeService],
    }).compile();

    controller = module.get<ProbeController>(ProbeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
