import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogdayService {
  constructor(private readonly prisma: PrismaService) {}

  remove(id: string) {
    return this.prisma.logDays.delete({ where: { id: id } });
  }
}
