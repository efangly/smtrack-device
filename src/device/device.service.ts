import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { uploadFile, dateFormat } from '../common/utils';
import { JwtPayloadDto } from '../common/dto/payload.dto';
import { Prisma } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}
  async create(deviceDto: CreateDeviceDto, file: Express.Multer.File) {
    if (file) deviceDto.positionPic = await uploadFile(file, 'devices');
    deviceDto.createAt = dateFormat(new Date());
    deviceDto.updateAt = dateFormat(new Date());
    await this.redis.del("device");
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

  async findAll(user: JwtPayloadDto) {
    const { conditions, key } = this.findCondition(user);
    const cache = await this.redis.get(key);
    if (cache) return JSON.parse(cache);
    const device = await this.prisma.devices.findMany({ 
      where: conditions,
      orderBy: { seq: 'asc' }
    });
    await this.redis.set(key, JSON.stringify(device), 3600 * 10);
    return device;
  }

  async findOne(id: string) {
    return this.prisma.devices.findUnique({ where: { id } });
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
