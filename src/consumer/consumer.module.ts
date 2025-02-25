import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule],
  providers: [ConsumerService],
  controllers: [ConsumerController]
})
export class ConsumerModule {}
