import { Injectable, Inject } from '@nestjs/common';
import { dateFormat } from '../common/utils';
import { CreateLogdayDto } from './dto/create-logday.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OnlineDto } from './dto/online.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ConsumerService {
  constructor(
    @Inject('ONLINE_SERVICE') private readonly client: ClientProxy,
    private readonly prisma: PrismaService
  ) {}
  async createLog(log: CreateLogdayDto) {
    log.sendTime = dateFormat(log.sendTime);
    log.expire = dateFormat(new Date(new Date().getTime() + 1800 * 1000));
    log.createAt = dateFormat(new Date());
    log.updateAt = dateFormat(new Date());
    await this.prisma.logDays.create({ data: log });
  }

  async online(data: OnlineDto) {
    const result = await this.prisma.devices.update({
      where: { id: data.sn },
      data: { online: data.status }
    });
    this.client.emit('online-status', {
      device: result.name,
      message: result.online ?  'Device online' : 'Device offline',
      hospital: result.hospital,
      time: result.online
    });
  }
}