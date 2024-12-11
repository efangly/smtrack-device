import { Module } from '@nestjs/common';
import { ProbeService } from './probe.service';
import { ProbeController } from './probe.controller';

@Module({
  controllers: [ProbeController],
  providers: [ProbeService],
})
export class ProbeModule {}
