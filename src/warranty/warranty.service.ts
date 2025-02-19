import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { dateFormat } from '../common/utils';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';

@Injectable()
export class WarrantyService {
  constructor(private readonly prisma: PrismaService) { }
  async create(warrantyDto: CreateWarrantyDto) {
    warrantyDto.createAt = dateFormat(new Date());
    warrantyDto.updateAt = dateFormat(new Date());
    return this.prisma.warranties.create({ data: warrantyDto });
  }

  async findAll() {
    return this.prisma.warranties.findMany({
      include: {
        device: {
          select: {
            id: true,
            name: true,
            location: true,
            position: true,
          }
        }
      },
      orderBy: { createAt: 'asc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.warranties.findUnique({ where: { id: id } });
  }

  async update(id: string, warrantyDto: UpdateWarrantyDto) {
    warrantyDto.updateAt = dateFormat(new Date());
    return this.prisma.warranties.update({
      where: { id },
      data: warrantyDto
    });
  }

  async remove(id: string) {
    return this.prisma.warranties.delete({ where: { id: id } });
  }
}
