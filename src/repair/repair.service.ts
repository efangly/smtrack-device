import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';

@Injectable()
export class RepairService {
  constructor(private readonly prisma: PrismaService) {}
  async create(repairDto: CreateRepairDto) {
    const seq = await this.prisma.repairs.findMany({ take: 1, orderBy: { createAt: 'desc' } });
    repairDto.seq = seq.length === 0 ? 1 : seq[0].seq + 1;
    repairDto.createAt = dateFormat(new Date());
    repairDto.updateAt = dateFormat(new Date());
    return this.prisma.repairs.create({ data: repairDto });
  }

  async findAll() {
    return this.prisma.repairs.findMany({
      include: {
        device: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.repairs.findUnique({ where: { id: id } });
  }

  async update(id: string, repairDto: UpdateRepairDto) {
    repairDto.updateAt = dateFormat(new Date());
    return this.prisma.repairs.update({ 
      where: { id },
      data: repairDto
    });
  }

  async remove(id: string) {
    return this.prisma.repairs.delete({ where: { id: id } });
  }
}
