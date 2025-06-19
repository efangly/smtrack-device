import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitmqService {
  constructor(
    @Inject('LOG_SERVICE') private readonly client: ClientProxy,
    @Inject('LEGACY_SERVICE') private readonly legacyClient: ClientProxy
  ) {}

  sendHistory(service: string, type: string, user: string, message: string) {
    this.client.emit('history', { service, type, message, user, time: new Date() });
  }

  sendLegacy<T>(type: string, id: string, data: T) {
    this.legacyClient.emit(type, { id, data });
  }
}
