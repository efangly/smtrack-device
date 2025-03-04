import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { DeviceModule } from 'src/device/device.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, DeviceModule],
  providers: [ConsumerService],
  controllers: [ConsumerController]
})
export class ConsumerModule {}
