import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateProbeDto } from './dto/create-probe.dto';
import { UpdateProbeDto } from './dto/update-probe.dto';

@Injectable()
export class ProbeService {
  constructor(private readonly prisma: PrismaService) {}
  async create(probeDto: CreateProbeDto) {
    probeDto.createAt = dateFormat(new Date());
    probeDto.updateAt = dateFormat(new Date());
    return this.prisma.probes.create({ data: probeDto });
  }

  async findAll() {
    return this.prisma.probes.findMany();
  }

  async findOne(id: string) {
    return this.prisma.probes.findMany({ where: { sn: id } });
  }

  async update(id: string, probeDto: UpdateProbeDto) {
    probeDto.updateAt = dateFormat(new Date());
    return this.prisma.probes.update({ 
      where: { id },
      data: probeDto
    });
  }

  async remove(id: string) {
    return this.prisma.probes.delete({ where: { id } });
  }
}
