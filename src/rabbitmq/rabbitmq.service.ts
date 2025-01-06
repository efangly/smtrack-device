import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { connect } from "amqplib";
import type { Connection, Channel } from "amqplib";

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private conn: Connection;
  private channel: Channel;
  async onModuleInit() {
    this.conn = await connect(String(process.env.RABBITMQ));
    this.channel = await this.conn.createChannel();
    await this.channel.assertExchange(process.env.NODE_ENV === "production" ? "smtrack" : "smtrack-test", 'direct', { durable: true });
  }

  async send(queue: string, payload: string): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(payload), { persistent: true });
  }

  async onModuleDestroy() {
    this.conn.close();
  }
}