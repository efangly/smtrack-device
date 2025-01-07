import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect } from 'amqplib';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateLogdayDto } from '../logday/dto/create-logday.dto';
import type { Connection, ConsumeMessage } from 'amqplib';


@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}
  private conn: Connection;

  async onModuleInit() {
    const queue = "send-log";
    this.conn = await connect(String(process.env.RABBITMQ));
    const channel = await this.conn.createChannel();
    await channel.assertExchange(process.env.NODE_ENV === "production" ? "smtrack" : "smtrack-test", 'direct', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.prefetch(10);
    channel.consume(queue, async (payload: ConsumeMessage | null) => {
      try {
        const log = JSON.parse(payload.content.toString()) as CreateLogdayDto;
        log.sendTime = dateFormat(log.sendTime);
        log.expire = new Date(new Date().getTime() + 3600 * 1000);
        await this.prisma.logDays.create({ data: log });
        channel.ack(payload);
      } catch (err) {
        channel.ack(payload);
        console.log("Error: ", err);
      }
    });
  }

  async onModuleDestroy() {
    this.conn.close();
  }
}
