import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CronService } from './cron.service';
import { ProbeModule } from 'src/probe/probe.module';

@Module({
  imports: [
    ProbeModule,
    ClientsModule.register([
      {
        name: 'REPORT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ],
          queue: 'notification_queue',
          queueOptions: { durable: true }
        }
      }
    ])
  ],
  providers: [CronService]
})
export class CronModule { }
