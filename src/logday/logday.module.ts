import { Global, Module } from '@nestjs/common';
import { LogdayService } from './logday.service';
import { LogdayController } from './logday.controller';

@Global()
@Module({
  controllers: [LogdayController],
  providers: [LogdayService],
  exports: [LogdayService]
})
export class LogdayModule {}
