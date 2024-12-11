import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConfigsService {
  constructor(private readonly prisma: PrismaService) {}
  create(configDto: CreateConfigDto) {
    configDto.createAt = dateFormat(new Date());
    configDto.updateAt = dateFormat(new Date());
    return this.prisma.configs.create({ data: configDto as unknown as Prisma.ConfigsCreateInput });
  }

  findAll() {
    return this.prisma.configs.findMany();
  }

  findOne(id: string) {
    return this.prisma.configs.findUnique({ where: { id: id } });
  }

  update(id: string, configDto: UpdateConfigDto) {
    configDto.updateAt = dateFormat(new Date());
    return this.prisma.configs.update({ 
      where: { id },
      data: configDto as unknown as Prisma.ConfigsUpdateInput
    });
  }

  remove(id: string) {
    return this.prisma.configs.delete({ where: { id: id } });
  }
}
