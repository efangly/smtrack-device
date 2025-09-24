import { Injectable, Inject } from '@nestjs/common';
import { dateFormat } from '../common/utils';
import { CreateLogdayDto } from './dto/create-logday.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OnlineDto } from './dto/online.dto';
import { ClientProxy } from '@nestjs/microservices';
import { RedisService } from '../redis/redis.service';
import { UpdateConfigDto } from 'src/configs/dto/update-config.dto';
import { UpdateProbeDto } from 'src/probe/dto/update-probe.dto';
import { UpdateDeviceDto } from 'src/device/dto/update-device.dto';
import { CreateRepairDto } from 'src/repair/dto/create-repair.dto';
import { CreateWarrantyDto } from 'src/warranty/dto/create-warranty.dto';
import { JsonLogger } from '../common/logger';

@Injectable()
export class ConsumerService {
  private readonly logger = new JsonLogger();
  
  constructor(
    @Inject('ONLINE_SERVICE') private readonly client: ClientProxy, 
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}
  async createLog(log: CreateLogdayDto) {
    try {
      log.sendTime = dateFormat(log.sendTime);
      log.expire = dateFormat(new Date(new Date().getTime() + 1800 * 1000));
      log.createAt = dateFormat(new Date());
      log.updateAt = dateFormat(new Date());
      await this.prisma.logDays.create({ data: log });
    } catch (error) {
      this.logger.logError(
        'Failed to create log entry',
        error instanceof Error ? error : new Error(String(error)),
        'ConsumerService.createLog',
        { logData: log }
      );
      throw error;
    }
  }

  async online(data: OnlineDto) {
    try {
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
    } catch (error) {
      this.logger.logError(
        'Failed to update device online status',
        error instanceof Error ? error : new Error(String(error)),
        'ConsumerService.online',
        { deviceSn: data.sn, status: data.status }
      );
      throw error;
    }
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

  async updateDevice(data: { id: string, device: UpdateDeviceDto }) {
    await this.prisma.devices.update({
      where: { id: data.id },
      data: data.device
    });
    await this.redis.del("device");
    await this.redis.del("list");
    await this.redis.del("deviceinfo");
  }

  async updateConfig(data: { id: string, config: UpdateConfigDto }) {
    await this.prisma.configs.update({
      where: { sn: data.id },
      data: data.config
    });
    await this.redis.del("device");
    await this.redis.del("list");
    await this.redis.del("deviceinfo");
  }

  async updateProbe(data: { id: string, probe: UpdateProbeDto }) {
    await this.prisma.probes.updateMany({
      where: { sn: data.id },
      data: data.probe
    });
    console.log(data.probe);
    await this.redis.del("device");
    await this.redis.del('probe');
    await this.redis.del("list");
    await this.redis.del("deviceinfo");
  }

  async createRepair(data: CreateRepairDto) {
    data.createAt = dateFormat(new Date());
    data.updateAt = dateFormat(new Date());
    await this.prisma.repairs.create({ data });
    await this.redis.del("repair");
  }

  async createWarranty(data: CreateWarrantyDto) {
    data.createAt = dateFormat(new Date());
    data.updateAt = dateFormat(new Date());
    await this.prisma.warranties.create({ data });
    await this.redis.del("warranty");
  }
}