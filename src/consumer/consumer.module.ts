import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    ClientsModule.register([
      {
        name: 'ONLINE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ],
          queue: 'online_queue',
          queueOptions: { durable: true }
        }
      }
    ]),
    PrismaModule
  ],
  providers: [ConsumerService],
  controllers: [ConsumerController]
})
export class ConsumerModule {}
