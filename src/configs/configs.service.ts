import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';
import { UpdateDeviceDto } from '../device/dto/update-device.dto';
import { JwtPayloadDto } from '../common/dto';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';


@Injectable()
export class ConfigsService {
  constructor(
    private readonly prisma: PrismaService, 
    private readonly redis: RedisService,
    private readonly rabbitmq: RabbitmqService
  ) {}
  async create(configDto: CreateConfigDto) {
    configDto.createAt = dateFormat(new Date());
    configDto.updateAt = dateFormat(new Date());
    return this.prisma.configs.create({ data: configDto as unknown as Prisma.ConfigsCreateInput });
  }

  async findAll() {
    return this.prisma.configs.findMany();
  }

  async findOne(id: string) {
    const cache = await this.redis.get(`config:${id}`);
    if (cache) return JSON.parse(cache);
    const result = await this.prisma.devices.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        token: true,
        probe: true,
        config: true
      }
    });
    if (result) await this.redis.set(`config:${id}`, JSON.stringify(result), 3600 * 24);
    return result;
  }

  async update(id: string, configDto: UpdateConfigDto, user: JwtPayloadDto) {
    const result = await this.prisma.configs.findUnique({ where: { sn: id } });
    if (!result) throw new BadRequestException('This config does not exist');
    const filtered = Object.keys(configDto).filter(key => configDto[key] !== null);
    configDto.updateAt = dateFormat(new Date());
    const config = await this.prisma.configs.update({
      where: { sn: id },
      data: configDto as unknown as Prisma.ConfigsUpdateInput
    });
    let message = '';
    for (const key of filtered) {
      if (result[key] !== config[key]) message += ` ${key} from ${result[key]} to ${config[key]}`;
    }
    if (message !== '') {
      this.rabbitmq.sendHistory(id, 'update', user.id, `Update config:${message}/${user.name}`);
      this.rabbitmq.sendLegacy('config', id, config);
    }
    await this.redis.del("device");
    await this.redis.del(`config:${id}`);
    return config;
  }

  async updateVersion(id: string, configDto: UpdateDeviceDto) {
    configDto.updateAt = dateFormat(new Date());
    const result = await this.prisma.devices.update({
      where: { id },
      data: configDto
    });
    await this.redis.del("device");
    return result;
  }

  async remove(id: string) {
    await this.prisma.configs.delete({ where: { id: id } });
    return 'This config has been deleted';
  }
}
