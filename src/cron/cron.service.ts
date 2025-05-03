import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { format, toDate } from "date-fns";

@Injectable()
export class CronService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/10 * * * *')
  async handleCron() {
    await this.handleLog();
  }

  async handleLog() {
    await this.prisma.logDays.deleteMany({
      where: {
        expire: {
          lt: toDate(format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"))
        }
      }
    });
  }
}
