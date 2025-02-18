import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';

@Injectable()
export class RepairService {
  constructor(private readonly prisma: PrismaService) {}
  create(repairDto: CreateRepairDto) {
    repairDto.createAt = dateFormat(new Date());
    repairDto.updateAt = dateFormat(new Date());
    return this.prisma.repairs.create({ data: repairDto });
  }

  findAll() {
    return this.prisma.repairs.findMany({
      include: {
        device: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.repairs.findUnique({ where: { id: id } });
  }

  update(id: string, repairDto: UpdateRepairDto) {
    repairDto.updateAt = dateFormat(new Date());
    return this.prisma.repairs.update({ 
      where: { id },
      data: repairDto
    });
  }

  remove(id: string) {
    return this.prisma.repairs.delete({ where: { id: id } });
  }
}
