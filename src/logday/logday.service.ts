import { Injectable } from '@nestjs/common';
import { CreateLogdayDto } from './dto/create-logday.dto';
import { dateFormat } from '../common/utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogdayService {
  constructor(private readonly prisma: PrismaService) {}
  create(createLogdayDto: CreateLogdayDto) {
    createLogdayDto.createAt = dateFormat(new Date());
    createLogdayDto.updateAt = dateFormat(new Date());
    return this.prisma.logDays.create({ data: createLogdayDto });
  }

  remove(id: string) {
    return this.prisma.logDays.delete({ where: { id: id } });
  }
}
