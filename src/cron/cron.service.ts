import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { format, toDate } from "date-fns";
import { ProbeService } from '../probe/probe.service';
import { dateFormat } from '../common/utils';

@Injectable()
export class CronService {
  constructor(
    @Inject('REPORT_SERVICE') private readonly client: ClientProxy, 
    private readonly prisma: PrismaService,
    private readonly probe: ProbeService
  ) {}

  @Cron('*/10 * * * *')
  async handleCron() {
    await this.handleLog();
    await this.handleProbe();
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

  async handleProbe() {
    const probe = await this.probe.findAll();
    if (probe.length === 0) return;
    const device = probe.filter((device) => device.firstDay === "ALL"
      || device.firstDay === format(new Date(), "eee").toUpperCase()
      || device.secondDay === format(new Date(), "eee").toUpperCase()
      || device.thirdDay === format(new Date(), "eee").toUpperCase()
    )
    if (device.length === 0) return;
    const sendTime = device.filter((device) => device.firstTime === format(new Date(), "HHmm")
      || device.secondTime === format(new Date(), "HHmm")
      || device.thirdTime === format(new Date(), "HHmm")
    );
    if (sendTime.length === 0) return;
    sendTime.forEach((device) => {
      if (device.device.log.length > 0) {
        this.client.emit('notification', {
          serial: device.device.id,
          message: `REPORT/TEMP ${device.device.log[0].tempDisplay} C, HUMI ${device.device.log[0].humidityDisplay}%`,
          detail: `Report: TEMP ${device.device.log[0].tempDisplay} C, HUMI ${device.device.log[0].humidityDisplay}%`,
          createAt: dateFormat(new Date()),
          updateAt: dateFormat(new Date())
        })
      } else {
        this.client.emit('notification', {
          serial: device.device.id,
          message: `REPORT/Can't get Temp. and Humi.`,
          detail: `Report: Can't get Temp. and Humi.`,
          createAt: dateFormat(new Date()),
          updateAt: dateFormat(new Date())
        })
      }
    });

  }
}
