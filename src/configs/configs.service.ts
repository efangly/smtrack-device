import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';


@Injectable()
export class ConfigsService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}
  async create(configDto: CreateConfigDto) {
    configDto.createAt = dateFormat(new Date());
    configDto.updateAt = dateFormat(new Date());
    await this.redis.del("device");
    return this.prisma.configs.create({ data: configDto as unknown as Prisma.ConfigsCreateInput });
  }

  async findAll() {
    return this.prisma.configs.findMany();
  }

  async findOne(id: string) {
    return this.prisma.devices.findUnique({ 
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        probe: true,
        config: true
      } 
    });
  }

  async update(id: string, configDto: UpdateConfigDto) {
    configDto.updateAt = dateFormat(new Date());
    const result = await this.prisma.configs.update({ 
      where: { sn: id },
      data: configDto as unknown as Prisma.ConfigsUpdateInput
    });
    await this.redis.del("device");
    return result;
  }

  async remove(id: string) {
    return this.prisma.configs.delete({ where: { id: id } });
  }
}
