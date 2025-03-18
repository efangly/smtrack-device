import { Module } from '@nestjs/common';
import { AdjustController } from './adjust.controller';
import { AdjustService } from './adjust.service';

@Module({
  controllers: [AdjustController],
  providers: [AdjustService]
})
export class AdjustModule {}
