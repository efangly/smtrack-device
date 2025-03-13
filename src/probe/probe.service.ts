import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateProbeDto } from './dto/create-probe.dto';
import { UpdateProbeDto } from './dto/update-probe.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProbeService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}
  async create(probeDto: CreateProbeDto) {
    probeDto.createAt = dateFormat(new Date());
    probeDto.updateAt = dateFormat(new Date());
    await this.prisma.probes.create({ data: probeDto });
    await this.redis.del("device");
    await this.redis.del("listdevice");
    return 'This action adds a new probe';
  }

  async findAll() {
    const probe = await this.prisma.probes.findMany({
      include: {
        device: { include: { log: true } }
      }
    });
    return probe;
  }

  async findOne(id: string) {
    return this.prisma.probes.findMany({ where: { sn: id } });
  }

  async update(id: string, probeDto: UpdateProbeDto) {
    probeDto.updateAt = dateFormat(new Date());
    const probe = await this.prisma.probes.update({ where: { id }, data: probeDto});
    await this.redis.del("device");
    await this.redis.del("listdevice");
    return probe;
  }

  async remove(id: string) {
    this.prisma.probes.delete({ where: { id } });
    await this.redis.del("device");
    await this.redis.del("listdevice");
    return 'This action removes a #${id} probe';
  }
}
