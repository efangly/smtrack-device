import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProbeDto } from '../probe/dto/update-probe.dto';
import { dateFormat } from '../common/utils';
import { RedisService } from '../redis/redis.service';
import { UpdateConfigDto } from '../configs/dto/update-config.dto';
import { UpdateDeviceDto } from 'src/device/dto/update-device.dto';

@Injectable()
export class AdjustService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  async updateProbe(id: string, probeDto: UpdateProbeDto) {
    probeDto.updateAt = dateFormat(new Date());
    await this.prisma.probes.update({ where: { id }, data: probeDto });
    await this.redis.del("device");
    await this.redis.del(`devices:${id}`);
    return probeDto;
  }

  async updateConfig(id: string, configDto: UpdateConfigDto) {
    await this.prisma.configs.update({ where: { sn: id }, data: configDto });
    await this.redis.del("device");
    await this.redis.del(`devices:${id}`);
    await this.redis.del(`config:${id}`);
    return configDto;
  }

  async updateDeviceName(id: string, deviceDto: UpdateDeviceDto) {
    if (!deviceDto.name) throw new BadRequestException("Device name is required");
    await this.prisma.devices.update({ where: { id }, data: { name: deviceDto.name } });
    await this.redis.del(`devices:${id}`);
    await this.redis.del("device");
    await this.redis.del(`config:${id}`);
    await this.redis.del("listdevice");
    await this.redis.del("deviceinfo");
    return deviceDto;
  }
}
