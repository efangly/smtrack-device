import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { uploadFile, dateFormat } from '../common/utils';
import { JwtPayloadDto } from '../common/dto/payload.dto';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';


@Injectable()
export class DeviceService {
  constructor(
    private readonly prisma: PrismaService, 
    private readonly redis: RedisService,
    private readonly jwtService: JwtService
  ) {}
  async create(deviceDto: CreateDeviceDto, file: Express.Multer.File) {
    if (file) deviceDto.positionPic = await uploadFile(file, 'devices');
    deviceDto.createAt = dateFormat(new Date());
    deviceDto.updateAt = dateFormat(new Date());
    deviceDto.token = this.jwtService.sign({ sn: deviceDto.id}, { secret: process.env.DEVICE_SECRET });
    await this.redis.del("device");
    await this.redis.del("listdevice");
    return this.prisma.devices.create({ 
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
  }

  async findAll(wardId: string, page: string, perpage: string, user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    const cache = await this.redis.get(wardId ? wardId : key);
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
    await this.redis.set(wardId ? wardId : key, JSON.stringify({ total, devices }), 10);
    return { total, devices };
  }

  async findDashboard(user: JwtPayloadDto) {
    const { conditions } = this.findCondition(user);
    const [warranties, repairs] = await this.prisma.$transaction([
      this.prisma.warranties.count({ where: { device: conditions } }),
      this.prisma.repairs.count({ where: { device: conditions } })
    ]);
    return { warranties, repairs }; 
  }

  async deviceList(user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    const cache = await this.redis.get(`list${key}`);
    if (cache) return JSON.parse(cache);
    const device = await this.prisma.devices.findMany({ 
      select: { id: true, name: true, ward: true },
      where: conditions,
      orderBy: { seq: 'asc' }
    });
    await this.redis.set(`list${key}`, JSON.stringify(device), 3600 * 6);
    return device; 
  }

  async findOne(id: string) {
    const log = await axios.get(`${process.env.LOG_URL}/logday/${id}`);
    const device = await this.prisma.devices.findUnique({ 
      where: { id }, 
      include: { 
        probe: true, 
        config: true,
        warranty: { select: { expire: true } },
        repair: true
      } 
    });
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
    await this.redis.del("hospital");
    return this.prisma.devices.update({ where: { id }, data: deviceDto });
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
    await this.redis.del("devices");
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
      case "LEGACY_ADMIN":
        conditions = { hospital: user.hosId };
        key = `device:${user.hosId}`;
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
