import { Module } from '@nestjs/common';
import { ProbeService } from './probe.service';
import { ProbeController } from './probe.controller';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [ProbeController],
  providers: [ProbeService],
  exports: [ProbeService]
})
export class ProbeModule {}
