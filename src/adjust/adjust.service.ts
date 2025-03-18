import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProbeDto } from '../probe/dto/update-probe.dto';
import { dateFormat } from '../common/utils';
import { RedisService } from '../redis/redis.service';
import { UpdateConfigDto } from '../configs/dto/update-config.dto';

@Injectable()
export class AdjustService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  async updateProbe(id: string, probeDto: UpdateProbeDto) {
    probeDto.updateAt = dateFormat(new Date());
    await this.prisma.probes.update({ where: { id }, data: probeDto });
    await this.redis.del("device");
    return probeDto;
  }

  async updateConfig(id: string, configDto: UpdateConfigDto) {
    await this.prisma.configs.update({ where: { sn: id }, data: configDto });
    await this.redis.del("device");
    await this.redis.del(`config:${id}`);
    return configDto;
  }
}
