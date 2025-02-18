import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { uploadFile, dateFormat } from '../common/utils';
import { JwtPayloadDto } from '../common/dto/payload.dto';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { ChangeDeviceDto } from './dto/change-device.dto';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class DeviceService {
  constructor(
    private readonly prisma: PrismaService, 
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly rabbitmq: RabbitmqService
  ) {}
  async create(deviceDto: CreateDeviceDto, file: Express.Multer.File) {
    if (file) deviceDto.positionPic = await uploadFile(file, 'devices');
    const device = await this.prisma.devices.findUnique({ where: { id: deviceDto.id } });
    if (device) throw new BadRequestException('Device already exists');
    const seq = await this.prisma.devices.findMany({ take: 1, orderBy: { createAt: 'desc' } });
    deviceDto.seq = seq.length === 0 ? 1 : seq[0].seq + 1;
    deviceDto.createAt = dateFormat(new Date());
    deviceDto.updateAt = dateFormat(new Date());
    deviceDto.token = this.jwt.sign({ sn: deviceDto.id}, { secret: process.env.DEVICE_SECRET });
    await this.redis.del("device");
    await this.redis.del("listdevice");
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
    await this.rabbitmq.send(
      "add-device", 
      JSON.stringify({ 
        id: result.id, 
        hospital: result.hospital, 
        ward: result.ward,
        staticName: result.staticName,
        name: result.name,
        status: result.status,
        seq: result.seq,
        firmware: result.firmware,
        remark: result.remark
      })
    );
    return result;
  }

  async findAll(wardId: string, page: string, perpage: string, user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    const cache = await this.redis.get(wardId ? `device:${wardId}${page || 0}${perpage || 10}` : `${key}${page || 0}${perpage || 10}`);
    if (cache) return JSON.parse(cache);
    const [devices, total] = await this.prisma.$transaction([
      this.prisma.devices.findMany({ 
        skip: page ? (parseInt(page) - 1) * parseInt(perpage) : 0,
        take: perpage ? parseInt(perpage) : 10,
        where: wardId ? { ward: wardId ? wardId : undefined } : conditions,
        include: { 
          probe: true, 
          config: true,
          warranty: { select: { expire: true } },
          log: { take: 1, orderBy: { createAt: 'desc' } }
        },
        orderBy: { seq: 'asc' }
      }),
      this.prisma.devices.count({ where: wardId ? { ward: wardId ? wardId : undefined } : conditions })
    ]);
    await this.redis.set(wardId ? `device:${wardId}${page || 0}${perpage || 10}` : `${key}${page || 0}${perpage || 10}`, JSON.stringify({ total, devices }), 10);
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
      select: { id: true, name: true, staticName: true, ward: true },
      where: conditions,
      orderBy: { seq: 'asc' }
    });
    await this.redis.set(`list${key}`, JSON.stringify(device), 3600 * 6);
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

  async update(id: string, deviceDto: UpdateDeviceDto, file: Express.Multer.File) {
    if (file) {
      deviceDto.positionPic = await uploadFile(file, 'devices');
      const device = await this.prisma.devices.findUnique({ where: { id } });
      if (device.positionPic) {
        const fileName = device.positionPic.split('/')[device.positionPic.split('/').length - 1];
        await axios.delete(`${process.env.UPLOAD_PATH}/media/image/devices/${fileName}`);
      }
    }
    deviceDto.updateAt = dateFormat(new Date());
    await this.redis.del("device");
    await this.redis.del("listdevice");
    return this.prisma.devices.update({ where: { id }, data: deviceDto });
  }

  async changeDevice(id: string, device: ChangeDeviceDto) {
    if (!device.id) throw new BadRequestException('Device id is required');
    const deviceInfo = await this.prisma.devices.findUnique({ 
      where: { id },
      include: { probe: true, config: true } 
    });
    await this.prisma.$transaction([
      this.prisma.devices.update({ 
        where: { id }, 
        data: { 
          ward: 'WID-DEVELOPMENT',
          hospital: 'HID-DEVELOPMENT',
          staticName: uuidv4(),
          name: null,
          status: false,
          location: null,
          position: null,
          positionPic: null,
          installDate: null,
          firmware: null,
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
      this.prisma.probes.updateMany({
        where: { sn: id },
        data: {
          name: null,
          type: null,
          tempMin: 0,
          tempMax: 0,
          humiMin: 0,
          humiMax: 0,
          tempAdj: 0,
          humiAdj: 0,
          stampTime: null,
          doorQty: 1,
          position: null,
          muteAlarmDuration: null
        }
      }),
      this.prisma.devices.update({ 
        where: { id: device.id }, 
        data: {
          ward: deviceInfo.ward,
          hospital: deviceInfo.hospital,
          staticName: deviceInfo.staticName,
          name: deviceInfo.name,
          status: deviceInfo.status,
          location: deviceInfo.location,
          position: deviceInfo.position,
          positionPic: deviceInfo.positionPic,
          installDate: deviceInfo.installDate,
          firmware: deviceInfo.firmware,
          remark: deviceInfo.remark,
          online: deviceInfo.online,
          tag: deviceInfo.tag
        } 
      })
    ]);
    await this.redis.del("device");
    await this.redis.del("listdevice");
    return this.prisma.devices.update({ where: { id }, data: device });
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
    return device;
  }

  private findCondition (user: JwtPayloadDto): { conditions: Prisma.DevicesWhereInput | undefined, key: string } {
    let conditions: Prisma.DevicesWhereInput | undefined = undefined;
    let key = "";
    switch (user.role) {
      case "ADMIN":
        conditions = { hospital: user.hosId };
        key = `device:${user.hosId}`;
        break;
      case "USER":
        conditions = { ward: user.wardId };
        key = `device:${user.wardId}`;
        break;
      case "SERVICE":
        conditions = { NOT: { hospital: "HID-DEVELOPMENT" } };
        key = "device:HID-DEVELOPMENT";
        break;
      default:
        conditions = undefined;
        key = "device";
    }
    return { conditions, key };
  }
}
