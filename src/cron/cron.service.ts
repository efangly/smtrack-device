import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LogdayService } from 'src/logday/logday.service';

@Injectable()
export class CronService {
  constructor(private readonly log: LogdayService) {}
  @Cron('*/10 * * * *')
  async handleCron() {
    return this.log.checkExpire();
  }
}
