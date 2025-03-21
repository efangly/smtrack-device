import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { uploadFile, dateFormat } from '../common/utils';
import { JwtPayloadDto } from '../common/dto/payload.dto';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { ChangeDeviceDto } from './dto/change-device.dto';
import { v4 as uuidv4 } from 'uuid';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import axios from 'axios';

@Injectable()
export class DeviceService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly rabbitmq: RabbitmqService
  ) {}
  async create(deviceDto: CreateDeviceDto, file: Express.Multer.File, user: JwtPayloadDto) {
    if (file) deviceDto.positionPic = await uploadFile(file, 'devices');
    const device = await this.prisma.devices.findUnique({ where: { id: deviceDto.id } });
    if (device) throw new BadRequestException('Device already exists');
    const seq = await this.prisma.devices.findMany({ take: 1, orderBy: { seq: 'desc' } });
    deviceDto.seq = seq.length === 0 ? 1 : seq[0].seq + 1;
    deviceDto.createAt = dateFormat(new Date());
    deviceDto.updateAt = dateFormat(new Date());
    deviceDto.token = this.jwt.sign({ sn: deviceDto.id }, { secret: process.env.DEVICE_SECRET });
    const result = await this.prisma.devices.create({
      data: {
        ...deviceDto,
        probe: {
          create: {
            tempMax: 37,
            humiMax: 100,
            createAt: dateFormat(new Date()),
            updateAt: dateFormat(new Date())
          }
        },
        config: {
          create: {
            createAt: dateFormat(new Date()),
            updateAt: dateFormat(new Date())
          }
        }
      },
      include: { probe: true, config: true }
    });
    this.client.emit('add-device', {
      serial: result.id,
      hospital: result.hospital,
      ward: result.ward,
      staticName: result.staticName,
      name: result.name,
      status: result.status,
      seq: result.seq,
      firmware: result.firmware,
      remark: result.remark
    });
    this.rabbitmq.sendHistory(result.id, 'create', user.id, `Create device: ${device.id}/${user.name}`);
    await this.redis.del("device");
    await this.redis.del("listdevice");
    await this.redis.del("deviceinfo");
    return result;
  }

  async findAll(filter: string, wardId: string, page: string, perpage: string, user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    if (!filter) {
      const cache = await this.redis.get(wardId ? `device:${wardId}${page || 0}${perpage || 10}` : `${key}${page || 0}${perpage || 10}`);
      if (cache) return JSON.parse(cache);
    }
    let search = {} as Prisma.DevicesWhereInput;
    if (filter) {
      search = {
        OR: [
          { name: { contains: filter } },
          { id: { contains: filter } },
          { wardName: { contains: filter } },
          { hospitalName: { contains: filter } }
        ]
      };
    }
    const [devices, total] = await this.prisma.$transaction([
      this.prisma.devices.findMany({
        skip: page ? (parseInt(page) - 1) * parseInt(perpage) : 0,
        take: perpage ? parseInt(perpage) : 10,
        where: filter ? { AND: [wardId ? { ward: wardId } : conditions, search] } : wardId ? { ward: wardId } : conditions,
        include: {
          probe: true,
          config: true,
          warranty: { select: { expire: true } },
          log: { take: 1, orderBy: { createAt: 'desc' } }
        },
        orderBy: { seq: 'asc' }
      }),
      this.prisma.devices.count({ where: filter ? { AND: [wardId ? { ward: wardId } : conditions, search] } : wardId ? { ward: wardId } : conditions })
    ]);
    if (devices.length > 0 && !filter) await this.redis.set(wardId ? `device:${wardId}${page || 0}${perpage || 10}` : `${key}${page || 0}${perpage || 10}`, JSON.stringify({ total, devices }), 10);
    return { total, devices };
  }

  async findDashboard(user: JwtPayloadDto, token: string) {
    const { conditions } = this.findCondition(user);
    const result = await axios.get(`${process.env.LOG_URL}/notification/dashboard/count`, { headers: { Authorization: token } });
    const [warranties, repairs] = await this.prisma.$transaction([
      this.prisma.warranties.count({ where: { device: conditions } }),
      this.prisma.repairs.count({ where: { device: conditions } })
    ]);
    return { warranties, repairs, ...result.data.data };
  }

  async deviceList(user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    const cache = await this.redis.get(`list${key}`);
    if (cache) return JSON.parse(cache);
    const device = await this.prisma.devices.findMany({
      select: { 
        id: true, 
        name: true, 
        staticName: true, 
        ward: true, 
        wardName: true, 
        hospital: true, 
        hospitalName: true, 
        location: true
      },
      where: conditions,
      orderBy: { seq: 'asc' }
    });
    await this.redis.set(`list${key}`, JSON.stringify(device), 3600 * 6);
    return device;
  }

  async deviceInfo() {
    const cache = await this.redis.get('deviceinfo');
    if (cache) return JSON.parse(cache);
    const device = await this.prisma.devices.findMany({
      select: { id: true, name: true, staticName: true, ward: true, wardName: true, hospital: true, hospitalName: true },
      orderBy: { seq: 'asc' }
    });
    if (device.length > 0) await this.redis.set('deviceinfo', JSON.stringify(device), 3600 * 6);
    return device;
  }

  async findOne(id: string) {
    const cache = await this.redis.get(`devices:${id}`);
    if (cache) return JSON.parse(cache);
    const log = await axios.get(`${process.env.LOG_URL}/logday/${id}`);
    const device = await this.prisma.devices.findUnique({
      where: { id },
      include: {
        probe: {
          orderBy: { channel: 'asc' },
        },
        config: true,
        warranty: { select: { expire: true } },
        repair: true
      }
    });
    await this.redis.set(`devices:${id}`, JSON.stringify({ ...device, log: log.data.data }), 15);
    return { ...device, log: log.data.data };
  }

  async update(id: string, deviceDto: UpdateDeviceDto, file: Express.Multer.File, user: JwtPayloadDto) {
    const result = await this.prisma.devices.findUnique({ where: { id } });
    if (!result) throw new BadRequestException('This device does not exist');
    if (file) {
      deviceDto.positionPic = await uploadFile(file, 'device');
      if (result.positionPic) {
        const fileName = result.positionPic.split('/')[result.positionPic.split('/').length - 1];
        await axios.delete(`${process.env.UPLOAD_PATH}/media/image/devices/${fileName}`);
      }
    }
    const filtered = Object.keys(deviceDto).filter(key => deviceDto[key] !== null);
    deviceDto.updateAt = dateFormat(new Date());
    const device = await this.prisma.devices.update({ where: { id }, data: deviceDto });
    this.client.emit('update-device', {
      serial: device.id,
      hospital: device.hospital,
      ward: device.ward,
      staticName: device.staticName,
      name: device.name,
      status: device.status,
      firmware: device.firmware,
      remark: device.remark
    });
    let message = '';
    for (const key of filtered) {
      if (result[key] !== device[key]) message += ` ${key} from ${result[key]} to ${device[key]}`;
    }
    if (message !== '') this.rabbitmq.sendHistory(device.id, 'update', user.id, `Update device:${message}/${user.name}`);
    await this.redis.del("device");
    return device;
  }

  async changeDevice(id: string, device: ChangeDeviceDto, user: JwtPayloadDto) {
    if (!device.id) throw new BadRequestException('DeviceId is required');
    const newDevice = await this.prisma.devices.findUnique({ where: { id: device.id } });
    if (newDevice.status) throw new BadRequestException('Device is actived');
    const oldDevice = await this.prisma.devices.findUnique({ where: { id }, include: { probe: true, config: true } });
    await this.prisma.$transaction([
      this.prisma.devices.update({
        where: { id },
        data: {
          ward: 'WID-DEVELOPMENT',
          wardName: 'WARD-DEV',
          hospital: 'HID-DEVELOPMENT',
          hospitalName: 'HOSPITAL-DEV',
          staticName: uuidv4(),
          name: null,
          status: false,
          seq: Math.floor(Math.random() * (32000 - 31000)) + 31000,
          location: null,
          position: null,
          positionPic: null,
          installDate: null,
          firmware: '1.0.0',
          remark: null,
          online: false,
          tag: null
        }
      }),
      this.prisma.configs.update({
        where: { sn: id },
        data: {
          dhcp: true,
          ip: null,
          mac: null,
          subnet: null,
          gateway: null,
          dns: null,
          dhcpEth: true,
          ipEth: null,
          macEth: null,
          subnetEth: null,
          gatewayEth: null,
          dnsEth: null,
          ssid: 'RDE3_2.4GHz',
          password: 'rde05012566',
          simSP: null,
          email1: null,
          email2: null,
          email3: null,
          hardReset: '0200'
        }
      }),
      this.prisma.probes.deleteMany({ where: { sn: id } }),
      this.prisma.logDays.deleteMany({ where: { serial: id } }),
      this.prisma.devices.update({
        where: { id: device.id },
        data: {
          ward: oldDevice.ward,
          wardName: oldDevice.wardName,
          hospital: oldDevice.hospital,
          hospitalName: oldDevice.hospitalName,
          staticName: oldDevice.staticName,
          name: oldDevice.name,
          status: oldDevice.status,
          seq: oldDevice.seq,
          location: oldDevice.location,
          position: oldDevice.position,
          positionPic: oldDevice.positionPic,
          installDate: oldDevice.installDate,
          firmware: oldDevice.firmware,
          remark: oldDevice.remark,
          online: oldDevice.online,
          tag: oldDevice.tag
        }
      }),
      this.prisma.configs.update({
        where: { sn: device.id },
        data: {
          dhcp: oldDevice.config.dhcp,
          ip: oldDevice.config.ip,
          mac: oldDevice.config.mac,
          subnet: oldDevice.config.subnet,
          gateway: oldDevice.config.gateway,
          dns: oldDevice.config.dns,
          dhcpEth: oldDevice.config.dhcpEth,
          ipEth: oldDevice.config.ipEth,
          macEth: oldDevice.config.macEth,
          subnetEth: oldDevice.config.subnetEth,
          gatewayEth: oldDevice.config.gatewayEth,
          dnsEth: oldDevice.config.dnsEth,
          ssid: oldDevice.config.ssid,
          password: oldDevice.config.password,
          simSP: oldDevice.config.simSP,
          email1: oldDevice.config.email1,
          email2: oldDevice.config.email2,
          email3: oldDevice.config.email3,
          hardReset: oldDevice.config.hardReset
        }
      })
    ]);
    await this.prisma.$transaction([
      this.prisma.probes.create({
        data: {
          sn: id,
          name: 'SHT-31',
          type: 'SHT-31',
          channel: '1',
          tempMin: 0,
          tempMax: 0,
          humiMin: 0,
          humiMax: 0,
          tempAdj: 0,
          humiAdj: 0,
          stampTime: null,
          doorQty: 1,
          position: null,
          muteAlarmDuration: null,
          doorSound: true,
          doorAlarmTime: null,
          muteDoorAlarmDuration: null,
          notiDelay: 0,
          notiToNormal: true,
          notiMobile: true,
          notiRepeat: 1,
          firstDay: 'OFF',
          secondDay: 'OFF',
          thirdDay: 'OFF',
          firstTime: '0000',
          secondTime: '0000',
          thirdTime: '0000',
        }
      }),
      this.prisma.devices.update({ where: { id }, data: { seq: newDevice.seq } }),
      this.prisma.probes.deleteMany({ where: { sn: newDevice.id } })
    ]);
    for (const probe of oldDevice.probe) {
      await this.prisma.probes.create({
        data: {
          sn: newDevice.id,
          name: probe.name,
          type: probe.type,
          channel: probe.channel,
          tempMin: probe.tempMin,
          tempMax: probe.tempMax,
          humiMin: probe.humiMin,
          humiMax: probe.humiMax,
          tempAdj: probe.tempAdj,
          humiAdj: probe.humiAdj,
          stampTime: probe.stampTime,
          doorQty: probe.doorQty,
          position: probe.position,
          muteAlarmDuration: probe.muteAlarmDuration,
          doorSound: probe.doorSound,
          doorAlarmTime: probe.doorAlarmTime,
          muteDoorAlarmDuration: probe.muteDoorAlarmDuration,
          notiDelay: probe.notiDelay,
          notiToNormal: probe.notiToNormal,
          notiMobile: probe.notiMobile,
          notiRepeat: probe.notiRepeat,
          firstDay: probe.firstDay,
          secondDay: probe.secondDay,
          thirdDay: probe.thirdDay,
          firstTime: probe.firstTime,
          secondTime: probe.secondTime,
          thirdTime: probe.thirdTime
        }
      });
    }
    this.rabbitmq.sendHistory(id, 'update', user.id, `Change device: ${id} to ${device.id}/${user.name}`);
    await this.redis.del("device");
    await this.redis.del("listdevice");
    return 'Change device successfully';
  }

  async remove(id: string) {
    const device = await this.prisma.devices.delete({
      where: { id },
      include: { probe: true, config: true }
    });
    if (device.positionPic) {
      const fileName = device.positionPic.split('/')[device.positionPic.split('/').length - 1];
      await axios.delete(`${process.env.UPLOAD_PATH}/media/image/devices/${fileName}`);
    }
    await this.redis.del("device");
    await this.redis.del("deviceinfo");
    return device;
  }

  private findCondition(user: JwtPayloadDto): { conditions: Prisma.DevicesWhereInput | undefined, key: string } {
    let conditions: Prisma.DevicesWhereInput | undefined = undefined;
    let key = "";
    switch (user.role) {
      case "ADMIN":
        conditions = {
          AND: [
            { hospital: user.hosId },
            {
              NOT: [
                { hospital: "HID-DEVELOPMENT" },
                { ward: "WID-DEVELOPMENT" }
              ]
            }
          ]
        };
        key = `device:${user.hosId}`;
        break;
      case "USER":
        conditions = { ward: user.wardId };
        key = `device:${user.wardId}`;
        break;
      case "SERVICE":
        conditions = {
          NOT: [
            { hospital: "HID-DEVELOPMENT" },
            { ward: "WID-DEVELOPMENT" }
          ]
        };
        key = "device:HID-DEVELOPMENT";
        break;
      default:
        conditions = {
          NOT: [
            { hospital: "0" },
          ]
        };
        key = "device";
    }
    return { conditions, key };
  }
}
