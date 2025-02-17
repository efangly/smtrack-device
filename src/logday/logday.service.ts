import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogdayDto } from './dto/create-logday.dto';
import { format, toDate } from "date-fns";

@Injectable()
export class LogdayService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLogdayDto) {
    return this.prisma.logDays.create({ data: data });
  }

  async checkExpire() {
    return this.prisma.logDays.deleteMany({ 
      where: { 
        expire: { 
          lt: toDate(format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'")) 
        } 
      } 
    });
  }

  async remove(id: string) {
    return this.prisma.logDays.delete({ where: { id: id } });
  }
}
