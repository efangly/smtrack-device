import { Injectable, Inject } from '@nestjs/common';
import { dateFormat } from '../common/utils';
import { CreateLogdayDto } from './dto/create-logday.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OnlineDto } from './dto/online.dto';
import { ClientProxy } from '@nestjs/microservices';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ConsumerService {
  constructor(
    @Inject('ONLINE_SERVICE') private readonly client: ClientProxy, 
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
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

  async updateHospital(data: { id: string, name: string }) {
    await this.prisma.devices.updateMany({
      where: { hospital: data.id },
      data: { hospitalName: data.name, updateAt: dateFormat(new Date()) }
    });
    await this.redis.del("device");
    await this.redis.del("list");
    await this.redis.del("deviceinfo");
  }

  async updateWard(data: { id: string, name: string }) {
    await this.prisma.devices.updateMany({
      where: { ward: data.id },
      data: { wardName: data.name, updateAt: dateFormat(new Date()) }
    });
    await this.redis.del("device");
    await this.redis.del("list");
    await this.redis.del("deviceinfo");
  }
}