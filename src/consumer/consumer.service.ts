import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { connect } from 'amqplib';
import { dateFormat } from '../common/utils';
import { CreateLogdayDto } from './dto/create-logday.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Connection, ConsumeMessage } from 'amqplib';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}
  private conn: Connection;
  private readonly logger = new Logger(ConsumerService.name);

  async onModuleInit() {
    const queue = "send-log";
    this.conn = await connect(String(process.env.RABBITMQ));
    const channel = await this.conn.createChannel();
    await channel.assertExchange(process.env.NODE_ENV === "production" ? "smtrack" : "smtrack-test", 'direct', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.prefetch(1);
    channel.consume(queue, async (payload: ConsumeMessage | null) => {
      try {
        const log = JSON.parse(payload.content.toString()) as CreateLogdayDto;
        log.sendTime = dateFormat(log.sendTime);
        log.expire = dateFormat(new Date(new Date().getTime() + 1800 * 1000));
        log.createAt = dateFormat(new Date());
        log.updateAt = dateFormat(new Date());
        await this.prisma.logDays.create({ data: log });
        channel.ack(payload);
      } catch (err) {
        this.logger.error(err.message);
        channel.ack(payload);
      }
    });
  }

  async onModuleDestroy() {
    this.conn.close();
  }
}
