import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitmqService } from './rabbitmq.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'LOG_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ],
          queue: 'log_queue',
          queueOptions: { durable: true }
        }
      }
    ]),
    ClientsModule.register([
      {
        name: 'LEGACY_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ],
          queue: 'legacy_queue',
          queueOptions: { durable: true }
        }
      }
    ])
  ],
  providers: [RabbitmqService],
  exports: [RabbitmqService]
})
export class RabbitmqModule {}
