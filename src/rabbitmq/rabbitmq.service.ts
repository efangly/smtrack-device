import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitmqService {
  constructor(@Inject('LOG_SERVICE') private readonly client: ClientProxy) {}

  async sendHistory(service: string, type: string, user: string, message: string) {
    this.client.emit('history', { service, type, message, user, time: new Date() });
  }
}
