import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProbeDto } from '../probe/dto/update-probe.dto';
import { dateFormat } from '../common/utils';
import { RedisService } from '../redis/redis.service';
import { UpdateConfigDto } from '../configs/dto/update-config.dto';
import { UpdateDeviceDto } from 'src/device/dto/update-device.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdjustService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  async getOnlineStatus(hospital: string, ward: string) {
    let whereClause = {
      AND: [
        { online: false },
        { NOT: { hospital: 'HID-DEVELOPMENT' } },
        { NOT: { hospital: 'HOS-5c4b9f29-2b0f-4e19-9442-22c9a72b19df' } },
      ]
    } as Prisma.DevicesWhereInput;
    if (hospital) whereClause = { ...whereClause, hospital };
    if (ward) whereClause = { ...whereClause, ward };
    const result = await this.prisma.devices.findMany({
      where: whereClause,
      select: { id: true, name: true, hospitalName: true, wardName: true, updateAt: true },
      orderBy: { seq: 'asc' }
    });
    return result;
  }

  async getProbe() {
    const cache = await this.redis.get('probe');
    if (cache) return JSON.parse(cache);
    const probe = await this.prisma.probes.findMany();
    await this.redis.set('probe', JSON.stringify(probe), 3600 * 6);
    return probe;
  }

  async updateProbe(id: string, probeDto: UpdateProbeDto) {
    probeDto.updateAt = dateFormat(new Date());
    await this.prisma.probes.update({ where: { id }, data: probeDto });
    await this.redis.del('device');
    await this.redis.del('devices');
    await this.redis.del('config');
    return probeDto;
  }

  async updateConfig(id: string, configDto: UpdateConfigDto) {
    await this.prisma.configs.update({ where: { sn: id }, data: configDto });
    await this.redis.del('device');
    await this.redis.del('devices');
    await this.redis.del('config');
    return configDto;
  }

  async updateDeviceName(id: string, deviceDto: UpdateDeviceDto) {
    if (!deviceDto.name) throw new BadRequestException("Device name is required");
    await this.prisma.devices.update({ where: { id }, data: { name: deviceDto.name } });
    await this.redis.del('devices');
    await this.redis.del('device');
    await this.redis.del('config');
    await this.redis.del('listdevice');
    await this.redis.del('deviceinfo');
    return deviceDto;
  }
}
