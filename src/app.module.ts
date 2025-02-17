import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { WarrantyModule } from './warranty/warranty.module';
import { ConfigsModule } from './configs/configs.module';
import { DeviceModule } from './device/device.module';
import { ProbeModule } from './probe/probe.module';
import { RepairModule } from './repair/repair.module';
import { HealthModule } from './health/health.module';
import { LogdayModule } from './logday/logday.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtStrategy, DeviceStrategy } from './common/strategies';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { ConsumerModule } from './consumer/consumer.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    PassportModule,
    RedisModule, 
    PrismaModule, 
    WarrantyModule, 
    RepairModule, 
    ProbeModule, 
    DeviceModule, 
    ConfigsModule, 
    HealthModule, 
    LogdayModule, 
    RabbitmqModule, 
    ConsumerModule, 
    CronModule
  ],
  providers: [JwtStrategy, DeviceStrategy]
})
export class AppModule {}
