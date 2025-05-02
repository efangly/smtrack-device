import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateProbeDto } from './dto/create-probe.dto';
import { UpdateProbeDto } from './dto/update-probe.dto';
import { RedisService } from '../redis/redis.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { JwtPayloadDto } from '../common/dto';
import { Prisma } from '@prisma/client';
import { ProbeWithPosts } from '../common/types/probe-with-device';

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
    await this.redis.del('device');
    await this.redis.del('config');
    await this.redis.del('listdevice');
    await this.redis.del('probe');
    return probe;
  }

  async findAll(user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    const cache = await this.redis.get(key);
    if (cache) return JSON.parse(cache) as ProbeWithPosts[];
    const probe = await this.prisma.probes.findMany({
      where: conditions,
      include: { device: { include: { log: true } } },
      orderBy: { device: { seq: 'asc' } }
    });
    await this.redis.set(key, JSON.stringify(probe), 3600 * 6);
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
    await this.redis.del('device');
    await this.redis.del('config');
    await this.redis.del('listdevice');
    await this.redis.del('probe');
    return probeDto;
  }

  async remove(id: string) {
    await this.prisma.probes.delete({ where: { id } });
    await this.redis.del('device');
    await this.redis.del('config');
    await this.redis.del('listdevice');
    return `This action removes a #${id} probe`;
  }

  private findCondition(user: JwtPayloadDto): { conditions: Prisma.ProbesWhereInput | undefined, key: string } {
    let conditions: Prisma.ProbesWhereInput | undefined = undefined;
    let key = "";
    switch (user.role) {
      case "ADMIN":
        conditions = {
          AND: [
            { device: { hospital: user.hosId } },
            {
              NOT: [
                { device: { hospital: "HID-DEVELOPMENT" } },
                { device: { ward: "WID-DEVELOPMENT" } }
              ]
            }
          ]
        };
        key = `probe:${user.hosId}`;
        break;
      case "LEGACY_ADMIN":
        conditions = {
          AND: [
            { device: { hospital: user.hosId } },
            {
              NOT: [
                { device: { hospital: "HID-DEVELOPMENT" } },
                { device: { ward: "WID-DEVELOPMENT" } }
              ]
            }
          ]
        };
        key = `probe:${user.hosId}`;
        break;
      case "USER":
        conditions = { device: { ward: user.wardId } };
        key = `probe:${user.wardId}`;
        break;
      case "LEGACY_USER":
        conditions = { device: { ward: user.wardId } };
        key = `probe:${user.wardId}`;
        break;
      case "SERVICE":
        conditions = {
          NOT: [
            { device: { hospital: "HID-DEVELOPMENT" } },
            { device: { ward: "WID-DEVELOPMENT" } }
          ]
        };
        key = "probe:HID-DEVELOPMENT";
        break;
      default:
        conditions = {
          NOT: [
            { device: { hospital: "0" } },
          ]
        };
        key = "probe";
    }
    return { conditions, key };
  }
}
