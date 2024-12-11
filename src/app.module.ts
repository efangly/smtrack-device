import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './common/strategies';
import { WarrantyModule } from './warranty/warranty.module';
import { ConfigsModule } from './configs/configs.module';
import { DeviceModule } from './device/device.module';
import { ProbeModule } from './probe/probe.module';
import { RepairModule } from './repair/repair.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    RedisModule, 
    PrismaModule, 
    WarrantyModule, 
    RepairModule, 
    ProbeModule, 
    DeviceModule, 
    ConfigsModule, 
    HealthModule
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
