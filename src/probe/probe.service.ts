import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateProbeDto } from './dto/create-probe.dto';
import { UpdateProbeDto } from './dto/update-probe.dto';
import { RedisService } from '../redis/redis.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { JwtPayloadDto } from '../common/dto';

@Injectable()
export class ProbeService {
  constructor(
    private readonly prisma: PrismaService, 
    private readonly redis: RedisService, 
    private readonly rabbitmq: RabbitmqService
  ) {}
  async create(probeDto: CreateProbeDto, user: JwtPayloadDto) {
    probeDto.createAt = dateFormat(new Date());
    probeDto.updateAt = dateFormat(new Date());
    const probe = await this.prisma.probes.create({ data: probeDto });
    this.rabbitmq.sendHistory(probe.sn, 'create', user.id, `Create probe: ${probe.id} with ${probeDto.sn}/${user.name}`);
    await this.redis.del("device");
    await this.redis.del("listdevice");
    return probe;
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

  async update(id: string, probeDto: UpdateProbeDto, user: JwtPayloadDto) {
    const result = await this.prisma.probes.findUnique({ where: { id } });
    if (!result) throw new BadRequestException('This probe does not exist');
    const filtered = Object.keys(probeDto).filter(key => probeDto[key] !== null);
    probeDto.updateAt = dateFormat(new Date());
    const probe = await this.prisma.probes.update({ where: { id }, data: probeDto });
    let message = '';
    for (const key of filtered) {
      if (result[key] !== probe[key]) message += ` ${key} from ${result[key]} to ${probe[key]}`;
    }
    if (message !== '') this.rabbitmq.sendHistory(probe.sn, 'update', user.id, `Update probe:${message}/${user.name}`);
    await this.redis.del("device");
    await this.redis.del("listdevice");
    return probeDto;
  }

  async remove(id: string) {
    this.prisma.probes.delete({ where: { id } });
    await this.redis.del("device");
    await this.redis.del("listdevice");
    return `This action removes a #${id} probe`;
  }
}
