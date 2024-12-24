import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateProbeDto } from './dto/create-probe.dto';
import { UpdateProbeDto } from './dto/update-probe.dto';

@Injectable()
export class ProbeService {
  constructor(private readonly prisma: PrismaService) {}
  create(probeDto: CreateProbeDto) {
    probeDto.createAt = dateFormat(new Date());
    probeDto.updateAt = dateFormat(new Date());
    return this.prisma.probes.create({ data: probeDto });
  }

  findAll() {
    return this.prisma.probes.findMany();
  }

  findOne(id: string) {
    return this.prisma.probes.findMany({ where: { sn: id } });
  }

  update(id: string, probeDto: UpdateProbeDto) {
    probeDto.updateAt = dateFormat(new Date());
    return this.prisma.probes.update({ 
      where: { id },
      data: probeDto
    });
  }

  remove(id: string) {
    return this.prisma.probes.delete({ where: { id } });
  }
}
